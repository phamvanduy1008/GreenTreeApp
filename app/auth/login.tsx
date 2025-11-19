import SocialLoginButton from "@/app/components/common/SocialLoginButton";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Input from "@/app/components/common/Input";
import Button from "@/app/components/common/Button";
import { useRouter } from "expo-router";
import { ipAddress } from "../constants/ip";
import { Colors } from "../constants/Colors";
import { Platform, useWindowDimensions } from "react-native";

export const useWarmUpBrowser = () => {
  useEffect(() => {
    if (Platform.OS !== "web") {
      void WebBrowser.warmUpAsync();
      return () => {
        void WebBrowser.coolDownAsync();
      };
    }
  }, []);
};

WebBrowser.maybeCompleteAuthSession();

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { width } = useWindowDimensions();
  const isWebLayout = width > 687; // Áp dụng layout web chỉ khi width > 687px

  const handleLogin = async () => {
    try {
      const response = await fetch(`${ipAddress}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.user) {
        const user = data.user;

        if (user.onboarding_completed === 0) {
          Alert.alert("Đăng nhập thành công! Vui lòng hoàn tất hồ sơ.");
          router.push({
            pathname: "/auth/complete-your-account",
            params: { email },
          });
        } else {
          await AsyncStorage.multiSet([
            ["userId", user._id],
            ["email", email],
            ["userData", JSON.stringify(user)],
          ]);

          Alert.alert("Đăng nhập thành công!");
          router.replace("/(tabs)");
        }
      } else {
        Alert.alert("Sai tài khoản hoặc mật khẩu!");
      }
    } catch (error) {
      console.error("Lỗi đăng nhập:", error);
      Alert.alert("Có lỗi xảy ra, vui lòng thử lại sau.");
    }
  };

  useWarmUpBrowser();
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={[
        styles.container,
        isWebLayout && styles.webContainer,
        { paddingTop: insets.top + 40, paddingBottom: insets.bottom },
      ]}
      contentContainerStyle={[
        styles.contentContainer,
        isWebLayout && styles.webContentContainer, 
      ]}
      showsVerticalScrollIndicator={false} 
    >
      <View style={[styles.headingContainer, isWebLayout && styles.webHeadingContainer]}>
        <Text style={styles.title}>Đăng Nhập</Text>
        <Text style={styles.text}>
          Bắt đầu hành trình của bạn cùng sản phẩm của chúng tôi.
        </Text>

        <Input
          type="login"
          placeholder="Email"
          value={email}
          onChange={setEmail}
          inputStyles={{ marginBottom: 20 }}
        />

        <Input
          type="password"
          placeholder="Mật khẩu"
          value={password}
          onChange={setPassword}
        />

        <TouchableOpacity onPress={() => {}}>
          <Text style={styles.forgetpass}>Quên mật khẩu?</Text>
        </TouchableOpacity>

        <Button onClick={handleLogin} buttonStyle={styles.btntologin}>
          <Text style={styles.btnTextLogin}>Đăng Nhập</Text>
        </Button>

        <Text style={styles.textaccount}>
          Chưa có tài khoản?{" "}
          <Text
            style={styles.link}
            onPress={() => {
              router.push("/auth/register");
            }}
          >
            Đăng Ký
          </Text>
        </Text>
         <View style={[styles.socialButtonsContainer, isWebLayout && styles.webSocialButtonsContainer]}>
        <SocialLoginButton strategy="facebook" />
        <SocialLoginButton strategy="google" />
        <SocialLoginButton strategy="apple" />
      </View>
      </View>

     
    </ScrollView>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
    gap: 20,
  },

  webContainer: {
    paddingHorizontal: 40,
  },
  contentContainer: {
    gap: 20,
  },
  webContentContainer: {
    maxWidth: 500, 
    alignSelf: "center", 
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: Colors.primary,
    textAlign: "center",
    marginBottom: 20,
  },
  text: {
    color: "rgb(97, 103, 125)",
    fontSize: 15,
    textAlign: "center",
    marginBottom: 30,
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
  label: {
    fontSize: 20,
    fontWeight: "bold",
  },
  description: {
    fontSize: 16,
    color: "gray",
  },
  socialButtonsContainer: {
    width: "100%",
    marginTop: 60,
    gap: 10,
  },
  webSocialButtonsContainer: {
    marginTop: 40, 
    flexDirection: "column",
    justifyContent: "center",
    gap: 16,
  },
  buttonlogin: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    width: "100%",
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
    borderRadius: 20,
  },
  bargeArea: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 20,
    marginBottom: 20,
  },
  barge: {
    width: 140,
    height: 1,
    backgroundColor: "rgb(193, 194, 197)",
  },
  or: {
    fontSize: 16,
    fontWeight: "400",
  },
  textaccount: {
    fontSize: 15,
    color: "#333",
    marginTop: 20,
    fontWeight: "400",
    fontFamily: "Montserrat",
    textAlign: "center",
  },
  btnTextLogin: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "400",
    padding: 20,
    marginBottom: 20,
  },
  link: {
    color: Colors.primary,
  },
  forgetpass: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: "500",
    marginTop: 10,
    textAlign: "right",
    marginRight: 10,
  },
  btntologin: {
    width: "98%",
    height: 47,
    backgroundColor: Colors.primary,
    borderRadius: 15,
    marginTop: 20,
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});