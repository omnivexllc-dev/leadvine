import Papa from "papaparse";

export interface ExportableLead {
  name?: string | null;
  address?: string | null;
  phone?: string | null;
  website?: string | null;
  has_website?: boolean | null;
  rating?: number | null;
  user_ratings_total?: number | null;
  types?: string[] | null;
  latitude?: number | null;
  longitude?: number | null;
  maps_url?: string | null;
  place_id?: string | null;
  status?: string | null;
  notes?: string | null;
  created_at?: string | null;
}

export function leadsToCsv(leads: ExportableLead[]): string {
  return Papa.unparse(
    leads.map((l) => ({
      name: l.name ?? "",
      address: l.address ?? "",
      phone: l.phone ?? "",
      website: l.website ?? "",
      has_website: l.has_website ? "yes" : "no",
      rating: l.rating ?? "",
      reviews: l.user_ratings_total ?? "",
      categories: (l.types ?? []).join("|"),
      latitude: l.latitude ?? "",
      longitude: l.longitude ?? "",
      maps_url: l.maps_url ?? "",
      place_id: l.place_id ?? "",
      status: l.status ?? "",
      notes: l.notes ?? "",
      created_at: l.created_at ?? "",
    })),
  );
}

export function downloadCsv(filename: string, csv: string) {
  const safe = filename.replace(/[^a-z0-9-_]+/gi, "_").replace(/^_+|_+$/g, "") || "leads";
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${safe}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
