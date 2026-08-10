import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { scoreOneLead } from "./opportunity.server";

export const rescoreAllLeads = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: leads, error } = await supabase
      .from("leads")
      .select("id, has_website, site_score, seo_score, rating, user_ratings_total, phone")
      .eq("user_id", userId);
    if (error) throw error;

    let updated = 0;
    for (const lead of leads ?? []) {
      const { score, label } = scoreOneLead(lead);
      const { error: upErr } = await supabase
        .from("leads")
        .update({ opportunity_score: score, opportunity_label: label })
        .eq("id", lead.id);
      if (!upErr) updated += 1;
    }
    return { updated };
  });
