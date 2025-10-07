import { Redirect, useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Alert, ImageBackground, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View, useWindowDimensions } from "react-native";
import { BottomTabs } from "../../components/BottomTabs";
import { LoadingOverlay } from "../../components/LoadingOverlay";
import { useAuth } from "../../context/AuthContext";
import { createBetWithPrize } from "../../lib/bets";
import { getBalance } from "../../lib/wallet";

export default function NewBetScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [prize, setPrize] = useState("0");
  const [durationMin, setDurationMin] = useState("30");
  const [balance, setBalance] = useState(0);
  const [pending, setPending] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const successRef = useRef<LottieView>(null);
  const [createdId, setCreatedId] = useState<number | null>(null);
  const navigatedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { width: screenWidth } = useWindowDimensions();
  const animSize = Math.min(320, Math.max(200, screenWidth - 80));

  useEffect(() => {
    if (!user) return;
    getBalance(Number(user.id)).then(setBalance).catch(() => {});
  }, [user]);

  // Note: Don't early-return before hooks below; we gate at render time later.

  const parsedPrize = useMemo(() => {
    const n = parseInt(prize || "0", 10);
    return Number.isFinite(n) ? Math.max(0, n) : 0;
  }, [prize]);

  const parsedDuration = useMemo(() => {
    const n = parseInt(durationMin || "0", 10);
    if (!Number.isFinite(n)) return 0;
    return Math.min(1440, Math.max(1, n)); // 1 minute to 24h
  }, [durationMin]);

  const closesPreview = useMemo(() => {
    if (!parsedDuration) return "";
    const date = new Date(Date.now() + parsedDuration * 60_000);
    const h = date.getHours().toString().padStart(2, "0");
    const m = date.getMinutes().toString().padStart(2, "0");
    return `${h}:${m}`;
  }, [parsedDuration]);

  const titleValid = title.trim().length > 0;
  const prizeValid = parsedPrize > 0 && parsedPrize <= balance;
  const durationValid = parsedDuration >= 1;
  const formValid = titleValid && prizeValid && durationValid;

  const onCreate = async () => {
    if (!formValid || !user) return;
    setPending(true);
    const startsAt = new Date().toISOString();
    const closesAt = new Date(Date.now() + parsedDuration * 60_000).toISOString();

    try {
      const bet = await createBetWithPrize({
        created_by: Number(user.id),
        title: title.trim(),
        description: desc.trim() || undefined,
        prize_amount: parsedPrize,
        starts_at: startsAt,
        closes_at: closesAt,
        odds_decimal: null,
      });
      setCreatedId(bet.id);
      setShowSuccess(true);
      navigatedRef.current = false;
      // Fallback in case onAnimationFinish does not fire (e.g., some web cases)
      timerRef.current = setTimeout(() => {
        if (!navigatedRef.current) {
          navigatedRef.current = true;
          setShowSuccess(false);
          router.replace(`/bets/${bet.id}` as any);
        }
      }, 3000);
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "Could not create bet");
    } finally {
      setPending(false);
    }
  };

  if (!user) return <Redirect href="/" />;

  return (
    <>
  <ImageBackground source={require("../../assets/wood.jpg")} style={{ flex: 1 }} resizeMode="repeat">
      <View style={styles.container}>
  <Text style={styles.title}>New bet (ADMIN)</Text>
  <Text style={styles.note}>Your balance: {balance} bones</Text>

  <View style={styles.field}>
    <Text style={styles.label}>Title</Text>
    <TextInput placeholder="e.g., Winner of the next hand" style={styles.input} value={title} onChangeText={setTitle} />
    {!titleValid && <Text style={styles.helpError}>Title is required</Text>}
  </View>

  <View style={styles.field}>
    <Text style={styles.label}>Description (optional)</Text>
    <TextInput
      placeholder="Add context or rules for the bet"
      style={styles.input}
      value={desc}
      onChangeText={setDesc}
    />
  </View>

  <View style={styles.field}>
    <Text style={styles.label}>Prize (bones)</Text>
    <TextInput
      placeholder="Amount to fund the prize pool"
      keyboardType="numeric"
      style={styles.input}
      value={prize}
      onChangeText={setPrize}
    />
    <Text style={[styles.help, !prizeValid ? styles.helpError : undefined]}>
      Must be greater than 0 and not exceed your balance
    </Text>
  </View>

  <View style={styles.field}>
    <Text style={styles.label}>Duration (minutes)</Text>
    <TextInput
      placeholder="How long the bet will stay open"
      keyboardType="numeric"
      style={styles.input}
      value={durationMin}
      onChangeText={setDurationMin}
    />
    <Text style={styles.help}>Opens now and closes at approximately {closesPreview}</Text>
  </View>

  <TouchableOpacity
    style={[styles.button, (!formValid || pending) && styles.buttonDisabled]}
    onPress={onCreate}
    disabled={!formValid || pending}
  >
    <Text style={styles.buttonText}>{pending ? "CREATING..." : "CREATE"}</Text>
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
    </ImageBackground>
    <Modal visible={showSuccess} transparent animationType="fade" onRequestClose={() => setShowSuccess(false)}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <LottieView
            ref={successRef}
            source={require("../../assets/animations/Approve.json")}
            autoPlay
            loop={false}
            style={{ width: animSize, height: animSize }}
            onAnimationFinish={() => {
              if (createdId && !navigatedRef.current) {
                navigatedRef.current = true;
                if (timerRef.current) clearTimeout(timerRef.current);
                setShowSuccess(false);
                router.replace(`/bets/${createdId}` as any);
              }
            }}
          />
          <Text style={styles.modalText}>Bet created!</Text>
        </View>
      </View>
  </Modal>
  <LoadingOverlay visible={pending} text="Creating bet..." />
  </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 10 },
  title: { color: "#fff", fontWeight: "900" },
  note: { color: "#fff", fontWeight: "700" },
  field: { gap: 6 },
  label: { color: "#fff", fontWeight: "800" },
  input: { backgroundColor: "#fff", borderWidth: 2, borderColor: "#000", borderRadius: 8, padding: 10 },
  help: { color: "#fff", opacity: 0.9 },
  helpError: { color: "#ffd4d4", fontWeight: "800" },
  button: { backgroundColor: "#000", padding: 12, borderRadius: 8, borderWidth: 3, borderColor: "#000" },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontWeight: "900", textAlign: "center" },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center" },
  modalCard: { backgroundColor: "#e6d2b5", borderWidth: 3, borderColor: "#000", padding: 20, borderRadius: 12, alignItems: "center" },
  modalText: { marginTop: 8, fontWeight: "900", color: "#000" },
});