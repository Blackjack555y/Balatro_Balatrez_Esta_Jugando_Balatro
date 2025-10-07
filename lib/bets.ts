import { supabase } from "./supabase";

export type Bet = {
  id: number;
  title: string;
  description?: string | null;
  status: "open" | "closed" | "settled" | "canceled";
  created_by: number;
  starts_at?: string | null;
  closes_at?: string | null;
  odds_decimal?: number | null;
};

export async function listOpenBets() {
  const { data, error } = await supabase
    .from("bets")
    .select("*")
    .in("status", ["open", "closed"])
    .order("coalesce(closes_at, starts_at)", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Bet[];
}

export function subscribeBets(onChange: (bet: Bet) => void) {
  const channel = supabase
    .channel("bets_feed")
    .on("postgres_changes", { event: "*", schema: "public", table: "bets" }, (payload: any) => {
      const bet = (payload.new || payload.old) as Bet;
      onChange(bet);
    })
    .subscribe();
  return channel;
}