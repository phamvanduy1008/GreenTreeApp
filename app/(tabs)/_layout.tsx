import { Redirect, Tabs } from "expo-router";
import { Platform, View, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useUser } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

export default function TabLayout() {
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
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarItemStyle: styles.tabBarItem,
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "#fff",
        tabBarButton: (props) => {
          const { onPress, children } = props;
          
          return (
            <Pressable
              onPress={onPress}
              style={styles.tabButton}
              android_ripple={{color: 'rgba(255, 255, 255, 0.1)'}}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
            >
              {children}
            </Pressable>
          );
        }
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIcon, focused && { left: -11},]}>
              <Ionicons size={26} name="home" color={focused ? "#000" : color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIcon, focused && { left: -10 },]}>
              <Ionicons size={28} name="compass-outline" color={focused ? "#000" : color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIcon]}>
              <Ionicons size={26} name="person-outline" color={focused ? "#000000" : color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeIcon, , focused && { left: 10.7},]}>
              <Ionicons size={26} name="settings-outline" color={focused ? "#000" : color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    justifyContent: 'space-around', 
    backgroundColor: "#222831", 
    borderRadius: 30,
    height: 60,
    marginHorizontal: 30,
    position: 'absolute',
    bottom: 25,
    left: 0,
    right: 0,
    elevation: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderTopWidth: 0,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    paddingTop: 5,
  },
  tabBarItem: {
    paddingVertical: 8,
    height: 50,
  },
  tabButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30, 
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 10,
  },
  
  activeIcon: {
    backgroundColor: "#fff", 
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
});