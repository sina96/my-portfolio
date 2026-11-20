import { afterEach, expect, test, vi } from "vitest";
import { createSourceCache } from "@/app/api/availability/sourceCache";
import { GET } from "@/app/api/availability/route";

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

test("coalesces in-flight requests and reloads on TTL expiry", async () => {
  vi.useFakeTimers();
  const load = createSourceCache<number>(300_000, 60_000);
  const fetchSource = vi.fn(async () => 7);
  const first = load("calendar", fetchSource);
  expect(load("calendar", fetchSource)).toBe(first);
  await expect(first).resolves.toBe(7);
  vi.advanceTimersByTime(299_999);
  await load("calendar", fetchSource);
  expect(fetchSource).toHaveBeenCalledTimes(1);
  vi.advanceTimersByTime(1);
  await load("calendar", fetchSource);
  expect(fetchSource).toHaveBeenCalledTimes(2);
});

test("backs off failed sources for no longer than a minute", async () => {
  vi.useFakeTimers();
  const load = createSourceCache<number>(300_000, 60_000);
  const fetchSource = vi.fn<() => Promise<number>>()
    .mockRejectedValueOnce(new Error("offline"))
    .mockResolvedValueOnce(7);
  await expect(load("calendar", fetchSource)).rejects.toThrow("offline");
  vi.advanceTimersByTime(59_999);
  await expect(load("calendar", fetchSource)).rejects.toThrow("offline");
  expect(fetchSource).toHaveBeenCalledOnce();
  vi.advanceTimersByTime(1);
  await expect(load("calendar", fetchSource)).resolves.toBe(7);
  expect(fetchSource).toHaveBeenCalledTimes(2);
});

test("public weeks share a parsed source and return the appropriate cache headers", async () => {
  vi.stubEnv("AVAILABILITY_ICS_FILE_PATHS_JSON", "[]");
  vi.stubEnv("AVAILABILITY_ICS_URLS_JSON", '["https://example.test/calendar.ics"]');
  const fetchSource = vi.fn(async () => new Response("BEGIN:VCALENDAR\r\nVERSION:2.0\r\nEND:VCALENDAR\r\n"));
  vi.stubGlobal("fetch", fetchSource);
  const week = (offset: number) => new Request(`http://localhost/api/availability?weekOffset=${offset}`);
  const responses = await Promise.all([GET(week(0)), GET(week(1))]);
  expect(fetchSource).toHaveBeenCalledOnce();
  for (const response of responses) {
    expect(response.headers.get("Cache-Control")).toBe("public, s-maxage=300, stale-while-revalidate=600");
    expect(await response.json()).toMatchObject({ source: "ics" });
  }
  vi.stubEnv("AVAILABILITY_ICS_URLS_JSON", "[]");
  const fallback = await GET(week(0));
  expect(fallback.headers.get("Cache-Control")).toBe("public, s-maxage=60, must-revalidate");
  expect(await fallback.json()).toMatchObject({ source: "mock" });
});
