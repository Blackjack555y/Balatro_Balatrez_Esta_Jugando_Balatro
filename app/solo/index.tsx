import { Redirect, useRouter } from "expo-router";
import React from "react";
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BottomTabs, Tab } from "../../components/BottomTabs";
import { useAuth } from "../../context/AuthContext";

export default function SoloIndex() {
  const { user } = useAuth();
  const router = useRouter();
  if (!user) return <Redirect href="/" />;

  const games = [
    { key: "high-card", title: "ALTA CARTA", desc: "Una vs Crupier. Paga 2x al ganar." },
    { key: "five-card", title: "PÓKER 5", desc: "Mano más alta gana. Paga 2x (empate devuelve)." },
    { key: "pair-plus", title: "PAR O MEJOR", desc: "Par o mejor paga ≥2x (según mano)." },
    { key: "flush-straight", title: "COLOR/ESCALERA", desc: "Color o Escalera paga 3x." },
  ];

  const tabs: Tab[] = [
    { id: 1, name: "Rules",  icon: require("../../assets/tab_1.png"),     onPress: () => router.push("/rules" as any) },
    { id: 2, name: "Solo",   icon: require("../../assets/tab_2.png"),     onPress: () => router.push("/solo" as any) },
    { id: 3, name: "Home",   icon: require("../../assets/tab_home.png"),  onPress: () => router.push("/home" as any) },
    { id: 4, name: "Wallet", icon: require("../../assets/tab_4.png"),     onPress: () => router.push("/wallet" as any) },
    { id: 5, name: "Profile",icon: require("../../assets/tab_profile.png"),onPress: () => router.push("/profile" as any) },
  ];

  return (
    <ImageBackground source={require("../../assets/wood.jpg")} style={{ flex: 1 }} resizeMode="repeat">
      <View style={styles.container}>
        <Text style={styles.title}>JUEGOS EN SOLITARIO</Text>
        {games.map((g) => (
          <TouchableOpacity key={g.key} style={styles.card} onPress={() => router.push(`/solo/${g.key}` as any)}>
            <Text style={styles.cardTitle}>{g.title}</Text>
            <Text style={styles.cardDesc}>{g.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <BottomTabs tabs={tabs} />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  title: { color: "#fff", fontWeight: "900", letterSpacing: 1, textTransform: "uppercase", fontSize: 18, marginBottom: 8 },
  card: { backgroundColor: "#e6d2b5", borderWidth: 3, borderColor: "#000", padding: 14, borderRadius: 8 },
  cardTitle: { fontWeight: "900", textTransform: "uppercase" },
  cardDesc: { marginTop: 4 },
});