import { Redirect, Tabs } from "expo-router";
import {
  Platform,
  View,
  StyleSheet,
  Pressable,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth, useUser } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { FontFamily } from "../constants/FontFamily";

export default function TabLayout() {
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
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu từ AsyncStorage:", error);
      }
    };
    checkLoginMethod();
  }, []);

  // if (isApiSignedIn === null) {
  //   return null;
  // }

  // if (!isSignedIn && !isApiSignedIn) {
  //   return <Redirect href="/auth/login" />;
  // }
  if (isSignedIn && user?.unsafeMetadata?.onboarding_completed !== true) {
    return <Redirect href="/auth/complete-your-account" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        tabBarButton: (props) => {
          const { onPress, children } = props;
          return (
            <Pressable
              onPress={onPress}
              style={styles.tabButton}
              android_ripple={{ color: "rgba(0, 0, 0, 0.05)" }}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {children}
            </Pressable>
          );
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <Ionicons
                name="home-outline"
                size={focused ? 30: 24}
                color={focused ? "#00B86B" : "#000"}
              />
              {/* <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
                Home
              </Text> */}
            </View>
          ),
        }}
      />
     <Tabs.Screen
        name="search"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <Ionicons
                name="search-outline"
                size={focused ? 32 : 24}
                color={focused ? "#00B86B" : "#000"}
              />
              {/* <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
              Favourite
              </Text> */}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <Ionicons
                name="storefront-outline"
                size={focused ? 32 : 24}
                color={focused ? "#00B86B" : "#000"}
              />
              {/* <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
                Shop
              </Text> */}
            </View>
          ),
        }}
      />
       <Tabs.Screen
        name="notice"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <Ionicons
                name="notifications-outline"
                size={focused ? 32 : 24}
                color={focused ? "#00B86B" : "#000"}
              />
              {/* <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
                Category
              </Text> */}
            </View>
          ),
        }}
      />
        
      <Tabs.Screen
        name="account"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.iconContainer}>
              <Ionicons
                name="person-outline"
                size={focused ? 28 : 24}
                color={focused ? "#00B86B" : "#000"}
              />
              {/* <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
                Account
              </Text> */}
            </View>
          ),
        }}
      />

    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 85,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === "ios" ? 20 : 10,
    paddingTop: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 60,
    height: 60,
  },
  tabLabel: {
    fontSize: 12,
    color: "#999",
    marginTop: 4,
    fontFamily: FontFamily.medium,
  },
  tabLabelActive: {
    color: "#00B86B",
    fontWeight: "600",
  },
});
