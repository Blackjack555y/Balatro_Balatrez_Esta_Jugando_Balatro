import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type Tab = {
  id: number;
  name: string;
  icon: any;
  onPress?: () => void;
};

export function BottomTabs({ tabs, style }: { tabs: Tab[]; style?: ViewStyle }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bottomBar, { paddingBottom: 10 + insets.bottom }, style]}>
      {tabs.map((tab) => (
        <TouchableOpacity key={tab.id} style={styles.tabButton} onPress={tab.onPress ?? (() => {})}>
          <Image source={tab.icon} style={styles.tabIcon} />
          <Text style={styles.tabLabel}>{tab.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    minHeight: 70,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    borderTopWidth: 3,
    borderColor: "#000",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    paddingTop: 8,
  },
  tabButton: { flex: 1, alignItems: "center" },
  tabIcon: { width: 48, height: 48, resizeMode: "contain" },
  tabLabel: { fontSize: 10, color: "#fff", marginTop: 4, textTransform: "uppercase" },
});

export default BottomTabs;