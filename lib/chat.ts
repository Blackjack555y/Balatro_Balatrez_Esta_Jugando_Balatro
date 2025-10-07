// Chat helpers and types using Supabase (with a mock conversation list fallback)
import type { RealtimeChannel } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export type Peer = {
  user_id: number;
  nickname?: string;
  avatar_url?: string;
  username?: string;
};

export type Message = {
  id: number;
  sender_id: number;
  receiver_id: number;
  content: string;
  created_at: string; // ISO string
};

export type Conversation = {
  peer: Peer;
  lastMessage: Message;
};

// Converts user id to number (handles string/number)
export function toNumberId(id: string | number): number | null {
  const num = typeof id === "string" ? parseInt(id, 10) : id;
  return isNaN(num) ? null : num;
}

// Fetch recent conversations (latest message per peer the user has messaged with)
export async function listConversations(userId: number): Promise<Conversation[]> {
  // 1) Get recent messages involving the user
  const { data: msgs, error: msgErr } = await supabase
    .from("messages")
    .select("id,sender_id,receiver_id,content,created_at")
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order("created_at", { ascending: false })
    .limit(200);
  if (msgErr) throw msgErr;

  const latestByPeer = new Map<number, Message>();
  (msgs ?? []).forEach((m: any) => {
    const otherId = m.sender_id === userId ? m.receiver_id : m.sender_id;
    if (!latestByPeer.has(otherId)) {
      latestByPeer.set(otherId, m as Message);
    }
  });

  const peerIds = Array.from(latestByPeer.keys());
  if (peerIds.length === 0) return [];

  // 2) Fetch peer profile info in one query
  const { data: profiles, error: profErr } = await supabase
    .from("profiles")
    .select("user_id,nickname,avatar_url")
    .in("user_id", peerIds);
  if (profErr) throw profErr;

  const profileById = new Map<number, { user_id: number; nickname?: string; avatar_url?: string }>();
  (profiles ?? []).forEach((p) => profileById.set((p as any).user_id, p as any));

  // 3) Compose conversation items
  const items: Conversation[] = peerIds.map((pid) => {
    const p = profileById.get(pid);
    return {
      peer: { user_id: pid, nickname: p?.nickname, avatar_url: p?.avatar_url },
      lastMessage: latestByPeer.get(pid)!,
    };
  });

  // Already sorted by latest message first via msgs descending order
  return items;
}

// List potential peers to start a new chat with (excludes current user)
export async function listPeersExcept(
  myUserId: number,
  opts?: { search?: string; limit?: number }
): Promise<Peer[]> {
  const limit = opts?.limit ?? 100;

  let query = supabase
    .from("profiles")
    .select("user_id,nickname,avatar_url")
    .neq("user_id", myUserId)
    .order("nickname", { ascending: true, nullsFirst: false })
    .limit(limit);

  if (opts?.search && opts.search.trim()) {
    const q = opts.search.trim();
    // Try to match by nickname; if numeric try by user_id
    query = query.ilike("nickname", `%${q}%`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as Peer[];
}

// Fetch a thread's messages between two users
export async function getThreadMessages(
  myId: number,
  peerId: number,
  opts?: { limit?: number; before?: string | Date }
): Promise<Message[]> {
  const limit = opts?.limit ?? 50;
  let query = supabase
    .from("messages")
    .select("id,sender_id,receiver_id,content,created_at")
    .or(
      `and(sender_id.eq.${myId},receiver_id.eq.${peerId}),and(sender_id.eq.${peerId},receiver_id.eq.${myId})`
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (opts?.before) {
    const beforeStr = typeof opts.before === "string" ? opts.before : opts.before.toISOString();
    query = query.lt("created_at", beforeStr);
  }

  const { data, error } = await query;
  if (error) throw error;
  // data is already in descending order
  return (data ?? []) as unknown as Message[];
}

// Send a message
export async function sendMessage(
  myId: number,
  peerId: number,
  content: string
): Promise<Message> {
  const text = content.trim();
  if (!text) throw new Error("Empty message");
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from("messages")
    .insert({ sender_id: myId, receiver_id: peerId, content: text, created_at: nowIso })
    .select("id,sender_id,receiver_id,content,created_at")
    .single();
  if (error) {
    // Surface more context to caller
    const err = error as any;
    const details = err?.details || err?.message || JSON.stringify(err);
    throw new Error(`sendMessage failed: ${details}`);
  }
  return data as unknown as Message;
}

// Subscribe to realtime inserts for a thread
export function subscribeToThread(
  myId: number,
  peerId: number,
  onInsert: (msg: Message) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`messages-thread-${myId}-${peerId}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages" },
      (payload) => {
        const rec = payload.new as any;
        if (!rec) return;
        const isThread =
          (rec.sender_id === myId && rec.receiver_id === peerId) ||
          (rec.sender_id === peerId && rec.receiver_id === myId);
        if (!isThread) return;
        const msg: Message = {
          id: rec.id,
          sender_id: rec.sender_id,
          receiver_id: rec.receiver_id,
          content: rec.content,
          created_at: rec.created_at,
        };
        onInsert(msg);
      }
    )
    .subscribe();

  return channel;
}