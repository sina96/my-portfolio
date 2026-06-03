export type AvailabilityProvider = "ics" | "mock";

export interface BusyBlock {
  provider: AvailabilityProvider;
  source: string;
  start: string;
  end: string;
}

export interface AvailabilitySlot {
  start: string;
  end: string;
  status: "free" | "busy" | "lunch-gym";
}

export type AvailabilitySource = "ics" | "mock";
