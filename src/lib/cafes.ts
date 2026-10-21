export type WifiQuality = "none" | "unreliable" | "reliable" | "fast";
export type OutletAvailability = "none" | "few" | "plenty";
export type NoiseLevel = "quiet" | "moderate" | "lively";
export type SeatingType = "communal" | "solo" | "booths" | "outdoor";
export type VisitTime = "morning" | "afternoon" | "evening" | "weekend";

export type Review = {
  id: string;
  name: string;
  rating: number; // 1-5
  text?: string;
  wifi: WifiQuality;
  outlets: OutletAvailability;
  noise: NoiseLevel;
  seating: SeatingType;
  visitTime: VisitTime;
  date: string; // e.g. "2 days ago"
  photoUrl?: string;
};

export type Cafe = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  distance: string;
  distanceKm: number;
  rating: number;
  hours: string; // e.g. "7:00 AM - 7:00 PM"
  openNow: boolean;
  wifi: WifiQuality;
  outlets: OutletAvailability;
  noise: NoiseLevel;
  seating: SeatingType[];
  photo: string;
  reviews: Review[];
  lastConfirmed: string; // freshness e.g. "Confirmed 2 weeks ago"
};

const img = (id: string) => `https://images.unsplash.com/photo-${id}?w=800&q=80&auto=format&fit=crop`;

export function getDirectionsUrl(cafe: Cafe): string {
  if (cafe.lat && cafe.lng) {
    return `https://www.google.com/maps/dir/?api=1&destination=${cafe.lat},${cafe.lng}&destination_place_id=&travelmode=walking`;
  }
  const query = cafe.address ? `${cafe.name}, ${cafe.address}` : cafe.name;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export const cafes: Cafe[] = [
  {
    id: "1",
    name: "Ember & Oat",
    address: "42 Market St, Financial District",
    lat: 37.7935,
    lng: -122.399,
    distance: "0.2 km",
    distanceKm: 0.2,
    rating: 4.8,
    hours: "7:00 AM – 6:00 PM",
    openNow: true,
    wifi: "fast",
    outlets: "plenty",
    noise: "quiet",
    seating: ["communal", "solo", "booths"],
    photo: img("1554118811-1e0d58224f24"),
    lastConfirmed: "2 days ago",
    reviews: [
      {
        id: "r1",
        name: "Meera",
        rating: 5,
        text: "Fiber connection (120 Mbps). Power strip under every communal table. Silent focus vibes in the morning.",
        wifi: "fast",
        outlets: "plenty",
        noise: "quiet",
        seating: "communal",
        visitTime: "morning",
        date: "2 days ago",
      },
      {
        id: "r2",
        name: "Arjun",
        rating: 5,
        text: "Studied here for 5 hours without disturbance. Big tables fit laptop and textbooks easily.",
        wifi: "fast",
        outlets: "plenty",
        noise: "quiet",
        seating: "solo",
        visitTime: "afternoon",
        date: "1 week ago",
      },
    ],
  },
  {
    id: "2",
    name: "The Daily Grind & Co",
    address: "108 2nd St, SOMA",
    lat: 37.7885,
    lng: -122.401,
    distance: "0.5 km",
    distanceKm: 0.5,
    rating: 4.4,
    hours: "6:30 AM – 5:00 PM",
    openNow: true,
    wifi: "reliable",
    outlets: "few",
    noise: "moderate",
    seating: ["solo", "booths"],
    photo: img("1445116572660-236099ec97a0"),
    lastConfirmed: "4 days ago",
    reviews: [
      {
        id: "r3",
        name: "Dev S.",
        rating: 4,
        text: "Great pour-overs. Outlets are only along the perimeter wall, so charge up beforehand.",
        wifi: "reliable",
        outlets: "few",
        noise: "moderate",
        seating: "solo",
        visitTime: "afternoon",
        date: "4 days ago",
      },
    ],
  },
  {
    id: "3",
    name: "Fern Courtyard Botanical Cafe",
    address: "245 Mission St, Yerba Buena",
    lat: 37.7915,
    lng: -122.397,
    distance: "0.8 km",
    distanceKm: 0.8,
    rating: 4.6,
    hours: "8:00 AM – 7:00 PM",
    openNow: true,
    wifi: "reliable",
    outlets: "none",
    noise: "lively",
    seating: ["outdoor", "communal"],
    photo: img("1521017432531-fbd92d768814"),
    lastConfirmed: "1 week ago",
    reviews: [
      {
        id: "r4",
        name: "Ana P.",
        rating: 5,
        text: "Gorgeous lush greenery and breezy garden patio. Better for brainstorms and chats than deep spreadsheet work.",
        wifi: "reliable",
        outlets: "none",
        noise: "lively",
        seating: "outdoor",
        visitTime: "weekend",
        date: "1 week ago",
      },
    ],
  },
  {
    id: "4",
    name: "Quiet Quarter Workspace Cafe",
    address: "510 Pine St, Nob Hill",
    lat: 37.7918,
    lng: -122.4065,
    distance: "1.1 km",
    distanceKm: 1.1,
    rating: 4.9,
    hours: "8:00 AM – 8:00 PM",
    openNow: true,
    wifi: "fast",
    outlets: "plenty",
    noise: "quiet",
    seating: ["solo", "communal", "booths"],
    photo: img("1495474472287-4d71bcdd2085"),
    lastConfirmed: "3 days ago",
    reviews: [
      {
        id: "r5",
        name: "Sarah L.",
        rating: 5,
        text: "Library rules apply here! Noise dampening panels, ergonomic chairs, individual lamps with 2 AC sockets each.",
        wifi: "fast",
        outlets: "plenty",
        noise: "quiet",
        seating: "solo",
        visitTime: "morning",
        date: "3 days ago",
      },
    ],
  },
  {
    id: "5",
    name: "Brewhaus Social Roastery",
    address: "780 Folsom St, SOMA",
    lat: 37.7802,
    lng: -122.4025,
    distance: "1.4 km",
    distanceKm: 1.4,
    rating: 4.2,
    hours: "7:00 AM – 9:00 PM",
    openNow: true,
    wifi: "unreliable",
    outlets: "few",
    noise: "lively",
    seating: ["communal", "booths", "outdoor"],
    photo: img("1525610553991-2bede1a236e2"),
    lastConfirmed: "2 weeks ago",
    reviews: [
      {
        id: "r6",
        name: "Carlos T.",
        rating: 4,
        text: "Great playlists and incredible nitro cold brew. Gets packed after 3 PM, wifi gets sluggish with many users.",
        wifi: "unreliable",
        outlets: "few",
        noise: "lively",
        seating: "booths",
        visitTime: "afternoon",
        date: "2 weeks ago",
      },
    ],
  },
  {
    id: "6",
    name: "Artisan Bench Roasters",
    address: "312 Valencia St, Mission District",
    lat: 37.7665,
    lng: -122.422,
    distance: "2.3 km",
    distanceKm: 2.3,
    rating: 4.7,
    hours: "7:30 AM – 6:30 PM",
    openNow: false,
    wifi: "fast",
    outlets: "plenty",
    noise: "quiet",
    seating: ["communal", "solo"],
    photo: img("1501339847302-ac426a4a7cbb"),
    lastConfirmed: "5 days ago",
    reviews: [
      {
        id: "r7",
        name: "Priya K.",
        rating: 5,
        text: "Massive solid oak communal table with integrated surge protectors. Baristas are super friendly to remote workers.",
        wifi: "fast",
        outlets: "plenty",
        noise: "quiet",
        seating: "communal",
        visitTime: "morning",
        date: "5 days ago",
      },
    ],
  },
];
