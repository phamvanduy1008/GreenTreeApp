import React, { useState } from "react";
import {
  View,
  Text,
  Alert,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useWindowDimensions } from "react-native";
import Input from "@/app/components/common/Input";
import Button from "@/app/components/common/Button";
import { ipAddress } from "../constants/ip";
import { Colors } from "../constants/Colors";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const { width } = useWindowDimensions();
  const isWebLayout = width > 687;

  const router = useRouter();

  const handleRegister = async () => {
    if (!email || !password || !passwordConfirm) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin!");
      return;
    }

    if (password !== passwordConfirm) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp!");
      return;
    }

    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      Alert.alert("Lỗi", "Email không hợp lệ!");
      return;
    }
    try {
      const response = await fetch(`${ipAddress}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        Alert.alert("Thành công", "Đăng ký thành công!");
        router.push("/auth/login");
      } else {
        Alert.alert(
          "Lỗi",
          data.message || "Đăng ký thất bại, vui lòng thử lại sau."
        );
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Lỗi", "Có lỗi xảy ra, vui lòng thử lại sau.");
    }
  };

  return (
    <ScrollView
      style={[
        styles.container,
        isWebLayout && styles.webContainer,
      ]}
      contentContainerStyle={[
        isWebLayout && styles.webContentContainer,
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.headingContainer, isWebLayout && styles.webHeadingContainer]}>
        <Text style={styles.registerTitle}>Đăng ký</Text>
        <Text style={styles.registerText}>
          Hãy đăng ký tài khoản để trải nghiệm những tính năng thú vị và tuyệt vời
          của app chúng tôi nhé{" "}
        </Text>

        <Input
          type="login"
          placeholder="Email"
          inputStyles={{ marginBottom: 20 }}
          value={email}
          onChange={setEmail}
        />
        <Input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={setPassword}
        />
        <Input
          type="password"
          placeholder="Xác nhận mật khẩu"
          value={passwordConfirm}
          onChange={setPasswordConfirm}
          inputStyles={{ marginTop: 20 }}
        />

        <Button buttonStyle={styles.btnToRegister} onClick={handleRegister}>
          <Text style={styles.btnToRegisterText}>Đăng ký</Text>
        </Button>
        <Text style={styles.accountText}>
          Đã có tài khoản?{" "}
          <Text
            style={styles.link}
            onPress={() => {
              router.push("/auth/login");
            }}
          >
            Đăng nhập
          </Text>
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flex: 1,
    paddingVertical: 100,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  webContainer: {
    paddingHorizontal: 40,
  },
  webContentContainer: {
    maxWidth: 500,
    alignSelf: "center",
    paddingBottom: 40,
  },
  headingContainer: {
    width: "100%",
    gap: 5,
  },
  webHeadingContainer: {
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 32,
    backgroundColor: "#fdfdffff", 
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  registerTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.primary,
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "Montserrat",
  },
  registerText: {
    color: "rgb(97, 103, 125)",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 30,
    fontFamily: "Montserrat",
  },
  buttonArea: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
    height: 80,
    gap: 20,
    padding: 10,
  },
  btnStyle: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    width: 160,
  },
  image: {
    width: 30,
    height: 30,
    marginRight: 15,
  },
  btnText: {
    color: "rgb(97, 103, 125)",
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
  },
  dividerArea: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    marginBottom: 20,
  },
  divider: {
    width: 140,
    height: 1,
    backgroundColor: "rgb(193, 194, 197)",
  },
  orText: {
    fontSize: 16,
    fontWeight: "400",
  },
  forgetPass: {
    color: "#7C8BA0",
    fontSize: 14,
    fontWeight: "500",
    marginTop: 10,
    textAlign: "right",
    marginRight: 10,
  },
  btnToRegister: {
    width: "98%",
    height: 60,
    backgroundColor: Colors.primary,
    borderRadius: 15,
    marginTop: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  btnToRegisterText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  accountText: {
    fontSize: 16,
    color: "#333",
    marginTop: 20,
    fontWeight: "400",
    fontFamily: "Montserrat",
    textAlign: "center",
  },
  link: {
    color: Colors.primary,
  },
});