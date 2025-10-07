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
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { Message, getThreadMessages, sendMessage, subscribeToThread, toNumberId } from "../../lib/chat";
import { BottomTabs } from "../../components/BottomTabs";

export default function ChatThreadScreen() {
    const { user } = useAuth();
    const router = useRouter();
    const insets = useSafeAreaInsets();
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
        setMessages((prev) => {
          if (prev.find((m) => m.id === msg.id)) return prev;
          const next = [msg, ...prev];
          return next.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
        });
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
        setMessages((prev) => {
          if (prev.find((m) => m.id === sent.id)) return prev;
          return [sent, ...prev];
        });
        listRef.current?.scrollToOffset({ offset: 0, animated: true });
      } catch (e) {
        console.log("sendMessage error", e);
        setInput(text);
      }
    };

    const renderItem = ({ item }: { item: Message }) => {
      const isMe = item.sender_id === myNumeric;
      return (
        <View style={[styles.bubbleRow, isMe ? styles.right : styles.left]}>
          <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
            <Text style={styles.bubbleText}>{item.content}</Text>
            <Text style={styles.bubbleTime}>{new Date(item.created_at).toLocaleTimeString()}</Text>
          </View>
        </View>
      );
    };

    return (
      <ImageBackground source={require("../../assets/wood.jpg")} style={{ flex: 1 }} resizeMode="repeat">
        <View style={[styles.topBar, { paddingTop: insets.top }]}>
          <TouchableOpacity onPress={() => router.back()} style={{ paddingHorizontal: 12 }}>
            <Text style={{ fontWeight: "bold" }}>{"<"}</Text>
          </TouchableOpacity>
          <Image source={require("../../assets/daniel.png")} style={styles.headerAvatar} />
          <Text style={styles.headerTitle}>Chat</Text>
        </View>

        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? insets.top + 56 : 0}
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
              contentContainerStyle={{ padding: 10, paddingBottom: 4 }}
              keyboardShouldPersistTaps="handled"
            />
          )}

          <View style={[styles.composer, { paddingBottom: 8 + insets.bottom }]}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={setInput}
              placeholder="Type a message"
              placeholderTextColor="#666"
              multiline
              returnKeyType="send"
              onSubmitEditing={() => onSend()}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={onSend} disabled={!input.trim()}>
              <Text style={{ color: "#fff", fontWeight: "bold" }}>SEND</Text>
            </TouchableOpacity>
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
        </KeyboardAvoidingView>
      </ImageBackground>
    );
  }

  const styles = StyleSheet.create({
    topBar: {
      minHeight: 50,
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
 
