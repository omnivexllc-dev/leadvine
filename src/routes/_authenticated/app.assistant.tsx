import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import { useServerFn } from "@tanstack/react-start";
import { createThread } from "@/lib/assistant/threads.functions";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/assistant")({
  head: () => ({ meta: [{ title: "AI assistant — LeadVine" }] }),
  component: AssistantIndex,
});

function AssistantIndex() {
  const create = useServerFn(createThread);
  const navigate = useNavigate();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    (async () => {
      try {
        const t = await create({ data: {} });
        if (t?.id) {
          navigate({ to: "/app/assistant/$threadId", params: { threadId: t.id }, replace: true });
          return;
        }
      } catch (e) {
        console.warn("[app.assistant] createThread error:", e);
      }
      const fallbackId =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `thread-${Date.now()}`;
      navigate({ to: "/app/assistant/$threadId", params: { threadId: fallbackId }, replace: true });
    })();
  }, [create, navigate]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground text-sm">
      <Loader2 className="h-4 w-4 animate-spin mr-2" /> Starting a new conversation…
    </div>
  );
}
