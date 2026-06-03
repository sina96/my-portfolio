import type { AvailabilitySlot, BusyBlock } from "../types/availability";

const AVAILABILITY_TIME_ZONE = "Europe/Stockholm";
const MAX_WEEK_OFFSET = 1;
const WEEKDAY_COUNT = 5;
const WORK_START_HOUR = 9;
const WORK_END_HOUR = 17;
const LUNCH_GYM_HOUR = 12;
const SLOT_DURATION_MINUTES = 30;
const MOCK_BUSY_HOURS_BY_WEEKDAY: Record<number, number[]> = {
  1: [10, 14],
  2: [13],
  3: [9, 15],
  4: [11],
  5: [10, 13],
};

interface ZonedDateParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

function getZonedDateParts(date: Date): ZonedDateParts {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: AVAILABILITY_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });

  const parts = formatter.formatToParts(date);
  const getPart = (type: Intl.DateTimeFormatPartTypes): number => {
    const value = parts.find((part) => part.type === type)?.value;
    return value ? Number(value) : 0;
  };

  return {
    year: getPart("year"),
    month: getPart("month"),
    day: getPart("day"),
    hour: getPart("hour"),
    minute: getPart("minute"),
    second: getPart("second"),
  };
}

function getTimeZoneOffsetMs(date: Date): number {
  const parts = getZonedDateParts(date);
  const zonedDateAsUtc = Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second
  );

  return zonedDateAsUtc - date.getTime();
}

export function createDateInAvailabilityTimeZone(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute = 0
): Date {
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const firstPass = new Date(utcGuess.getTime() - getTimeZoneOffsetMs(utcGuess));
  const secondOffset = getTimeZoneOffsetMs(firstPass);

  return new Date(utcGuess.getTime() - secondOffset);
}

export function formatDateTimeInAvailabilityTimeZone(date: Date): string {
  const parts = getZonedDateParts(date);
  const pad = (value: number): string => value.toString().padStart(2, "0");

  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hour)}:${pad(
    parts.minute
  )}:${pad(parts.second)}`;
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function addDays(date: Date, days: number): Date {
  const nextDate = new Date(date);
  nextDate.setUTCDate(nextDate.getUTCDate() + days);
  return nextDate;
}

function getWeekdayIndex(date: Date): number {
  const parts = getZonedDateParts(date);
  const localMidnight = createDateInAvailabilityTimeZone(parts.year, parts.month, parts.day, 0);
  const weekdayName = new Intl.DateTimeFormat("en-US", {
    timeZone: AVAILABILITY_TIME_ZONE,
    weekday: "long",
  }).format(localMidnight);

  return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(
    weekdayName
  );
}

function getStartOfWeek(date: Date): Date {
  const parts = getZonedDateParts(date);
  const today = createDateInAvailabilityTimeZone(parts.year, parts.month, parts.day, 0);
  const weekdayIndex = getWeekdayIndex(today);
  const daysSinceMonday = weekdayIndex === 0 ? 6 : weekdayIndex - 1;

  return addDays(today, -daysSinceMonday);
}

function createMockBusyBlock(start: Date, end: Date): BusyBlock {
  return {
    provider: "mock",
    source: "static-fixture",
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

function overlapsBusyBlock(slotStart: Date, slotEnd: Date, busyBlocks: BusyBlock[]): boolean {
  return busyBlocks.some((busyBlock) => {
    const busyStart = new Date(busyBlock.start);
    const busyEnd = new Date(busyBlock.end);

    return slotStart < busyEnd && slotEnd > busyStart;
  });
}

function getSlotStatus(slotStart: Date, slotEnd: Date): AvailabilitySlot["status"] {
  const startParts = getZonedDateParts(slotStart);
  const endParts = getZonedDateParts(slotEnd);
  const isLunchGym =
    startParts.hour === LUNCH_GYM_HOUR &&
    startParts.minute >= 0 &&
    endParts.hour <= LUNCH_GYM_HOUR + 1;

  return isLunchGym ? "lunch-gym" : "free";
}

function canMergeSlots(currentSlot: AvailabilitySlot, nextSlot: AvailabilitySlot): boolean {
  return currentSlot.status === nextSlot.status && currentSlot.end === nextSlot.start;
}

function mergeContiguousSlots(slots: AvailabilitySlot[]): AvailabilitySlot[] {
  const mergedSlots: AvailabilitySlot[] = [];

  for (const slot of slots) {
    const previousSlot = mergedSlots.at(-1);

    if (previousSlot && canMergeSlots(previousSlot, slot)) {
      previousSlot.end = slot.end;
    } else {
      mergedSlots.push({ ...slot });
    }
  }

  return mergedSlots;
}

export function normalizeWeekOffset(weekOffset: number): number {
  if (!Number.isInteger(weekOffset) || weekOffset < 0) {
    return 0;
  }

  return Math.min(weekOffset, MAX_WEEK_OFFSET);
}

export function getAvailabilityWeekRange(weekOffset = 0, now = new Date()) {
  const normalizedWeekOffset = normalizeWeekOffset(weekOffset);
  const weekStart = addDays(getStartOfWeek(now), normalizedWeekOffset * 7);

  return {
    start: weekStart,
    end: addDays(weekStart, 7),
    normalizedWeekOffset,
  };
}

export function getAvailabilitySlotsFromBusyBlocks(
  busyBlocks: BusyBlock[],
  weekOffset = 0,
  now = new Date()
): AvailabilitySlot[] {
  const { start: weekStart } = getAvailabilityWeekRange(weekOffset, now);
  const slots: AvailabilitySlot[] = [];

  for (let dayOffset = 0; dayOffset < WEEKDAY_COUNT; dayOffset += 1) {
    const day = addDays(weekStart, dayOffset);
    const dayParts = getZonedDateParts(day);
    const workdayStart = createDateInAvailabilityTimeZone(
      dayParts.year,
      dayParts.month,
      dayParts.day,
      WORK_START_HOUR
    );
    const workdayEnd = createDateInAvailabilityTimeZone(
      dayParts.year,
      dayParts.month,
      dayParts.day,
      WORK_END_HOUR
    );

    for (
      let start = workdayStart;
      start < workdayEnd;
      start = addMinutes(start, SLOT_DURATION_MINUTES)
    ) {
      const end = addMinutes(start, SLOT_DURATION_MINUTES);

      if (overlapsBusyBlock(start, end, busyBlocks)) {
        continue;
      }

      slots.push({
        start: start.toISOString(),
        end: end.toISOString(),
        status: getSlotStatus(start, end),
      });
    }
  }

  return mergeContiguousSlots(slots);
}

function getMockBusyBlocks(weekOffset = 0, now = new Date()): BusyBlock[] {
  const { start: weekStart } = getAvailabilityWeekRange(weekOffset, now);
  const busyBlocks: BusyBlock[] = [];

  for (let dayOffset = 0; dayOffset < WEEKDAY_COUNT; dayOffset += 1) {
    const day = addDays(weekStart, dayOffset);
    const dayParts = getZonedDateParts(day);
    const weekdayIndex = getWeekdayIndex(day);
    const mockBusyHours = MOCK_BUSY_HOURS_BY_WEEKDAY[weekdayIndex] ?? [];

    for (const hour of mockBusyHours) {
      if (hour === LUNCH_GYM_HOUR) {
        continue;
      }

      const start = createDateInAvailabilityTimeZone(
        dayParts.year,
        dayParts.month,
        dayParts.day,
        hour
      );
      const end = createDateInAvailabilityTimeZone(
        dayParts.year,
        dayParts.month,
        dayParts.day,
        hour + 1
      );

      busyBlocks.push(createMockBusyBlock(start, end));
    }
  }

  return busyBlocks;
}

export function getMockAvailabilitySlots(weekOffset = 0, now = new Date()): AvailabilitySlot[] {
  return getAvailabilitySlotsFromBusyBlocks(getMockBusyBlocks(weekOffset, now), weekOffset, now);
}

export { AVAILABILITY_TIME_ZONE, MAX_WEEK_OFFSET };
