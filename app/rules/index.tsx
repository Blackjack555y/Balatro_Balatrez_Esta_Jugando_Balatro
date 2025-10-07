import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, ImageBackground, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { BottomTabs, Tab } from "../../components/BottomTabs";

export default function RulesIndex() {
  const router = useRouter();

  const goToFamily = (family: string) => {
    router.push(`/rules/${family}` as any);
  };

  const families = [
    { id: "spades", name: "Spades", image: require("../../assets/aSpades.png") },
    { id: "hearts", name: "Hearts", image: require("../../assets/aHearts.png") },
    { id: "clubs", name: "Clubs", image: require("../../assets/aClubs.png") },
    { id: "diamonds", name: "Diamonds", image: require("../../assets/aDiamonds.png") },
  ];

  const tabs: Tab[] = [
    { id: 1, name: "Rules",  icon: require("../../assets/tab_1.png"),     onPress: () => router.push("/rules" as any) },
    { id: 2, name: "Solo",   icon: require("../../assets/tab_2.png"),     onPress: () => router.push("/solo" as any) },
    { id: 3, name: "Home",   icon: require("../../assets/tab_home.png"),  onPress: () => router.push("/home" as any) },
  { id: 4, name: "Chat",   icon: require("../../assets/tab_4.png"),     onPress: () => router.push("/chat" as any) },
    { id: 5, name: "Profile",icon: require("../../assets/tab_profile.png"),onPress: () => router.push("/profile" as any) },
  ];

  return (
    <ImageBackground source={require("../../assets/wood.jpg")} style={styles.background} resizeMode="cover">
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>📜 Reglas - Familias de Cartas</Text>
        <View style={styles.grid}>
          {families.map((family) => (
            <FamilyCard key={family.id} family={family} onPress={() => goToFamily(family.id)} />
          ))}
        </View>
      </ScrollView>
      <BottomTabs tabs={tabs} />
    </ImageBackground>
  );
}

// Tarjeta individual con animación al presionar
function FamilyCard({
  family,
  onPress,
}: {
  family: { id: string; name: string; image: any };
  onPress: () => void;
}) {
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={onPress}
      style={[styles.card, pressed && { transform: [{ scale: 0.95 }], opacity: 0.9 }]}
    >
      <Image source={family.image} style={styles.cardImage} />
      <Text style={styles.cardText}>{family.name}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  container: {
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#f4e1d2",
    marginBottom: 20,
    textShadowColor: "#000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  card: {
    alignItems: "center",
    margin: 15,
    padding: 10,
    backgroundColor: "rgba(244, 225, 210, 0.9)",
    borderWidth: 2,
    borderColor: "#000",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 3, height: 3 },
  },
  cardImage: {
    width: 90,
    height: 120,
    resizeMode: "contain",
  },
  cardText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: "700",
    color: "#2c2c2c",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
