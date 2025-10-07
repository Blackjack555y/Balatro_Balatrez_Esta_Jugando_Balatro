import { supabase } from "./supabase";

export type Review = {
  id: number;
  bet_id: number;
  user_id: number;
  content: string;
  created_at: string;
};

export type ReviewDetail = Review & {
  username: string | null;
  nickname: string | null;
};

export async function listReviews(betId: number): Promise<ReviewDetail[]> {
  // Try the view first
  const { data, error } = await supabase
    .from("reviews_detail")
    .select("*")
    .eq("bet_id", betId)
    .order("created_at", { ascending: false });
  if (!error) return (data as ReviewDetail[]) ?? [];

  // Fallback if view doesn't exist yet (e.g., 404 / relation not found)
  const fb = await supabase
    .from("reviews")
    .select("id, bet_id, user_id, content, created_at, users(username), profiles(nickname)")
    .eq("bet_id", betId)
    .order("created_at", { ascending: false });
  if (fb.error) throw fb.error;
  const rows = (fb.data as any[]) ?? [];
  return rows.map((r) => ({
    id: r.id,
    bet_id: r.bet_id,
    user_id: r.user_id,
    content: r.content,
    created_at: r.created_at,
    username: r.users?.username ?? null,
    nickname: r.profiles?.nickname ?? null,
  }));
}

export async function addReview(betId: number, userId: number, content: string): Promise<Review> {
  // Prefer RPC if available
  const { data, error } = await supabase.rpc("add_review", {
    p_bet_id: betId,
    p_user_id: userId,
    p_content: content,
  });
  if (!error) return data as Review;

  // Fallback to direct insert if RPC is missing (404) or not exposed
  const fb = await supabase
    .from("reviews")
    .insert({ bet_id: betId, user_id: userId, content })
    .select("*")
    .single();
  if (fb.error) throw fb.error;
  return fb.data as Review;
}
