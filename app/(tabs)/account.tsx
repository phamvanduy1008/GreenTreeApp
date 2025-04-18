import { useClerk } from "@clerk/clerk-expo";
import { StyleSheet, Text, View, TouchableOpacity, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

const Account = () => {
  const { signOut, user } = useClerk();
  const [storedUserData, setStoredUserData] = useState<{ full_name: string; username: string; gender: string } | null>(null);
  const [storedEmail, setStoredEmail] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const email = await AsyncStorage.getItem("email");
        const userData = await AsyncStorage.getItem("userData");

        if (email) setStoredEmail(email);
        if (userData) {
          const parsedData = JSON.parse(userData);
          console.log("parsedData.profile: ", parsedData.profile);
          setStoredUserData(parsedData.profile);
        }
      } catch (error) {
        console.error("❌ Lỗi khi lấy userData từ AsyncStorage:", error);
      }
    };
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      setStoredEmail(null);
      setStoredUserData(null);
      await signOut();
      router.replace("/auth/login");
    } catch (error) {
      console.error("❌ Lỗi khi đăng xuất:", error);
    }
  };

  const handleEdit = () => {
    try {
      router.push("/page/changepass");
    } catch (error) {
      console.error("❌ Lỗi khi điều hướng đến màn hình chỉnh sửa:", error);
    }
  };
  

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Settings</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <Text style={styles.emailText}>
            Email: {user?.emailAddresses?.[0]?.emailAddress || storedEmail || "N/A"}
          </Text>
          <Text style={styles.text}>
            Full Name: {user?.fullName || storedUserData?.full_name || "N/A"}
          </Text>
          <Text style={styles.text}>
            Username: {String(user?.unsafeMetadata?.username || storedUserData?.username || "N/A")}
          </Text>
          <Text style={styles.text}>
            Gender: {String(user?.unsafeMetadata?.gender || storedUserData?.gender || "N/A")}
          </Text>
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Text style={styles.buttonText}>Edit password</Text>
          </TouchableOpacity>
         
        </View>
      </View>
    </View>
  );
};

export default Account;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: Platform.OS === "ios" ? 50 : 30,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    padding: 25,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "700",
    color: "rgb(42, 78, 202)",
  },
  cardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 25,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: "100%",
    maxWidth: 300,
    alignItems: "center",
    marginBottom: 250,
  },
  emailText: {
    fontSize: 18,
    fontWeight: "600",
    color: "rgb(42, 78, 202)",
    marginBottom: 20,
    textAlign: "center",
  },
  text: {
    fontSize: 16,
    fontWeight: "500",
    color: "rgb(97, 103, 125)",
    marginBottom: 10,
    textAlign: "center",
  },
  editButton: {
    backgroundColor: "#3461FD",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
    width: 150,
  },
  logoutButton: {
    position: "absolute",
    backgroundColor: "#3461FD",
    paddingVertical: 12,
    paddingHorizontal: 12, 
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    width: 45, 
    height: 45,
    right: 15,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});