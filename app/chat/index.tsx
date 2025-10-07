import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    ImageBackground,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { Conversation, listConversations, toNumberId } from "../../lib/chat";

export default function ChatListScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Conversation[]>([]);

  useEffect(() => {
    if (!user) {
      router.replace("/");
      return;
    }

    const uid = toNumberId((user as any).id);
    if (uid == null) return;

    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const data = await listConversations(uid);
        if (mounted) setItems(data);
      } catch (e) {
        console.log("listConversations error", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [user, router]);

  const renderItem = ({ item }: { item: Conversation }) => {
    const avatar = item.peer.avatar_url
      ? { uri: item.peer.avatar_url }
      : require("../../assets/david.png");
    const name = item.peer.nickname || `User ${item.peer.user_id}`;
    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() => router.push(`/chat/${item.peer.user_id}` as any)}
      >
        <Image source={avatar} style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.snippet} numberOfLines={1}>
            {item.lastMessage.content}
          </Text>
        </View>
        <Text style={styles.time}>
          {new Date(item.lastMessage.created_at).toLocaleTimeString()}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <ImageBackground
      source={require("../../assets/wood.jpg")}
      style={styles.container}
      resizeMode="repeat"
    >
      <View style={styles.topBar}>
        <Text style={styles.barText}>Messages</Text>
        <TouchableOpacity style={styles.newBtn} onPress={() => router.push("/chat/new" as any)}>
          <Text style={styles.newBtnText}>Nuevo chat</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator color="#fff" />
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(it) => `${it.peer.user_id}`}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 10 }}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        />
      )}
      <View style={styles.bottomBar} />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 3,
    borderColor: "#000",
    backgroundColor: "rgba(244, 225, 210, 0.9)",
    flexDirection: "row",
  },
  newBtn: { position: "absolute", right: 10, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 2, borderColor: "#000", backgroundColor: "#e6d2b5" },
  newBtnText: { fontWeight: "bold", color: "#000" },
  bottomBar: {
    height: 10,
    borderTopWidth: 3,
    borderColor: "#000",
    backgroundColor: "rgba(0,0,0,0.8)",
  },
  barText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(244, 225, 210, 0.9)",
    borderWidth: 2,
    borderColor: "#000",
    padding: 10,
  },
  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 10 },
  name: { fontWeight: "bold", color: "#000", textTransform: "uppercase" },
  snippet: { color: "#333", marginTop: 4 },
  time: { marginLeft: 10, color: "#000", fontSize: 10 },
});
