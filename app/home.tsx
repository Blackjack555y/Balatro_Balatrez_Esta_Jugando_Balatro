// app/home.tsx
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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

  // protege la ruta
  useEffect(() => {
    if (!user) {
      router.replace("/");
    }
  }, [user]);

  const cards = [
    { id: 1, title: "Story Mode", image: require("./adder.png") },
    { id: 2, title: "Endless", image: require("./squirrel.png") },
    { id: 3, title: "Multiplayer", image: require("./starvation.png") },
    { id: 4, title: "Settings", image: require("./wolf.png") },
  ];

  const tabs: Tab[] = [
    {
      id: 1,
      name: "Rules",
      icon: require("../assets/tab_1.png"),
      onPress: () => router.push("/rules" as any), // cast para evitar error TS
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
      name: "Tab4",
      icon: require("../assets/tab_4.png"),
      onPress: () => console.log("Tab4 pressed"),
    },
    {
      id: 5,
      name: "Profile",
      icon: require("../assets/tab_profile.png"),
      onPress: () => router.push("/profile" as any),
    },
  ];

  return (
    <ImageBackground
      source={require("../assets/wood.jpg")}
      style={styles.container}
      resizeMode="repeat"
    >
      {/* Barra superior */}
      <View style={styles.topBar}>
        <Text style={styles.barText}>☠️ Inscryption Clone</Text>
      </View>

      {/* Zona principal con cartas */}
      <View style={styles.grid}>
        {cards.map((card) => (
          <TouchableOpacity
            key={card.id}
            style={styles.cardContainer}
            onPress={() => console.log(`Selected ${card.title}`)}
          >
            <Image source={card.image} style={styles.cardImage} />
            <Text style={styles.cardTitle}>{card.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Barra inferior con Tabs */}
      <View style={styles.bottomBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={styles.tabButton}
            onPress={tab.onPress ?? (() => console.log(`Tab selected: ${tab.name}`))}
          >
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
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 3,
    borderColor: "#000",
    backgroundColor: "rgba(244, 225, 210, 0.9)",
  },
  bottomBar: {
    height: 80,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 3,
    borderColor: "#000",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingBottom: 10,
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
  cardImage: {
    width: 140,
    height: 200,
    resizeMode: "contain",
  },
  cardTitle: {
    marginTop: 5,
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
  },
  tabIcon: {
    width: 48,
    height: 48,
    resizeMode: "contain",
  },
  tabLabel: {
    fontSize: 10,
    color: "#fff",
    marginTop: 4,
    textTransform: "uppercase",
  },
});
