import { readFile } from "node:fs/promises";
import path from "node:path";
import ical, { type CalendarResponse, type EventInstance, type VEvent } from "node-ical";
import type { BusyBlock } from "../../(main)/types/availability";

const DEFAULT_ICS_TIMEOUT_MS = 7000;
const DEFAULT_ICS_MAX_BYTES = 2_000_000;
const LOCAL_ICS_ROOT = path.resolve(process.cwd(), "private", "availability");

interface IcsSourceConfig {
  urls: string[];
  filePaths: string[];
  timeoutMs: number;
  maxBytes: number;
}

interface IcsSource {
  id: string;
  body: string;
}

function getEnvValue(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

function parsePositiveIntegerEnv(name: string, fallback: number): number {
  const value = getEnvValue(name);

  if (!value) {
    return fallback;
  }

  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    console.warn(`[Availability] Ignoring invalid ${name}; expected a positive integer.`);
    return fallback;
  }

  return parsedValue;
}

function parseJsonStringArrayEnv(name: string): string[] {
  const value = getEnvValue(name);

  if (!value) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(value) as unknown;

    if (
      Array.isArray(parsedValue) &&
      parsedValue.every((item): item is string => typeof item === "string" && item.trim().length > 0)
    ) {
      return parsedValue.map((item) => item.trim());
    }
  } catch (error) {
    console.warn(`[Availability] Failed to parse ${name} as a JSON string array:`, error);
    return [];
  }

  console.warn(`[Availability] Ignoring ${name}; expected a JSON string array.`);
  return [];
}

function normalizeIcsUrl(url: string): string {
  if (url.startsWith("webcal://")) {
    return `https://${url.slice("webcal://".length)}`;
  }

  if (url.startsWith("webcals://")) {
    return `https://${url.slice("webcals://".length)}`;
  }

  return url;
}

export function getIcsSourceConfig(): IcsSourceConfig {
  return {
    urls: parseJsonStringArrayEnv("AVAILABILITY_ICS_URLS_JSON").map(normalizeIcsUrl),
    filePaths: parseJsonStringArrayEnv("AVAILABILITY_ICS_FILE_PATHS_JSON"),
    timeoutMs: parsePositiveIntegerEnv("AVAILABILITY_ICS_TIMEOUT_MS", DEFAULT_ICS_TIMEOUT_MS),
    maxBytes: parsePositiveIntegerEnv("AVAILABILITY_ICS_MAX_BYTES", DEFAULT_ICS_MAX_BYTES),
  };
}

function assertLocalIcsPath(filePath: string): string {
  if (path.isAbsolute(filePath)) {
    throw new Error(`ICS file path must be relative to private/availability: ${filePath}`);
  }

  const normalizedPath = path.normalize(filePath);

  if (!normalizedPath.startsWith(`private${path.sep}availability${path.sep}`)) {
    throw new Error(`ICS file path must stay within private/availability: ${filePath}`);
  }

  const relativeIcsPath = normalizedPath.slice(`private${path.sep}availability${path.sep}`.length);
  const resolvedPath = path.join(LOCAL_ICS_ROOT, relativeIcsPath);
  const relativePath = path.relative(LOCAL_ICS_ROOT, resolvedPath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    throw new Error(`ICS file path must stay within private/availability: ${filePath}`);
  }

  return resolvedPath;
}

async function readBoundedResponseText(response: Response, maxBytes: number): Promise<string> {
  const contentLength = response.headers.get("content-length");

  if (contentLength && Number(contentLength) > maxBytes) {
    throw new Error(`ICS response exceeds ${maxBytes} bytes.`);
  }

  if (!response.body) {
    const body = await response.text();

    if (Buffer.byteLength(body, "utf8") > maxBytes) {
      throw new Error(`ICS response exceeds ${maxBytes} bytes.`);
    }

    return body;
  }

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();

    if (done) {
      break;
    }

    totalBytes += value.byteLength;

    if (totalBytes > maxBytes) {
      await reader.cancel();
      throw new Error(`ICS response exceeds ${maxBytes} bytes.`);
    }

    chunks.push(value);
  }

  return Buffer.concat(chunks).toString("utf8");
}

async function fetchIcsUrl(url: string, index: number, config: IcsSourceConfig): Promise<IcsSource> {
  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), config.timeoutMs);

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "text/calendar, text/plain;q=0.9, */*;q=0.8",
        "User-Agent": "portfolio-availability/1.0",
      },
      signal: abortController.signal,
    });

    if (!response.ok) {
      throw new Error(`ICS URL source ${index + 1} returned ${response.status}.`);
    }

    return {
      id: `url-${index + 1}`,
      body: await readBoundedResponseText(response, config.maxBytes),
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function readIcsFile(filePath: string, index: number, maxBytes: number): Promise<IcsSource> {
  const resolvedPath = assertLocalIcsPath(filePath);
  const body = await readFile(resolvedPath, "utf8");

  if (Buffer.byteLength(body, "utf8") > maxBytes) {
    throw new Error(`ICS file source ${index + 1} exceeds ${maxBytes} bytes.`);
  }

  return {
    id: `file-${index + 1}`,
    body,
  };
}

async function loadIcsSources(config: IcsSourceConfig): Promise<IcsSource[]> {
  const sourceResults = await Promise.allSettled([
    ...config.urls.map((url, index) => fetchIcsUrl(url, index, config)),
    ...config.filePaths.map((filePath, index) => readIcsFile(filePath, index, config.maxBytes)),
  ]);

  return sourceResults.flatMap((result) => {
    if (result.status === "rejected") {
      console.warn("[Availability] Ignoring failed ICS source:", result.reason);
      return [];
    }

    return result.value.body.trim().length > 0 ? [result.value] : [];
  });
}

function isBlockingEvent(event: VEvent): boolean {
  return event.status !== "CANCELLED" && event.transparency !== "TRANSPARENT";
}

function overlapsRange(start: Date, end: Date, rangeStart: Date, rangeEnd: Date): boolean {
  return start < rangeEnd && end > rangeStart;
}

function getEventEnd(event: VEvent): Date | undefined {
  if (event.end) {
    return event.end;
  }

  if (event.start) {
    return event.start;
  }

  return undefined;
}

function instanceToBusyBlock(instance: EventInstance, sourceId: string): BusyBlock | undefined {
  const event = instance.event;

  if (!isBlockingEvent(event) || instance.start >= instance.end) {
    return undefined;
  }

  return {
    provider: "ics",
    source: sourceId,
    start: instance.start.toISOString(),
    end: instance.end.toISOString(),
  };
}

function eventToBusyBlock(
  event: VEvent,
  sourceId: string,
  rangeStart: Date,
  rangeEnd: Date
): BusyBlock | undefined {
  const end = getEventEnd(event);

  if (!isBlockingEvent(event) || !end || event.start >= end || !overlapsRange(event.start, end, rangeStart, rangeEnd)) {
    return undefined;
  }

  return {
    provider: "ics",
    source: sourceId,
    start: event.start.toISOString(),
    end: end.toISOString(),
  };
}

function getIcsBusyBlocksFromCalendar(
  calendar: CalendarResponse,
  sourceId: string,
  rangeStart: Date,
  rangeEnd: Date
): BusyBlock[] {
  const busyBlocks: BusyBlock[] = [];

  for (const component of Object.values(calendar)) {
    if (!component || component.type !== "VEVENT") {
      continue;
    }

    if (component.rrule) {
      const instances = ical.expandRecurringEvent(component, {
        from: rangeStart,
        to: rangeEnd,
        expandOngoing: true,
      });

      for (const instance of instances) {
        const busyBlock = instanceToBusyBlock(instance, sourceId);

        if (busyBlock && overlapsRange(new Date(busyBlock.start), new Date(busyBlock.end), rangeStart, rangeEnd)) {
          busyBlocks.push(busyBlock);
        }
      }
    } else {
      const busyBlock = eventToBusyBlock(component, sourceId, rangeStart, rangeEnd);

      if (busyBlock) {
        busyBlocks.push(busyBlock);
      }
    }
  }

  return busyBlocks;
}

export function hasConfiguredIcsSources(): boolean {
  const config = getIcsSourceConfig();

  return config.urls.length > 0 || config.filePaths.length > 0;
}

export async function getIcsBusyBlocks(rangeStart: Date, rangeEnd: Date): Promise<BusyBlock[]> {
  const config = getIcsSourceConfig();

  if (config.urls.length === 0 && config.filePaths.length === 0) {
    throw new Error("No ICS availability sources configured.");
  }

  const sources = await loadIcsSources(config);

  if (sources.length === 0) {
    throw new Error("No ICS availability sources could be loaded.");
  }

  const calendarResults = await Promise.allSettled(
    sources.map(async (source) => ({
      sourceId: source.id,
      calendar: await ical.async.parseICS(source.body),
    }))
  );

  const calendars = calendarResults.flatMap((result) => {
    if (result.status === "rejected") {
      console.warn("[Availability] Ignoring failed ICS parse result:", result.reason);
      return [];
    }

    return [result.value];
  });

  if (calendars.length === 0) {
    throw new Error("No ICS availability sources could be parsed.");
  }

  return calendars.flatMap(({ sourceId, calendar }) =>
    getIcsBusyBlocksFromCalendar(calendar, sourceId, rangeStart, rangeEnd)
  );
}
