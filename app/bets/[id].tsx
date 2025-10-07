import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { BetParticipant, BetStats, getBet, joinBet, listParticipantsDetailed, settleBet } from "../../lib/bets";
import { BottomTabs } from "../../components/BottomTabs";

export default function BetDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [bet, setBet] = useState<BetStats | null>(null);
  const [parts, setParts] = useState<BetParticipant[]>([]);
  const [tick, setTick] = useState(0);
  const role = (user?.profile?.role ?? "jugador").toString().toLowerCase();
  const isAdmin = role === "administrador";

  const refresh = useCallback(async () => {
    if (!id) return;
    const b = await getBet(Number(id));
    setBet(b);
    setParts(await listParticipantsDetailed(Number(id)));
  }, [id]);

  useEffect(() => {
    refresh().catch(() => {});
  }, [refresh]);

  useEffect(() => {
    const int = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(int);
  }, []);

  const closesIn = (() => {
    if (!bet?.closes_at) return "";
    const diff = Math.max(0, new Date(bet.closes_at).getTime() - Date.now());
    const mm = Math.floor(diff / 60000);
    const ss = Math.floor((diff % 60000) / 1000);
    return `${mm}:${ss.toString().padStart(2, "0")}`;
  })();

  const onJoin = async () => {
    try {
      await joinBet(Number(id), Number(user!.id), 1);
      await refresh();
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "No se pudo unir");
    }
  };

  const onSettle = async () => {
    try {
      const res = await settleBet(Number(id));
      Alert.alert("Liquidada", JSON.stringify(res));
      router.replace("/bets" as any);
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "No se pudo liquidar");
    }
  };

  if (!user) return <Redirect href="/" />;

  return (
    <ImageBackground source={require("../../assets/wood.jpg")} style={{ flex: 1 }} resizeMode="repeat">
      <View style={styles.container}>
  <TouchableOpacity onPress={() => router.back()}><Text style={styles.back}>&lt; BACK</Text></TouchableOpacity>

        {bet && (
          <>
            <Text style={styles.title}>{bet.title}</Text>
            <Text style={styles.note}>Prize: {bet.prize_amount} bones • Participants: {bet.participants_count}</Text>
            {bet.closes_at && <Text style={styles.note} key={`tick-${tick}`}>Closes in: {closesIn}</Text>}

            <Text style={styles.section}>Participants</Text>
            <View style={{ gap: 8 }}>
              {parts.map((p) => (
                <View key={p.user_id} style={styles.partRow}>
                  {p.avatar_url ? (
                    <Image source={{ uri: p.avatar_url }} style={styles.avatar} />
                  ) : (
                    <Image source={require("../../assets/david.png")} style={styles.avatar} />
                  )}
                  <Text style={styles.partText}>{p.nickname ?? `User ${p.user_id}`}</Text>
                </View>
              ))}
              {parts.length === 0 && <Text style={styles.note}>No participants yet.</Text>}
            </View>

            {bet.status === "open" && (
              <TouchableOpacity style={styles.button} onPress={onJoin}>
                <Text style={styles.buttonText}>JOIN</Text>
              </TouchableOpacity>
            )}
            {isAdmin && bet.status !== "settled" && bet.closes_at && new Date(bet.closes_at).getTime() <= Date.now() && (
              <TouchableOpacity style={[styles.button, { backgroundColor: "#2f8e2f" }]} onPress={onSettle}>
                <Text style={styles.buttonText}>SETTLE</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
      <BottomTabs
        tabs={[
          { id: 1, name: "Rules",   icon: require("../../assets/tab_1.png"),      onPress: () => router.push("/rules" as any) },
          { id: 2, name: "Solo",    icon: require("../../assets/tab_2.png"),      onPress: () => router.push("/solo" as any) },
          { id: 3, name: "Home",    icon: require("../../assets/tab_home.png"),   onPress: () => router.push("/home" as any) },
          { id: 4, name: "Chat",    icon: require("../../assets/tab_4.png"),      onPress: () => router.push("/chat" as any) },
          { id: 5, name: "Profile", icon: require("../../assets/tab_profile.png"),onPress: () => router.push("/profile" as any) },
        ]}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 10 },
  title: { color: "#fff", fontWeight: "900", fontSize: 18 },
  note: { color: "#fff", fontWeight: "700" },
  section: { color: "#fff", fontWeight: "900", marginTop: 10 },
  back: { color: "#fff", fontWeight: "900" },
  partRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  avatar: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: "#000", backgroundColor: "#eee" },
  partText: { color: "#fff", fontWeight: "900" },
  button: { backgroundColor: "#000", padding: 12, borderRadius: 8, borderWidth: 3, borderColor: "#000", marginTop: 12 },
  buttonText: { color: "#fff", fontWeight: "900", textAlign: "center" },
});