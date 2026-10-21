import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  cafes as seed,
  type Cafe,
  type WifiQuality,
  type OutletAvailability,
  type NoiseLevel,
  type SeatingType,
  type VisitTime,
  getDirectionsUrl,
} from "@/lib/cafes";
import { MapView } from "@/components/MapView";
import { SuggestCafeModal, ReportReviewModal } from "@/components/CafeModals";
import {
  MapPin,
  Navigation,
  ExternalLink,
  Wifi,
  Zap,
  Volume2,
  Armchair,
  Clock,
  CheckCircle2,
  List,
  Map as MapIcon,
  Search,
  SlidersHorizontal,
  PlusCircle,
  Flag,
  Share2,
  Check,
  Sparkles,
  ArrowUpDown,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Perch — Work-Friendly Cafe Finder" },
      {
        name: "description",
        content:
          "Discover nearby cafes filtered by wifi quality, power outlets, noise levels, and seating. Read and share community-verified workspace reviews.",
      },
      { property: "og:title", content: "Perch — Work-Friendly Cafe Finder" },
      {
        property: "og:description",
        content: "Filter cafes by verified wifi, outlets, noise and seating for remote work and study.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: App,
});

type Tab = "discover" | "saved";
type ViewMode = "list" | "map";
type SortOption = "match" | "distance" | "rating";

function App() {
  const [cafes, setCafes] = useState<Cafe[]>(seed);
  const [tab, setTab] = useState<Tab>("discover");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [openId, setOpenId] = useState<string | null>(null);
  const [favs, setFavs] = useState<string[]>(["1", "4"]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("match");

  // Attribute filters matching PRD MVP
  const [selectedWifi, setSelectedWifi] = useState<WifiQuality[]>([]);
  const [selectedOutlets, setSelectedOutlets] = useState<OutletAvailability[]>([]);
  const [selectedNoise, setSelectedNoise] = useState<NoiseLevel[]>([]);
  const [selectedSeating, setSelectedSeating] = useState<SeatingType[]>([]);
  const [openNowOnly, setOpenNowOnly] = useState(false);

  // Modals state
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  // Post-visit prompt verification banner state (PRD Goal 1)
  const [verifiedPromptDismissed, setVerifiedPromptDismissed] = useState(false);

  const toggleFav = (id: string) => {
    setFavs((f) => {
      const isFav = f.includes(id);
      if (isFav) {
        toast.info("Removed from saved places");
        return f.filter((x) => x !== id);
      } else {
        toast.success("Saved to your favourites!");
        return [...f, id];
      }
    });
  };

  const toggleWifi = (w: WifiQuality) =>
    setSelectedWifi((prev) => (prev.includes(w) ? prev.filter((x) => x !== w) : [...prev, w]));

  const toggleOutlet = (o: OutletAvailability) =>
    setSelectedOutlets((prev) => (prev.includes(o) ? prev.filter((x) => x !== o) : [...prev, o]));

  const toggleNoise = (n: NoiseLevel) =>
    setSelectedNoise((prev) => (prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]));

  const toggleSeating = (s: SeatingType) =>
    setSelectedSeating((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const clearAllFilters = () => {
    setSelectedWifi([]);
    setSelectedOutlets([]);
    setSelectedNoise([]);
    setSelectedSeating([]);
    setOpenNowOnly(false);
    setSearchQuery("");
  };

  const activeFilterCount =
    selectedWifi.length +
    selectedOutlets.length +
    selectedNoise.length +
    selectedSeating.length +
    (openNowOnly ? 1 : 0);

  // Filter & match scoring
  const filteredAndSortedCafes = useMemo(() => {
    const baseList = tab === "saved" ? cafes.filter((c) => favs.includes(c.id)) : cafes;

    const filtered = baseList.filter((c) => {
      // Query filter (name or address)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesAddress = c.address.toLowerCase().includes(q);
        if (!matchesName && !matchesAddress) return false;
      }

      // Open now filter
      if (openNowOnly && !c.openNow) return false;

      // Wifi filter
      if (selectedWifi.length > 0 && !selectedWifi.includes(c.wifi)) return false;

      // Outlets filter
      if (selectedOutlets.length > 0 && !selectedOutlets.includes(c.outlets)) return false;

      // Noise filter
      if (selectedNoise.length > 0 && !selectedNoise.includes(c.noise)) return false;

      // Seating filter (at least one matching seating option)
      if (selectedSeating.length > 0 && !c.seating.some((st) => selectedSeating.includes(st))) {
        return false;
      }

      return true;
    });

    // Sorting
    return [...filtered].sort((a, b) => {
      if (sortBy === "distance") {
        return a.distanceKm - b.distanceKm;
      }
      if (sortBy === "rating") {
        return b.rating - a.rating;
      }
      // "match" sort - prioritise fast wifi, plenty outlets, and quiet noise
      const score = (c: Cafe) => {
        let sc = 0;
        if (c.wifi === "fast") sc += 4;
        else if (c.wifi === "reliable") sc += 2;
        if (c.outlets === "plenty") sc += 4;
        else if (c.outlets === "few") sc += 2;
        if (c.noise === "quiet") sc += 3;
        else if (c.noise === "moderate") sc += 1;
        if (c.openNow) sc += 2;
        return sc;
      };
      return score(b) - score(a);
    });
  }, [
    cafes,
    tab,
    favs,
    searchQuery,
    openNowOnly,
    selectedWifi,
    selectedOutlets,
    selectedNoise,
    selectedSeating,
    sortBy,
  ]);

  const openCafe = cafes.find((c) => c.id === openId);

  return (
    <div className="min-h-screen bg-muted/60 text-foreground antialiased sm:py-8">
      {/* Shell Container */}
      <div className="mx-auto min-h-screen max-w-xl overflow-hidden bg-background sm:min-h-0 sm:rounded-3xl sm:border sm:shadow-2xl">
        {openCafe ? (
          <DetailView
            cafe={openCafe}
            fav={favs.includes(openCafe.id)}
            onFav={() => toggleFav(openCafe.id)}
            onBack={() => setOpenId(null)}
            onReview={(newRev) => {
              setCafes((cs) =>
                cs.map((c) => (c.id === openCafe.id ? { ...c, reviews: [newRev, ...c.reviews] } : c))
              );
              toast.success("Review posted! Thanks for verifying workspace attributes.");
            }}
          />
        ) : (
          <>
            {/* Header Section */}
            <header className="px-5 pt-6 pb-2 border-b bg-background sticky top-0 z-20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-primary">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span>Workspace Finder</span>
                  </div>
                  <h1 className="font-display text-3xl font-semibold tracking-tight">Perch</h1>
                </div>

                {/* Suggest Cafe CTA */}
                <button
                  onClick={() => setIsSuggestOpen(true)}
                  className="flex items-center gap-1.5 rounded-full border bg-muted/50 px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted"
                >
                  <PlusCircle className="h-3.5 w-3.5 text-primary" />
                  <span>Suggest Cafe</span>
                </button>
              </div>

              {/* Discover / Saved Tabs */}
              <div className="mt-4 flex gap-1 rounded-full bg-muted p-1 text-sm">
                {(["discover", "saved"] as Tab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`flex-1 rounded-full py-1.5 text-xs font-medium capitalize transition ${
                      tab === t
                        ? "bg-background shadow-sm text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t === "saved" ? `Saved Spots (${favs.length})` : "Nearby Cafes"}
                  </button>
                ))}
              </div>

              {/* Search Bar & View Mode Toggle */}
              <div className="mt-3 flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search cafe name or neighborhood..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border bg-muted/40 pl-9 pr-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-2.5 text-xs text-muted-foreground hover:text-foreground"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* List / Map view switcher */}
                <div className="flex rounded-xl border bg-muted/40 p-0.5">
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-lg transition ${
                      viewMode === "list" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"
                    }`}
                    title="List View"
                  >
                    <List className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("map")}
                    className={`p-2 rounded-lg transition ${
                      viewMode === "map" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"
                    }`}
                    title="Map View"
                  >
                    <MapIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Filter toggle & Sort dropdown */}
              <div className="mt-2.5 flex items-center justify-between text-xs pb-1">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-1.5 font-medium text-foreground hover:text-primary transition"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span>Attribute Filters</span>
                  {activeFilterCount > 0 && (
                    <span className="rounded-full bg-primary px-1.5 py-0.2 text-[10px] text-primary-foreground">
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <ArrowUpDown className="h-3.5 w-3.5" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="bg-transparent text-xs font-medium text-foreground outline-none cursor-pointer"
                  >
                    <option value="match">Sort: Best Match</option>
                    <option value="distance">Sort: Distance</option>
                    <option value="rating">Sort: Top Rated</option>
                  </select>
                </div>
              </div>
            </header>

            {/* Filter Chips Bar (Structured MVP Attributes) */}
            {showFilters && (
              <div className="border-b bg-muted/20 px-5 py-3 space-y-2.5 text-xs animate-in fade-in slide-in-from-top-1">
                {/* Wifi Filter */}
                <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
                  <span className="shrink-0 font-medium text-muted-foreground flex items-center gap-1">
                    <Wifi className="h-3.5 w-3.5" /> Wifi:
                  </span>
                  {(["fast", "reliable", "unreliable"] as WifiQuality[]).map((w) => (
                    <FilterChip
                      key={w}
                      active={selectedWifi.includes(w)}
                      onClick={() => toggleWifi(w)}
                    >
                      {w === "fast" ? "⚡ Fast" : w === "reliable" ? "✓ Reliable" : "⚠️ Slow"}
                    </FilterChip>
                  ))}
                </div>

                {/* Outlets Filter */}
                <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
                  <span className="shrink-0 font-medium text-muted-foreground flex items-center gap-1">
                    <Zap className="h-3.5 w-3.5" /> Outlets:
                  </span>
                  {(["plenty", "few", "none"] as OutletAvailability[]).map((o) => (
                    <FilterChip
                      key={o}
                      active={selectedOutlets.includes(o)}
                      onClick={() => toggleOutlet(o)}
                    >
                      {o === "plenty" ? "🔌 Plenty" : o === "few" ? "🔌 Few" : "No Outlets"}
                    </FilterChip>
                  ))}
                </div>

                {/* Noise Filter */}
                <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
                  <span className="shrink-0 font-medium text-muted-foreground flex items-center gap-1">
                    <Volume2 className="h-3.5 w-3.5" /> Noise:
                  </span>
                  {(["quiet", "moderate", "lively"] as NoiseLevel[]).map((n) => (
                    <FilterChip
                      key={n}
                      active={selectedNoise.includes(n)}
                      onClick={() => toggleNoise(n)}
                    >
                      {n === "quiet" ? "🤫 Quiet" : n === "moderate" ? "☕ Moderate" : "🎉 Lively"}
                    </FilterChip>
                  ))}
                </div>

                {/* Seating Filter & Open Now */}
                <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none">
                  <span className="shrink-0 font-medium text-muted-foreground flex items-center gap-1">
                    <Armchair className="h-3.5 w-3.5" /> Seating:
                  </span>
                  {(["communal", "solo", "booths", "outdoor"] as SeatingType[]).map((s) => (
                    <FilterChip
                      key={s}
                      active={selectedSeating.includes(s)}
                      onClick={() => toggleSeating(s)}
                    >
                      {s === "communal" ? "🪑 Big Tables" : s === "solo" ? "👤 Solo Tables" : s === "booths" ? "🛋️ Booths" : "🌿 Outdoor"}
                    </FilterChip>
                  ))}
                  <FilterChip
                    active={openNowOnly}
                    onClick={() => setOpenNowOnly(!openNowOnly)}
                    className="border-emerald-600/30 text-emerald-700 dark:text-emerald-400"
                  >
                    🟢 Open Now
                  </FilterChip>
                </div>

                {activeFilterCount > 0 && (
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={clearAllFilters}
                      className="text-[11px] text-primary underline hover:opacity-80"
                    >
                      Reset all filters
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Post-visit one-tap validation prompt (PRD Goal 1 metric) */}
            {!verifiedPromptDismissed && (
              <div className="mx-5 mt-4 flex items-center justify-between rounded-2xl bg-primary/10 border border-primary/20 p-3.5 text-xs text-foreground">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Visited Ember & Oat recently?</p>
                    <p className="text-muted-foreground text-[11px]">
                      Did it match your filter requirements for power & wifi?
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      toast.success("Thank you! Filter match confirmed.");
                      setVerifiedPromptDismissed(true);
                    }}
                    className="rounded-full bg-primary px-3 py-1 font-medium text-primary-foreground hover:bg-primary/90 text-[11px]"
                  >
                    Yes, 100%
                  </button>
                  <button
                    onClick={() => setVerifiedPromptDismissed(true)}
                    className="text-muted-foreground hover:text-foreground text-[11px] p-1"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}

            {/* Main Content: Map or List */}
            <div className="p-5">
              {viewMode === "map" ? (
                <div className="space-y-3">
                  <MapView
                    cafes={filteredAndSortedCafes}
                    onSelectCafe={(c) => {
                      setOpenId(c.id);
                      window.scrollTo(0, 0);
                    }}
                    className="h-96 w-full"
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    Showing {filteredAndSortedCafes.length} cafes matching current criteria
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAndSortedCafes.length === 0 ? (
                    <div className="py-14 text-center">
                      <p className="text-sm font-medium text-foreground">No cafes match these filters</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Try loosening your wifi or outlet filters to find more places.
                      </p>
                      <button
                        onClick={clearAllFilters}
                        className="mt-4 rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground"
                      >
                        Reset filters
                      </button>
                    </div>
                  ) : (
                    filteredAndSortedCafes.map((cafe) => (
                      <CafeCard
                        key={cafe.id}
                        cafe={cafe}
                        isFav={favs.includes(cafe.id)}
                        onFav={() => toggleFav(cafe.id)}
                        onClick={() => {
                          setOpenId(cafe.id);
                          window.scrollTo(0, 0);
                        }}
                      />
                    ))
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <p className="py-5 text-center text-xs text-muted-foreground">
        Perch · Hybrid Work & Study Cafe Directory · Community Verified
      </p>

      {/* Suggest Cafe Modal */}
      <SuggestCafeModal
        open={isSuggestOpen}
        onOpenChange={setIsSuggestOpen}
        onAddCafe={(newCafe) => {
          setCafes((prev) => [newCafe, ...prev]);
          toast.success("Thank you! Cafe added to community directory.");
        }}
      />
    </div>
  );
}

// Cafe Card Component
function CafeCard({
  cafe,
  isFav,
  onFav,
  onClick,
}: {
  cafe: Cafe;
  isFav: boolean;
  onFav: () => void;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="group relative flex cursor-pointer gap-3.5 rounded-2xl border bg-card p-3.5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
        <img
          src={cafe.photo}
          alt={cafe.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        <div className="absolute bottom-1 left-1 rounded-md bg-background/85 px-1.5 py-0.5 text-[10px] font-semibold backdrop-blur-sm">
          ★ {cafe.rating.toFixed(1)}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-sm text-foreground line-clamp-1">{cafe.name}</h3>
            <p className="text-xs text-muted-foreground line-clamp-1">{cafe.address}</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFav();
            }}
            className="text-lg p-1 transition hover:scale-110 text-primary"
            title={isFav ? "Saved" : "Save to Favourites"}
          >
            {isFav ? "♥" : "♡"}
          </button>
        </div>

        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
          <span>{cafe.distance} away</span>
          <span>•</span>
          <span className={cafe.openNow ? "text-emerald-600 font-medium" : "text-muted-foreground"}>
            {cafe.openNow ? "Open now" : "Closed"}
          </span>
        </div>

        {/* Work Attributes Badges */}
        <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
          <span
            className={`rounded-md px-2 py-0.5 font-medium ${
              cafe.wifi === "fast"
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300"
                : "bg-muted text-muted-foreground"
            }`}
          >
            📶 {cafe.wifi} wifi
          </span>

          <span
            className={`rounded-md px-2 py-0.5 font-medium ${
              cafe.outlets === "plenty"
                ? "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"
                : "bg-muted text-muted-foreground"
            }`}
          >
            🔌 {cafe.outlets} outlets
          </span>

          <span className="rounded-md bg-muted px-2 py-0.5 text-muted-foreground">
            🔊 {cafe.noise}
          </span>
        </div>
      </div>
    </div>
  );
}

// Cafe Detail View with Full Attributes, Verification and Directions
function DetailView({
  cafe,
  fav,
  onFav,
  onBack,
  onReview,
}: {
  cafe: Cafe;
  fav: boolean;
  onFav: () => void;
  onBack: () => void;
  onReview: (r: any) => void;
}) {
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [wifiQuality, setWifiQuality] = useState<WifiQuality>(cafe.wifi);
  const [outlets, setOutlets] = useState<OutletAvailability>(cafe.outlets);
  const [noise, setNoise] = useState<NoiseLevel>(cafe.noise);
  const [seating, setSeating] = useState<SeatingType>(cafe.seating[0] || "communal");
  const [visitTime, setVisitTime] = useState<VisitTime>("morning");
  const [reportingReview, setReportingReview] = useState<string | null>(null);

  const handlePostReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    onReview({
      id: "rev-" + Date.now(),
      name: "You",
      rating,
      text: text.trim(),
      wifi: wifiQuality,
      outlets,
      noise,
      seating,
      visitTime,
      date: "Just now",
    });
    setText("");
  };

  return (
    <div className="animate-in fade-in">
      {/* Top Media Bar */}
      <div className="relative h-56 bg-muted">
        <img src={cafe.photo} alt={cafe.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-black/40" />

        <button
          onClick={onBack}
          className="absolute left-4 top-4 rounded-full bg-background/90 backdrop-blur-md px-3.5 py-1.5 text-xs font-medium shadow-md transition hover:bg-background"
        >
          ← Back
        </button>

        <div className="absolute right-4 top-4 flex gap-2">
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: cafe.name, url: window.location.href });
              } else {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Link copied to clipboard!");
              }
            }}
            className="rounded-full bg-background/90 backdrop-blur-md p-2 text-foreground shadow-md transition hover:bg-background"
            title="Share Cafe"
          >
            <Share2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onFav}
            className="rounded-full bg-background/90 backdrop-blur-md px-3.5 py-1.5 text-xs font-medium text-primary shadow-md transition hover:bg-background"
          >
            {fav ? "♥ Saved" : "♡ Save"}
          </button>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <h2 className="font-display text-2xl font-bold text-foreground drop-shadow-sm">
            {cafe.name}
          </h2>
          <div className="mt-1 flex items-center gap-2 text-xs text-foreground/90">
            <span className="font-semibold text-primary">★ {cafe.rating.toFixed(1)}</span>
            <span>•</span>
            <span>{cafe.distance} away</span>
            <span>•</span>
            <span className={cafe.openNow ? "text-emerald-600 font-semibold" : "text-muted-foreground"}>
              {cafe.openNow ? "Open Now" : "Closed"}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-5">
        {/* Address and Hours */}
        <div className="rounded-2xl border bg-card p-4 space-y-3">
          <div className="flex items-start gap-2.5 text-xs">
            <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">{cafe.address}</p>
              <p className="text-muted-foreground text-[11px] mt-0.5">
                Freshness: {cafe.lastConfirmed}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-muted-foreground border-t pt-2.5">
            <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span>Regular Hours: {cafe.hours}</span>
          </div>

          {/* Google Maps Action */}
          <div className="pt-1">
            <a
              href={getDirectionsUrl(cafe)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90 w-full"
            >
              <Navigation className="h-4 w-4" />
              <span>Get Walking Directions in Google Maps</span>
              <ExternalLink className="h-3.5 w-3.5 opacity-80" />
            </a>
          </div>
        </div>

        {/* Embedded Location Map */}
        <div>
          <h3 className="font-semibold text-xs tracking-wider uppercase text-muted-foreground mb-2">
            Location & Vicinity
          </h3>
          <MapView cafe={cafe} className="h-52 w-full" />
        </div>

        {/* Aggregated Workspace Attribute Matrix (PRD Cafe Detail) */}
        <div>
          <h3 className="font-semibold text-xs tracking-wider uppercase text-muted-foreground mb-2">
            Work Suitability Summary ({cafe.reviews.length + 12} community points)
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <StatCard
              icon={<Wifi className="h-4 w-4 text-primary" />}
              label="Wifi Quality"
              value={cafe.wifi === "fast" ? "Fast (>100 Mbps)" : cafe.wifi === "reliable" ? "Reliable" : "Unreliable"}
              sub="Video call friendly"
            />
            <StatCard
              icon={<Zap className="h-4 w-4 text-primary" />}
              label="Power Outlets"
              value={cafe.outlets === "plenty" ? "Plenty available" : cafe.outlets === "few" ? "Limited / Wall only" : "None"}
              sub="Multi-hour stays"
            />
            <StatCard
              icon={<Volume2 className="h-4 w-4 text-primary" />}
              label="Noise Level"
              value={cafe.noise === "quiet" ? "Quiet / Focused" : cafe.noise === "moderate" ? "Moderate ambient" : "Lively music"}
              sub="Call suitability"
            />
            <StatCard
              icon={<Armchair className="h-4 w-4 text-primary" />}
              label="Seating Layout"
              value={cafe.seating.map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(", ")}
              sub="Spacious tables"
            />
          </div>
        </div>

        {/* Structured Review Submission (PRD Section 5) */}
        <div className="rounded-2xl border bg-card p-4 space-y-4">
          <div>
            <h3 className="font-semibold text-sm">Rate Workspace Attributes</h3>
            <p className="text-xs text-muted-foreground">
              Help other remote workers know what power & wifi to expect.
            </p>
          </div>

          <form onSubmit={handlePostReview} className="space-y-3.5">
            {/* Overall Stars */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Overall Rating</span>
              <div className="flex gap-1 text-xl">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    className={n <= rating ? "text-primary" : "text-muted-foreground/30"}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* Time of Visit Selector (PRD requirement) */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Time of Visit</label>
              <div className="grid grid-cols-4 gap-1">
                {(["morning", "afternoon", "evening", "weekend"] as VisitTime[]).map((vt) => (
                  <button
                    type="button"
                    key={vt}
                    onClick={() => setVisitTime(vt)}
                    className={`rounded-lg py-1 text-[11px] capitalize border transition ${
                      visitTime === vt ? "bg-primary text-primary-foreground border-primary font-medium" : "hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    {vt}
                  </button>
                ))}
              </div>
            </div>

            {/* Wifi in Review */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Wifi Experience</label>
              <div className="grid grid-cols-4 gap-1">
                {(["none", "unreliable", "reliable", "fast"] as WifiQuality[]).map((w) => (
                  <button
                    type="button"
                    key={w}
                    onClick={() => setWifiQuality(w)}
                    className={`rounded-lg py-1 text-[11px] capitalize border transition ${
                      wifiQuality === w ? "bg-primary text-primary-foreground border-primary font-medium" : "hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            {/* Outlets in Review */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Outlets Available</label>
              <div className="grid grid-cols-3 gap-1">
                {(["none", "few", "plenty"] as OutletAvailability[]).map((o) => (
                  <button
                    type="button"
                    key={o}
                    onClick={() => setOutlets(o)}
                    className={`rounded-lg py-1 text-[11px] capitalize border transition ${
                      outlets === o ? "bg-primary text-primary-foreground border-primary font-medium" : "hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>

            {/* Noise in Review */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Noise Atmosphere</label>
              <div className="grid grid-cols-3 gap-1">
                {(["quiet", "moderate", "lively"] as NoiseLevel[]).map((n) => (
                  <button
                    type="button"
                    key={n}
                    onClick={() => setNoise(n)}
                    className={`rounded-lg py-1 text-[11px] capitalize border transition ${
                      noise === n ? "bg-primary text-primary-foreground border-primary font-medium" : "hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Was it easy to get a table? How was the coffee and staff?"
              className="w-full rounded-xl border bg-background p-3 text-xs outline-none focus:ring-2 focus:ring-primary/20"
              rows={2}
            />

            <button
              type="submit"
              disabled={!text.trim()}
              className="w-full rounded-full bg-primary py-2.5 text-xs font-semibold text-primary-foreground disabled:opacity-40 transition"
            >
              Submit Structured Review
            </button>
          </form>
        </div>

        {/* Reviews List with Structured Ratings & Report Button */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-xs tracking-wider uppercase text-muted-foreground">
              Reviews & Verification ({cafe.reviews.length})
            </h3>
            <span className="text-[11px] text-muted-foreground">Filtered by recent</span>
          </div>

          {cafe.reviews.length === 0 ? (
            <p className="py-4 text-center text-xs text-muted-foreground">
              No reviews yet. Be the first remote worker to verify this spot!
            </p>
          ) : (
            cafe.reviews.map((r) => (
              <div key={r.id} className="rounded-2xl border bg-card p-3.5 space-y-2 text-xs">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-semibold">{r.name}</span>
                    <span className="text-primary ml-1.5">{"★".repeat(r.rating)}</span>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      Visited in the {r.visitTime} · {r.date}
                    </div>
                  </div>

                  {/* Report fake/abusive review button (PRD MVP) */}
                  <button
                    onClick={() => setReportingReview(r.name)}
                    className="text-muted-foreground hover:text-destructive transition p-1"
                    title="Report fake or inaccurate review"
                  >
                    <Flag className="h-3 w-3" />
                  </button>
                </div>

                {r.text && <p className="text-foreground/90">{r.text}</p>}

                {/* Attribute tags recorded in review */}
                <div className="flex flex-wrap gap-1 text-[10px]">
                  <span className="rounded bg-muted px-1.5 py-0.5 text-muted-foreground">
                    Wifi: {r.wifi}
                  </span>
                  <span className="rounded bg-muted px-1.5 py-0.5 text-muted-foreground">
                    Outlets: {r.outlets}
                  </span>
                  <span className="rounded bg-muted px-1.5 py-0.5 text-muted-foreground">
                    Noise: {r.noise}
                  </span>
                  <span className="rounded bg-muted px-1.5 py-0.5 text-muted-foreground">
                    Seat: {r.seating}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Report Review Modal */}
      {reportingReview && (
        <ReportReviewModal
          open={!!reportingReview}
          onOpenChange={(op) => !op && setReportingReview(null)}
          reviewAuthor={reportingReview}
          onReportSubmit={(reason) => {
            toast.success(`Review reported for "${reason}". Sent to moderation queue.`);
            setReportingReview(null);
          }}
        />
      )}
    </div>
  );
}

// Micro UI helpers
function FilterChip({
  active,
  onClick,
  children,
  className = "",
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition ${
        active
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-border/80 bg-background text-foreground/80 hover:bg-muted"
      } ${className}`}
    >
      {children}
    </button>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-xl border bg-muted/40 p-3 flex flex-col justify-between">
      <div className="flex items-center gap-1.5 text-muted-foreground">
        {icon}
        <span className="text-[11px] font-medium">{label}</span>
      </div>
      <div className="mt-2">
        <p className="font-semibold text-foreground text-xs leading-tight">{value}</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>
      </div>
    </div>
  );
}
