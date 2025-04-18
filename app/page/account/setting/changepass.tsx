import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Text,
  Alert,
  Platform,
} from "react-native";
import { Stack, router } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ipAddress } from "../../../constants/ip";
import { Ionicons } from "@expo/vector-icons";

const ChangePass = () => {
  const { user } = useUser();
  const [userID, setUserID] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdHidden, setPwdHidden] = useState(true);

  useEffect(() => {
    const fetchUserID = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          setUserID(storedUserId);
          return;
        }

        const email = user?.primaryEmailAddress?.emailAddress;
        if (!email) throw new Error("User email not found");

        const response = await fetch(`${ipAddress}/get_userid?email=${email}`);
        const data = await response.json();

        if (data.success && data.user_id) {
          setUserID(data.user_id);
          await AsyncStorage.setItem("userId", data.user_id);
        }
      } catch (error) {
        console.error("Error fetching user ID:", error);
        Alert.alert("Error", "Unable to fetch user information.");
      }
    };

    fetchUserID();
  }, [user]);

  const togglePwdVisibility = () => {
    setPwdHidden(!pwdHidden);
  };

  const validateInputs = () => {
    if (!currentPassword) {
      Alert.alert("Error", "Please enter current password.");
      return false;
    }
    if (newPassword.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters.");
      return false;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New password and confirmation do not match.");
      return false;
    }
    return true;
  };

  const handleUpdatePassword = async () => {
    if (!validateInputs()) return;
    if (!userID) {
      Alert.alert("Error", "Unable to determine the user. Please try again.");
      return;
    }

    try {
      const response = await fetch(`${ipAddress}/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userID,
          currentPassword: currentPassword,
          newPassword: newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert("Success", "Password updated successfully!");
        router.back();
      } else {
        Alert.alert("Error", data.message || "Unable to update password.");
      }
    } catch (error) {
      console.error("❌ Error while changing password:", error);
      Alert.alert("Error", "Unable to connect to the server. Please try again.");
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView style={styles.container}>
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="rgb(42, 78, 202)" />
          </TouchableOpacity>
          <Text style={styles.title}>Change Password</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.noteContainer}>
            <Text style={styles.note}>Password must include letters and numbers</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Current Password</Text>
            <View style={styles.passwordField}>
              <TextInput
                style={styles.input}
                placeholder="Enter current password"
                secureTextEntry={pwdHidden}
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />
              <TouchableOpacity onPress={togglePwdVisibility} style={styles.toggleButton}>
                <Text style={styles.toggleText}>{pwdHidden ? "SHOW" : "HIDE"}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>New Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter new password"
              secureTextEntry={pwdHidden}
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <Text style={styles.label}>Confirm New Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm new password"
              secureTextEntry={pwdHidden}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          <TouchableOpacity style={styles.button} onPress={handleUpdatePassword}>
            <Text style={styles.buttonText}>Update</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: Platform.OS === "ios" ? 40 : 30,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: 20,
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    color: "rgb(42, 78, 202)",
  },
  scrollView: {
    flexGrow: 1,
    padding: 20,
  },
  noteContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  note: {
    fontSize: 14,
    fontWeight: "500",
    color: "rgb(97, 103, 125)",
  },
  inputContainer: {
    marginVertical: 20,
  },
  label: {
    marginBottom: 5,
    fontSize: 16,
    fontWeight: "600",
    color: "rgb(42, 78, 202)",
  },
  passwordField: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position:"relative"
    },
  input: {
    flex: 1,
    height: 40,
    borderColor: "#E0E0E0",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    color: "rgb(97, 103, 125)",
  },
  toggleButton: {
    paddingHorizontal: 10,
    position:"absolute",
    right:0,
    top:-22,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgb(42, 78, 202)",
  },
  button: {
    backgroundColor: "#3461FD",
    paddingVertical: 10,
    borderRadius: 15,
    alignItems: "center",
    elevation: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ChangePass;
