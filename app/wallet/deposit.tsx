import { Redirect, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { BottomTabs, Tab } from "../../components/BottomTabs";
import { useAuth } from "../../context/AuthContext";
import { applyDelta, getBalance } from "../../lib/wallet";

export default function DepositScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [amount, setAmount] = useState("10");

  if (!user) return <Redirect href="/" />;

  const userId = Number(user.id);

  const confirm = async () => {
    const n = Math.max(0, Math.floor(Number(amount)));
    if (!n) return Alert.alert("Monto inválido", "Ingresa un número mayor a 0");
    try {
      await applyDelta(userId, n, "deposit");
      const b = await getBalance(userId);
      Alert.alert("Depósito realizado", `Nuevo saldo: ${b} bones`, [{ text: "OK", onPress: () => router.back() }]);
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "No se pudo depositar");
    }
  };

  return (
    <ImageBackground source={require("../../assets/wood.jpg")} style={{ flex: 1 }} resizeMode="repeat">
      <View style={styles.container}>
        <Text style={styles.title}>DEPOSITAR BONES</Text>
        <TextInput style={styles.input} keyboardType="number-pad" value={amount} onChangeText={setAmount} placeholder="Monto" />
        <View style={styles.row}>
          <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={() => setAmount(String(Math.max(0, Number(amount) - 5)))}>
            <Text style={styles.btnLabel}>-5</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={() => setAmount(String(Number(amount) + 5))}>
            <Text style={styles.btnLabel}>+5</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={[styles.btn, styles.btnPrimary]} onPress={confirm}>
          <Text style={styles.btnLabel}>CONFIRMAR</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={() => router.back()}>
          <Text style={styles.btnLabel}>CANCELAR</Text>
        </TouchableOpacity>
      </View>
      <BottomTabs
        tabs={[
          { id: 1, name: "Rules",  icon: require("../../assets/tab_1.png"),     onPress: () => router.push("/rules" as any) },
          { id: 2, name: "Solo",   icon: require("../../assets/tab_2.png"),     onPress: () => router.push("/solo" as any) },
          { id: 3, name: "Home",   icon: require("../../assets/tab_home.png"),  onPress: () => router.push("/home" as any) },
          { id: 4, name: "Chat",   icon: require("../../assets/tab_4.png"),     onPress: () => router.push("/chat" as any) },
          { id: 5, name: "Profile",icon: require("../../assets/tab_profile.png"),onPress: () => router.push("/profile" as any) },
        ] as Tab[]}
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 10 },
  title: { color: "#fff", fontWeight: "900", letterSpacing: 1, textTransform: "uppercase", fontSize: 18 },
  input: { backgroundColor: "#fff", borderWidth: 3, borderColor: "#000", borderRadius: 8, padding: 12, fontWeight: "900" },
  row: { flexDirection: "row", gap: 10 },
  btn: { flex: 1, padding: 12, borderRadius: 8, borderWidth: 3, borderColor: "#000", alignItems: "center" },
  btnGhost: { backgroundColor: "#e6d2b5" },
  btnPrimary: { backgroundColor: "#2e7d32" },
  btnSecondary: { backgroundColor: "#555" },
  btnLabel: { color: "#fff", fontWeight: "900", textTransform: "uppercase" },
});