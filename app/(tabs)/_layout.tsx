import { Redirect, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useUser } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";

import { Colors } from "../constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ipAddress } from "../constants/Ip";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user } = useUser();
  const { isSignedIn } = useAuth();
  const [isApiSignedIn, setIsApiSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkLoginMethod = async () => {
      try {
        const emailApi = await AsyncStorage.getItem("email");
        const emailClerk = user?.primaryEmailAddress?.emailAddress || "";
        const storedEmail = emailApi || emailClerk;

        setIsApiSignedIn(!!storedEmail);
        if (storedEmail) {
          fetchUserData(storedEmail);
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu từ AsyncStorage:", error);
      }
    };
    checkLoginMethod();
  }, []);

  const fetchUserData = async (email: string) => {
    try {
      const response = await fetch(`${ipAddress}/infor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (data.success) {
        await AsyncStorage.setItem("userData", JSON.stringify(data.user));
      }
    } catch (error) {
      console.error("❌ Lỗi khi gọi API:", error);
    }
  };

  if (isApiSignedIn === null) {
    return null;
  }

  if (!isSignedIn && !isApiSignedIn) {
    return <Redirect href="/auth/login" />;
  }
  if (isSignedIn && user?.unsafeMetadata?.onboarding_completed !== true) {
    return <Redirect href="/auth/complete-your-account" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor:"#fff",
        headerShown: false,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <Ionicons size={28} name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: "Shop",
          tabBarIcon: ({ color }) => (
            <Ionicons size={28} name="cart" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="weather"
        options={{
          title: "Weather",
          tabBarIcon: ({ color }) => (
            <Ionicons size={28} name="partly-sunny" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color }) => (
            <Ionicons size={28} name="person" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: 10,
    left: 30,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#4CAF50",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    marginLeft:20,
    marginRight:20,
    marginBottom:10,
  },
});
