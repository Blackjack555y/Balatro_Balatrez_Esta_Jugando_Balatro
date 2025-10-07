import LottieView from "lottie-react-native";
import React from "react";
import { Modal, StyleSheet, Text, View, useWindowDimensions } from "react-native";

type Props = {
  visible: boolean;
  text?: string;
};

export const LoadingOverlay: React.FC<Props> = ({ visible, text = "Loading..." }) => {
  const { width } = useWindowDimensions();
  const size = Math.min(240, Math.max(160, width - 120));
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => {}}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <LottieView
            source={require("../assets/animations/Loading Circle Animation.json")}
            autoPlay
            loop
            style={{ width: size, height: size }}
          />
          {!!text && <Text style={styles.text}>{text}</Text>}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center" },
  card: { backgroundColor: "#e6d2b5", borderWidth: 3, borderColor: "#000", padding: 20, borderRadius: 12, alignItems: "center" },
  text: { marginTop: 8, fontWeight: "900", color: "#000" },
});

export default LoadingOverlay;
