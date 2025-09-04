import React, { useEffect, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
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
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [shuffleAnim] = useState(new Animated.Value(0));
  const [buttonScale] = useState(new Animated.Value(1));
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [styles, setStyles] = useState(createStyles(false));

  const maxAttempts = 3;

  const getHumorousErrorMessage = () => {
    const messages = [
      "Oops! That password is as wrong as a joker in a royal flush.",
      "Are you bluffing? Try again!",
      "Looks like you folded too soon. Check your username.",
      "That login attempt was a wild card—try a real one!",
      "Your password is playing hide and seek.",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

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
      console.log("Logged in!");
    });
  };

  const handleButtonPressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handleButtonPressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning, Player!";
    if (hour < 18) return "Good afternoon, Player!";
    return "Good evening, Player!";
  };

  useEffect(() => {
    AccessibilityInfo.isScreenReaderEnabled().then((isEnabled) => {
      setStyles(createStyles(isEnabled));
    });
  }, []);

  return (
    <ImageBackground
      source={require("./banner.png")} // ✅ tu imagen local
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Text style={styles.title}>Welcome to Balatro!</Text>
        <Text style={styles.greeting}>{getGreeting()}</Text>

        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          accessible={true}
          accessibilityLabel="Enter your username"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          accessible={true}
          accessibilityLabel="Enter your password"
        />

        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          onPressIn={handleButtonPressIn}
          onPressOut={handleButtonPressOut}
          disabled={loading}
          accessible={true}
          accessibilityLabel="Login button"
        >
          <Text style={styles.buttonText}>
            {loading ? "Dealing..." : "Deal Me In!"}
          </Text>
        </TouchableOpacity>

        {loading && (
          <>
            {renderQuirkyLoadingSpinner()}
            {renderCardShuffleAnimation()}
          </>
        )}

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

const createStyles = (isAccessible: boolean) => {
  const highContrastStyles = isAccessible
    ? {
        backgroundColor: "#000",
        color: "#FFF",
      }
    : {};

  return StyleSheet.create({
    background: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    overlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0,0,0,0.6)", // oscurece para ver el texto
      width: "100%",
      padding: 20,
    },
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#2c2c54",
      ...highContrastStyles,
    },
    title: {
      fontSize: 24,
      color: "#f5f6fa",
      marginBottom: 20,
      fontWeight: "bold",
    },
    greeting: {
      fontSize: 20,
      color: "#f5f6fa",
      marginBottom: 10,
    },
    input: {
      width: "80%",
      padding: 10,
      marginVertical: 10,
      backgroundColor: "#f5f6fa",
      borderRadius: 5,
    },
    button: {
      backgroundColor: "#e84118",
      padding: 15,
      borderRadius: 5,
      marginTop: 20,
    },
    buttonText: {
      color: "#f5f6fa",
      fontSize: 16,
    },
    error: {
      color: "#e84118",
      marginTop: 10,
    },
    loadingSpinner: {
      marginTop: 20,
      width: 50,
      height: 50,
      justifyContent: "center",
      alignItems: "center",
    },
    spinnerText: {
      fontSize: 24,
      color: "#f5f6fa",
    },
    cardShuffleContainer: {
      position: "absolute",
      top: 100,
      left: 0,
      right: 0,
      alignItems: "center",
    },
    card: {
      fontSize: 32,
      color: "#f5f6fa",
      position: "absolute",
    },
    progressBarContainer: {
      width: "80%",
      height: 10,
      backgroundColor: "#dcdde1",
      borderRadius: 5,
      overflow: "hidden",
      marginTop: 10,
    },
    progressBar: {
      height: "100%",
      backgroundColor: "#e84118",
    },
  });
};

export default LoginScreen;
