import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Download, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { leadsToCsv, downloadCsv } from "@/lib/leadvine/csv";

export const Route = createFileRoute("/_authenticated/app/lists")({
  head: () => ({ meta: [{ title: "Lead lists — LeadVine" }] }),
  component: Lists,
});

function Lists() {
  const [openId, setOpenId] = useState<string | null>(null);
  const qc = useQueryClient();

  const { data: lists } = useQuery({
    queryKey: ["lead-lists"],
    queryFn: async () => {
      const { data } = await supabase
        .from("lead_lists")
        .select("*")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const del = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("leads").delete().eq("list_id", id);
      await supabase.from("lead_lists").delete().eq("id", id);
    },
    onSuccess: () => {
      toast.success("List deleted");
      qc.invalidateQueries({ queryKey: ["lead-lists"] });
    },
  });

  return (
    <div>
      <div className="mb-8">
        <div className="text-xs uppercase tracking-widest text-vine mb-2">Saved</div>
        <h1 className="font-display text-4xl">Lead lists</h1>
      </div>

      <div className="grid gap-3">
        {lists?.map((l) => (
          <ListRow
            key={l.id}
            list={l}
            open={openId === l.id}
            onToggle={() => setOpenId(openId === l.id ? null : l.id)}
            onDelete={() => del.mutate(l.id)}
          />
        ))}
        {lists && lists.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No lists yet. Try Find Leads.
          </p>
        )}
      </div>
    </div>
  );
}

function ListRow({
  list,
  open,
  onToggle,
  onDelete,
}: {
  list: { id: string; name: string; created_at: string; query?: string; location?: string };
  open: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data: leads } = useQuery({
    queryKey: ["leads-in-list", list.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("leads")
        .select("*")
        .eq("list_id", list.id)
        .order("created_at");
      return data ?? [];
    },
    enabled: open,
  });

  const allSelected = !!leads && leads.length > 0 && selected.size === leads.length;
  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const toggleAll = () => {
    if (!leads) return;
    setSelected(allSelected ? new Set() : new Set(leads.map((l) => l.id)));
  };

  const exportCsv = async () => {
    let rows = leads;
    if (!rows) {
      const { data, error } = await supabase.from("leads").select("*").eq("list_id", list.id);
      if (error) {
        toast.error("Export failed");
        return;
      }
      rows = data ?? [];
    }
    const toExport = selected.size > 0 ? rows.filter((l) => selected.has(l.id)) : rows;
    if (toExport.length === 0) {
      toast.error("Nothing to export");
      return;
    }
    downloadCsv(list.name, leadsToCsv(toExport));
    toast.success(`Exported ${toExport.length} leads`);
  };

  const exportLabel = selected.size > 0 ? `CSV (${selected.size})` : "CSV";

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="p-4 flex items-center justify-between gap-3">
        <button onClick={onToggle} className="flex items-center gap-3 flex-1 min-w-0 text-left">
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          <div className="min-w-0">
            <div className="font-medium truncate">{list.name}</div>
            <div className="text-xs text-muted-foreground">
              {list.query} · {list.location} · {new Date(list.created_at).toLocaleDateString()}
            </div>
          </div>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={exportCsv}
            className="text-xs border border-border rounded-md px-3 py-1.5 flex items-center gap-1 hover:bg-secondary"
          >
            <Download className="h-3 w-3" /> {exportLabel}
          </button>
          <button
            onClick={onDelete}
            className="text-xs border border-border rounded-md p-1.5 hover:bg-destructive/20 hover:border-destructive text-muted-foreground hover:text-destructive-foreground"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
      {open && leads && (
        <div className="border-t border-border">
          {leads.length > 0 && (
            <label className="flex items-center gap-2 text-xs px-3 py-2 border-b border-border text-muted-foreground">
              <input type="checkbox" checked={allSelected} onChange={toggleAll} />
              Select all ({selected.size}/{leads.length})
            </label>
          )}
          <div className="divide-y divide-border">
            {leads.map((l) => (
              <label
                key={l.id}
                className="p-3 text-sm flex items-center gap-3 cursor-pointer hover:bg-secondary/30"
              >
                <input type="checkbox" checked={selected.has(l.id)} onChange={() => toggle(l.id)} />
                <div className="min-w-0 flex-1">
                  <div className="truncate">{l.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {l.address} · {l.phone ?? "no phone"}
                  </div>
                </div>
                {!l.has_website && (
                  <span className="text-[10px] uppercase tracking-wider bg-vine/15 text-vine px-2 py-0.5 rounded-full flex-shrink-0">
                    No site
                  </span>
                )}
              </label>
            ))}
            {leads.length === 0 && <p className="text-xs text-muted-foreground p-4">Empty list.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
