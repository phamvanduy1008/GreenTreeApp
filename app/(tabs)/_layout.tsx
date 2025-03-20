import { Redirect, Tabs } from "expo-router";
import { Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useUser } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { ipAddress } from "../ip";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user } = useUser();
  const { isSignedIn } = useAuth();

  const [isApiSignedIn, setIsApiSignedIn] = useState<boolean | null>(null);

  const logAsyncStorageKeys = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      console.log("📌 AsyncStorage Keys:", keys);
    } catch (error) {
      console.error("❌ Lỗi khi lấy danh sách keys từ AsyncStorage:", error);
    }
  };

  logAsyncStorageKeys();

  useEffect(() => {
    const checkLoginMethod = async () => {
      try {
        const emailApi = await AsyncStorage.getItem("email");
        const emailClerk = user?.primaryEmailAddress?.emailAddress || "";
        const storedEmail = emailApi || emailClerk;
        console.log("storedEmail", storedEmail);

        setIsApiSignedIn(!!storedEmail);
        if (storedEmail) {
          // fetchUserData(storedEmail);
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu từ AsyncStorage:", error);
      }
    };
    checkLoginMethod();
  }, []);

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
        tabBarActiveTintColor: "#3461FD",
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#FFFFFF", 
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          padding: 10,
          height: Platform.OS === "ios" ? 80 : 70,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
          position: Platform.OS === "ios" ? "absolute" : "relative",
          bottom: Platform.OS === "ios" ? 0 : undefined,
        },
        tabBarItemStyle: {
          paddingVertical: 5,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          color: "rgb(97, 103, 125)", // Đồng bộ với Login text
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "",
          tabBarIcon: ({ color }) => (
            <Ionicons size={28} name="home" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "",
          tabBarIcon: ({ color }) => (
            <Ionicons size={28} name="settings-outline" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}