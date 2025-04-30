import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, Platform } from "react-native";
import { router } from "expo-router";
import { Colors } from "../../constants/Colors";

const Success = () => {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Image
          source={require("../../../assets/images/success/success_icon.png")}
          style={styles.successIcon}
        />
      </View>
      <Text style={styles.title}>Đặt hàng thành công!</Text>
      <Text style={styles.subtitle}>Đơn hàng của bạn đã được đặt thành công và đang chờ người bán xử lý.</Text>
      <TouchableOpacity
        style={styles.trackButton}
        onPress={() => {
          router.push("/page/account/acc/order");
        }}
      >
        <Text style={styles.buttonText}>Theo dõi đơn hàng</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => router.push("../../(tabs)/shop")}
      >
        <Text style={styles.backText}>Trở về cửa hàng</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
  },
  iconContainer: {
    width: "100%",
    marginTop: Platform.OS === "android" ? 180 : 130,
    marginBottom: 10,
    marginLeft: "35%",
  },
  successIcon: {
    width: 200,
    height: 180,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 50,
  },
  trackButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    marginBottom: 20,
    marginTop: 170,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  backText: {
    fontSize: 18,
    color: Colors.primary,
    fontWeight: "500",
  },
});

export default Success;