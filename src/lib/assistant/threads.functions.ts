import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// In-memory fallback store when Supabase tables don't exist or return DB errors
type ThreadRow = { id: string; title: string; updated_at: string; user_id: string };
type MessageRow = {
  id: string;
  role: string;
  parts: unknown;
  created_at: string;
  thread_id: string;
};

const memoryThreads = new Map<string, ThreadRow>();
const memoryMessages = new Map<string, MessageRow[]>();

export const listThreads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    try {
      const { data, error } = await context.supabase
        .from("chat_threads")
        .select("id, title, updated_at")
        .order("updated_at", { ascending: false })
        .limit(100);
      if (!error && data) return data;
    } catch {
      // fallback
    }

    const userThreads = Array.from(memoryThreads.values())
      .filter((t) => t.user_id === context.userId || context.userId === "usr_demo_user")
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

    return userThreads.map((t) => ({ id: t.id, title: t.title, updated_at: t.updated_at }));
  });

export const createThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ title: z.string().optional() }).parse(i ?? {}))
  .handler(async ({ data, context }) => {
    const threadId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `thread-${Date.now()}`;
    const title = data.title ?? "New conversation";
    const updatedAt = new Date().toISOString();

    try {
      const { data: row, error } = await context.supabase
        .from("chat_threads")
        .insert({ user_id: context.userId, title })
        .select("id, title, updated_at")
        .single();
      if (!error && row) return row;
    } catch {
      // fallback
    }

    const fallbackThread: ThreadRow = {
      id: threadId,
      title,
      updated_at: updatedAt,
      user_id: context.userId,
    };
    memoryThreads.set(threadId, fallbackThread);

    return { id: threadId, title, updated_at: updatedAt };
  });

export const deleteThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ id: z.string() }).parse(i))
  .handler(async ({ data, context }) => {
    try {
      await context.supabase.from("chat_threads").delete().eq("id", data.id);
    } catch {
      // ignore
    }
    memoryThreads.delete(data.id);
    memoryMessages.delete(data.id);
    return { ok: true };
  });

export const renameThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) =>
    z.object({ id: z.string(), title: z.string().min(1).max(200) }).parse(i),
  )
  .handler(async ({ data, context }) => {
    try {
      await context.supabase
        .from("chat_threads")
        .update({ title: data.title, updated_at: new Date().toISOString() })
        .eq("id", data.id);
    } catch {
      // ignore
    }
    const existing = memoryThreads.get(data.id);
    if (existing) {
      existing.title = data.title;
      existing.updated_at = new Date().toISOString();
    }
    return { ok: true };
  });

export const getThreadMessages = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i: unknown) => z.object({ threadId: z.string() }).parse(i))
  .handler(async ({ data, context }) => {
    try {
      const { data: rows, error } = await context.supabase
        .from("chat_messages")
        .select("id, role, parts, created_at")
        .eq("thread_id", data.threadId)
        .order("created_at", { ascending: true });
      if (!error && rows) {
        return rows.map((r) => ({
          id: r.id as string,
          role: r.role as string,
          partsJson: JSON.stringify(r.parts ?? []),
        }));
      }
    } catch {
      // fallback
    }

    const msgs = memoryMessages.get(data.threadId) ?? [];
    return msgs.map((r) => ({
      id: r.id,
      role: r.role,
      partsJson: JSON.stringify(r.parts ?? []),
    }));
  });
