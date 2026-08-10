import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PlacesApiDiagnostics } from "@/components/app/PlacesApiDiagnostics";

export const Route = createFileRoute("/_authenticated/app/settings")({
  head: () => ({ meta: [{ title: "Settings — LeadVine" }] }),
  component: Settings,
});

function Settings() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const qc = useQueryClient();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      setEmail(data.user.email ?? "");
      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name")
        .eq("id", data.user.id)
        .maybeSingle();
      setName(profile?.display_name ?? "");
    });
  }, []);

  const save = async () => {
    setSaving(true);
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      await supabase.from("profiles").update({ display_name: name }).eq("id", data.user.id);
      toast.success("Saved");
    }
    setSaving(false);
  };

  const signOut = async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    router.navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <div className="text-xs uppercase tracking-widest text-vine mb-2">Account</div>
        <h1 className="font-display text-4xl">Settings</h1>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5">
            Email
          </div>
          <input
            value={email}
            disabled
            className="w-full bg-background border border-border rounded-md px-3 py-2.5 text-sm text-muted-foreground"
          />
        </div>
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5">
            Display name
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-background border border-border rounded-md px-3 py-2.5 text-sm outline-none focus:border-vine"
          />
        </div>
        <div className="flex justify-between pt-4 border-t border-border">
          <button
            onClick={signOut}
            className="text-sm text-muted-foreground hover:text-destructive-foreground"
          >
            Sign out
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="bg-vine text-primary-foreground rounded-md px-5 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      <div className="mt-6">
        <PlacesApiDiagnostics />
      </div>
    </div>
  );
}
