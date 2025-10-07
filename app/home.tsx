// app/home.tsx
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";

type Tab = {
  id: number;
  name: string;
  icon: any;
  onPress?: () => void;
};

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();


  useEffect(() => {
    if (!user) {
      router.replace("/");
    }
  }, [user, router]);

  const cards = [
    {
      id: 1,
      title: "Juegos",
      image: require("./adder.png"),
  onPress: () => router.push("/solo" as any),
    },
    {
      id: 2,
      title: "Apuestas",
      image: require("./squirrel.png"),
  onPress: () => router.push("/bets" as any),
    },
    {
      id: 3,
      title: "Wallet",
      image: require("./starvation.png"),
  onPress: () => router.push("/wallet" as any),
    },
    {
      id: 4,
  title: "Chat",
      image: require("./wolf.png"),
  onPress: () => router.push("/chat" as any),
    },
  ];

  const tabs: Tab[] = [
    {
      id: 1,
      name: "Rules",
      icon: require("../assets/tab_1.png"),
      onPress: () => router.push("/rules" as any),
    },
    {
      id: 2,
      name: "Tab2",
      icon: require("../assets/tab_2.png"),
      onPress: () => console.log("Tab2 pressed"),
    },
    {
      id: 3,
      name: "Home",
      icon: require("../assets/tab_home.png"),
      onPress: () => router.push("/home" as any),
    },
    {
      id: 4,
      name: "Chat",
      icon: require("../assets/tab_4.png"),
      onPress: () => router.push("/chat" as any),
    },
    {
      id: 5,
      name: "Profile",
      icon: require("../assets/tab_profile.png"),
      onPress: () => router.push("/profile" as any),
    },
  ];

  return (
    <ImageBackground source={require("../assets/wood.jpg")} style={styles.container} resizeMode="repeat">
  <View style={[styles.topBar, { paddingTop: insets.top }]}>
        <Text style={styles.barText}>☠️ Inscryption Clone</Text>
      </View>

      <View style={styles.grid}>
        {cards.map((card) => (
          <TouchableOpacity
            key={card.id}
            style={styles.cardContainer}
            onPress={card.onPress ?? (() => console.log(`Selected ${card.title}`))}
          >
            <Image source={card.image} style={styles.cardImage} />
            <Text style={styles.cardTitle}>{card.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

  <View style={[styles.bottomBar, { paddingBottom: 10 + insets.bottom }]}>
        {tabs.map((tab) => (
          <TouchableOpacity key={tab.id} style={styles.tabButton} onPress={tab.onPress ?? (() => {})}>
            <Image source={tab.icon} style={styles.tabIcon} />
            <Text style={styles.tabLabel}>{tab.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    minHeight: 50,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 3,
    borderColor: "#000",
    backgroundColor: "rgba(244, 225, 210, 0.9)",
  },
  bottomBar: {
    minHeight: 70,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 3,
    borderColor: "#000",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingTop: 8,
  },
  barText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  grid: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  cardContainer: {
    width: "40%",
    margin: 10,
    alignItems: "center",
  },
  cardImage: { width: 140, height: 200, resizeMode: "contain" },
  cardTitle: {
    marginTop: 5,
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  tabButton: { flex: 1, alignItems: "center" },
  tabIcon: { width: 48, height: 48, resizeMode: "contain" },
  tabLabel: { fontSize: 10, color: "#fff", marginTop: 4, textTransform: "uppercase" },
});
