import { describe, expect, it } from "vitest";

import { directionsUrl, intercityLinks, localRideLinks } from "./booking-links";

describe("booking links", () => {
  it("train trips link to IRCTC for tickets", () => {
    const links = intercityLinks("Mumbai", "Jaipur", "train");
    expect(links.map((l) => l.label)).toContain("IRCTC");
    expect(links.find((l) => l.label === "IRCTC")?.href).toBe(
      "https://www.irctc.co.in/nget/train-search",
    );
  });

  it("flight trips link to flight search for the chosen cities", () => {
    const g = intercityLinks("Pune", "Goa", "flight").find((l) => l.label === "Google Flights");
    expect(g?.href).toContain(encodeURIComponent("Flights from Pune to Goa"));
  });

  it("bus trips link to redBus", () => {
    expect(intercityLinks("Delhi", "Manali", "bus")[0]?.href).toBe("https://www.redbus.in/");
  });

  it("local rides include a Rapido option and an Uber link with the drop-off, e.g. airport to Red Fort", () => {
    const links = localRideLinks("Delhi Airport", "Red Fort");
    expect(links.map((l) => l.label)).toContain("Rapido");
    expect(links.find((l) => l.label === "Uber")?.href).toContain(encodeURIComponent("Red Fort"));
  });

  it("directions encode origin and destination", () => {
    expect(directionsUrl("Delhi Airport", "Red Fort")).toBe(
      "https://www.google.com/maps/dir/?api=1&origin=Delhi%20Airport&destination=Red%20Fort&travelmode=driving",
    );
  });
});
