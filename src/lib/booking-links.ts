// Builds outbound booking / directions links for a trip. Kept pure so it can be unit-tested.
export type TransportMode = "flight" | "train" | "bus" | "car" | "any";

export type BookingLink = { label: string; href: string; note: string };

const enc = encodeURIComponent;

export function intercityLinks(from: string, to: string, mode: TransportMode): BookingLink[] {
  const flights: BookingLink[] = [
    {
      label: "Google Flights",
      href: `https://www.google.com/travel/flights?q=${enc(`Flights from ${from} to ${to}`)}`,
      note: "Compare flight prices",
    },
    {
      label: "MakeMyTrip Flights",
      href: "https://www.makemytrip.com/flights/",
      note: "Book flights",
    },
  ];
  const trains: BookingLink[] = [
    {
      label: "IRCTC",
      href: "https://www.irctc.co.in/nget/train-search",
      note: "Official train tickets",
    },
    { label: "ConfirmTkt", href: "https://www.confirmtkt.com/", note: "Check seats & PNR" },
  ];
  const buses: BookingLink[] = [
    { label: "redBus", href: "https://www.redbus.in/", note: "Book bus tickets" },
    { label: "AbhiBus", href: "https://www.abhibus.com/", note: "Compare bus operators" },
  ];
  const car: BookingLink[] = [
    {
      label: "Driving route",
      href: directionsUrl(from, to, "driving"),
      note: "Open the road route in Google Maps",
    },
  ];
  switch (mode) {
    case "flight":
      return flights;
    case "train":
      return trains;
    case "bus":
      return buses;
    case "car":
      return car;
    default:
      return [...flights.slice(0, 1), ...trains.slice(0, 1), ...buses.slice(0, 1), ...car];
  }
}

export function directionsUrl(
  origin: string,
  destination: string,
  travelmode: "driving" | "transit" | "walking" = "driving",
) {
  return `https://www.google.com/maps/dir/?api=1&origin=${enc(origin)}&destination=${enc(destination)}&travelmode=${travelmode}`;
}

/** Local ride links, e.g. "Delhi Airport" → "Red Fort". */
export function localRideLinks(pickup: string, dropoff: string): BookingLink[] {
  return [
    {
      label: "Rapido",
      href: "https://www.rapido.bike/",
      note: "Bike taxi, auto or cab — book in the Rapido app",
    },
    {
      label: "Uber",
      href: `https://m.uber.com/ul/?action=setPickup&pickup[formatted_address]=${enc(pickup)}&dropoff[formatted_address]=${enc(dropoff)}`,
      note: "Opens Uber with this drop-off",
    },
    { label: "Ola", href: "https://book.olacabs.com/", note: "Cabs and autos" },
    {
      label: "Directions",
      href: directionsUrl(pickup, dropoff, "transit"),
      note: "Metro / bus route",
    },
  ];
}
