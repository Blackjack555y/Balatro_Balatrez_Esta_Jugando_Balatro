import { Ionicons } from "@expo/vector-icons";
import * as Device from "expo-device";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { Redirect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Image,
  ImageBackground,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

type Tab = {
  id: number;
  name: string;
  icon: any;
  onPress?: () => void;
};

type UserProfile = {
  id: number;
  user_id: number;
  username: string;
  avatar_url?: string;
  nickname?: string | null;
  bio?: string | null;
  bones: number;
  games_played: number;
  games_won: number;
  high_score: number;
  created_at: string;
};

function toNumericUserId(rawId: any): number | null {
  if (typeof rawId === "number") return rawId;
  if (typeof rawId === "string") {
    const digitsOnly = rawId.match(/^\d+$/);
    if (digitsOnly) return parseInt(rawId, 10);
  }
  return null;
}

export async function pickFromGallery(userId: number | string) {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== "granted") {
    Alert.alert("Permisos", "Necesitamos permiso para acceder a la galería.");
    return null;
  }

  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  const uri = (res as any).uri ?? (res as any).assets?.[0]?.uri;
  if (!uri) return null;

  return uploadImageToSupabase(String(userId), uri);
}

export async function takePhoto(userId: number | string) {
  if (Platform.OS === "web" || !Device.isDevice) {
    console.warn("takePhoto: cámara no disponible en este entorno, abriendo galería...");
    return pickFromGallery(userId);
  }

  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== "granted") {
    Alert.alert("Permisos", "Necesitamos permiso para usar la cámara.");
    return null;
  }

  const res = await ImagePicker.launchCameraAsync({
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  const uri = (res as any).uri ?? (res as any).assets?.[0]?.uri;
  if (!uri) return null;

  return uploadImageToSupabase(String(userId), uri);
}

async function uploadImageToSupabase(userIdStr: string, uri: string) {
  let mime = "image/jpeg";
  let ext = "jpg";
  const lastSeg = uri.split("/").pop() ?? "";
  if (lastSeg.includes(".")) {
    ext = lastSeg.split(".").pop()?.toLowerCase() || "jpg";
    mime = ext === "png" ? "image/png" : "image/jpeg";
  }

  const manip = await ImageManipulator.manipulateAsync(uri, [], {
    compress: 0.8,
    format: ImageManipulator.SaveFormat.JPEG,
    base64: true,
  });
  if (!manip.base64) throw new Error("No se pudo convertir la imagen");

  const blob = await (await fetch(`data:${mime};base64,${manip.base64}`)).blob();

  const fileName = `${Date.now()}.${ext}`;
  const filePath = `${userIdStr}/${fileName}`;
  const bucket = "Avatars";

  const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, blob, {
    contentType: mime,
    upsert: true,
  });
  if (uploadError) {
    console.error("Supabase storage upload error:", uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return { publicUrl: data.publicUrl };
}

export default function ProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editNickname, setEditNickname] = useState("");
  const [editBio, setEditBio] = useState("");

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const uidNum = toNumericUserId((user as any)?.id);
      if (uidNum === null) {
        console.warn("fetchProfile: user.id no es numérico:", (user as any).id);
        setProfile(null);
        setLoading(false);
        return;
      }

      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", uidNum)
        .single();

      if (error) throw error;
      setProfile(profileData ?? null);
    } catch (err) {
      console.log("Error fetching profile:", err);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Always call hooks at the top-level; redirect handled in render.
    fetchProfile();
  }, [fetchProfile]);

  if (!user) {
    return <Redirect href="/" />;
  }

  const saveProfile = async () => {
    try {
      const uidNum = toNumericUserId((user as any).id);
      if (uidNum === null) {
        Alert.alert("Error", "ID de usuario inválido.");
        return;
      }

      const payload: Record<string, any> = {};
      if (typeof editNickname === "string") payload.nickname = editNickname;
      if (typeof editBio === "string") payload.bio = editBio;

      const { data, error } = await supabase
        .from("profiles")
        .update(payload)
        .eq("user_id", uidNum)
        .select()
        .single();

      if (error) throw error;
      setProfile(data);
      setEditModalVisible(false);
    } catch (err) {
      console.log("Error updating profile:", err);
      Alert.alert("Error", "No se pudo actualizar el perfil.");
    }
  };

  const tabs: Tab[] = [
    { id: 1, name: "Rules", icon: require("../assets/tab_1.png"), onPress: () => router.push("/rules" as any) },
    { id: 2, name: "Tab2", icon: require("../assets/tab_2.png"), onPress: () => console.log("Tab2 pressed") },
    { id: 3, name: "Home", icon: require("../assets/tab_home.png"), onPress: () => router.push("/home" as any) },
  { id: 4, name: "Chat", icon: require("../assets/tab_4.png"), onPress: () => router.push("/chat" as any) },
    { id: 5, name: "Profile", icon: require("../assets/tab_profile.png"), onPress: () => router.push("/profile" as any) },
  ];

  return (
    <ImageBackground source={require("../assets/wood.jpg")} style={styles.background} resizeMode="repeat">
      <View style={styles.container}>
        {/* Barra superior */}
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => {
              setEditNickname(profile?.nickname ?? "");
              setEditBio(profile?.bio ?? "");
              setEditModalVisible(true);
            }}
            style={styles.settingsButton}
          >
            <Ionicons name="settings-outline" size={28} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Contenido con scroll */}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.cardWrapper}>
            <Image
              source={profile?.avatar_url ? { uri: profile.avatar_url } : require("../assets/daniel.png")}
              style={styles.cardImage}
            />
          </View>

          {loading ? (
            <Text style={{ color: "#fff" }}>Cargando perfil...</Text>
          ) : profile ? (
            <View style={styles.statsBox}>
              <Text style={styles.statsTitle}>Perfil de {profile.username}</Text>
              <Text style={styles.statsItem}>Nickname: {profile.nickname}</Text>
              <Text style={styles.statsItem}>Bio: {profile.bio}</Text>
              <Text style={styles.statsItem}>Bones: {profile.bones}</Text>
              <Text style={styles.statsItem}>Partidas jugadas: {profile.games_played}</Text>
              <Text style={styles.statsItem}>Partidas ganadas: {profile.games_won}</Text>
              <Text style={styles.statsItem}>Puntaje máximo: {profile.high_score}</Text>
              <Text style={styles.statsItem}>
                Cuenta creada: {new Date(profile.created_at).toLocaleDateString()}
              </Text>
            </View>
          ) : (
            <Text style={{ color: "#fff" }}>No se encontró el perfil</Text>
          )}
        </ScrollView>

        {/* Modal para editar perfil */}
        <Modal
          visible={editModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setEditModalVisible(false)}
        >
          <View style={styles.modalBackground}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Editar perfil</Text>

              {/* Avatar actual + botones */}
              <View style={{ alignItems: "center", marginBottom: 15 }}>
                <Image
                  source={profile?.avatar_url ? { uri: profile.avatar_url } : require("../assets/daniel.png")}
                  style={{ width: 100, height: 100, borderRadius: 50, marginBottom: 10 }}
                />
                <View style={{ flexDirection: "row" }}>
                  <TouchableOpacity
                    style={[styles.saveButton, { marginRight: 10 }]}
                    onPress={async () => {
                      try {
                        const uidNum = toNumericUserId((user as any).id);
                        if (uidNum === null) {
                          Alert.alert("Error", "ID de usuario inválido para subir avatar.");
                          return;
                        }

                        const res = await pickFromGallery(uidNum);
                        if (res) {
                          const { error } = await supabase
                            .from("profiles")
                            .update({ avatar_url: res.publicUrl })
                            .eq("user_id", uidNum);

                          if (error) {
                            console.error("Error actualizando avatar en profiles:", error);
                            Alert.alert("Error", "No se pudo actualizar avatar en perfil.");
                            return;
                          }
                          await fetchProfile();
                          Alert.alert("Éxito", "Avatar actualizado.");
                        }
                      } catch (err) {
                        console.log("Error galería:", err);
                        Alert.alert("Error", "Falló la subida de la imagen.");
                      }
                    }}
                  >
                    <Text style={{ color: "#fff" }}>Galería</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={async () => {
                      try {
                        const uidNum = toNumericUserId((user as any).id);
                        if (uidNum === null) {
                          Alert.alert("Error", "ID de usuario inválido para cámara.");
                          return;
                        }

                        const res = await takePhoto(uidNum);
                        if (res) {
                          const { error } = await supabase
                            .from("profiles")
                            .update({ avatar_url: res.publicUrl })
                            .eq("user_id", uidNum);

                          if (error) {
                            console.error("Error actualizando avatar en profiles:", error);
                            Alert.alert("Error", "No se pudo actualizar avatar en perfil.");
                            return;
                          }
                          await fetchProfile();
                          Alert.alert("Éxito", "Avatar actualizado.");
                        }
                      } catch (err) {
                        console.log("Error cámara:", err);
                        Alert.alert("Error", "Falló la captura/subida de la imagen.");
                      }
                    }}
                  >
                    <Text style={{ color: "#fff" }}>Cámara</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Campos de texto */}
              <Text>Nickname:</Text>
              <TextInput
                style={styles.input}
                value={editNickname}
                onChangeText={setEditNickname}
              />
              <Text>Bio:</Text>
              <TextInput
                style={[styles.input, { height: 80 }]}
                value={editBio}
                onChangeText={setEditBio}
                multiline
              />

              {/* Botones de acción */}
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
                  <Text style={{ color: "#fff" }}>Guardar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setEditModalVisible(false)}
                >
                  <Text style={{ color: "#fff" }}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Barra inferior con Tabs */}
        <View style={styles.bottomBar}>
          {tabs.map((tab) => (
            <TouchableOpacity key={tab.id} style={styles.tabButton} onPress={tab.onPress}>
              <Image source={tab.icon} style={styles.tabIcon} />
              <Text style={styles.tabLabel}>{tab.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { flex: 1 },
  topBar: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 3,
    borderColor: "#000",
    backgroundColor: "rgba(244,225,210,0.9)",
    position: "relative",
  },
  settingsButton: {
    position: "absolute",
    right: 15,
    top: "50%",
    transform: [{ translateY: -14 }],
  },
  scrollContent: { alignItems: "center", padding: 20 },
  cardWrapper: { marginBottom: 20 },
  cardImage: { width: 320, height: 450, resizeMode: "contain" },
  statsBox: { width: "90%", backgroundColor: "rgba(0,0,0,0.6)", padding: 15, borderRadius: 10, marginBottom: 100 },
  statsTitle: { fontSize: 18, fontWeight: "bold", color: "#fff", marginBottom: 10 },
  statsItem: { fontSize: 14, color: "#fff", marginBottom: 5 },
  bottomBar: { height: 80, flexDirection: "row", justifyContent: "space-around", alignItems: "center", borderTopWidth: 3, borderColor: "#000", backgroundColor: "rgba(0,0,0,0.9)", paddingBottom: 10 },
  tabButton: { flex: 1, alignItems: "center" },
  tabIcon: { width: 48, height: 48, resizeMode: "contain" },
  tabLabel: { fontSize: 10, color: "#fff", marginTop: 4, textTransform: "uppercase" },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 8,
    marginBottom: 10,
  },
  modalButtons: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  saveButton: { backgroundColor: "#28a745", padding: 10, borderRadius: 5 },
  cancelButton: { backgroundColor: "#dc3545", padding: 10, borderRadius: 5 },
});
