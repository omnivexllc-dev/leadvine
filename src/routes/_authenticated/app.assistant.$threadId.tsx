import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import {
  listThreads,
  createThread,
  deleteThread,
  getThreadMessages,
} from "@/lib/assistant/threads.functions";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { Tool, ToolHeader, ToolContent, ToolInput } from "@/components/ai-elements/tool";
import { Plus, Trash2, MessageSquare, Sparkles, Play, Info } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/app/assistant/$threadId")({
  head: () => ({ meta: [{ title: "AI assistant — LeadVine" }] }),
  component: AssistantThread,
});

type ProposedFilters = {
  query: string;
  location: string;
  onlyMissing: boolean;
  notes?: string;
};

const SAMPLE_PROMPTS = [
  "Find roofing companies in Texas with websites older than five years.",
  "Show dentists in California spending on Google Ads but with poor SEO.",
  "Find Shopify stores with slow mobile performance.",
  "Businesses in New York with more than 50 employees and no live chat.",
];

function AssistantThread() {
  const { threadId } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const listFn = useServerFn(listThreads);
  const createFn = useServerFn(createThread);
  const deleteFn = useServerFn(deleteThread);
  const getMessagesFn = useServerFn(getThreadMessages);

  const threadsQ = useQuery({
    queryKey: ["assistant-threads"],
    queryFn: () => listFn(),
  });

  const historyQ = useQuery({
    queryKey: ["assistant-messages", threadId],
    queryFn: () => getMessagesFn({ data: { threadId } }),
  });

  const initialMessages = useMemo<UIMessage[]>(() => {
    if (!historyQ.data) return [];
    return historyQ.data.map((r) => {
      const parts = safeJson(r.partsJson);
      return {
        id: r.id,
        role: r.role as UIMessage["role"],
        parts: Array.isArray(parts) ? parts : [],
      } as UIMessage;
    });
  }, [historyQ.data]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4 -m-6 lg:-m-10 h-[calc(100vh-3.5rem)] lg:h-screen">
      <aside className="border-r border-border bg-sidebar/40 p-3 hidden lg:flex flex-col min-h-0">
        <button
          onClick={async () => {
            const t = await createFn({ data: {} });
            qc.invalidateQueries({ queryKey: ["assistant-threads"] });
            navigate({ to: "/app/assistant/$threadId", params: { threadId: t.id } });
          }}
          className="flex items-center gap-2 text-sm bg-vine text-primary-foreground rounded-md px-3 py-2 mb-3 hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> New chat
        </button>
        <div className="flex-1 overflow-y-auto space-y-0.5">
          {threadsQ.data?.map((t) => (
            <div
              key={t.id}
              className={cn(
                "group flex items-center gap-1 rounded-md text-sm",
                t.id === threadId ? "bg-secondary" : "hover:bg-secondary/50",
              )}
            >
              <Link
                to="/app/assistant/$threadId"
                params={{ threadId: t.id }}
                className="flex-1 flex items-center gap-2 px-2 py-2 truncate text-foreground/90"
              >
                <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="truncate">{t.title}</span>
              </Link>
              <button
                onClick={async () => {
                  if (!confirm("Delete this conversation?")) return;
                  await deleteFn({ data: { id: t.id } });
                  qc.invalidateQueries({ queryKey: ["assistant-threads"] });
                  if (t.id === threadId) navigate({ to: "/app/assistant" });
                }}
                className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive p-2"
                aria-label="Delete conversation"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </aside>

      <section className="flex flex-col min-h-0 min-w-0">
        <header className="border-b border-border px-6 py-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-vine" />
          <div>
            <div className="text-sm font-medium">Lead finder assistant</div>
            <div className="text-xs text-muted-foreground">
              Describe the leads you want in plain English. I'll build the filters.
            </div>
          </div>
        </header>

        {historyQ.isLoading ? (
          <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
            Loading conversation…
          </div>
        ) : (
          <ChatArea key={threadId} threadId={threadId} initialMessages={initialMessages} />
        )}
      </section>
    </div>
  );
}

function safeJson(s: string): unknown {
  try {
    return JSON.parse(s);
  } catch {
    return [];
  }
}

function ChatArea({
  threadId,
  initialMessages,
}: {
  threadId: string;
  initialMessages: UIMessage[];
}) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        fetch: async (url, init) => {
          const { data } = await supabase.auth.getSession();
          const token = data.session?.access_token;
          const headers = new Headers(init?.headers);
          if (token) headers.set("Authorization", `Bearer ${token}`);
          return fetch(url, { ...init, headers });
        },
        prepareSendMessagesRequest: ({ messages, id }) => ({
          body: { messages, threadId: id },
        }),
      }),
    [],
  );

  const { messages, sendMessage, status, error } = useChat({
    id: threadId,
    messages: initialMessages,
    transport,
    onError: (e) => toast.error(e.message || "Chat error"),
  });

  useEffect(() => {
    textareaRef.current?.focus();
  }, [threadId, status]);

  const disabled = status === "submitted" || status === "streaming";

  const submit = () => {
    const text = input.trim();
    if (!text || disabled) return;
    sendMessage({ text });
    setInput("");
  };

  return (
    <>
      <Conversation className="flex-1 min-h-0">
        <ConversationContent className="max-w-3xl mx-auto w-full py-6">
          {messages.length === 0 ? (
            <ConversationEmptyState>
              <Sparkles className="h-8 w-8 text-vine" />
              <div className="space-y-1">
                <h3 className="font-medium">Ask for the leads you want</h3>
                <p className="text-muted-foreground text-sm">Try one of these:</p>
              </div>
              <div className="mt-3 grid gap-2 max-w-xl w-full">
                {SAMPLE_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      sendMessage({ text: p });
                    }}
                    className="text-left text-sm rounded-lg border border-border bg-card hover:border-vine/50 px-3 py-2.5"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </ConversationEmptyState>
          ) : (
            messages.map((m) => <MessageBlock key={m.id} message={m} />)
          )}
          {status === "submitted" && (
            <div className="mt-2 pl-2">
              <Shimmer>Thinking…</Shimmer>
            </div>
          )}
          {error && <div className="text-sm text-destructive mt-3">{error.message}</div>}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="border-t border-border bg-background p-4">
        <div className="max-w-3xl mx-auto w-full">
          <PromptInput
            onSubmit={() => {
              submit();
            }}
          >
            <PromptInputTextarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe the leads you're looking for…"
            />
            <PromptInputFooter className="justify-end">
              <PromptInputSubmit status={status} disabled={!input.trim() || disabled} />
            </PromptInputFooter>
          </PromptInput>
        </div>
      </div>
    </>
  );
}

function MessageBlock({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";
  return (
    <Message from={message.role as "user" | "assistant"}>
      <MessageContent
        className={cn(
          isUser ? "bg-primary text-primary-foreground" : "bg-transparent text-foreground p-0",
        )}
      >
        <div className="space-y-3">
          {message.parts.map((part, i) => {
            if (part.type === "text") {
              return (
                <div key={i} className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown>{(part as { text: string }).text}</ReactMarkdown>
                </div>
              );
            }
            if (
              part.type === "tool-propose_lead_filters" ||
              (part.type as string).startsWith("tool-")
            ) {
              return <ToolInvocation key={i} part={part} />;
            }
            return null;
          })}
        </div>
      </MessageContent>
    </Message>
  );
}

type ToolInvocationPart = {
  type: string;
  state?: string;
  input?: unknown;
  output?: unknown;
  errorText?: string;
  toolCallId?: string;
};

function ToolInvocation({ part }: { part: unknown }) {
  const p = part as ToolInvocationPart;
  const toolName = p.type.replace(/^tool-/, "");
  const state = (p.state ?? "output-available") as
    "input-streaming" | "input-available" | "output-available" | "output-error";

  const filters =
    toolName === "propose_lead_filters" && p.output ? (p.output as ProposedFilters) : null;

  return (
    <Tool defaultOpen={false}>
      <ToolHeader type={`tool-${toolName}`} state={state} />
      <ToolContent>
        <ToolInput input={p.input} />
      </ToolContent>
      {filters && <FilterCard filters={filters} />}
    </Tool>
  );
}

function FilterCard({ filters }: { filters: ProposedFilters }) {
  const navigate = useNavigate();
  const apply = (run: boolean) => {
    navigate({
      to: "/app/find-leads",
      search: {
        q: filters.query,
        loc: filters.location,
        only: filters.onlyMissing ? 1 : 0,
        run: run ? 1 : 0,
      },
    });
  };
  return (
    <div className="border-t p-4 bg-card space-y-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-widest">
        <Sparkles className="h-3 w-3 text-vine" /> Suggested filters
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
        <FilterField label="Niche / query" value={filters.query} />
        <FilterField label="Location" value={filters.location} />
        <FilterField label="Only without website" value={filters.onlyMissing ? "Yes" : "No"} />
      </div>
      {filters.notes && (
        <div className="flex items-start gap-2 text-xs text-muted-foreground border border-dashed border-border rounded-md p-2.5">
          <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>{filters.notes}</span>
        </div>
      )}
      <div className="flex gap-2 flex-wrap pt-1">
        <button
          onClick={() => apply(true)}
          className="inline-flex items-center gap-2 rounded-md bg-vine text-primary-foreground text-sm px-3 py-2 hover:opacity-90"
        >
          <Play className="h-4 w-4" /> Apply & run
        </button>
        <button
          onClick={() => apply(false)}
          className="inline-flex items-center gap-2 rounded-md border border-border text-sm px-3 py-2 hover:bg-secondary/60"
        >
          Open in Find Leads
        </button>
      </div>
    </div>
  );
}

function FilterField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background p-2.5">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="text-sm font-medium mt-0.5 break-words">{value}</div>
    </div>
  );
}
