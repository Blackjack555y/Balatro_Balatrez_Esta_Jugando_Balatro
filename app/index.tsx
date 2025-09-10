import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router"; // 👈 importa esto
import React, { useEffect, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const LoginScreen = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [shuffleAnim] = useState(new Animated.Value(0));
  const [buttonScale] = useState(new Animated.Value(1));
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [styles, setStyles] = useState(createStyles(false));
  const router = useRouter(); // 👈 instancia el router
  const maxAttempts = 3;

  // Mensajes de error graciosos
  const getHumorousErrorMessage = () => {
    const messages = [
      "Oops! Don't you try that again.",
      "Are you bluffing? It's the last time you do that!",
      "Let's put you on a card.",
      "That attempt was real good this time around!",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  // Acción de login
  const handleLogin = () => {
    if (!username || !password) {
      setLoginAttempts((prev) => Math.min(prev + 1, maxAttempts));
      setErrorMessage(getHumorousErrorMessage());
      return;
    }

    setErrorMessage("");
    setLoading(true);

    Animated.timing(shuffleAnim, {
      toValue: 1,
      duration: 1000,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(() => {
      setLoading(false);
      shuffleAnim.setValue(0);
      console.log("✅ Come on!");
      router.replace("/home"); // 👈 redirige a la página de inicio
    });
  };

  // Animación botón
  const handleButtonPressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handleButtonPressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  // Animación de cartas
  const renderCardShuffleAnimation = () => {
    const cards = ["♠️", "♥️", "♣️", "♦️"];
    return (
      <View style={styles.cardShuffleContainer}>
        {cards.map((card, index) => (
          <Animated.Text
            key={index}
            style={[
              styles.card,
              {
                transform: [
                  {
                    translateY: shuffleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -50 * (index + 1)],
                    }),
                  },
                ],
                opacity: shuffleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0],
                }),
              },
            ]}
          >
            {card}
          </Animated.Text>
        ))}
      </View>
    );
  };

  // Spinner
  const renderQuirkyLoadingSpinner = () => {
    return (
      <Animated.View
        style={[
          styles.loadingSpinner,
          {
            transform: [
              {
                rotate: shuffleAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", "360deg"],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.spinnerText}>🎲</Text>
      </Animated.View>
    );
  };

  // Saludo dinámico
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Prepare to die!";
    if (hour < 18) return "Prepare to suffer!";
    return "Prepare to meet your doom!";
  };

  // Accesibilidad
  useEffect(() => {
    AccessibilityInfo.isScreenReaderEnabled().then((isEnabled) => {
      setStyles(createStyles(isEnabled));
    });
  }, []);

  return (
    <ImageBackground
      source={require("./banner.png")} // Fondo
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        {/* LOGO */}
        <Image source={require("../assets/logo.png")} style={styles.logo} />

        <Text style={styles.title}>Are you ready player?</Text>
        <Text style={styles.greeting}>{getGreeting()}</Text>

        {/* Username */}
        <View style={styles.inputContainer}>
          <Ionicons name="person-outline" size={22} color="#555" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#999"
            value={username}
            onChangeText={setUsername}
            accessible={true}
          />
        </View>

        {/* Password */}
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={22} color="#555" style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            accessible={true}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={22}
              color="#555"
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>

        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

        {/* Botón */}
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            onPress={handleLogin}
            onPressIn={handleButtonPressIn}
            onPressOut={handleButtonPressOut}
            disabled={loading}
          >
            <LinearGradient
              colors={["#8B0000", "#4B0082"]} // rojo sangre → púrpura
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.button}
            >
              <Text style={styles.buttonText}>
                {loading ? "Dealing..." : "Come on, Player!"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {loading && (
          <>
            {renderQuirkyLoadingSpinner()}
            {renderCardShuffleAnimation()}
          </>
        )}

        {/* Barra de intentos */}
        <View style={styles.progressBarContainer}>
          <View
            style={{
              ...styles.progressBar,
              width: `${(loginAttempts / maxAttempts) * 100}%`,
            }}
          />
        </View>
      </View>
    </ImageBackground>
  );
};

// Estilos
const createStyles = (isAccessible: boolean) => {
  return StyleSheet.create({
    background: { flex: 1, backgroundColor: "#2d132c" },
    overlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.4)",

      padding: 20,
    },
    logo: {
      width: 100,
      height: 100,
      marginBottom: 20,
      resizeMode: "contain",
    },
    title: {
      fontSize: 20,
      color: "#f1f2f6",
      fontWeight: "bold",
      marginBottom: 10,
      textTransform: "uppercase",
      letterSpacing: 3,
    },
    greeting: { fontSize: 14, color: "#e0c3fc", marginBottom: 20 },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      width: "85%",
      backgroundColor: "#f4e1d2", // pergamino
      borderWidth: 3,
      borderColor: "#000",
      marginVertical: 10,
      paddingHorizontal: 8,
    },
    input: {
      flex: 1,
      padding: 12,
      fontSize: 14,
      color: "#000",
      fontFamily: "monospace",
    },
    icon: { marginHorizontal: 5, color: "#000" },
    button: {
      paddingVertical: 15,
      paddingHorizontal: 40,
      borderRadius: 0, // cuadrado retro
      marginTop: 20,
      alignItems: "center",
      backgroundColor: "#000",
      borderWidth: 3,
      borderColor: "#fff",
    },
    buttonText: {
      color: "#fff",
      fontSize: 14,
      fontWeight: "bold",
      textTransform: "uppercase",
      letterSpacing: 2,
      fontFamily: "monospace",
    },
    error: {
      color: "#e84118",
      marginTop: 10,
      fontSize: 12,
      fontWeight: "600",
      textAlign: "center",
    },
    loadingSpinner: {
      marginTop: 20,
      width: 50,
      height: 50,
      justifyContent: "center",
      alignItems: "center",
    },
    spinnerText: { fontSize: 30, color: "#fff" },
    cardShuffleContainer: {
      position: "absolute",
      top: 100,
      left: 0,
      right: 0,
      alignItems: "center",
    },
    card: {
      fontSize: 32,
      color: "#fff",
      position: "absolute",
      textShadowColor: "#000",
      textShadowOffset: { width: 2, height: 2 },
      textShadowRadius: 2,
    },
progressBarContainer: {
  width: "85%",
  height: 10,
  backgroundColor: "#f4e1d2", // pergamino claro
  borderWidth: 2,
  borderColor: "#000",
  marginTop: 20,
},

    progressBar: { height: "100%", backgroundColor: "#8B0000" },
  });
};

export default LoginScreen;
