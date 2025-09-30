import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

export default function ClubsScreen() {
  const cards = [
    { name: "A♣", image: require("../../assets/aClubs.png") },
    { name: "2♣", image: require("../../assets/2Clubs.png") },
    { name: "3♣", image: require("../../assets/3Clubs.png") },
    { name: "4♣", image: require("../../assets/4Clubs.png") },
    { name: "5♣", image: require("../../assets/5Clubs.png") },
    { name: "6♣", image: require("../../assets/6Clubs.png") },
    { name: "7♣", image: require("../../assets/7Clubs.png") },
    { name: "8♣", image: require("../../assets/8Clubs.png") },
    { name: "9♣", image: require("../../assets/9Clubs.png") },
    { name: "10♣", image: require("../../assets/10Clubs.png") },
    { name: "J♣", image: require("../../assets/jClubs.png") },
    { name: "Q♣", image: require("../../assets/qClubs.png") },
    { name: "K♣", image: require("../../assets/kClubs.png") },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Familia de Tréboles ♣</Text>
      <View style={styles.grid}>
        {cards.map((card) => (
          <View key={card.name} style={styles.card}>
            <Image source={card.image} style={styles.cardImage} />
            <Text style={styles.cardText}>{card.name}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center" },
  card: { alignItems: "center", margin: 10 },
  cardImage: { width: 70, height: 100, resizeMode: "contain" },
  cardText: { marginTop: 5, fontSize: 14, fontWeight: "500" },
});
