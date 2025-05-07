import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ipAddress } from "@/app/constants/ip";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  status: string;
  image: string;
  evaluate: number;
  info?: string;
  category?: string;
  plant?: string;
};

const FavouriteItem = () => {
  const router = useRouter();
  const [favourites, setFavourites] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const fetchFavourites = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        if (!userData) {
          setError("Bạn cần đăng nhập để xem danh sách yêu thích.");
          setLoading(false);
          return;
        }

        const user = JSON.parse(userData);
        const userId = user._id;

        const response = await fetch(`${ipAddress}/api/favourites/${userId}`);
        if (!response.ok) {
          throw new Error("Không thể lấy danh sách yêu thích");
        }

        const favouriteData = await response.json();
        const products = favouriteData.products || [];
        setFavourites(products);
        setLoading(false);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định"
        );
        setLoading(false);
        console.error("Lỗi khi lấy danh sách yêu thích:", err);
      }
    };

    fetchFavourites();
  }, []);

  const handleGoBack = () => {
    router.back();
  };
  const handleAddToBasket = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (!userData) {
        setError("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng.");
        return;
      }

      const user = JSON.parse(userData);
      const userId = user._id;

      for (const product of favourites) {
        if (product.status !== "out_of_stock") {
          const response = await fetch(`${ipAddress}/api/cart`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              product: product._id,
              user: userId,
              quantity: 1,
            }),
          });

          if (!response.ok) {
            throw new Error(`Thêm sản phẩm ${product.name} thất bại`);
          }
        }
      }

      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 1500);
    } catch (error) {
      console.error("Lỗi thêm vào giỏ hàng:", error);
      setError("Lỗi khi thêm vào giỏ hàng");
    }
  };

  const handleProductPress = (productId: string) => {
    router.push(`/page/productDetail/${productId}`);
  };

  const formatPrice = (price: number): string => {
    return `${price.toLocaleString("vi-VN")} Đ`;
  };

  const handleRemoveFavorite = async (productId: string) => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (!userData) return;

      const user = JSON.parse(userData);
      const userId = user._id;

      const response = await fetch(
        `${ipAddress}/api/favourites/${userId}/${productId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setFavourites((prev) => prev.filter((item) => item._id !== productId));
      }
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm yêu thích:", error);
    }
  };

  const renderProductItem = ({ item }: { item: Product }) => (
    <TouchableOpacity
      style={styles.notificationCard}
      onPress={() => handleProductPress(item._id)}
      activeOpacity={0.9}
    >
      <View style={styles.cardContent}>
        <Image
          source={
            item.image
              ? { uri: `${ipAddress}/${item.image}` }
              : require("../../../assets/images/test.png")
          }
          style={styles.productImage}
          resizeMode="cover"
        />
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {item.name || "Tên sản phẩm"}
          </Text>
          <Text style={styles.subtitle}>
            {item.price ? formatPrice(item.price) : "0 VNĐ"}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.iconContainer}
          onPress={() => handleRemoveFavorite(item._id)}
        >
          <Ionicons name="heart" size={28} color="#FF6B6B" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="heart-dislike-outline" size={80} color="#FF6B6B" />
      <Text style={styles.emptyText}>
        Danh sách yêu thích của bạn đang trống
      </Text>
      <TouchableOpacity
        style={styles.shopButton}
        onPress={() => router.push("/(tabs)/shop")}
      >
        <Text style={styles.shopButtonText}>Mua sắm ngay</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Đang tải danh sách yêu thích...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Ionicons name="alert-circle-outline" size={60} color="#FF3B30" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={handleGoBack} style={styles.goBackButton}>
          <Text style={styles.goBackText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Danh sách yêu thích</Text>
          <View style={styles.headerRightPlaceholder} />
        </View>
        <View style={styles.countContainer}>
          <Text style={styles.countText}>Tất cả lượt thích</Text>
          <Text style={styles.countBadge}>{favourites.length} sản phẩm</Text>
        </View>
        <FlatList
          data={favourites}
          renderItem={renderProductItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={[
            styles.productList,
            favourites.length === 0 && styles.emptyListContainer,
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyList}
        />
        {showPopup && (
          <View style={styles.popupContainer}>
            <View style={styles.popup}>
              <Text style={styles.popupIcon}>🛒</Text>
              <Text style={styles.popupText}>Đã thêm thành công!</Text>
            </View>
          </View>
        )}

        <View style={styles.fixedButtonContainer}>
          <TouchableOpacity
            style={styles.addToBasketButton}
            onPress={handleAddToBasket}
          >
            <Text style={styles.addToBasketText}>Thêm tất cả vào giỏ hàng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
    backgroundColor: "#FFFFFF",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333333",
  },
  headerRightPlaceholder: {
    width: 40,
  },
  countContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  countText: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "500",
  },
  countBadge: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "600",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  productList: {
    padding: 12,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginVertical: 8,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#4CAF50",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFF1F1",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 16,
    elevation: 2,
    shadowColor: "#FF6B6B",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "700",
    marginBottom: 6,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 20,
  },
  errorText: {
    textAlign: "center",
    color: "#FF3B30",
    fontSize: 16,
    marginTop: 12,
    marginBottom: 20,
  },
  goBackButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#FF6B6B",
    borderRadius: 8,
  },
  goBackText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 20,
    marginBottom:180,
  },
  emptyText: {
    fontSize: 16,
    color: "#666666",
    marginVertical: 16,
    textAlign: "center",
  },
  shopButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  shopButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
  fixedButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: "#FFFFFF",
    paddingBottom: 30,
  },
  addToBasketButton: {
    backgroundColor: "#53B175",
    borderRadius: 18,
    padding: 16,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#B0B0B0",
  },
  addToBasketText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  popupIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  popupContainer: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
    alignItems: "center",
    zIndex: 999,
  },
  popup: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  popupText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
});

export default FavouriteItem;
