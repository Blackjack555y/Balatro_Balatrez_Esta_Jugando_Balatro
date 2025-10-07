import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import {
  Message,
  getThreadMessages,
  sendMessage,
  subscribeToThread,
  toNumberId,
} from "../../lib/chat";

export default function ChatThreadScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const { peerId } = useLocalSearchParams<{ peerId: string }>();
  const peerNumeric = useMemo(() => toNumberId(peerId), [peerId]);
  const myNumeric = useMemo(() => toNumberId((user as any)?.id), [user]);

  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const listRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    if (!user) {
      router.replace("/");
      return;
    }
  }, [user, router]);

  useEffect(() => {
    let active = true;
    (async () => {
      if (myNumeric == null || peerNumeric == null) return;
      setLoading(true);
      try {
        const data = await getThreadMessages(myNumeric, peerNumeric, { limit: 50 });
        if (active) setMessages(data);
      } catch (e) {
        console.log("getThreadMessages error", e);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [myNumeric, peerNumeric]);

  useEffect(() => {
    if (myNumeric == null || peerNumeric == null) return;
    const ch = subscribeToThread(myNumeric, peerNumeric, (msg: Message) => {
      // prevent dupes by id
      setMessages((prev) => {
        if (prev.find((m) => m.id === msg.id)) return prev;
        const next = [msg, ...prev];
        return next.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
      });
      // scroll to bottom (which is index 0 when inverted)
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    });
    return () => {
      ch.unsubscribe();
    };
  }, [myNumeric, peerNumeric]);

  const onSend = async () => {
    if (myNumeric == null || peerNumeric == null) return;
    if (!input.trim()) return;
    const text = input;
    setInput("");
    try {
      const sent = await sendMessage(myNumeric, peerNumeric, text);
      // optimistic add (subscription will also deliver; guard against dupes by id)
      setMessages((prev) => {
        if (prev.find((m) => m.id === sent.id)) return prev;
        return [sent, ...prev];
      });
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    } catch (e) {
      console.log("sendMessage error", e);
      // restore text on failure
      setInput(text);
    }
  };

  const renderItem = ({ item }: { item: Message }) => {
    const isMe = item.sender_id === myNumeric;
    return (
      <View style={[styles.bubbleRow, isMe ? styles.right : styles.left]}>
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
          <Text style={styles.bubbleText}>{item.content}</Text>
          <Text style={styles.bubbleTime}>
            {new Date(item.created_at).toLocaleTimeString()}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <ImageBackground
      source={require("../../assets/wood.jpg")}
      style={{ flex: 1 }}
      resizeMode="repeat"
    >
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.back()} style={{ paddingHorizontal: 12 }}>
          <Text style={{ fontWeight: "bold" }}>{"<"}</Text>
        </TouchableOpacity>
        <Image source={require("../../assets/daniel.png")} style={styles.headerAvatar} />
        <Text style={styles.headerTitle}>Chat</Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        {loading ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <ActivityIndicator color="#fff" />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            inverted
            keyExtractor={(m) => `${m.id}`}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 10 }}
          />
        )}

        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type a message"
            placeholderTextColor="#666"
            multiline
          />
          <TouchableOpacity style={styles.sendBtn} onPress={onSend} disabled={!input.trim()}>
            <Text style={{ color: "#fff", fontWeight: "bold" }}>SEND</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  headerAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: 8 },
  headerTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  bubbleRow: { paddingVertical: 4, flexDirection: "row" },
  left: { justifyContent: "flex-start" },
  right: { justifyContent: "flex-end" },
  bubble: {
    maxWidth: "80%",
    borderWidth: 2,
    borderColor: "#000",
    padding: 8,
  },
  bubbleMe: { backgroundColor: "#8B0000" },
  bubbleThem: { backgroundColor: "#f4e1d2" },
  bubbleText: { color: "#000" },
  bubbleTime: { marginTop: 4, fontSize: 10, color: "#222" },
  composer: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 3,
    borderColor: "#000",
    backgroundColor: "rgba(0,0,0,0.8)",
    padding: 8,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 120,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  sendBtn: {
    marginLeft: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#4B0082",
    borderWidth: 2,
    borderColor: "#fff",
  },
});
