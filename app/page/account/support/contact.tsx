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

export default function ContactScreen() {
  const router = useRouter();

  // Hàm mở liên kết (điện thoại, email, mạng xã hội, v.v.)
  const openLink = (type: string, value: string) => {
    let url = "";
    if (type === "phone") url = `tel:${value}`;
    if (type === "email") url = `mailto:${value}`;
    if (type === "social") url = value;
    Linking.openURL(url).catch((err) => console.error("Error opening link:", err));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Liên hệ với chúng tôi</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Contact Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>

          <TouchableOpacity
            style={styles.infoItem}
            onPress={() => openLink("phone", "+84355582926")}
          >
            <View style={styles.infoIconContainer}>
              <Ionicons name="call-outline" size={22} color={PRIMARY_COLOR} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Số điện thoại</Text>
              <Text style={styles.infoSubtitle}>0355582926</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.infoItem}
            onPress={() => openLink("email", "phamvanduy.dev@gmail.com")}
          >
            <View style={styles.infoIconContainer}>
              <Ionicons name="mail-outline" size={22} color={PRIMARY_COLOR} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Email</Text>
              <Text style={styles.infoSubtitle}>phamvanduy.dev@gmail.com</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.infoItem}
            onPress={() => openLink("social", "https://www.facebook.com/huongnongtienich")}
          >
            <View style={styles.infoIconContainer}>
              <Ionicons name="logo-facebook" size={22} color={PRIMARY_COLOR} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Facebook</Text>
              <Text style={styles.infoSubtitle}>GreenTrees Official</Text>
            </View>
          </TouchableOpacity>

     
          <View style={styles.infoItem}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="location-outline" size={22} color={PRIMARY_COLOR} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Địa chỉ</Text>
              <Text style={styles.infoSubtitle}>
                53 Nguyễn Minh Châu, Hoà Hải, Ngũ Hành Sơn, Đà Nẵng
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.contentSection}>
          <Text style={styles.contentTitle}>Hướng dẫn và thông tin hỗ trợ</Text>
          <Text style={styles.contentText}>
            - Thời gian hoạt động: Chúng tôi hỗ trợ từ 8:00 sáng đến 22:00 tối
            hàng ngày, kể cả cuối tuần.
          </Text>
          <Text style={styles.contentText}>
            - Hỗ trợ trực tuyến: Bạn có thể chat với chúng tôi qua Facebook
            Messenger hoặc Zalo để được giải đáp nhanh chóng. Vui lòng cung cấp mã
            đơn hàng nếu có.
          </Text>
          <Text style={styles.contentText}>
            - Chính sách đổi trả: Sản phẩm có thể được đổi trong vòng 7 ngày
            nếu còn nguyên tem, vui lòng liên hệ qua email hoặc số điện thoại để
            được hướng dẫn.
          </Text>
          <Text style={styles.contentText}>
            - Câu hỏi thường gặp: Vui lòng truy cập trang FAQ trên website
            của chúng tôi để tìm câu trả lời cho các thắc mắc phổ biến như thanh
            toán, vận chuyển, và bảo hành.
          </Text>
          <Text style={styles.contentText}>
            - Khuyến mãi đặc biệt: Theo dõi Facebook và Website để không bỏ
            lỡ các chương trình giảm giá hoặc ưu đãi độc quyền!
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },

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
    marginLeft: 60,
    flex: 1,
    },

  infoSection: {
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
  infoItem: {
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
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(83, 177, 117, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  infoSubtitle: {
    fontSize: 13,
    color: "#888",
  },

  // Content Section
  contentSection: {
    marginTop: 20,
    paddingHorizontal: 16,
    marginBottom: 40,
  },
  contentTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#888",
    marginBottom: 12,
    paddingLeft: 5,
  },
  contentText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 10,
    lineHeight: 20,
  },
});