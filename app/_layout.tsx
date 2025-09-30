// app/_layout.tsx
import { Slot } from "expo-router";
import "react-native-url-polyfill/auto";
import { AuthProvider } from "../context/AuthContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}
