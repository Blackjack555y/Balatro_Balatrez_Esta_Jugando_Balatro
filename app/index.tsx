import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Image,
  ImageBackground,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase"; // tu cliente supabase

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
  const router = useRouter();
  const maxAttempts = 3;
  const { login, register } = useAuth();

  // Registro modal
  const [showRegister, setShowRegister] = useState(false);
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");


// Función para seleccionar imagen
const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.7,
  });

  if (!result.canceled) {
    const uri = result.assets[0].uri;
    return uri;
  }
  return null;
};

// Función para subir avatar a Supabase
const uploadAvatar = async (userId: string, uri: string) => {
  const response = await fetch(uri);
  const blob = await response.blob();
  const fileExt = uri.split('.').pop();
  const fileName = `${userId}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(fileName, blob, { upsert: true });

  if (uploadError) {
    console.log("Upload error:", uploadError);
    return null;
  }

  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(fileName);

  return data.publicUrl;
};

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
  const handleLogin = async () => {
    setErrorMessage("");
    const success = await login(username, password);
    if (success) {
      setLoading(true);
      Animated.timing(shuffleAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => {
        setLoading(false);
        shuffleAnim.setValue(0);
        router.replace("/home");
      });
    } else {
      setErrorMessage(getHumorousErrorMessage());
      setLoginAttempts((prev) => prev + 1);
    }
  };

  // Acción de registro
const handleRegister = async () => {
  setErrorMessage("");

  // Pedir avatar
  const avatarUri = await pickImage();

  // Registrar usuario con username y password
  const success = await register(regUsername, regPassword, avatarUri ?? undefined); // username como email para supabase auth
  if (!success) {
    setErrorMessage("❌ No se pudo registrar. Intenta otro username.");
    return;
  }

  // Obtener el usuario actual
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Subir avatar si seleccionó
  if (avatarUri && user) {
    const publicUrl = await uploadAvatar(user.id, avatarUri);

    // Actualizar tabla profiles con avatar_url
    if (publicUrl) {
      await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", user.id);
    }
  }

  setShowRegister(false);
  setRegUsername("");
  setRegPassword("");
  alert("✅ Usuario creado con éxito! Ahora haz login.");
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
  const renderQuirkyLoadingSpinner = () => (
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
      source={require("./banner.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
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

        {/* Login Button */}
        <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
          <TouchableOpacity
            onPress={handleLogin}
            onPressIn={handleButtonPressIn}
            onPressOut={handleButtonPressOut}
            disabled={loading}
          >
            <LinearGradient
              colors={["#8B0000", "#4B0082"]}
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

        {/* Register Button */}
        <TouchableOpacity onPress={() => setShowRegister(true)} style={{ marginTop: 10 }}>
          <Text style={{ color: "#fff", textDecorationLine: "underline" }}>
            Create new account
          </Text>
        </TouchableOpacity>

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

        {/* Modal Registro */}
        <Modal visible={showRegister} transparent animationType="slide">
          <View style={{
            flex:1,
            justifyContent:"center",
            alignItems:"center",
            backgroundColor:"rgba(0,0,0,0.5)"
          }}>
            <View style={{
              width:"80%",
              backgroundColor:"#f4e1d2",
              padding:20,
              borderWidth:3,
              borderColor:"#000"
            }}>
              <Text style={{ fontWeight:"bold", fontSize:16, marginBottom:10 }}>Register</Text>

              <TextInput
                placeholder="Username"
                value={regUsername}
                onChangeText={setRegUsername}
                style={{ backgroundColor:"#fff", marginBottom:10, padding:10 }}
              />
              <TextInput
                placeholder="Password"
                value={regPassword}
                onChangeText={setRegPassword}
                secureTextEntry
                style={{ backgroundColor:"#fff", marginBottom:10, padding:10 }}
              />

              <TouchableOpacity onPress={handleRegister} style={{ backgroundColor:"#8B0000", padding:10, marginBottom:10 }}>
                <Text style={{ color:"#fff", textAlign:"center" }}>Register</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setShowRegister(false)}>
                <Text style={{ textAlign:"center", textDecorationLine:"underline" }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </ImageBackground>
  );
};

// Estilos completos
const createStyles = (isAccessible: boolean) => StyleSheet.create({
  background: { flex: 1, backgroundColor: "#2d132c" },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 20,
  },
  logo: { width: 100, height: 100, marginBottom: 20, resizeMode: "contain" },
  title: { fontSize: 20, color: "#f1f2f6", fontWeight: "bold", marginBottom: 10, textTransform: "uppercase", letterSpacing: 3 },
  greeting: { fontSize: 14, color: "#e0c3fc", marginBottom: 20 },
  inputContainer: { flexDirection: "row", alignItems: "center", width: "85%", backgroundColor: "#f4e1d2", borderWidth: 3, borderColor: "#000", marginVertical: 10, paddingHorizontal: 8 },
  input: { flex: 1, padding: 12, fontSize: 14, color: "#000", fontFamily: "monospace" },
  icon: { marginHorizontal: 5, color: "#000" },
  button: { paddingVertical: 15, paddingHorizontal: 40, borderRadius: 0, marginTop: 20, alignItems: "center", backgroundColor: "#000", borderWidth: 3, borderColor: "#fff" },
  buttonText: { color: "#fff", fontSize: 14, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 2, fontFamily: "monospace" },
  error: { color: "#e84118", marginTop: 10, fontSize: 12, fontWeight: "600", textAlign: "center" },
  loadingSpinner: { marginTop: 20, width: 50, height: 50, justifyContent: "center", alignItems: "center" },
  spinnerText: { fontSize: 30, color: "#fff" },
  cardShuffleContainer: { position: "absolute", top: 100, left: 0, right: 0, alignItems: "center" },
  card: { fontSize: 32, color: "#fff", position: "absolute", textShadowColor: "#000", textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 2 },
  progressBarContainer: { width: "85%", height: 10, backgroundColor: "#f4e1d2", borderWidth: 2, borderColor: "#000", marginTop: 20 },
  progressBar: { height: "100%", backgroundColor: "#8B0000" },
});

export default LoginScreen;
