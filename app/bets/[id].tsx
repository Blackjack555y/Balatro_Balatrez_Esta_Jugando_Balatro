import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, Image, ImageBackground, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { BottomTabs } from "../../components/BottomTabs";
import { LoadingOverlay } from "../../components/LoadingOverlay";
import { SuccessOverlay } from "../../components/SuccessOverlay";
import { useAuth } from "../../context/AuthContext";
import { BetParticipant, BetStats, getBet, joinBet, listParticipantsDetailed, settleBet } from "../../lib/bets";
import { addReview, listReviews, ReviewDetail } from "../../lib/reviews";

export default function BetDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [bet, setBet] = useState<BetStats | null>(null);
  const [parts, setParts] = useState<BetParticipant[]>([]);
  const [tick, setTick] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [pending, setPending] = useState(false);
  const [reviews, setReviews] = useState<ReviewDetail[]>([]);
  const [newReview, setNewReview] = useState("");
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

  const refreshReviews = useCallback(async () => {
    if (!id) return;
    const rs = await listReviews(Number(id));
    setReviews(rs);
  }, [id]);

  useEffect(() => {
    refreshReviews().catch(() => {});
  }, [refreshReviews]);

  const closesIn = (() => {
    if (!bet?.closes_at) return "";
    const diff = Math.max(0, new Date(bet.closes_at).getTime() - Date.now());
    const mm = Math.floor(diff / 60000);
    const ss = Math.floor((diff % 60000) / 1000);
    return `${mm}:${ss.toString().padStart(2, "0")}`;
  })();

  const onJoin = async () => {
    try {
      setPending(true);
      await joinBet(Number(id), Number(user!.id), 1);
      await refresh();
  setShowSuccess(true);
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "No se pudo unir");
    } finally {
      setPending(false);
    }
  };

  const onSettle = async () => {
    try {
      setPending(true);
      const res = await settleBet(Number(id));
      Alert.alert("Liquidada", JSON.stringify(res));
      router.replace("/bets" as any);
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "No se pudo liquidar");
    } finally {
      setPending(false);
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
            <Text style={styles.section}>Reviews</Text>
            <ScrollView style={{ maxHeight: 200, marginBottom: 8 }}>
              {reviews.map((r) => (
                <View key={r.id} style={{ marginBottom: 8 }}>
                  <Text style={{ color: "#fff", fontWeight: "800" }}>{r.nickname ?? r.username ?? `User ${r.user_id}`}</Text>
                  <Text style={{ color: "#fff" }}>{r.content}</Text>
                </View>
              ))}
              {reviews.length === 0 && <Text style={styles.note}>No reviews yet.</Text>}
            </ScrollView>
            <View style={{ gap: 8 }}>
              <TextInput
                placeholder="Write a review"
                placeholderTextColor="#333"
                value={newReview}
                onChangeText={setNewReview}
                style={styles.input}
              />
              <TouchableOpacity
                style={[styles.button, { backgroundColor: "#2e7d32" }]}
                onPress={async () => {
                  if (!newReview.trim()) return;
                  try {
                    setPending(true);
                    await addReview(Number(id), Number(user!.id), newReview.trim());
                    setNewReview("");
                    await refreshReviews();
                  } catch (e: any) {
                    Alert.alert("Error", e.message ?? "No se pudo guardar");
                  } finally {
                    setPending(false);
                  }
                }}
              >
                <Text style={styles.buttonText}>Submit review</Text>
              </TouchableOpacity>
            </View>

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
      <SuccessOverlay
        visible={showSuccess}
        text="Joined!"
        onFinished={() => setShowSuccess(false)}
      />
  <LoadingOverlay visible={pending} text="Processing..." />
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
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center", padding: 16 },
  modalCard: { backgroundColor: "#e6d2b5", borderWidth: 3, borderColor: "#000", padding: 16, borderRadius: 12, width: "100%" },
  input: { backgroundColor: "#fff", borderWidth: 2, borderColor: "#000", borderRadius: 8, padding: 10 },
});