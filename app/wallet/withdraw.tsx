import { Redirect, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, ImageBackground, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { applyDelta, getBalance } from "../../lib/wallet";

export default function WithdrawScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [amount, setAmount] = useState("10");

  if (!user) return <Redirect href="/" />;

  const userId = Number(user.id);

  const confirm = async () => {
    const n = Math.max(0, Math.floor(Number(amount)));
    if (!n) return Alert.alert("Monto inválido", "Ingresa un número mayor a 0");
    try {
      await applyDelta(userId, -n, "withdraw");
      const b = await getBalance(userId);
      Alert.alert("Retiro realizado", `Nuevo saldo: ${b} bones`, [{ text: "OK", onPress: () => router.back() }]);
    } catch (e: any) {
      Alert.alert("Error", e.message ?? "No se pudo retirar");
    }
  };

  return (
    <ImageBackground source={require("../../assets/wood.jpg")} style={{ flex: 1 }} resizeMode="repeat">
      <View style={styles.container}>
        <Text style={styles.title}>RETIRAR BONES</Text>
        <TextInput style={styles.input} keyboardType="number-pad" value={amount} onChangeText={setAmount} placeholder="Monto" />
        <View style={styles.row}>
          <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={() => setAmount(String(Math.max(0, Number(amount) - 5)))}>
            <Text style={styles.btnLabel}>-5</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.btnGhost]} onPress={() => setAmount(String(Number(amount) + 5))}>
            <Text style={styles.btnLabel}>+5</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={[styles.btn, styles.btnDanger]} onPress={confirm}>
          <Text style={styles.btnLabel}>CONFIRMAR</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.btnSecondary]} onPress={() => router.back()}>
          <Text style={styles.btnLabel}>CANCELAR</Text>
        </TouchableOpacity>
      </View>
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
  btnDanger: { backgroundColor: "#c62828" },
  btnSecondary: { backgroundColor: "#555" },
  btnLabel: { color: "#fff", fontWeight: "900", textTransform: "uppercase" },
});