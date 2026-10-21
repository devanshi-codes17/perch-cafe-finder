import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type Cafe,
  type WifiQuality,
  type OutletAvailability,
  type NoiseLevel,
  type SeatingType,
  type VisitTime,
} from "@/lib/cafes";
import { Star, ShieldAlert } from "lucide-react";

interface SuggestCafeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddCafe: (cafe: Cafe) => void;
}

export function SuggestCafeModal({ open, onOpenChange, onAddCafe }: SuggestCafeModalProps) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [wifi, setWifi] = useState<WifiQuality>("fast");
  const [outlets, setOutlets] = useState<OutletAvailability>("plenty");
  const [noise, setNoise] = useState<NoiseLevel>("quiet");
  const [seating, setSeating] = useState<SeatingType[]>(["communal", "solo"]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newCafe: Cafe = {
      id: "cafe-" + Date.now(),
      name: name.trim(),
      address: address.trim() || "Nearby location",
      lat: 37.788 + (Math.random() - 0.5) * 0.02,
      lng: -122.405 + (Math.random() - 0.5) * 0.02,
      distance: "0.4 km",
      distanceKm: 0.4,
      rating: 5.0,
      hours: "7:30 AM – 6:00 PM",
      openNow: true,
      wifi,
      outlets,
      noise,
      seating: seating.length ? seating : ["solo"],
      photo: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80&auto=format&fit=crop",
      reviews: [],
      lastConfirmed: "Just now (Community suggested)",
    };

    onAddCafe(newCafe);
    setName("");
    setAddress("");
    onOpenChange(false);
  };

  const toggleSeating = (st: SeatingType) => {
    setSeating((prev) =>
      prev.includes(st) ? prev.filter((s) => s !== st) : [...prev, st]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Suggest a Work-Friendly Cafe</DialogTitle>
          <DialogDescription className="text-xs">
            Help the community discover new spots equipped with power, fast wifi, and good seating.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="cafe-name" className="text-xs font-medium">Cafe Name *</Label>
            <Input
              id="cafe-name"
              placeholder="e.g. Ritual Coffee Roasters"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cafe-address" className="text-xs font-medium">Street Address / Neighborhood</Label>
            <Input
              id="cafe-address"
              placeholder="e.g. 1026 Valencia St, Mission"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Wifi Quality</Label>
            <div className="grid grid-cols-4 gap-1.5">
              {(["none", "unreliable", "reliable", "fast"] as WifiQuality[]).map((w) => (
                <button
                  type="button"
                  key={w}
                  onClick={() => setWifi(w)}
                  className={`rounded-lg py-1.5 text-xs capitalize border transition ${
                    wifi === w ? "bg-primary text-primary-foreground border-primary font-medium" : "hover:bg-muted text-muted-foreground"
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Power Outlets</Label>
            <div className="grid grid-cols-3 gap-1.5">
              {(["none", "few", "plenty"] as OutletAvailability[]).map((o) => (
                <button
                  type="button"
                  key={o}
                  onClick={() => setOutlets(o)}
                  className={`rounded-lg py-1.5 text-xs capitalize border transition ${
                    outlets === o ? "bg-primary text-primary-foreground border-primary font-medium" : "hover:bg-muted text-muted-foreground"
                  }`}
                >
                  {o}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Noise Level</Label>
            <div className="grid grid-cols-3 gap-1.5">
              {(["quiet", "moderate", "lively"] as NoiseLevel[]).map((n) => (
                <button
                  type="button"
                  key={n}
                  onClick={() => setNoise(n)}
                  className={`rounded-lg py-1.5 text-xs capitalize border transition ${
                    noise === n ? "bg-primary text-primary-foreground border-primary font-medium" : "hover:bg-muted text-muted-foreground"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Seating Types</Label>
            <div className="grid grid-cols-2 gap-1.5">
              {(["communal", "solo", "booths", "outdoor"] as SeatingType[]).map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => toggleSeating(s)}
                  className={`rounded-lg py-1.5 text-xs capitalize border transition ${
                    seating.includes(s)
                      ? "bg-primary/15 text-primary border-primary font-medium"
                      : "hover:bg-muted text-muted-foreground"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" disabled={!name.trim()} className="w-full mt-3 rounded-full">
            Submit Suggestion
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reviewAuthor?: string;
  onReportSubmit: (reason: string) => void;
}

export function ReportReviewModal({
  open,
  onOpenChange,
  reviewAuthor = "Review",
  onReportSubmit,
}: ReportModalProps) {
  const [reason, setReason] = useState("Spam / Fake review");

  const reasons = [
    "Spam / Fake review",
    "Inaccurate wifi or outlet information",
    "Abusive, offensive or inappropriate language",
    "Promotional / Commercial advertising",
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-2 text-destructive">
            <ShieldAlert className="h-5 w-5" />
            <DialogTitle className="text-lg">Report Review</DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Flag this review by {reviewAuthor} for community moderation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-2">
          {reasons.map((r) => (
            <label
              key={r}
              className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition ${
                reason === r ? "border-primary bg-primary/5 font-medium" : "hover:bg-muted/50"
              }`}
            >
              <input
                type="radio"
                name="report-reason"
                checked={reason === r}
                onChange={() => setReason(r)}
                className="text-primary focus:ring-primary"
              />
              <span>{r}</span>
            </label>
          ))}
        </div>

        <Button
          onClick={() => {
            onReportSubmit(reason);
            onOpenChange(false);
          }}
          className="w-full rounded-full"
        >
          Submit Report to Moderation
        </Button>
      </DialogContent>
    </Dialog>
  );
}
