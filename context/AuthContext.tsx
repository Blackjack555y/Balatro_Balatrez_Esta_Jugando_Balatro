// context/AuthContext.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

type User = {
  id: number;
  username: string;
  created_at?: string;
};

type Profile = {
  id: number;
  user_id: number;
  avatar_url?: string | null;
  nickname?: string | null;
  bio?: string | null;
  bones: number; // puntos
  games_played: number;
  games_won: number;
  high_score: number;
};

type AuthContextType = {
  user: (User & { profile?: Profile | null }) | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (
    username: string,
    password: string,
    avatarUri?: string
  ) => Promise<boolean>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User & { profile?: Profile | null } | null>(
    null
  );

  // helper: hash (SHA256) con username como "salt"
  const hashPassword = async (username: string, password: string) => {
    const toHash = `${username}:${password}`;
    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      toHash
    );
  };

  // Cargar usuario en sesión
  useEffect(() => {
    const loadUser = async () => {
      const storedId = await AsyncStorage.getItem("userId");
      if (!storedId) return;

      const idNum = parseInt(storedId, 10);
      if (Number.isNaN(idNum)) return;

      // Traer user + profile (relación 1:1 pero array)
      const { data, error } = await supabase
        .from("users")
        .select("id,username,created_at, profiles(*)")
        .eq("id", idNum)
        .single();

      if (!error && data) {
        setUser({
          ...data,
          profile: (data.profiles?.[0] as Profile) ?? null,
        });
      }
    };

    loadUser();
  }, []);

  // 🔹 Login
  const login = async (username: string, password: string) => {
    const password_hash = await hashPassword(username, password);

    const { data, error } = await supabase
      .from("users")
      .select("id,username,created_at, profiles(*)")
      .eq("username", username)
      .eq("password_hash", password_hash)
      .single();

    if (error || !data) return false;

    setUser({
      ...data,
      profile: (data.profiles?.[0] as Profile) ?? null,
    });
    await AsyncStorage.setItem("userId", String(data.id));
    return true;
  };


// 🔹 Register
const register = async (
  username: string,
  password: string,
  avatarUri?: string,
  nickname?: string,
  bio?: string
) => {
  try {
    // verificar si ya existe
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (existing) return false;

    const password_hash = await hashPassword(username, password);

    // crear usuario
    const { data: newUser, error: userErr } = await supabase
      .from("users")
      .insert({ username, password_hash })
      .select("id,username,created_at")
      .single();

    if (userErr || !newUser) return false;

    // subir avatar si hay
    let avatarUrl: string | null = null;
    if (avatarUri) {
      const response = await fetch(avatarUri);
      const blob = await response.blob();
      const filePath = `avatars/${newUser.id}-${Date.now()}.jpg`;

      console.log("Uploading avatar to:", filePath, {avatarUri});

      const { error: uploadErr } = await supabase.storage
        .from("avatars")
        .upload(filePath, blob, { contentType: "image/jpeg", upsert: true });

      if (!uploadErr) {
        const { data: publicUrl } = supabase.storage
          .from("avatars")
          .getPublicUrl(filePath);
        avatarUrl = publicUrl.publicUrl;
      }
    }

    // crear profile
    const { data: newProfile, error: profileErr } = await supabase
      .from("profiles")
      .insert({
        user_id: newUser.id,
        avatar_url: avatarUrl,
        nickname: nickname ?? username, // por defecto usar username
        bio: bio ?? "",
        bones: 0, // iniciar con 0
        games_played: 0,
        games_won: 0,
        high_score: 0,
      })
      .select()
      .single();

    if (profileErr) console.log("profile creation error:", profileErr);

    const fullUser = { ...newUser, profile: newProfile ?? null };
    setUser(fullUser);
    await AsyncStorage.setItem("userId", String(newUser.id));

    return true;
  } catch (err) {
    console.log("register error:", err);
    return false;
  }
};

// 🔹 Logout
  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem("userId");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
