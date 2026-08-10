import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { searchPlaces, saveLeadList, type PlacesLead } from "@/lib/leadvine/places.functions";
import { refineFilters } from "@/lib/leadvine/refine.functions";
import { leadsToCsv, downloadCsv } from "@/lib/leadvine/csv";
import {
  Search,
  MapPin,
  Phone,
  Star,
  ExternalLink,
  Loader2,
  Download,
  Sparkles,
  X,
} from "lucide-react";

type FindLeadsSearch = {
  q?: string;
  loc?: string;
  only?: number;
  run?: number;
};

export const Route = createFileRoute("/_authenticated/app/find-leads")({
  head: () => ({ meta: [{ title: "Find leads — LeadVine" }] }),
  validateSearch: (s: Record<string, unknown>): FindLeadsSearch => ({
    q: typeof s.q === "string" ? s.q : undefined,
    loc: typeof s.loc === "string" ? s.loc : undefined,
    only: typeof s.only === "number" ? s.only : s.only === "1" ? 1 : s.only === "0" ? 0 : undefined,
    run: typeof s.run === "number" ? s.run : s.run === "1" ? 1 : undefined,
  }),
  component: FindLeads,
});

function FindLeads() {
  const navigate = useNavigate();
  const initial = Route.useSearch();
  const [query, setQuery] = useState(initial.q ?? "");
  const [location, setLocation] = useState(initial.loc ?? "");
  const [onlyMissing, setOnlyMissing] = useState(
    initial.only === undefined ? true : initial.only === 1,
  );
  const [results, setResults] = useState<{
    all: PlacesLead[];
    withoutWebsite: PlacesLead[];
  } | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const searchFn = useServerFn(searchPlaces);
  const saveFn = useServerFn(saveLeadList);
  const refineFn = useServerFn(refineFilters);

  const [refineOpen, setRefineOpen] = useState(false);
  const [refineText, setRefineText] = useState("");
  const [refineNote, setRefineNote] = useState<string | null>(null);

  const refine = useMutation({
    mutationFn: async (instruction: string) =>
      refineFn({ data: { current: { query, location, onlyMissing }, instruction } }),
    onSuccess: async (r) => {
      setQuery(r.query);
      setLocation(r.location);
      setOnlyMissing(r.onlyMissing);
      setRefineNote(r.notes ?? null);
      setRefineText("");
      setRefineOpen(false);
      toast.success("Filters updated — searching…");
      try {
        const res = await searchFn({ data: { query: r.query, location: r.location } });
        setResults(res);
        setSelected(new Set((r.onlyMissing ? res.withoutWebsite : res.all).map((l) => l.place_id)));
        toast.success(
          `Found ${res.all.length} businesses (${res.withoutWebsite.length} without a website)`,
        );
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Search failed");
      }
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Refine failed"),
  });

  const search = useMutation({
    mutationFn: async () => searchFn({ data: { query, location } }),
    onSuccess: (r) => {
      setResults(r);
      setSelected(new Set((onlyMissing ? r.withoutWebsite : r.all).map((l) => l.place_id)));
      toast.success(
        `Found ${r.all.length} businesses (${r.withoutWebsite.length} without a website)`,
      );
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Search failed"),
  });

  const autoRan = useRef(false);
  useEffect(() => {
    if (autoRan.current) return;
    if (initial.run === 1 && (initial.q || query) && (initial.loc || location)) {
      autoRan.current = true;
      search.mutate();
      navigate({ to: "/app/find-leads", search: {}, replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = useMutation({
    mutationFn: async () => {
      const leads = (results?.all ?? []).filter((l) => selected.has(l.place_id));
      if (leads.length === 0) throw new Error("Nothing to save");
      return saveFn({ data: { listName: `${query} — ${location}`, query, location, leads } });
    },
    onSuccess: () => {
      toast.success("Saved to your lead lists");
      navigate({ to: "/app/lists" });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  const shown = results ? (onlyMissing ? results.withoutWebsite : results.all) : [];
  const selectedShown = shown.filter((l) => selected.has(l.place_id));
  const allShownSelected = shown.length > 0 && selectedShown.length === shown.length;

  const toggle = (id: string) => {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  };
  const toggleAll = () => {
    setSelected((s) => {
      const n = new Set(s);
      if (allShownSelected) shown.forEach((l) => n.delete(l.place_id));
      else shown.forEach((l) => n.add(l.place_id));
      return n;
    });
  };

  return (
    <div>
      <div className="mb-8">
        <div className="text-xs uppercase tracking-widest text-vine mb-2">Tool</div>
        <h1 className="font-display text-4xl mb-2">Find leads</h1>
        <p className="text-muted-foreground">
          Search Google Maps for businesses in a niche and city, then filter for those without a
          website.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          search.mutate();
        }}
        className="rounded-2xl border border-border bg-card p-5 grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end mb-6"
      >
        <Field label="Business type">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            required
            placeholder="Bakery, plumber, auto repair…"
            className="input"
          />
        </Field>
        <Field label="Location">
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            placeholder="Portland, OR"
            className="input"
          />
        </Field>
        <button
          disabled={search.isPending}
          type="submit"
          className="bg-vine text-primary-foreground rounded-md py-2.5 px-6 font-medium h-11 flex items-center gap-2 justify-center hover:opacity-90 disabled:opacity-50"
        >
          {search.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
          Search
        </button>
      </form>

      <div className="flex items-center justify-between mb-6 -mt-2 flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setRefineOpen((v) => !v)}
          className="inline-flex items-center gap-2 text-sm border border-border rounded-md px-3 py-1.5 hover:bg-secondary"
        >
          <Sparkles className="h-3.5 w-3.5 text-vine" />
          Refine with AI
        </button>
        {refineNote && (
          <div className="text-xs text-muted-foreground flex items-center gap-2 max-w-xl">
            <span className="line-clamp-2">{refineNote}</span>
            <button
              onClick={() => setRefineNote(null)}
              className="text-muted-foreground hover:text-foreground"
              aria-label="Dismiss"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>

      {refineOpen && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (refineText.trim()) refine.mutate(refineText.trim());
          }}
          className="rounded-2xl border border-border bg-card p-5 mb-6"
        >
          <div className="text-xs uppercase tracking-widest text-vine mb-2 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3" /> Refine filters
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Ask in plain English — e.g. "switch to dentists in Miami" or "also include ones that
            have a website".
          </p>
          <div className="flex gap-2">
            <input
              value={refineText}
              onChange={(e) => setRefineText(e.target.value)}
              autoFocus
              placeholder="How should I change the filters?"
              className="input flex-1"
            />
            <button
              type="submit"
              disabled={refine.isPending || !refineText.trim()}
              className="bg-vine text-primary-foreground rounded-md px-4 text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
            >
              {refine.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Update
            </button>
            <button
              type="button"
              onClick={() => {
                setRefineOpen(false);
                setRefineText("");
              }}
              className="border border-border rounded-md px-3 text-sm hover:bg-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {results && (
        <div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div className="flex items-center gap-4 flex-wrap">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={onlyMissing}
                  onChange={(e) => setOnlyMissing(e.target.checked)}
                />
                Only without websites ({results.withoutWebsite.length})
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={allShownSelected} onChange={toggleAll} />
                Select all ({selectedShown.length}/{shown.length})
              </label>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (selectedShown.length === 0) return;
                  downloadCsv(
                    `${query}-${location}`,
                    leadsToCsv(selectedShown.map((l) => ({ ...l, has_website: !!l.website }))),
                  );
                }}
                disabled={selectedShown.length === 0}
                className="border border-border rounded-md py-2 px-4 text-sm font-medium hover:bg-secondary disabled:opacity-50 flex items-center gap-2"
              >
                <Download className="h-3.5 w-3.5" /> CSV ({selectedShown.length})
              </button>
              <button
                onClick={() => save.mutate()}
                disabled={save.isPending || selectedShown.length === 0}
                className="bg-vine text-primary-foreground rounded-md py-2 px-4 text-sm font-medium hover:opacity-90 disabled:opacity-50"
              >
                {save.isPending ? "Saving…" : `Save ${selectedShown.length} to list`}
              </button>
            </div>
          </div>

          <div className="grid gap-3">
            {shown.map((l) => (
              <LeadRow
                key={l.place_id}
                lead={l}
                checked={selected.has(l.place_id)}
                onToggle={() => toggle(l.place_id)}
              />
            ))}
            {shown.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No matches.</p>
            )}
          </div>
        </div>
      )}

      <style>{`.input { width:100%; background: var(--background); border:1px solid var(--border); border-radius: 8px; padding: 10px 12px; font-size: 14px; outline:none; }
      .input:focus { border-color: var(--vine); }`}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5">{label}</div>
      {children}
    </div>
  );
}

function LeadRow({
  lead,
  checked,
  onToggle,
}: {
  lead: PlacesLead;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-6">
      <input
        type="checkbox"
        checked={checked}
        onChange={onToggle}
        className="mt-1 md:mt-0 self-start md:self-center"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <div className="font-medium truncate">{lead.name}</div>
          {!lead.website && (
            <span className="text-[10px] uppercase tracking-wider bg-vine/15 text-vine px-2 py-0.5 rounded-full">
              No website
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {lead.address && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {lead.address}
            </span>
          )}
          {lead.phone && (
            <span className="flex items-center gap-1">
              <Phone className="h-3 w-3" />
              {lead.phone}
            </span>
          )}
          {lead.rating != null && (
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              {lead.rating} ({lead.user_ratings_total ?? 0})
            </span>
          )}
        </div>
      </div>
      {lead.maps_url && (
        <a
          href={lead.maps_url}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-vine hover:underline flex items-center gap-1"
        >
          Maps <ExternalLink className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}
