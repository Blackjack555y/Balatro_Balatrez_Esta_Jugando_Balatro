import { Redirect, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { Card, CARD_IMAGES, compareHands, deal, evaluateHand, makeDeck, shuffle, toKey } from "../../lib/cards";
import { recordSoloGame } from "../../lib/games";
import { getBalance, subscribeWallet } from "../../lib/wallet";

export default function FiveCard() {
  const { user } = useAuth();
  const router = useRouter();
  const [bet, setBet] = useState(10);
  const [balance, setBalance] = useState(0);
  const [player, setPlayer] = useState<Card[]>([]);
  const [dealer, setDealer] = useState<Card[]>([]);
  const [info, setInfo] = useState<string>("");

  useEffect(() => {
    if (!user) return;
    const userId = Number(user.id);
    getBalance(userId).then(setBalance).catch(console.log);
    const ch = subscribeWallet(userId, async () => {
      try { setBalance(await getBalance(userId)); } catch {}
    });
    return () => {
      ch.unsubscribe();
    };
  }, [user]);

  if (!user) return <Redirect href="/" />;

  const canPlay = bet > 0 && bet <= balance;
  const step = (n: number) => setBet((b) => Math.max(1, Math.min(1_000_000, b + n)));

  const play = async () => {
    if (!canPlay) return Alert.alert("Saldo insuficiente", "Ajusta tu apuesta o deposita más bones.");

    const deck = shuffle(makeDeck());
    const p = deal(deck, 5);
    const d = deal(deck, 5);
    setPlayer(p); setDealer(d);

    const cmp = compareHands(p, d);
    const ep = evaluateHand(p);
    const ed = evaluateHand(d);

    let won = false;
    let payout = 0;
    let text = `Tú: ${ep.name} vs Crupier: ${ed.name} — `;

    if (cmp > 0) { won = true; payout = bet * 2; text += "GANASTE (x2)"; }
    else if (cmp < 0) { won = false; payout = 0; text += "PERDISTE"; }
    else { won = false; payout = bet; text += "EMPATE"; }

    setInfo(text);

    try {
      await recordSoloGame({
        userId: Number(user.id),
        gameType: "solo_five_card",
        won,
        score: cmp,
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
        <TouchableOpacity onPress={() => router.back()} style={{ alignSelf: "flex-start" }}>
          <Text style={{ color: "#fff", fontWeight: "900" }}>{"< VOLVER"}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>PÓKER 5 CARTAS</Text>
        <Text style={styles.subtitle}>Saldo: {balance} bones</Text>

        <View style={styles.betRow}>
          <TouchableOpacity style={styles.betBtn} onPress={() => step(-5)}><Text style={styles.betBtnText}>-5</Text></TouchableOpacity>
          <TouchableOpacity style={styles.betBtn} onPress={() => step(-1)}><Text style={styles.betBtnText}>-1</Text></TouchableOpacity>
          <Text style={styles.betLabel}>Apuesta: {bet} bones</Text>
          <TouchableOpacity style={styles.betBtn} onPress={() => step(+1)}><Text style={styles.betBtnText}>+1</Text></TouchableOpacity>
          <TouchableOpacity style={styles.betBtn} onPress={() => step(+5)}><Text style={styles.betBtnText}>+5</Text></TouchableOpacity>
        </View>

        <Text style={styles.section}>TU MANO</Text>
        <View style={styles.row}>
          {player.map((c) => (
            <Image key={toKey(c)} source={CARD_IMAGES[toKey(c)]} style={styles.card} />
          ))}
        </View>

        <Text style={styles.section}>CRUPIER</Text>
        <View style={styles.row}>
          {dealer.map((c) => (
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
  betRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  betBtn: { backgroundColor: "#e6d2b5", borderWidth: 3, borderColor: "#000", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  betBtnText: { fontWeight: "900" },
  betLabel: { fontWeight: "900", flex: 1, textAlign: "center" },
  section: { marginTop: 8, fontWeight: "900" },
  row: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  card: { width: 80, height: 110, resizeMode: "contain" },
  result: { marginTop: 8, fontWeight: "900" },
  button: { backgroundColor: "#000", padding: 12, borderRadius: 8, borderWidth: 3, borderColor: "#000", marginTop: 8 },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontWeight: "900", textAlign: "center", textTransform: "uppercase" },
});