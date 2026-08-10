import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const searchInput = z.object({
  query: z.string().trim().min(2).max(200),
  location: z.string().trim().min(2).max(200),
});

export interface PlacesLead {
  place_id: string;
  name: string;
  address: string;
  phone: string | null;
  website: string | null;
  maps_url: string | null;
  rating: number | null;
  user_ratings_total: number | null;
  types: string[];
  latitude: number | null;
  longitude: number | null;
}

export const verifyPlacesApiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey)
      return {
        ok: false as const,
        reason: "GOOGLE_PLACES_API_KEY is not configured on the server.",
      };
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.id",
      },
      body: JSON.stringify({ textQuery: "coffee in New York", pageSize: 1 }),
    });
    if (res.ok) return { ok: true as const };
    const text = await res.text();
    if (res.status === 400 && /API key not valid/i.test(text)) {
      return {
        ok: false as const,
        reason:
          "Key rejected as invalid. Verify the key value and that 'Places API (New)' is enabled on its Google Cloud project.",
      };
    }
    if (res.status === 403) {
      return {
        ok: false as const,
        reason:
          "Key rejected (403). Enable 'Places API (New)' and check billing/API restrictions on the key.",
      };
    }
    return { ok: false as const, reason: `Places API ${res.status}: ${text.slice(0, 200)}` };
  });

// Google Places API (New) — Text Search returns most needed fields directly.
export const searchPlaces = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => searchInput.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) throw new Error("GOOGLE_PLACES_API_KEY not configured");

    const body = {
      textQuery: `${data.query} in ${data.location}`,
      pageSize: 20,
    };
    const fieldMask = [
      "places.id",
      "places.displayName",
      "places.formattedAddress",
      "places.internationalPhoneNumber",
      "places.nationalPhoneNumber",
      "places.websiteUri",
      "places.googleMapsUri",
      "places.rating",
      "places.userRatingCount",
      "places.types",
      "places.location",
    ].join(",");

    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": fieldMask,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      if (res.status === 400 && /API key not valid/i.test(text)) {
        throw new Error(
          "Google Places API key is invalid or missing permissions. Verify the key, enable 'Places API (New)' on its Google Cloud project, and remove HTTP-referrer restrictions (server-side call).",
        );
      }
      if (res.status === 403) {
        throw new Error(
          "Google Places API key rejected (403). Enable 'Places API (New)' and check billing on the key's Google Cloud project.",
        );
      }
      throw new Error(`Places API ${res.status}: ${text.slice(0, 200)}`);
    }

    const json = (await res.json()) as { places?: Array<Record<string, unknown>> };
    const places: PlacesLead[] = (json.places ?? []).map((p) => {
      const displayName = p.displayName as { text?: string } | undefined;
      const loc = p.location as { latitude?: number; longitude?: number } | undefined;
      return {
        place_id: (p.id as string) ?? "",
        name: displayName?.text ?? "Unknown",
        address: (p.formattedAddress as string) ?? "",
        phone: (p.internationalPhoneNumber as string) ?? (p.nationalPhoneNumber as string) ?? null,
        website: (p.websiteUri as string) ?? null,
        maps_url: (p.googleMapsUri as string) ?? null,
        rating: (p.rating as number) ?? null,
        user_ratings_total: (p.userRatingCount as number) ?? null,
        types: (p.types as string[]) ?? [],
        latitude: loc?.latitude ?? null,
        longitude: loc?.longitude ?? null,
      };
    });

    return {
      all: places,
      withoutWebsite: places.filter((p) => !p.website),
    };
  });

const saveInput = z.object({
  listName: z.string().trim().min(1).max(120),
  query: z.string(),
  location: z.string(),
  leads: z.array(
    z.object({
      place_id: z.string(),
      name: z.string(),
      address: z.string(),
      phone: z.string().nullable(),
      website: z.string().nullable(),
      maps_url: z.string().nullable(),
      rating: z.number().nullable(),
      user_ratings_total: z.number().nullable(),
      types: z.array(z.string()),
      latitude: z.number().nullable(),
      longitude: z.number().nullable(),
    }),
  ),
});

export const saveLeadList = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => saveInput.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: list, error: listErr } = await supabase
      .from("lead_lists")
      .insert({ user_id: userId, name: data.listName, query: data.query, location: data.location })
      .select()
      .single();
    if (listErr) throw listErr;

    if (data.leads.length > 0) {
      const rows = data.leads.map((l) => ({
        user_id: userId,
        list_id: list.id,
        place_id: l.place_id,
        name: l.name,
        address: l.address,
        phone: l.phone,
        website: l.website,
        maps_url: l.maps_url,
        rating: l.rating,
        user_ratings_total: l.user_ratings_total,
        types: l.types,
        latitude: l.latitude,
        longitude: l.longitude,
        has_website: !!l.website,
      }));
      const { error: leadsErr } = await supabase.from("leads").insert(rows);
      if (leadsErr) throw leadsErr;
    }

    return { listId: list.id, count: data.leads.length };
  });
