// Builds the TinyFish "live fare check" task for a trip. Pure so it can be unit-tested.
export type FareMode = "flight" | "train" | "bus";

export type FareOption = {
  operator: string;
  departure: string;
  arrival: string;
  duration: string;
  details: string;
  price_inr: number;
};

export type FareTask = { url: string; goal: string; source: string };

/** Formats YYYY-MM-DD as "29 November 2026" for natural-language goals. */
export function readableDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${d} ${months[(m ?? 1) - 1]} ${y}`;
}

export function isValidTravelDate(iso: string, today = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const date = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return false;
  const start = Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());
  const days = (date.getTime() - start) / 86_400_000;
  return days >= 0 && days <= 120;
}

const RULES =
  "Only read what the site shows. Do not log in, sign up, enter personal details, pay or book anything. Close any pop-ups.";

export function fareTask(mode: FareMode, from: string, to: string, dateIso: string): FareTask {
  const when = readableDate(dateIso);
  if (mode === "flight") {
    return {
      source: "Google Flights",
      url: `https://www.google.com/travel/flights?q=${encodeURIComponent(`One way flights from ${from} to ${to} on ${dateIso}`)}&curr=INR&hl=en`,
      goal: `Read the one-way flights from ${from} to ${to} on ${when}. If results are not shown, use the search form on this page to search them. Return up to 5 of the cheapest options with airline, departure time, arrival time, duration, stops (in details) and price in Indian rupees. ${RULES}`,
    };
  }
  if (mode === "train") {
    return {
      source: "ConfirmTkt",
      url: "https://www.confirmtkt.com/",
      goal: `Search trains from ${from} to ${to} for ${when} using the nearest major stations. Return up to 5 trains with train name and number (operator), departure time, arrival time, duration, the cheapest available class with seat availability (details) and its fare in Indian rupees. ${RULES}`,
    };
  }
  return {
    source: "redBus",
    url: "https://www.redbus.in/",
    goal: `Search buses from ${from} to ${to} for ${when}. Return up to 5 of the cheapest buses with operator name, departure time, arrival time, duration, bus type (details) and the starting fare in Indian rupees. ${RULES}`,
  };
}

/** JSON schema TinyFish fills for every fare check. */
export const FARE_SCHEMA = {
  type: "object",
  properties: {
    options: {
      type: "array",
      items: {
        type: "object",
        properties: {
          operator: { type: "string" },
          departure: { type: "string" },
          arrival: { type: "string" },
          duration: { type: "string" },
          details: { type: "string" },
          price_inr: { type: "number" },
        },
        required: ["operator", "price_inr"],
      },
    },
  },
  required: ["options"],
} as const;

/** Cleans TinyFish's result into sorted, valid fare options. */
export function normalizeFares(result: unknown): FareOption[] {
  const raw =
    result && typeof result === "object" && Array.isArray((result as { options?: unknown }).options)
      ? ((result as { options: unknown[] }).options)
      : [];
  const str = (v: unknown) => (typeof v === "string" ? v.trim().slice(0, 120) : "");
  return raw
    .map((o) => {
      const r = (o ?? {}) as Partial<Record<keyof FareOption, unknown>>;
      const price =
        typeof r.price_inr === "number"
          ? r.price_inr
          : Number(String(r.price_inr ?? "").replace(/[^\d.]/g, ""));
      return {
        operator: str(r.operator),
        departure: str(r.departure),
        arrival: str(r.arrival),
        duration: str(r.duration),
        details: str(r.details),
        price_inr: Math.round(price),
      };
    })
    .filter((o) => o.operator && Number.isFinite(o.price_inr) && o.price_inr > 0)
    .sort((a, b) => a.price_inr - b.price_inr)
    .slice(0, 5);
}
