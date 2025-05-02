import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/app/constants/Colors";
import { useRouter } from "expo-router";

const PRIMARY_COLOR = Colors.primary;

export default function PolicyScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chính sách & Điều khoản</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chính sách bảo mật</Text>
          <Text style={styles.sectionText}>
            Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn. Dữ liệu như tên,
            địa chỉ, và thông tin thanh toán sẽ được mã hóa và chỉ sử dụng cho mục
            đích xử lý đơn hàng. Chúng tôi không chia sẻ thông tin của bạn với bên
            thứ ba mà không có sự đồng ý của bạn, trừ khi được yêu cầu bởi pháp luật.
          </Text>
          <Text style={styles.sectionText}>
            Chúng tôi sử dụng cookie để cải thiện trải nghiệm của bạn trên ứng dụng.
            Bạn có thể tắt cookie trong cài đặt, nhưng điều này có thể ảnh hưởng đến
            một số tính năng.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Điều khoản sử dụng</Text>
          <Text style={styles.sectionText}>
            Khi sử dụng ứng dụng, bạn đồng ý tuân thủ các điều khoản sau:
          </Text>
          <Text style={styles.sectionText}>
            - Không sử dụng ứng dụng cho các mục đích bất hợp pháp.
          </Text>
          <Text style={styles.sectionText}>
            - Không sao chép hoặc phân phối nội dung của ứng dụng mà không được phép.
          </Text>
          <Text style={styles.sectionText}>
            - Chúng tôi có quyền tạm ngưng tài khoản nếu phát hiện hành vi vi phạm.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chính sách đổi trả</Text>
          <Text style={styles.sectionText}>
            Sản phẩm có thể được đổi trả trong vòng 7 ngày kể từ ngày nhận hàng
            với điều kiện:
          </Text>
          <Text style={styles.sectionText}>
            - Sản phẩm chưa sử dụng và còn nguyên tem, bao bì.
          </Text>
          <Text style={styles.sectionText}>
            - Có hóa đơn mua hàng đi kèm.
          </Text>
          <Text style={styles.sectionText}>
            Vui lòng liên hệ qua số điện thoại +123-456-7890 hoặc email
            support@shop.com để được hỗ trợ.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chính sách thanh toán</Text>
          <Text style={styles.sectionText}>
            Chúng tôi hỗ trợ nhiều phương thức thanh toán bao gồm:
          </Text>
          <Text style={styles.sectionText}>
            - Thanh toán khi nhận hàng (COD).
          </Text>
          <Text style={styles.sectionText}>
            - Thanh toán qua thẻ tín dụng/thẻ ghi nợ.
          </Text>
          <Text style={styles.sectionText}>
            - Thanh toán qua ví điện tử (Momo, ZaloPay, v.v.).
          </Text>
          <Text style={styles.sectionText}>
            Tất cả giao dịch đều được mã hóa để đảm bảo an toàn. Nếu có vấn đề
            về thanh toán, vui lòng liên hệ ngay để được hỗ trợ.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chính sách vận chuyển</Text>
          <Text style={styles.sectionText}>
            Thời gian giao hàng dự kiến:
          </Text>
          <Text style={styles.sectionText}>
            - Nội thành: 1-2 ngày làm việc.
          </Text>
          <Text style={styles.sectionText}>
            - Ngoại thành: 3-5 ngày làm việc.
          </Text>
          <Text style={styles.sectionText}>
            Phí vận chuyển sẽ được tính dựa trên khu vực và khối lượng đơn hàng.
            Miễn phí vận chuyển cho đơn hàng trên 500.000 VNĐ.
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
    paddingBottom:20,
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
    marginLeft: 40,
    flex: 1,
  },

  // General Section
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
  sectionText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 10,
    lineHeight: 20,
  },
});