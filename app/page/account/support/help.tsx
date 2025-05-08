import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Linking,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/app/constants/Colors";
import { useRouter } from "expo-router";

const PRIMARY_COLOR = Colors.primary;
type PagePath =
  | "../../message/message"
  | "./policy"
  | "../acc/order";

export default function SupportScreen() {
  const router = useRouter();

  const openLink = (type: string, value: string) => {
    let url = "";
    if (type === "phone") url = `tel:${value}`;
    if (type === "email") url = `mailto:${value}`;
    Linking.openURL(url).catch((err) => console.error("Error opening link:", err));
  };

  const navigateToPage = (path: PagePath) => {
    router.push(path);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trung tâm hỗ trợ</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Câu hỏi thường gặp</Text>
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>
              Làm thế nào để theo dõi đơn hàng?
            </Text>
            <Text style={styles.faqAnswer}>
              Vào mục "Đơn đặt hàng" trong tài khoản, nhập mã đơn hàng để kiểm
              tra trạng thái.
            </Text>
          </View>
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>
              Quy trình đổi trả sản phẩm như thế nào?
            </Text>
            <Text style={styles.faqAnswer}>
              Liên hệ qua email hoặc số điện thoại trong vòng 7 ngày, sản phẩm
              phải còn nguyên tem và chưa sử dụng.
            </Text>
          </View>
          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>
              Làm sao để thanh toán an toàn?
            </Text>
            <Text style={styles.faqAnswer}>
              Chúng tôi hỗ trợ thanh toán qua thẻ tín dụng, ví điện tử và tiền
              mặt khi nhận hàng (COD). Tất cả đều được mã hóa bảo mật.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Liên kết nhanh</Text>
          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => navigateToPage("../../message/message")}
          >
            <View style={styles.linkIconContainer}>
              <Ionicons name="chatbubble-ellipses-outline" size={22} color={PRIMARY_COLOR} />
            </View>
            <Text style={styles.linkText}>Liên hệ hỗ trợ</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => navigateToPage("./policy")}
          >
            <View style={styles.linkIconContainer}>
              <Ionicons name="shield-checkmark-outline" size={22} color={PRIMARY_COLOR} />
            </View>
            <Text style={styles.linkText}>Chính sách & Điều khoản</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => navigateToPage("../acc/order")}
          >
            <View style={styles.linkIconContainer}>
              <Ionicons name="basket-outline" size={22} color={PRIMARY_COLOR} />
            </View>
            <Text style={styles.linkText}>Kiểm tra đơn hàng</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hướng dẫn sử dụng</Text>
          <Text style={styles.guideText}>
            - Đặt hàng: Chọn sản phẩm, thêm vào giỏ hàng, sau đó nhấn "Thanh
            toán" để hoàn tất.
          </Text>
          <Text style={styles.guideText}>
            - Kiểm tra giỏ hàng: Vào biểu tượng giỏ hàng trên đầu trang để
            xem và chỉnh sửa.
          </Text>
          <Text style={styles.guideText}>
            - Cập nhật tài khoản: Vào "Thông tin tài khoản" để chỉnh sửa thông
            tin cá nhân.
          </Text>
        </View>

        {/* Emergency Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hỗ trợ khẩn cấp</Text>
          <TouchableOpacity
            style={styles.supportItem}
            onPress={() => openLink("phone", "+84355582926")}
          >
            <View style={styles.supportIconContainer}>
              <Ionicons name="call-outline" size={22} color={PRIMARY_COLOR} />
            </View>
            <Text style={styles.supportText}>Gọi ngay: +84355582926</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.supportItem}
            onPress={() => openLink("email", "phamvanduy.dev@gmail.com")}
          >
            <View style={styles.supportIconContainer}>
              <Ionicons name="mail-outline" size={22} color={PRIMARY_COLOR} />
            </View>
            <Text style={styles.supportText}>Email: phamvanduy.dev@gmail.com</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    marginBottom: 20,

  },

  // Header Section
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    paddingTop:50
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginLeft: 70,
    flex: 1,
  },

  section: {
    marginTop: 20,
    paddingHorizontal: 16,

  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#888",
    marginBottom: 12,
    paddingLeft: 5,
  },

  // FAQ Section
  faqItem: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 1,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
    marginBottom: 6,
  },
  faqAnswer: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },

  // Quick Links Section
  linkItem: {
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
  linkIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(83, 177, 117, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  linkText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
  },

  // Guide Section
  guideText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 10,
    lineHeight: 20,
  },

  // Emergency Support Section
  supportItem: {
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
  supportIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(83, 177, 117, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  supportText: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
  },
});