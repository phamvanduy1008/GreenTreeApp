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
  StatusBar,
} from "react-native";
import { Stack, router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ipAddress } from "../../../constants/ip";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/app/constants/Colors";

const ChangePass = () => {
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
        }
      } catch (error) {
        console.error("Lỗi khi lấy ID người dùng:", error);
      }
    };

    fetchUserID();
  }, []);

  const togglePwdVisibility = () => {
    setPwdHidden(!pwdHidden);
  };

  const validateInputs = () => {
    if (!currentPassword) {
      Alert.alert("Lỗi", "Vui lòng nhập mật khẩu hiện tại.");
      return false;
    }
    if (newPassword.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu mới phải có ít nhất 6 ký tự.");
      return false;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Lỗi", "Mật khẩu mới và xác nhận mật khẩu không khớp.");
      return false;
    }
    return true;
  };

  const handleUpdatePassword = async () => {
    if (!validateInputs()) return;
    if (!userID) {
      Alert.alert("Lỗi", "Không thể xác định người dùng. Vui lòng thử lại.");
      return;
    }

    try {
      const response = await fetch(`${ipAddress}/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userID, currentPassword, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Thành công", data.message || "Đổi mật khẩu thành công!");
        router.back();
      } else {
        Alert.alert("Lỗi", data.message || "Không thể đổi mật khẩu.");
      }
    } catch (error) {
      console.error("❌ Lỗi khi đổi mật khẩu:", error);
      Alert.alert("Lỗi", "Không thể kết nối với máy chủ. Vui lòng thử lại.");
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Đổi mật khẩu</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.noteContainer}>
            <Text style={styles.note}>
              Mật khẩu phải bao gồm chữ cái và số
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Mật khẩu hiện tại</Text>
            <View style={styles.passwordField}>
              <TextInput
                style={styles.input}
                placeholder="Nhập mật khẩu hiện tại"
                placeholderTextColor={Colors.lightText}
                secureTextEntry={pwdHidden}
                value={currentPassword}
                onChangeText={setCurrentPassword}
              />
              <TouchableOpacity onPress={togglePwdVisibility} style={styles.toggleButton}>
                <Text style={styles.toggleText}>{pwdHidden ? "HIỆN" : "ẨN"}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Mật khẩu mới</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu mới"
              placeholderTextColor={Colors.lightText}
              secureTextEntry={pwdHidden}
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <Text style={styles.label}>Xác nhận mật khẩu mới</Text>
            <TextInput
              style={styles.input}
              placeholder="Xác nhận mật khẩu mới"
              placeholderTextColor={Colors.lightText}
              secureTextEntry={pwdHidden}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.button,
              (!currentPassword || !newPassword || !confirmPassword) && styles.buttonDisabled,
            ]}
            onPress={handleUpdatePassword}
            disabled={!currentPassword || !newPassword || !confirmPassword}
          >
            <Text style={styles.buttonText}>Cập nhật</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.white,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: Colors.accent,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  scrollView: {
    flexGrow: 1,
    padding: 20,
  },
  noteContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  note: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.lightText,
  },
  inputContainer: {
    marginVertical: 10,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },
  passwordField: {
    position: "relative",
    marginBottom: 20,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.text,
  },
  toggleButton: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: [{ translateY: -10 }],
  },
  toggleText: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.primary,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: Colors.lightText,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ChangePass;