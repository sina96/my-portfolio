import {
  getAvailabilitySlotsFromBusyBlocks,
  getAvailabilityWeekRange,
  getMockAvailabilitySlots,
  normalizeWeekOffset,
} from "../../(main)/data/availability";
import { getIcsBusyBlocks, hasConfiguredIcsSources } from "./ics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function parseWeekOffset(request: Request): number {
  const { searchParams } = new URL(request.url);
  const weekOffset = Number(searchParams.get("weekOffset") ?? "0");

  return normalizeWeekOffset(weekOffset);
}

export async function GET(request: Request) {
  const weekOffset = parseWeekOffset(request);
  const weekRange = getAvailabilityWeekRange(weekOffset);

  try {
    if (!hasConfiguredIcsSources()) {
      throw new Error("No ICS availability sources configured.");
    }

    const busyBlocks = await getIcsBusyBlocks(weekRange.start, weekRange.end);
    const slots = getAvailabilitySlotsFromBusyBlocks(busyBlocks, weekOffset);

    return Response.json({
      slots,
      source: "ics",
      weekOffset,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.warn("[Availability] Falling back to mock availability:", error);

    return Response.json({
      slots: getMockAvailabilitySlots(weekOffset),
      source: "mock",
      weekOffset,
      generatedAt: new Date().toISOString(),
    });
  }
}
