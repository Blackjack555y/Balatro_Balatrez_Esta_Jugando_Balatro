import LottieView from "lottie-react-native";
import React, { useEffect, useRef } from "react";
import { Modal, StyleSheet, Text, View, useWindowDimensions } from "react-native";

type Props = {
  visible: boolean;
  text?: string;
  onFinished?: () => void;
  // Optional override for fallback auto-close
  fallbackMs?: number;
};

export const SuccessOverlay: React.FC<Props> = ({ visible, text = "Success!", onFinished, fallbackMs = 1500 }) => {
  const { width } = useWindowDimensions();
  const size = Math.min(320, Math.max(200, width - 80));
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      // Fallback: ensure we always close even if onAnimationFinish doesn't fire on web
      timerRef.current = setTimeout(() => {
        if (onFinished) onFinished();
      }, fallbackMs);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible, fallbackMs, onFinished]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onFinished}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <LottieView
            source={require("../assets/animations/Approve.json")}
            autoPlay
            loop={false}
            style={{ width: size, height: size }}
            onAnimationFinish={() => {
              if (timerRef.current) clearTimeout(timerRef.current);
              if (onFinished) onFinished();
            }}
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

export default SuccessOverlay;
