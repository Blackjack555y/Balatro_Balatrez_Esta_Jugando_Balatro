import { Redirect, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { FlatList, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { BottomTabs } from "../../components/BottomTabs";
import { useAuth } from "../../context/AuthContext";
import { BetStats, listBets } from "../../lib/bets";
import { LoadingOverlay } from "../../components/LoadingOverlay";

export default function BetsScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [bets, setBets] = useState<BetStats[]>([]);
  const [tick, setTick] = useState(0);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "open" | "closed" | "settled" | "canceled">("all");
  const [loading, setLoading] = useState(true);
  const role = (user?.profile?.role ?? "jugador").toString().toLowerCase();
  const isAdmin = role === "administrador";

  useEffect(() => {
    let mounted = true;
    const fetchOnce = () => listBets()
      .then((rows: BetStats[]) => { if (mounted) setBets(rows); })
      .catch(console.log)
      .finally(() => { if (mounted) setLoading(false); });
    fetchOnce();
    const poll = setInterval(fetchOnce, 5000);
    return () => {
      mounted = false;
      clearInterval(poll);
    };
  }, []);

  useEffect(() => {
    const int = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(int);
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    // include `tick` to recompute every second so items move between OPEN/CLOSED as time passes
    const now = Date.now() + tick * 0;
    return bets.filter((b) => {
      const matchesText = q
        ? (b.title?.toLowerCase().includes(q) || (b.description ?? "").toLowerCase().includes(q))
        : true;
      const effectiveStatus =
        b.status === "open" && b.closes_at && new Date(b.closes_at).getTime() <= now
          ? "closed"
          : b.status;
      const matchesStatus = status === "all" ? true : effectiveStatus === status;
      return matchesText && matchesStatus;
    });
  }, [bets, search, status, tick]);

  if (!user) return <Redirect href="/" />;

  return (
    <>
    <ImageBackground source={require("../../assets/wood.jpg")} style={{ flex: 1 }} resizeMode="repeat">
      <View style={styles.container}>
        <View style={styles.headerRow}>
    <Text style={styles.title}>LIVE BETS</Text>
          {isAdmin && (
            <TouchableOpacity style={styles.newBtn} onPress={() => router.push("/bets/new" as any)}>
      <Text style={styles.newBtnText}>New bet</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={{ gap: 8, marginTop: 10 }}>
          <TextInput
            placeholder="Search by title or description"
            placeholderTextColor="#333"
            value={search}
            onChangeText={setSearch}
            style={styles.search}
          />
          <View style={styles.chipsRow}>
            {(["all", "open", "closed", "settled", "canceled"] as const).map((s) => (
              <TouchableOpacity key={s} onPress={() => setStatus(s)} style={[styles.chip, status === s && styles.chipActive]}>
                <Text style={[styles.chipText, status === s && styles.chipTextActive]}>{s.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <FlatList
          data={filtered}
          keyExtractor={(x) => `${x.id}-${tick}`}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.bet} onPress={() => router.push(`/bets/${item.id}` as any)}>
              <Text style={styles.betTitle}>{item.title}</Text>
              {item.description ? <Text>{item.description}</Text> : null}
              <Text style={styles.badge}>
                {(() => {
                  const now = Date.now();
                  const effectiveStatus =
                    item.status === "open" && item.closes_at && new Date(item.closes_at).getTime() <= now
                      ? "closed"
                      : item.status;
                  return `Status: ${effectiveStatus.toUpperCase()}`;
                })()}
              </Text>
              {item.closes_at ? (
                <Text style={styles.badge}>
                  Closes in: {(() => {
                    const diff = new Date(item.closes_at!).getTime() - Date.now();
                    if (diff <= 0) return "CLOSED";
                    const s = Math.floor(diff / 1000);
                    const m = Math.floor(s / 60);
                    const sec = s % 60;
                    return `${m}:${String(sec).padStart(2, "0")}`;
                  })()}
                </Text>
              ) : null}
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          contentContainerStyle={{ paddingVertical: 12 }}
          ListEmptyComponent={() => (
            <Text style={{ color: "#fff", fontWeight: "900", marginTop: 12 }}>No results</Text>
          )}
        />
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
  <LoadingOverlay visible={loading} text="Loading bets..." />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  title: { fontWeight: "900", fontSize: 18, letterSpacing: 1, textTransform: "uppercase", color: "#fff" },
  search: { backgroundColor: "#fff", borderWidth: 2, borderColor: "#000", borderRadius: 8, padding: 10 },
  chipsRow: { flexDirection: "row", gap: 8 },
  chip: { paddingHorizontal: 10, paddingVertical: 6, borderWidth: 2, borderColor: "#000", backgroundColor: "#e6d2b5", borderRadius: 999 },
  chipActive: { backgroundColor: "#000", borderColor: "#000" },
  chipText: { fontWeight: "900", color: "#000" },
  chipTextActive: { color: "#fff" },
  bet: { backgroundColor: "#e6d2b5", borderWidth: 3, borderColor: "#000", padding: 12, borderRadius: 8 },
  betTitle: { fontWeight: "900" },
  badge: { marginTop: 6, fontWeight: "900" },
  newBtn: { paddingHorizontal: 10, paddingVertical: 6, borderWidth: 2, borderColor: "#000", backgroundColor: "#e6d2b5" },
  newBtnText: { fontWeight: "bold", color: "#000" },
});