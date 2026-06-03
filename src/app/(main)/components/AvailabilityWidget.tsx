"use client";

import { useEffect, useMemo, useState } from "react";
import { AVAILABILITY_TIME_ZONE } from "../data/availability";
import type { AvailabilitySlot, AvailabilitySource } from "../types/availability";

interface AvailabilityDayGroup {
  label: string;
  slots: AvailabilitySlot[];
}

interface AvailabilityWidgetProps {
  id?: string;
}

interface AvailabilityApiResponse {
  slots: AvailabilitySlot[];
  source: AvailabilitySource;
  weekOffset: number;
  generatedAt: string;
}

function groupSlotsByDay(slots: AvailabilitySlot[]): AvailabilityDayGroup[] {
  const dayFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: AVAILABILITY_TIME_ZONE,
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const groups = new Map<string, AvailabilityDayGroup>();

  for (const slot of slots) {
    const label = dayFormatter.format(new Date(slot.start));
    const existingGroup = groups.get(label);

    if (existingGroup) {
      existingGroup.slots.push(slot);
    } else {
      groups.set(label, { label, slots: [slot] });
    }
  }

  return Array.from(groups.values());
}

function formatSlotTime(slot: AvailabilitySlot): string {
  const timeFormatter = new Intl.DateTimeFormat("en-GB", {
    timeZone: AVAILABILITY_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
  });

  return `${timeFormatter.format(new Date(slot.start))}-${timeFormatter.format(new Date(slot.end))}`;
}

function getWeekLabel(weekOffset: number): string {
  return weekOffset === 0 ? "Current week" : "Next week";
}

export function AvailabilityWidget({ id }: Readonly<AvailabilityWidgetProps>) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [availabilityResponse, setAvailabilityResponse] = useState<AvailabilityApiResponse>();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string>();
  const groupedSlots = useMemo(
    () => groupSlotsByDay(availabilityResponse?.slots ?? []),
    [availabilityResponse?.slots]
  );

  useEffect(() => {
    const abortController = new AbortController();

    async function loadAvailability(): Promise<void> {
      setIsLoading(true);
      setLoadError(undefined);

      try {
        const response = await fetch(`/api/availability?weekOffset=${weekOffset}`, {
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`Availability request failed with ${response.status}`);
        }

        const nextAvailabilityResponse = (await response.json()) as AvailabilityApiResponse;

        setAvailabilityResponse(nextAvailabilityResponse);
      } catch (error) {
        if (abortController.signal.aborted) {
          return;
        }

        console.warn("[Availability] Failed to load availability:", error);
        setAvailabilityResponse(undefined);
        setLoadError("Availability could not be loaded. Please try again later.");
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    }

    void loadAvailability();

    return () => abortController.abort();
  }, [weekOffset]);

  return (
    <div id={id} className="availability-panel">
      <p className="availability-note">
        Weekday slots, shown in Stockholm time.
      </p>
      <p className="availability-note availability-disclaimer">
        * Lunch/gym, generally every weekday 12:00-13:00.
      </p>
      {availabilityResponse?.source === "mock" && (
        <p className="availability-note availability-source-note">
          Showing static fallback availability.
        </p>
      )}

      <div className="availability-week-nav">
        <button
          type="button"
          aria-label="Show current week"
          disabled={weekOffset === 0 || isLoading}
          onClick={() => setWeekOffset(0)}
        >
          {"<"}
        </button>
        <span>{getWeekLabel(weekOffset)}</span>
        <button
          type="button"
          aria-label="Show next week"
          disabled={weekOffset === 1 || isLoading}
          onClick={() => setWeekOffset(1)}
        >
          {">"}
        </button>
      </div>

      {isLoading ? (
        <p className="availability-empty">Loading availability...</p>
      ) : loadError ? (
        <p className="availability-empty">{loadError}</p>
      ) : groupedSlots.length > 0 ? (
        <>
          <div className="availability-day-grid" aria-label="Available time slots">
            {groupedSlots.map((dayGroup) => (
              <section key={dayGroup.label} className="availability-day">
                <h3>{dayGroup.label}</h3>
                <div className="availability-slots">
                  {dayGroup.slots.map((slot) => (
                    <span
                      key={slot.start}
                      className={`availability-slot availability-slot-${slot.status}`}
                    >
                      {slot.status === "lunch-gym" ? "* " : ""}
                      {formatSlotTime(slot)}
                    </span>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      ) : (
        <p className="availability-empty">No slots found for this week.</p>
      )}
    </div>
  );
}
