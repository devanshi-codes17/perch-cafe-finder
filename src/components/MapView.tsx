import { type Cafe, getDirectionsUrl } from "@/lib/cafes";
import { MapPin, Navigation, ExternalLink } from "lucide-react";

interface MiniMapProps {
  cafe?: Cafe | null;
  cafes?: Cafe[];
  onSelectCafe?: (cafe: Cafe) => void;
  className?: string;
  zoom?: number;
}

export function MapView({
  cafe,
  cafes = [],
  onSelectCafe,
  className = "h-72 w-full",
}: MiniMapProps) {
  const activeCafe = cafe || cafes[0];
  const items = cafe ? [cafe] : cafes;

  // Center coordinate
  const lat = activeCafe ? activeCafe.lat : 37.788;
  const lng = activeCafe ? activeCafe.lng : -122.405;

  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-muted/30 shadow-inner flex flex-col ${className}`}>
      {/* Embed OpenStreetMap / Leaflet-compatible canvas iframe */}
      <iframe
        title="Map View"
        width="100%"
        height="100%"
        className="border-0 w-full flex-1 filter saturate-125"
        loading="lazy"
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.02}%2C${lat - 0.015}%2C${lng + 0.02}%2C${lat + 0.015}&layer=mapnik&marker=${lat}%2C${lng}`}
      />

      {/* Floating interactive overlay pills */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
        <div className="pointer-events-auto rounded-full bg-background/90 backdrop-blur-md px-3 py-1 text-xs font-medium shadow-md border flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-primary" />
          <span>{items.length} {items.length === 1 ? "cafe location" : "cafes pinned"}</span>
        </div>
        {activeCafe && (
          <a
            href={getDirectionsUrl(activeCafe)}
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground shadow-md transition hover:bg-primary/90"
          >
            <Navigation className="h-3.5 w-3.5" />
            <span>Open Google Maps</span>
            <ExternalLink className="h-3 w-3 opacity-80" />
          </a>
        )}
      </div>

      {/* Pin cards at the bottom if multiple cafes */}
      {!cafe && cafes.length > 0 && (
        <div className="absolute bottom-3 left-3 right-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {cafes.map((c) => (
            <button
              key={c.id}
              onClick={() => onSelectCafe?.(c)}
              className="shrink-0 flex items-center gap-2 rounded-xl bg-background/95 backdrop-blur-md border px-3 py-1.5 text-left text-xs shadow-md transition hover:scale-[1.02]"
            >
              <div className="h-2 w-2 rounded-full bg-primary" />
              <div>
                <p className="font-medium text-foreground">{c.name}</p>
                <p className="text-[10px] text-muted-foreground">{c.distance} · {c.wifi} wifi</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
