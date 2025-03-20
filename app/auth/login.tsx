import SocialLoginButton from "@/components/SocialLoginButton";
import { Alert, StyleSheet, Text, TouchableOpacity, View,ScrollView, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";
import {useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Input from "@/components/Input";
import Button from "@/components/Button";
import {useRouter } from "expo-router";
import { ipAddress } from "../ip";
export const useWarmUpBrowser = () => {
  useEffect(() => {
    // Warm up the android browser to improve UX
    // https://docs.expo.dev/guides/authentication/#improving-user-experience
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

WebBrowser.maybeCompleteAuthSession();
const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await fetch(`${ipAddress}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
      console.log("data:", data);

      if (response.ok && data.success && data.user) {
        Alert.alert("Đăng nhập thành công!");
  
        await AsyncStorage.setItem("email", email);
        await AsyncStorage.setItem("userData", JSON.stringify(data.user));
        await AsyncStorage.setItem("userId", data.user._id); // Lưu _id của user
        console.log("data.user.profile",data.user._id);
        
        if (data.user.profile.full_name === "") {
          router.push("/auth/complete-your-account");
        } else {
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
        { paddingTop: insets.top + 40, paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.headingContainer}>
      <Text style={styles.title}>Sign In</Text>
      <Text style={styles.text}> Start your journey with thousands of developers around the world.</Text>
        <Input type="login" placeholder="Email" value={email} onChange={setEmail} inputStyles={{marginBottom:20} }></Input>
      <Input type="password" placeholder="Password" value={password} onChange={setPassword} ></Input>
     <TouchableOpacity onPress={()=>{}}>
      <Text style={styles.forgetpass}>Forget Password?</Text>
      </TouchableOpacity>
    <Button onClick={handleLogin} buttonStyle={styles.btntologin}><Text style={styles.btnTextLogin}>Login</Text></Button>
    <Text style={styles.textaccount}>
      Don’t have account?{" "}
      <Text style={styles.link} onPress={()=>{ router.push("/auth/register");
}}>
        Sign Up
      </Text> 
      </Text>
      </View>

      <View style={styles.socialButtonsContainer}>
      <SocialLoginButton strategy="facebook" />
        <SocialLoginButton strategy="google" />
        <SocialLoginButton strategy="apple" />
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
  title: {
    fontSize: 32,
    fontWeight: "700",
    color:"rgb(42, 78, 202)",
    textAlign:"center",
    marginBottom:20,
  },
  text: {
    color:"rgb(97, 103, 125)",
    fontSize: 15,
    textAlign:"center",
    marginBottom:30,
  },
  headingContainer: {
    width: "100%",
    gap: 5,
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
    marginTop: 20,
    gap: 10,
  },
  buttonlogin: {
    flexDirection: "row",
    justifyContent: "center", 
    alignItems:"center",
    marginBottom: 20,
    width:'100%',
    gap:20,
    padding:10,
  },
  btnStyle: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    width:160,
  },
  image: {
    width: 30,
    height: 30,
    marginRight: 15,
  },
  btnText: {
    color:"rgb(97, 103, 125)",
    fontSize: 18,
    fontWeight:"500",
    textAlign:"center",
    borderRadius:20,
  },
  bargeArea:{
    flexDirection:"row",
    justifyContent:"center",
    alignItems:"center",
    gap: 20,
    marginBottom:20,
  },
  barge:{
    width:140,
    height:1,
    backgroundColor:"rgb(193, 194, 197)"
  },
  or:{
    fontSize:16,
    fontWeight:"400",
  },
  textaccount: {
    fontSize: 15,
    color: "#333",
    marginTop:20,
    fontWeight:"400",
    fontFamily: "Montserrat",
    textAlign:"center",
  },
  btnTextLogin:{
    color:"#fff",
    fontSize:17,
    fontWeight:"400",
    padding:20,
    marginBottom:20,
  },
  link: {
    color: "blue",
  },
  forgetpass:{
    color:"#7C8BA0",
    fontSize:12,
    fontWeight:"500",
    marginTop:10,
    textAlign:"right",
    marginRight:10
  },
  btntologin:{
    width:"98%",
    height:47,
    backgroundColor:"#3461FD",
    borderRadius:15,
    marginTop:20,
    color:"#fff",
    fontSize:18,
    fontWeight:"600",
  },
});
