import {
  getAvailabilitySlotsFromBusyBlocks,
  getAvailabilityWeekRange,
  getMockAvailabilitySlots,
  normalizeWeekOffset,
} from "../../(main)/data/availability";
import { getIcsBusyBlocks } from "./ics";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const AVAILABLE_CACHE = "public, s-maxage=300, stale-while-revalidate=600";
const DEGRADED_CACHE = "public, s-maxage=60, must-revalidate";

export async function GET(request: Request): Promise<Response> {
  const now = new Date();
  const { searchParams } = new URL(request.url);
  const weekOffset = normalizeWeekOffset(Number(searchParams.get("weekOffset") ?? "0"));
  const weekRange = getAvailabilityWeekRange(weekOffset, now);

  try {
    const { busyBlocks, partial } = await getIcsBusyBlocks(weekRange.start, weekRange.end);
    return Response.json({
      slots: getAvailabilitySlotsFromBusyBlocks(busyBlocks, weekOffset, now),
      source: "ics",
      weekOffset,
      generatedAt: now.toISOString(),
    }, { headers: { "Cache-Control": partial ? DEGRADED_CACHE : AVAILABLE_CACHE } });
  } catch {
    // Failed sources are logged on cache fill, not on repeated public requests.
    return Response.json({
      slots: getMockAvailabilitySlots(weekOffset, now),
      source: "mock",
      weekOffset,
      generatedAt: now.toISOString(),
    }, { headers: { "Cache-Control": DEGRADED_CACHE } });
  }
}
