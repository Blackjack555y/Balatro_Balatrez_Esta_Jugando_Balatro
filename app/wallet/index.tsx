import { Redirect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, ImageBackground, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { getBalance, getTransactions, subscribeWallet, WalletTx } from "../../lib/wallet";

export default function WalletScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const userId = user ? Number(user.id) : 0;
  const [balance, setBalance] = useState<number>(0);
  const [tx, setTx] = useState<WalletTx[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const [b, list] = await Promise.all([getBalance(userId), getTransactions(userId)]);
    setBalance(b);
    setTx(list);
  }, [user, userId]);

  useEffect(() => {
    if (!user) return;
    load().catch(console.log);
    const ch = subscribeWallet(userId, () => {
      load().catch(console.log);
    });
    return () => {
      ch.unsubscribe();
    };
  }, [user, userId, load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load().finally(() => setRefreshing(false));
  }, [load]);

  if (!user) return <Redirect href="/" />;

  return (
    <ImageBackground source={require("../../assets/wood.jpg")} style={{ flex: 1 }} resizeMode="repeat">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>WALLET</Text>
          <Text style={styles.balance}>BONES: {balance}</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={[styles.btn, styles.btnGreen]} onPress={() => router.push("/wallet/deposit" as any)}>
              <Text style={styles.btnText}>DEPOSITAR</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.btnRed]} onPress={() => router.push("/wallet/withdraw" as any)}>
              <Text style={styles.btnText}>RETIRAR</Text>
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={tx}
          keyExtractor={(x) => String(x.id)}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={[styles.delta, { color: item.delta >= 0 ? "green" : "red" }]}>
                {item.delta >= 0 ? `+${item.delta}` : item.delta}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.reason}>{item.reason?.toUpperCase() ?? "—"}</Text>
                <Text style={styles.meta}>{new Date(item.created_at).toLocaleString()}</Text>
              </View>
            </View>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          contentContainerStyle={{ paddingVertical: 12 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { backgroundColor: "#e6d2b5", borderWidth: 3, borderColor: "#000", padding: 12, borderRadius: 8, marginBottom: 12 },
  title: { fontWeight: "900", fontSize: 18, letterSpacing: 1, textTransform: "uppercase" },
  balance: { marginTop: 6, fontWeight: "900" },
  actions: { flexDirection: "row", gap: 8, marginTop: 10 },
  btn: { flex: 1, padding: 10, borderRadius: 8, borderWidth: 3, borderColor: "#000", alignItems: "center" },
  btnGreen: { backgroundColor: "#2e7d32" },
  btnRed: { backgroundColor: "#c62828" },
  btnText: { color: "#fff", fontWeight: "900" },
  row: { backgroundColor: "#e6d2b5", borderWidth: 3, borderColor: "#000", padding: 12, borderRadius: 8, flexDirection: "row", gap: 12 },
  delta: { width: 64, fontWeight: "900", textAlign: "right" },
  reason: { fontWeight: "900" },
  meta: { fontStyle: "italic" },
});