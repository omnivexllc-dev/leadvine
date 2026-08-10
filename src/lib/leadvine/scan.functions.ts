import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { normalizeUrl, isFresh, scanOneSite, scoreOneLead, type ScanLead } from "./scan.server";

const startInput = z.object({
  listId: z.string().uuid().nullable().optional(),
  forceRescan: z.boolean().default(false),
  rescanDays: z.number().int().min(1).max(365).default(30),
  name: z.string().max(120).optional(),
});

export const startScanBatch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => startInput.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    let q = supabase.from("leads").select("id").eq("user_id", userId).not("website", "is", null);
    if (data.listId) q = q.eq("list_id", data.listId);
    const { data: leads, error } = await q;
    if (error) throw error;

    const ids = (leads ?? []).map((l) => l.id);

    const { data: batch, error: bErr } = await supabase
      .from("scan_batches")
      .insert({
        user_id: userId,
        name: data.name ?? "Bulk scan",
        list_id: data.listId ?? null,
        force_rescan: data.forceRescan,
        rescan_days: data.rescanDays,
        lead_ids: ids,
        total: ids.length,
        status: ids.length === 0 ? "done" : "running",
        finished_at: ids.length === 0 ? new Date().toISOString() : null,
      })
      .select()
      .single();
    if (bErr) throw bErr;
    return batch;
  });

const chunkInput = z.object({
  batchId: z.string().uuid(),
  chunkSize: z.number().int().min(1).max(10).default(5),
});

export const processScanBatchChunk = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => chunkInput.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: batch, error } = await supabase
      .from("scan_batches")
      .select("*")
      .eq("id", data.batchId)
      .eq("user_id", userId)
      .single();
    if (error) throw error;
    if (batch.status !== "running")
      return {
        batch,
        results: [] as { id: string; name: string; outcome: string; detail?: string }[],
      };

    const ids: string[] = (batch.lead_ids as string[]) ?? [];
    const slice = ids.slice(batch.cursor, batch.cursor + data.chunkSize);

    const results: { id: string; name: string; outcome: string; detail?: string }[] = [];
    let completed = 0;
    let skipped = 0;
    let failed = 0;

    if (slice.length) {
      const { data: leads } = await supabase
        .from("leads")
        .select(
          "id, name, website, has_website, rating, user_ratings_total, phone, last_scanned_at",
        )
        .in("id", slice);

      for (const lead of (leads ?? []) as ScanLead[]) {
        const url = lead.website ? normalizeUrl(lead.website) : null;
        if (!url) {
          skipped += 1;
          results.push({
            id: lead.id,
            name: lead.name,
            outcome: "skipped",
            detail: "No usable website URL",
          });
          continue;
        }
        if (!batch.force_rescan && isFresh(lead.last_scanned_at, batch.rescan_days)) {
          skipped += 1;
          results.push({
            id: lead.id,
            name: lead.name,
            outcome: "skipped",
            detail: `Scanned within ${batch.rescan_days} days`,
          });
          continue;
        }

        try {
          const { site, seo, screenshot } = await scanOneSite(url);

          await supabase.from("site_audits").insert({
            user_id: userId,
            url,
            score: site.score,
            needs_redesign: site.needs_redesign,
            signals: site.signals,
            screenshot_url: screenshot,
          });
          await supabase.from("seo_reports").insert({
            user_id: userId,
            url,
            score: seo.score,
            title: seo.title,
            description: seo.description,
            data: seo.data,
            recommendations: seo.recommendations,
          });

          const scored = scoreOneLead({
            has_website: true,
            site_score: site.score,
            seo_score: seo.score,
            rating: lead.rating,
            user_ratings_total: lead.user_ratings_total,
            phone: lead.phone,
          });

          await supabase
            .from("leads")
            .update({
              site_score: site.score,
              seo_score: seo.score,
              last_scanned_at: new Date().toISOString(),
              opportunity_score: scored.score,
              opportunity_label: scored.label,
            })
            .eq("id", lead.id);

          completed += 1;
          results.push({
            id: lead.id,
            name: lead.name,
            outcome: "scanned",
            detail: `Site ${site.score} · SEO ${seo.score} · Opportunity ${scored.score}`,
          });
        } catch (err) {
          failed += 1;
          results.push({
            id: lead.id,
            name: lead.name,
            outcome: "failed",
            detail: err instanceof Error ? err.message.slice(0, 160) : "Unknown error",
          });
        }
      }
    }

    const cursor = Math.min(batch.cursor + data.chunkSize, ids.length);
    const done = cursor >= ids.length;

    const { data: updated, error: uErr } = await supabase
      .from("scan_batches")
      .update({
        cursor,
        completed: batch.completed + completed,
        skipped: batch.skipped + skipped,
        failed: batch.failed + failed,
        status: done ? "done" : "running",
        finished_at: done ? new Date().toISOString() : null,
      })
      .eq("id", batch.id)
      .select()
      .single();
    if (uErr) throw uErr;

    return { batch: updated, results };
  });

const cancelInput = z.object({ batchId: z.string().uuid() });

export const cancelScanBatch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => cancelInput.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase
      .from("scan_batches")
      .update({ status: "cancelled", finished_at: new Date().toISOString() })
      .eq("id", data.batchId)
      .eq("user_id", userId)
      .select()
      .single();
    if (error) throw error;
    return row;
  });
