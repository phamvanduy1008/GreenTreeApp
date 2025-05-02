import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { ipAddress } from "../constants/ip";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Colors } from "../constants/Colors";

// Define the INotice interface based on the noticeSchema
interface INotice {
  _id: string;
  user: string;
  order: string | { _id: string; status: string; orderCode: string };
  title: string;
  message: string;
  isRead: boolean;
  type: "pending" | "processing" | "delivered" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

const NoticeScreen: React.FC = () => {
  const router = useRouter();
  const [notices, setNotices] = useState<INotice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchNotices = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (!userData) {
        throw new Error("Bạn cần đăng nhập để xem thông báo");
      }

      const { _id: userId } = JSON.parse(userData);
      const response = await fetch(`${ipAddress}/notice/${userId}`);
      if (!response.ok) throw new Error("Lỗi khi gọi API");

      const data: INotice[] = await response.json();
      console.log("data:", data);
      
      setNotices(data);
    } catch (error) {
      console.error("Lỗi khi tải thông báo:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotices();
  };

  const handleCartPress = () => {
    router.push("../page/cart/cart");
  };

  const handelNotice = async (notice: INotice) => {
    try {
      if (!notice.isRead) {
        await fetch(`${ipAddress}/notice/read/${notice._id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isRead: true }),
        });
      }
  
      const orderId =
        typeof notice.order === "string" ? notice.order : notice.order._id;
  
      router.push({
        pathname: "/page/account/acc/order",
        params: { status: notice.type, orderId },
      });
    } catch (error) {
      console.error("Lỗi khi xử lý thông báo:", error);
    }
  };
  
  

  const getNoticeIcon = (type: string) => {
    switch (type) {
      case "pending":
        return "hourglass-outline";
      case "processing":
        return "cog-outline";
      case "delivered":
        return "checkmark-circle-outline";
      case "cancelled":
        return "close-circle-outline";
      default:
        return "notifications-outline";
    }
  };

  const getIconBackground = (type: string) => {
    switch (type) {
      case "pending":
        return "#E8F5E9";
      case "processing":
        return "#FFF8E1";
      case "delivered":
        return "#E3F2FD";
      case "cancelled":
        return "#FFEBEE";
      default:
        return "#E1F5FE";
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case "pending":
        return Colors.primary;
      case "processing":
        return "#FFA000";
      case "delivered":
        return "#0288D1";
      case "cancelled":
        return "#D32F2F";
      default:
        return "#039BE5";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "Vừa xong";
    } else if (diffInSeconds < 3600) {
      return `${Math.floor(diffInSeconds / 60)} phút trước`;
    } else if (diffInSeconds < 86400) {
      return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    } else if (diffInSeconds < 604800) {
      return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    } else {
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
  };

  const renderNoticeItem = ({ item }: { item: INotice }) => (
    <TouchableOpacity
      style={[styles.noticeContainer, !item.isRead && styles.unreadNotice]}
      activeOpacity={0.7}
      onPress={()=>handelNotice(item)}
    >
      <View
        style={[styles.iconContainer, { backgroundColor: getIconBackground(item.type) }]}
      >
        <Ionicons
          name={getNoticeIcon(item.type)}
          size={22}
          color={getIconColor(item.type)}
        />
      </View>

      <View style={styles.noticeContent}>
        <View style={styles.noticeHeader}>
          <Text
            style={[styles.noticeTitle, !item.isRead && styles.unreadText]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          {!item.isRead && <View style={styles.unreadDot} />}
        </View>

        <Text style={styles.noticeMessage} numberOfLines={2}>
          {item.message}
        </Text>

        <View style={styles.noticeFooter}>
          <Text style={styles.noticeTimestamp}>{formatTimeAgo(item.createdAt)}</Text>
          <View style={[styles.typeBadge, { backgroundColor: getIconBackground(item.type) }]}>
            <Text style={[styles.typeBadgeText, { color: getIconColor(item.type) }]}>
              {item.type === "pending"
                ? "Đang chờ"
                : item.type === "processing"
                ? "Đang xử lý"
                : item.type === "delivered"
                ? "Đã giao"
                : "Đã hủy"}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.listHeader}>
      <Text style={styles.listHeaderTitle}>Tất cả thông báo</Text>
      {notices.length > 0 && (
        <Text style={styles.noticeCount}>
          {notices.filter((n) => !n.isRead).length} chưa đọc
        </Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Đang tải thông báo...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Thông báo</Text>
        </View>
        <TouchableOpacity onPress={handleCartPress} style={styles.cartIcon}>
          <Ionicons name="cart-outline" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {notices.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Không có thông báo</Text>
          <Text style={styles.emptyText}>
            Bạn chưa có thông báo nào. Chúng tôi sẽ thông báo khi có tin mới.
          </Text>
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <Text style={styles.refreshButtonText}>Làm mới</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={notices}
          keyExtractor={(item) => item._id}
          renderItem={renderNoticeItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={renderHeader}
        />
      )}
    </View>
  );
};

// Styles remain unchanged
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 50 : StatusBar.currentHeight,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.white,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 3,
    zIndex: 10,
  },
  backButton: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: Colors.background,
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    textAlign: "center",
    letterSpacing: 0.3,
  },
  cartIcon: {
    padding: 8,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 5,
  },
  listHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
  },
  noticeCount: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
  },
  noticeContainer: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: 14,
    marginBottom: 15,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  unreadNotice: {
    backgroundColor: Colors.white,
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  noticeContent: {
    flex: 1,
  },
  noticeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    flex: 1,
  },
  unreadText: {
    color: Colors.text,
    fontWeight: "700",
  },
  noticeMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 10,
    lineHeight: 20,
  },
  noticeFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  noticeTimestamp: {
    fontSize: 12,
    color: Colors.textLight,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
    marginLeft: 10,
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 30,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 20,
  },
  refreshButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: Colors.primary,
    borderRadius: 30,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  refreshButtonText: {
    color: Colors.white,
    fontWeight: "600",
    fontSize: 15,
  },
  listContent: {
    padding: 20,
    paddingTop: 5,
    paddingBottom: 30,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: Colors.textSecondary,
  },
});

export default NoticeScreen;