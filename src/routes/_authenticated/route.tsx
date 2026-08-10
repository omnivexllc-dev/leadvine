import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app/AppShell";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    let user = null;
    try {
      const { data } = await supabase.auth.getUser();
      user = data?.user ?? null;
    } catch {
      // Ignore network errors on unconfigured/placeholder Supabase
    }

    if (!user && typeof window !== "undefined") {
      const localUserStr = localStorage.getItem("leadvine_user_session");
      if (localUserStr) {
        try {
          user = JSON.parse(localUserStr);
        } catch {
          // ignore invalid json
        }
      }
    }

    if (!user) {
      throw redirect({ to: "/auth" });
    }

    return { user };
  },
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});
