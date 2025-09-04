import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Pantalla Principal</Text>

      <Link href="/login">
        <Text>Ir al Login</Text>
      </Link>
    </View>
  );
}
