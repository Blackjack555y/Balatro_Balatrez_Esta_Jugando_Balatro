import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { Card, CARD_IMAGES, deal, evaluateHand, makeDeck, shuffle, toKey } from "../../lib/cards";
import { recordSoloGame } from "../../lib/games";
import { getBalance, subscribeWallet } from "../../lib/wallet";

// Paga al menos 2x cuando hay mano ganadora
const PAY_TABLE: Record<string, number> = {
  "PAR": 2,
  "DOBLE PAR": 3,
  "TRÍO": 4,
  "ESCALERA": 5,
  "COLOR": 6,
  "FULL": 8,
  "POKER": 12,
  "ESCALERA COLOR": 20,
};

export default function PairPlus() {
  const { user } = useAuth();

  const [bet, setBet] = useState(10);
  const [balance, setBalance] = useState(0);
  const [hand, setHand] = useState<Card[]>([]);
  const [info, setInfo] = useState<string>("");

  useEffect(() => {
    if (!user) return;
    const userId = Number(user.id);
    getBalance(userId).then(setBalance).catch(console.log);
    const ch = subscribeWallet(userId, async () => {
      const b = await getBalance(userId).catch(() => null);
      if (b != null) setBalance(b);
    });
    return () => {
      ch.unsubscribe();
    };
  }, [user]);

  if (!user) return <Redirect href="/" />;

  const canPlay = bet > 0 && bet <= balance;
  const step = (n: number) => setBet((b) => Math.max(1, b + n));

  const play = async () => {
    if (!canPlay) return Alert.alert("Saldo insuficiente", "Ajusta tu apuesta o deposita más bones.");
    const deck = shuffle(makeDeck());
    const h = deal(deck, 5);
    setHand(h);

    const e = evaluateHand(h);
    const won = e.score >= 1; // Par o mejor
    const mult = won ? (PAY_TABLE[e.name] ?? 2) : 0;
    const payout = won ? bet * mult : 0;
    setInfo(`${e.name} — ${won ? `GANASTE x${mult}` : "PERDISTE"}`);

    try {
      await recordSoloGame({
        userId: Number(user.id),
        gameType: "solo_pair_plus",
        won,
        score: e.score,
        betAmount: bet,
        payout,
      });
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "No se pudo registrar");
    }
  };

  return (
    <ImageBackground source={require("../../assets/wood.jpg")} style={{ flex: 1 }} resizeMode="repeat">
      <View style={styles.container}>
        <Text style={styles.title}>PAR O MEJOR</Text>
        <Text style={styles.subtitle}>Saldo: {balance} — Apuesta: {bet} bones</Text>

        <View style={styles.betRow}>
          <TouchableOpacity style={styles.betBtn} onPress={() => step(-5)}><Text style={styles.betBtnText}>-5</Text></TouchableOpacity>
          <TouchableOpacity style={styles.betBtn} onPress={() => step(-1)}><Text style={styles.betBtnText}>-1</Text></TouchableOpacity>
          <TouchableOpacity style={styles.betBtn} onPress={() => step(+1)}><Text style={styles.betBtnText}>+1</Text></TouchableOpacity>
          <TouchableOpacity style={styles.betBtn} onPress={() => step(+5)}><Text style={styles.betBtnText}>+5</Text></TouchableOpacity>
        </View>

        <View style={styles.row}>
          {hand.map((c) => (
            <Image key={toKey(c)} source={CARD_IMAGES[toKey(c)]} style={styles.card} />
          ))}
        </View>
        {info ? <Text style={styles.result}>{info}</Text> : null}
        <TouchableOpacity style={[styles.button, !canPlay && styles.buttonDisabled]} disabled={!canPlay} onPress={play}>
          <Text style={styles.buttonText}>{canPlay ? "REPARTIR" : "SIN SALDO"}</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 10 },
  title: { color: "#fff", fontWeight: "900", letterSpacing: 1, textTransform: "uppercase", fontSize: 18 },
  subtitle: { color: "#fff", fontWeight: "700" },
  betRow: { flexDirection: "row", gap: 8 },
  betBtn: { backgroundColor: "#e6d2b5", borderWidth: 3, borderColor: "#000", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  betBtnText: { fontWeight: "900" },
  row: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  card: { width: 80, height: 110, resizeMode: "contain" },
  result: { marginTop: 8, fontWeight: "900" },
  button: { backgroundColor: "#000", padding: 12, borderRadius: 8, borderWidth: 3, borderColor: "#000", marginTop: 8 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontWeight: "900", textAlign: "center", textTransform: "uppercase" },
});