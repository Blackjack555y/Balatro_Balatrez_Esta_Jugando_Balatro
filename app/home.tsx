import { useRouter, type Href } from "expo-router";
import { Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter();

  const cards = [
    { id: 1, title: "Story Mode", image: require("./adder.png") },
    { id: 2, title: "Endless", image: require("./squirrel.png") },
    { id: 3, title: "Multiplayer", image: require("./starvation.png") },
    { id: 4, title: "Settings", image: require("./wolf.png") },
  ];

  const tabs: { id: number; name: string; icon: any; route: Href | null }[] = [
    { id: 1, name: "Tab1", icon: require("../assets/tab_1.png"), route: null },
    { id: 2, name: "Tab2", icon: require("../assets/tab_2.png"), route: null },
    { id: 3, name: "Home", icon: require("../assets/tab_home.png"), route: "/home" },
    { id: 4, name: "Tab4", icon: require("../assets/tab_4.png"), route: null },
    { id: 5, name: "Profile", icon: require("../assets/tab_profile.png"), route: "/profile" },
  ];

  return (
    <ImageBackground
      source={require("../assets/wood.jpg")} // 👈 textura de madera en assets
      style={styles.container}
      resizeMode="cover"
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
            onPress={() => {
              if (tab.route) router.push(tab.route);
              else console.log(`Tab selected: ${tab.name}`);
            }}
          >
            <Image source={tab.icon} style={styles.tabIcon} />
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
    backgroundColor: "rgba(244, 225, 210, 0.9)", // translúcido sobre madera
  },
  bottomBar: {
    height: 70,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 3,
    borderColor: "#000",
    backgroundColor: "rgba(0, 0, 0, 0.8)", // translúcido para contraste
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
});
