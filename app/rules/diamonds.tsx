import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

export default function DiamondsScreen() {
  const cards = [
    { name: "A♦", image: require("../../assets/aDiamonds.png") },
    { name: "2♦", image: require("../../assets/2Diamonds.png") },
    { name: "3♦", image: require("../../assets/3Diamonds.png") },
    { name: "4♦", image: require("../../assets/4Diamonds.png") },
    { name: "5♦", image: require("../../assets/5Diamonds.png") },
    { name: "6♦", image: require("../../assets/6Diamonds.png") },
    { name: "7♦", image: require("../../assets/7Diamonds.png") },
    { name: "8♦", image: require("../../assets/8Diamonds.png") },
    { name: "9♦", image: require("../../assets/9Diamonds.png") },
    { name: "10♦", image: require("../../assets/10Diamonds.png") },
    { name: "J♦", image: require("../../assets/jDiamonds.png") },
    { name: "Q♦", image: require("../../assets/qDiamonds.png") },
    { name: "K♦", image: require("../../assets/kDiamonds.png") },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Familia de Diamantes ♦</Text>
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
