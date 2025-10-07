import { Redirect, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { createBetWithPrize } from "../../lib/bets";
import { getBalance } from "../../lib/wallet";
import { BottomTabs } from "../../components/BottomTabs";

export default function NewBetScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [prize, setPrize] = useState("0");
  const [durationMin, setDurationMin] = useState("30");
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (!user) return;
    getBalance(Number(user.id)).then(setBalance).catch(() => {});
  }, [user]);

  if (!user) return <Redirect href="/" />;

  const onCreate = async () => {
    const prizeAmount = Math.max(0, parseInt(prize || "0", 10));
    const mins = Math.max(1, parseInt(durationMin || "30", 10));
    const startsAt = new Date().toISOString();
    const closesAt = new Date(Date.now() + mins * 60_000).toISOString();

    try {
      const bet = await createBetWithPrize({
        created_by: Number(user.id),
        title,
        description: desc,
        prize_amount: prizeAmount,
        starts_at: startsAt,
        closes_at: closesAt,
        odds_decimal: null,
      });
      Alert.alert("Apuesta creada", `ID ${bet.id}`);
      router.replace(`/bets/${bet.id}` as any);
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "No se pudo crear");
    }
  };

  return (
    <ImageBackground source={require("../../assets/wood.jpg")} style={{ flex: 1 }} resizeMode="repeat">
      <View style={styles.container}>
        <Text style={styles.title}>Nueva apuesta (ADMIN)</Text>
        <Text style={styles.note}>Tu saldo: {balance} bones</Text>

        <TextInput placeholder="Título" style={styles.input} value={title} onChangeText={setTitle} />
        <TextInput placeholder="Descripción" style={styles.input} value={desc} onChangeText={setDesc} />
        <TextInput placeholder="Premio (bones)" keyboardType="numeric" style={styles.input} value={prize} onChangeText={setPrize} />
        <TextInput placeholder="Duración (min)" keyboardType="numeric" style={styles.input} value={durationMin} onChangeText={setDurationMin} />

        <TouchableOpacity style={styles.button} onPress={onCreate}><Text style={styles.buttonText}>CREAR</Text></TouchableOpacity>
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
  title: { color: "#fff", fontWeight: "900" },
  note: { color: "#fff", fontWeight: "700" },
  input: { backgroundColor: "#fff", borderWidth: 2, borderColor: "#000", borderRadius: 8, padding: 10 },
  button: { backgroundColor: "#000", padding: 12, borderRadius: 8, borderWidth: 3, borderColor: "#000" },
  buttonText: { color: "#fff", fontWeight: "900", textAlign: "center" },
});