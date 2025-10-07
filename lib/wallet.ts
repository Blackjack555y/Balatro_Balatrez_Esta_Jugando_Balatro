import { supabase } from "./supabase";

export type WalletTx = {
  id: number;
  user_id: number;
  delta: number;
  reason: string;
  ref_type?: string | null;
  ref_id?: number | null;
  meta?: any;
  created_at: string;
};

export async function getBalance(userId: number) {
  const { data, error } = await supabase
    .from("profiles")
    .select("bones")
    .eq("user_id", userId)
    .single();
  if (error) throw error;
  return data.bones as number;
}

export async function getTransactions(userId: number, limit = 50) {
  const { data, error } = await supabase
    .from("wallet_transactions")
    .select("id,user_id,delta,reason,ref_type,ref_id,meta,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as WalletTx[];
}

export async function applyDelta(userId: number, delta: number, reason = "adjust", meta?: any) {
  const { data, error } = await supabase.rpc("wallet_apply_delta", {
    p_user_id: userId,
    p_delta: delta,
    p_reason: reason,
    p_ref_type: "manual",
    p_ref_id: null,
    p_meta: meta ?? null,
  });
  if (error) throw error;
  return data as number; // nuevo saldo
}

export async function applyDeltaRef(
  userId: number,
  delta: number,
  reason: string,
  ref: { type: string; id?: number | null },
  meta?: any
) {
  const { data, error } = await supabase.rpc("wallet_apply_delta", {
    p_user_id: userId,
    p_delta: delta,
    p_reason: reason,
    p_ref_type: ref.type,
    p_ref_id: ref.id ?? null,
    p_meta: meta ?? null,
  });
  if (error) throw error;
  return data as number;
}

export function subscribeWallet(userId: number, onChange: (tx: WalletTx) => void) {
  const channel = supabase
    .channel(`wallet_user_${userId}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "wallet_transactions", filter: `user_id=eq.${userId}` },
      (payload) => {
        const row = (payload.new || payload.old) as WalletTx;
        onChange(row);
      }
    )
    .subscribe();
  return channel;
}