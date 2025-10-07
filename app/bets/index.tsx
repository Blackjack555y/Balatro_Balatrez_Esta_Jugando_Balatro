import { Redirect } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, ImageBackground, StyleSheet, Text, View } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { Bet, listOpenBets, subscribeBets } from "../../lib/bets";

export default function BetsScreen() {
  const { user } = useAuth();
  const [bets, setBets] = useState<Bet[]>([]);

  useEffect(() => {
    let mounted = true;
    listOpenBets().then((rows) => mounted && setBets(rows)).catch(console.log);
    const ch = subscribeBets((b) => {
      setBets((prev) => {
        const map = new Map(prev.map((x) => [x.id, x]));
        map.set(b.id, { ...(map.get(b.id) || {}), ...b });
        return Array.from(map.values()).sort((a, b) =>
          String(b.closes_at || b.starts_at || "") > String(a.closes_at || a.starts_at || "") ? 1 : -1
        );
      });
    });
    return () => {
      mounted = false;
      ch.unsubscribe();
    };
  }, []);

  if (!user) return <Redirect href="/" />;

  return (
    <ImageBackground source={require("../../assets/wood.jpg")} style={{ flex: 1 }} resizeMode="repeat">
      <View style={styles.container}>
        <Text style={styles.title}>APUESTAS EN TIEMPO REAL</Text>
        <FlatList
          data={bets}
          keyExtractor={(x) => String(x.id)}
          renderItem={({ item }) => (
            <View style={styles.bet}>
              <Text style={styles.betTitle}>{item.title}</Text>
              {item.description ? <Text>{item.description}</Text> : null}
              <Text style={styles.badge}>{item.status.toUpperCase()}</Text>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          contentContainerStyle={{ paddingVertical: 12 }}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontWeight: "900", fontSize: 18, letterSpacing: 1, textTransform: "uppercase", color: "#fff" },
  bet: { backgroundColor: "#e6d2b5", borderWidth: 3, borderColor: "#000", padding: 12, borderRadius: 8 },
  betTitle: { fontWeight: "900" },
  badge: { marginTop: 6, fontWeight: "900" },
});