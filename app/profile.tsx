import { useRouter } from "expo-router";
import {
    Image,
    ImageBackground,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

export default function ProfileScreen() {
  const router = useRouter();

  const tabs = [
    { id: 1, name: "Tab1", icon: require("../assets/tab_1.png"), route: null },
    { id: 2, name: "Tab2", icon: require("../assets/tab_2.png"), route: null },
    { id: 3, name: "Home", icon: require("../assets/tab_home.png"), route: "/home" },
    { id: 4, name: "Tab4", icon: require("../assets/tab_4.png"), route: null },
    { id: 5, name: "Profile", icon: require("../assets/tab_profile.png"), route: "/profile" },
  ];

  return (
    <ImageBackground
      source={require("../assets/wood.jpg")}
      style={styles.background}
      resizeMode="repeat" // 👈 para que la textura se repita
    >
      <View style={styles.container}>
        {/* Barra superior */}
        <View style={styles.topBar}>
          <Text style={styles.barText}>👤 Profile</Text>
        </View>

        {/* Contenido scrollable */}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Carta fija */}
          <View style={styles.cardWrapper}>
            <Image
              source={require("../assets/david.png")}
              style={styles.cardImage}
            />
          </View>

          {/* Estadísticas de ejemplo */}
          <View style={styles.statsBox}>
            <Text style={styles.statsTitle}>Estadísticas</Text>
            <Text style={styles.statsItem}>Victorias: 25</Text>
            <Text style={styles.statsItem}>Derrotas: 10</Text>
            <Text style={styles.statsItem}>Nivel: 12</Text>
            <Text style={styles.statsItem}>Cartas desbloqueadas: 45</Text>
          </View>
        </ScrollView>

        {/* Barra inferior con Tabs */}
        <View style={styles.bottomBar}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={styles.tabButton}
              onPress={() => {
                if (tab.route) router.push(tab.route as any);
                else console.log(`Tab selected: ${tab.name}`);
              }}
            >
              <Image source={tab.icon} style={styles.tabIcon} />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: { flex: 1 },

  // Barra superior
  topBar: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 3,
    borderColor: "#000",
    backgroundColor: "rgba(244,225,210,0.9)", // semi-transparente para ver la madera
  },
  barText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    letterSpacing: 2,
    textTransform: "uppercase",
  },

  // Contenido scrollable
  scrollContent: {
    alignItems: "center",
    padding: 20,
  },

  // Carta
  cardWrapper: {
    marginBottom: 20,
  },
  cardImage: {
    width: 320,
    height: 450,
    resizeMode: "contain",
  },

  // Stats
  statsBox: {
    width: "90%",
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 15,
    borderRadius: 10,
    marginBottom: 100, // deja espacio antes de la barra inferior
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  statsItem: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 5,
  },

  // Barra inferior
  bottomBar: {
    height: 70,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 3,
    borderColor: "#000",
    backgroundColor: "rgba(0,0,0,0.9)", // semi-transparente
    paddingBottom: 10,
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
