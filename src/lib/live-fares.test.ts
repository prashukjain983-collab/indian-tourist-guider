import { describe, expect, it } from "vitest";
import { fareTask, isValidTravelDate, normalizeFares, readableDate } from "./live-fares";

describe("live fares", () => {
  it("uses the right booking site for each ticket type", () => {
    expect(fareTask("flight", "Delhi", "Jaipur", "2026-11-29").source).toBe("Google Flights");
    expect(fareTask("train", "Delhi", "Jaipur", "2026-11-29").source).toBe("ConfirmTkt");
    expect(fareTask("bus", "Delhi", "Jaipur", "2026-11-29").source).toBe("redBus");
  });

  it("tells the agent never to book or pay", () => {
    const goal = fareTask("bus", "Delhi", "Jaipur", "2026-11-29").goal;
    expect(goal).toContain("29 November 2026");
    expect(goal).toContain("Do not log in");
    expect(goal).toContain("book anything");
  });

  it("only allows dates from today up to 120 days ahead", () => {
    const today = new Date("2026-11-22T10:00:00Z");
    expect(isValidTravelDate("2026-11-22", today)).toBe(true);
    expect(isValidTravelDate("2026-11-21", today)).toBe(false);
    expect(isValidTravelDate("2027-03-22", today)).toBe(true);
    expect(isValidTravelDate("2027-03-23", today)).toBe(false);
    expect(isValidTravelDate("29-11-2026", today)).toBe(false);
  });

  it("keeps the 5 cheapest valid fares, cheapest first", () => {
    const fares = normalizeFares({
      options: [
        { operator: "A", price_inr: 900 },
        { operator: "B", price_inr: "₹1,250" },
        { operator: "C", price_inr: 400 },
        { operator: "", price_inr: 100 },
        { operator: "D", price_inr: 0 },
        { operator: "E", price_inr: 700 },
        { operator: "F", price_inr: 650 },
        { operator: "G", price_inr: 2000 },
      ],
    });
    expect(fares.map((f) => f.operator)).toEqual(["C", "F", "E", "A", "B"]);
    expect(fares[4]!.price_inr).toBe(1250);
    expect(readableDate("2026-01-05")).toBe("5 January 2026");
  });
});
