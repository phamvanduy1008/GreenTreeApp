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
import { ipAddress } from "../constants/ip";

  export default function TabLayout() {
    const { user, isLoaded: isClerkLoaded } = useUser();
    const { isSignedIn } = useAuth();
    const [authChecking, setAuthChecking] = useState(true);
    const [storageOk, setStorageOk] = useState(false);
  
    const checkStored = async () => {
      try {
        const stored = await AsyncStorage.getItem("ok");
        setStorageOk(stored === "true");
      } catch (err) {
        console.error("Error checking AsyncStorage:", err);
      }
      setAuthChecking(false);
    };
  
    useEffect(() => {
      checkStored();
    }, []);
  
    useEffect(() => {
      const interval = setInterval(async () => {
        const stored = await AsyncStorage.getItem("ok");
        if (stored === "true" && !storageOk) {
          setStorageOk(true);
          console.log(stored);
          
        }
      }, 1000);
  
      return () => clearInterval(interval);
    }, [storageOk]);

  
    useEffect(() => {

      const initAuth = async () => {

        if (!isClerkLoaded || !user || !storageOk) return;
  
        try {
          const email = user?.primaryEmailAddress?.emailAddress;
          if (!email) {
            console.error("No email found for user");
            return;
          }
  
          const resp = await fetch(`${ipAddress}/get-user-info`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
  
          const data = await resp.json();
          console.log("Fetched user ID:", data._id);
  
          if (resp.ok) {
            await AsyncStorage.setItem("userData", JSON.stringify(data));
            await AsyncStorage.setItem("userId", data._id);
          } else {
            console.error("API error:", data.message);
          }
        } catch (err) {
          console.error("Fetch user error:", err);
        }
      };
  
      initAuth();
    }, [isClerkLoaded, user, storageOk]);
  
    if (authChecking) {
      return null; 
    }
  
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
