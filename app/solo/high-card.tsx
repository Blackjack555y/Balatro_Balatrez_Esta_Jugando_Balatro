import { Redirect, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { Card, CARD_IMAGES, deal, makeDeck, shuffle, toKey } from "../../lib/cards";
import { recordSoloGame } from "../../lib/games";
import { getBalance, subscribeWallet } from "../../lib/wallet";

export default function HighCard() {
  const { user } = useAuth();
  const router = useRouter();

  const [bet, setBet] = useState(10);
  const [balance, setBalance] = useState(0);
  const [player, setPlayer] = useState<Card | null>(null);
  const [dealer, setDealer] = useState<Card | null>(null);
  const [result, setResult] = useState<string>("");

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
    const [p] = deal(deck, 1);
    const [d] = deal(deck, 1);
    setPlayer(p);
    setDealer(d);

    const pv = p.rank;
    const dv = d.rank;
    let won = false;
    let payout = 0;
    let text = "";
    if (pv > dv) { won = true; payout = bet * 2; text = "GANASTE (x2)"; }
    else if (pv < dv) { won = false; payout = 0; text = "PERDISTE"; }
    else { won = false; payout = bet; text = "EMPATE (DEVUELTO)"; }

    setResult(text);
    try {
      await recordSoloGame({
        userId: Number(user.id),
        gameType: "solo_high_card",
        won,
        score: pv - dv,
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
        <Text style={styles.title}>ALTA CARTA</Text>
        <Text style={styles.note}>Saldo: {balance} — Apuesta: {bet} bones</Text>

        <View style={styles.betRow}>
          <TouchableOpacity style={styles.betBtn} onPress={() => step(-5)}><Text style={styles.betBtnText}>-5</Text></TouchableOpacity>
          <TouchableOpacity style={styles.betBtn} onPress={() => step(-1)}><Text style={styles.betBtnText}>-1</Text></TouchableOpacity>
          <TouchableOpacity style={styles.betBtn} onPress={() => step(+1)}><Text style={styles.betBtnText}>+1</Text></TouchableOpacity>
          <TouchableOpacity style={styles.betBtn} onPress={() => step(+5)}><Text style={styles.betBtnText}>+5</Text></TouchableOpacity>
        </View>

        <View style={styles.row}>
          <View style={styles.side}>
            <Text style={styles.label}>TU CARTA</Text>
            {player && <Image source={CARD_IMAGES[toKey(player)]} style={styles.card} />}
          </View>
          <View style={styles.side}>
            <Text style={styles.label}>CRUPIER</Text>
            {dealer && <Image source={CARD_IMAGES[toKey(dealer)]} style={styles.card} />}
          </View>
        </View>
        {result ? <Text style={styles.result}>{result}</Text> : null}
        <TouchableOpacity style={[styles.button, !canPlay && styles.buttonDisabled]} disabled={!canPlay} onPress={play}>
          <Text style={styles.buttonText}>{canPlay ? "JUGAR" : "SIN SALDO"}</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  title: { color: "#fff", fontWeight: "900", letterSpacing: 1, textTransform: "uppercase", fontSize: 18 },
  note: { color: "#fff", fontWeight: "700" },
  betRow: { flexDirection: "row", gap: 8 },
  betBtn: { backgroundColor: "#e6d2b5", borderWidth: 3, borderColor: "#000", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8 },
  betBtnText: { fontWeight: "900" },
  row: { flexDirection: "row", justifyContent: "space-around", marginVertical: 10 },
  side: { alignItems: "center" },
  label: { fontWeight: "900" },
  card: { width: 120, height: 170, resizeMode: "contain", marginTop: 6 },
  result: { marginTop: 8, fontWeight: "900", textAlign: "center" },
  button: { backgroundColor: "#000", padding: 12, borderRadius: 8, borderWidth: 3, borderColor: "#000" },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontWeight: "900", textAlign: "center", textTransform: "uppercase" },
});