import { Redirect, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Image, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { Peer, listPeersExcept, toNumberId } from "../../lib/chat";

export default function NewChatScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const myId = useMemo(() => toNumberId((user as any)?.id), [user]);
  const [loading, setLoading] = useState(true);
  const [peers, setPeers] = useState<Peer[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    (async () => {
      try {
        const list = await listPeersExcept(myId!, { limit: 200 });
        if (mounted) setPeers(list);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false };
  }, [user, myId]);

  if (!user) return <Redirect href="/" />;

  const filtered = peers.filter(p => {
    if (!q.trim()) return true;
    const s = q.trim().toLowerCase();
    return (p.nickname?.toLowerCase().includes(s) || String(p.user_id).includes(s));
  });

  return (
    <ImageBackground source={require("../../assets/wood.jpg")} style={{ flex: 1 }} resizeMode="repeat">
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={{ paddingHorizontal: 12 }}>
          <Text style={{ fontWeight: "bold" }}>{"<"}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Nuevo chat</Text>
      </View>

      <View style={styles.searchRow}>
        <TextInput value={q} onChangeText={setQ} placeholder="Buscar usuario..." placeholderTextColor="#666" style={styles.search} />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator color="#fff" />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(p) => String(p.user_id)}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.row} onPress={() => router.push(`/chat/${item.user_id}` as any)}>
              <Image source={ item.avatar_url ? { uri: item.avatar_url } : require("../../assets/david.png") } style={styles.avatar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.nickname || `User ${item.user_id}`}</Text>
                <Text style={styles.meta}>ID: {item.user_id}</Text>
              </View>
              <Text style={styles.go}>Abrir</Text>
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          contentContainerStyle={{ padding: 10 }}
        />
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  topBar: {
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 3,
    borderColor: "#000",
    backgroundColor: "rgba(244,225,210,0.9)",
  },
  title: { fontSize: 14, fontWeight: "bold", color: "#000", letterSpacing: 2, textTransform: "uppercase" },
  searchRow: { padding: 10, borderBottomWidth: 3, borderColor: "#000", backgroundColor: "rgba(0,0,0,0.5)" },
  search: { backgroundColor: "#fff", borderWidth: 2, borderColor: "#000", paddingHorizontal: 10, paddingVertical: 8, color: "#000" },
  row: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(244, 225, 210, 0.9)", borderWidth: 2, borderColor: "#000", padding: 10 },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 10 },
  name: { fontWeight: "bold", color: "#000", textTransform: "uppercase" },
  meta: { color: "#333", marginTop: 4 },
  go: { color: "#000", fontWeight: "bold" },
});
