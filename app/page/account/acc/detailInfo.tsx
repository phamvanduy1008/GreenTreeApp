import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Button,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useRouter } from "expo-router";
import { ipAddress } from "@/app/constants/ip";

// Định nghĩa kiểu cho các màn hình
type RootStackParamList = {
  AccountSecurity: undefined;
  Profile: undefined;
  Username: undefined;
  Phone: undefined;
  Email: undefined;
  SocialMedia: undefined;
  ChangePassword: undefined;
  Login: undefined;
};

// Định kiểu cho navigation
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface UserProfile {
  _id: string;
  email: string;
  profile: {
    full_name: string;
    username: string;
    gender: string;
    phone: string;
    avatar: string;
    address: string;
  };
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
}

interface ApiResponse {
  success: boolean;
  user: UserProfile;
  message?: string;
}

export default function AccountSecurityScreen() {
  const router = useRouter();
  const navigation = useNavigation<NavigationProp>();
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        console.log("UserId lưu trong AsyncStorage:", userId);

        if (!userId) {
          setIsLoggedIn(false);
          setLoading(false);
          return;
        }

        setIsLoggedIn(true);
        const response = await fetch(
          `${ipAddress}/api/user/${userId}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          console.log("Error details:", errorData);
          throw new Error(
            `HTTP error! status: ${response.status}, message: ${
              errorData.message || "Không có thông báo lỗi"
            }`
          );
        }

        const data: ApiResponse = await response.json();

        if (data.success && data.user) {
          setUserData(data.user);
        } else {
          setError(data.message || "Không thể lấy thông tin người dùng");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Lỗi không xác định";
        console.error("Lỗi khi fetch dữ liệu:", errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    checkLoginStatus();
  }, []);

  const handleGoBack = () => {
    navigation.goBack();
  };

  // Sử dụng router.push để điều hướng theo đường dẫn của Expo Router
  const handleNavigate = (screen: keyof RootStackParamList) => {
    if (screen === "Profile") {
      router.push("/page/account/acc/profile"); // Điều hướng đến profile.tsx
    } else if (screen === "Login") {
      router.push("/auth/login");
    } else {
      // Các màn hình khác vẫn sử dụng navigation.navigate
      navigation.navigate(screen);
    }
  };

  if (loading || isLoggedIn === null) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F05A22" />
        </View>
      </SafeAreaView>
    );
  }

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            Người dùng chưa đăng nhập, chưa có thông tin người dùng. Hãy đăng
            nhập để xem được thông tin chi tiết người dùng
          </Text>
          <Button title="Đăng nhập" onPress={() => handleNavigate("Login")} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.retryText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông tin tài khoản</Text>
      </View>

      <View style={styles.menuContainer}>
        <MenuItem
          title="Hồ sơ của tôi"
          onPress={() => handleNavigate("Profile")} // Sẽ điều hssướng đến /page/acc/profile
        />
        <MenuItem
          title="Tên người dùng"
          value={userData?.profile?.username || "Chưa cập nhật"}
          onPress={() => {}}
        />
        <MenuItem
          title="Điện thoại"
          value={
            userData?.profile?.phone
              ? `******${userData.profile.phone.slice(-2)}`
              : "Chưa cập nhật"
          }
          onPress={() => {}}
        />
        <MenuItem
          title="Email nhận hóa đơn"
          value={
            userData?.email
              ? `${userData.email[0]}******${userData.email
                  .split("@")[0]
                  .slice(-1)}@${userData.email.split("@")[1]}`
              : "Chưa cập nhật"
          }
          onPress={() => {}}
        />
        <MenuItem title="Mạng xã hội" onPress={() => {}} />
        <MenuItem title="Đổi mật khẩu" onPress={() => {}} />
      </View>
    </SafeAreaView>
  );
}

function MenuItem({
  title,
  value,
  onPress,
}: {
  title: string;
  value?: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemContent}>
        <Text style={styles.menuItemText}>{title}</Text>
        {value && <Text style={styles.menuItemValue}>{value}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  menuContainer: {
    marginTop: 5,
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomColor: "#f0f0f0",
    borderBottomWidth: 1,
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    color: "#444",
    flex: 1,
  },
  menuItemValue: {
    fontSize: 16,
    color: "#999",
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#F05A22",
    marginBottom: 20,
    textAlign: "center",
  },
  retryText: {
    fontSize: 16,
    color: "#333",
    textDecorationLine: "underline",
  },
});
