import { supabase } from "./supabase";
import { applyDelta } from "./wallet";

type SoloGameInput = {
  userId: number;
  gameType: string;
  won: boolean;
  score: number;
  betAmount: number;
  payout: number; // ganancia bruta
};

// Registra resultado + aplica delta al wallet (payout - bet)
export async function recordSoloGame(input: SoloGameInput) {
  const { userId, gameType, won, score, betAmount, payout } = input;
  const net = Math.round((payout ?? 0) - (betAmount ?? 0));

  // Actualiza wallet primero (seguro por RPC)
  await applyDelta(userId, net, `solo:${gameType}`, { won, score, betAmount, payout });

  // Inserta resultado (sin RLS restrictiva, o añade política select/insert true)
  const { error } = await supabase.from("game_results").insert({
    user_id: userId,
    game_type: gameType,
    won,
    score,
    bet_amount: betAmount,
    payout,
  });
  if (error) throw error;
}