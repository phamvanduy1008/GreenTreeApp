import { useClerk } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors } from "../constants/Colors";
import { useRouter } from "expo-router";

const PRIMARY_COLOR = Colors.primary;

interface MenuItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress?: () => void;
}

export default function AccountScreen() {
  const { signOut, user } = useClerk();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const userApi = await AsyncStorage.getItem("userData");
        if (userApi || user) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra user:", error);
        setIsAuthenticated(false);
      }
    };
    checkAuthentication();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut();
      await AsyncStorage.clear();
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
    }
  };
  const toSignIn = () => {
    router.push("/auth/login");
  };
  const toSignUp = () => {
    router.push("/auth/register");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ScrollView showsVerticalScrollIndicator={false}>
        {isAuthenticated ? (
          <View style={styles.profileSection}>
            <View style={styles.profileHeader}>
              <Image
                source={{ uri: "https://via.placeholder.com/150" }}
                style={styles.profileImage}
              />

              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>DuyDuy</Text>
              </View>

              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <Ionicons name="log-out-outline" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.loginSection}>
            <Text style={styles.welcomeText}>Chào mừng bạn!</Text>

            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={toSignIn} style={styles.loginButton}>
                <Text style={styles.buttonText}>Đăng nhập</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={toSignUp} style={styles.signupButton}>
                <Text style={styles.buttonText11}>Đăng ký</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Menu Section */}
        <View style={styles.menuContainer}>
          {isAuthenticated && (
            <>
              <Text style={styles.menuTitle}>Tài khoản</Text>

              <MenuItem
                icon="basket-outline"
                title="Đơn đặt hàng"
                subtitle="Xem và theo dõi đơn hàng của bạn"
                onPress={() => router.push("../page/account/acc/order")}
              />

              <MenuItem
                icon="person-circle-outline"
                title="Thông tin tài khoản"
                subtitle="Cập nhật thông tin cá nhân"
                onPress={() => router.push("../page/account/acc/detailInfo")}
              />

              <MenuItem
                icon="map-outline"
                title="Địa chỉ giao hàng"
                subtitle="Quản lý địa chỉ nhận hàng"
                onPress={() => router.push("../page/account/acc/address")}
              />

              <Text style={styles.menuTitle}>Tiện ích</Text>

              <MenuItem
                icon="pricetag-outline"
                title="Giá cả"
                subtitle="Kiểm tra bảng giá sản phẩm"
                onPress={() => router.push("../page/account/utility/price")}
              />

              <MenuItem
                icon="calculator-sharp"
                title="Máy tính"
                subtitle="Công cụ tính toán đơn giản"
                onPress={() =>
                  router.push("../page/account/utility/calculator")
                }
              />

              <MenuItem
                icon="cloudy-night-outline"
                title="Thời tiết"
                subtitle="Xem dự báo thời tiết hiện tại"
                onPress={() => router.push("../page/account/utility/weather")}
              />

              <Text style={styles.menuTitle}>Hỗ trợ</Text>

              <MenuItem
                icon="help-circle-sharp"
                title="Giúp đỡ"
                subtitle="Các câu hỏi thường gặp"
                onPress={() => router.push("../page/account/support/help")}
              />

              <MenuItem
                icon="chatbubble-ellipses-outline"
                title="Liên hệ"
                subtitle="Kết nối với đội ngũ hỗ trợ"
                onPress={() => router.push("../page/account/support/contact")}
              />
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function MenuItem({ icon, title, subtitle, onPress }: MenuItemProps) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.menuItem}>
      <View style={styles.menuIconContainer}>
        <Ionicons name={icon} size={22} color={PRIMARY_COLOR} />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuItemTitle}>{title}</Text>
        {subtitle && <Text style={styles.menuItemSubtitle}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={18} color="#CCCCCC" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    paddingBottom: 40,
  },

  // Profile section when logged in
  profileSection: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F5F5F5",
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  logoutButton: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 20,
    width: 38,
    height: 38,
    justifyContent: "center",
    alignItems: "center",
  },

  // Login section when not logged in
  loginSection: {
    backgroundColor: "#fff",
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  loginButton: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    flex: 1,
    marginRight: 10,
    alignItems: "center",
  },
  signupButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: PRIMARY_COLOR,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 15,
    flex: 1,
    marginLeft: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonText11: {
    color: PRIMARY_COLOR,
    fontSize: 16,
    fontWeight: "600",
  },

  // Menu section
  menuContainer: {
    marginTop: 20,
    marginBottom: 40,
    paddingHorizontal: 16,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#888",
    marginTop: 24,
    marginBottom: 12,
    paddingLeft: 5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(83, 177, 117, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 13,
    color: "#888",
  },
  versionInfo: {
    marginTop: 40,
    alignItems: "center",
    paddingBottom: 20,
  },
  versionText: {
    fontSize: 13,
    color: "#888",
  },
});
