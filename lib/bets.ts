// ...existing code...
import { supabase } from "./supabase";

export type Bet = {
  id: number;
  title: string;
  description?: string | null;
  status: "open" | "closed" | "settled" | "canceled";
  created_by: number;
  starts_at: string | null;
  closes_at: string | null;
  odds_decimal: number | null;
  prize_amount: number;
  settled_at?: string | null;
};

export type BetStats = Bet & {
  participants_count: number;
};

export type BetParticipant = {
  bet_id: number;
  user_id: number;
  stake: number;
  nickname?: string | null;
  avatar_url?: string | null;
};

export async function createBetWithPrize(input: {
  created_by: number;
  title: string;
  description?: string;
  prize_amount: number;
  starts_at?: string | null;
  closes_at?: string | null;
  odds_decimal?: number | null;
}) {
  const { data, error } = await supabase.rpc("create_bet_with_prize", {
    p_created_by: input.created_by,
    p_title: input.title,
    p_description: input.description ?? null,
    p_prize_amount: input.prize_amount,
    p_starts_at: input.starts_at ?? null,
    p_closes_at: input.closes_at ?? null,
    p_odds_decimal: input.odds_decimal ?? null,
  });
  if (error) throw error;
  return data as Bet;
}

export async function listBets(): Promise<BetStats[]> {
  const { data, error } = await supabase.from("bet_stats").select("*").order("closes_at", { ascending: true });
  if (error) throw error;
  return data as BetStats[];
}

export async function getBet(id: number): Promise<BetStats> {
  const { data, error } = await supabase.from("bet_stats").select("*").eq("id", id).single();
  if (error) throw error;
  return data as BetStats;
}

export async function listParticipantsDetailed(betId: number): Promise<BetParticipant[]> {
  const { data, error } = await supabase.from("bet_participants_detail").select("*").eq("bet_id", betId).order("stake", { ascending: false });
  if (error) throw error;
  return data as BetParticipant[];
}

export async function joinBet(betId: number, userId: number, stake = 1) {
  const { data, error } = await supabase.rpc("join_bet", { p_bet_id: betId, p_user_id: userId, p_stake: stake });
  if (error) throw error;
  return data;
}

export async function settleBet(betId: number) {
  const { data, error } = await supabase.rpc("settle_bet", { p_bet_id: betId });
  if (error) throw error;
  return data;
}
// ...existing code...