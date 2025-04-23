import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { ipAddress } from "@/app/constants/ip";
import { Colors } from "../constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Product {
  _id: string;
  name: string;
  price: number;
  info: string;
  image: string;
  status: "available" | "out_of_stock";
  evaluate: number;
  category: string;
  plant: string;
}

interface CartItem {
  _id: string;
  quantity: number;
  product: Product;
  user: string;
}

const Cart = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  useEffect(() => {
    const getUserId = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem("userData");
        if (storedUserData) {
          const userData = JSON.parse(storedUserData);
          const fetchedUserId = userData._id;
          console.log("userId từ userData:", fetchedUserId);
          setUserId(fetchedUserId);
        } else {
          console.error("Không tìm thấy userData trong AsyncStorage");
        }
      } catch (error) {
        console.error("Lỗi khi lấy userData từ AsyncStorage:", error);
      }
    };
    getUserId();
  }, []);

  const fetchCartItems = async () => {
    if (!userId) {
      console.error("Không có userId để lấy giỏ hàng");
      return;
    }
    try {
      const response = await fetch(`${ipAddress}/api/user-cart/${userId}`);
      const data: CartItem[] = await response.json();
      console.log("Phản hồi API:", data);
      if (response.ok) {
        setCartItems(data);
        calculateTotalPrice(data);
      } else {
        console.error("Lỗi khi lấy giỏ hàng:", data || "Lỗi không xác định");
      }
    } catch (error) {
      console.error("Lỗi khi lấy giỏ hàng:", error);
    }
  };

  const calculateTotalPrice = (items: CartItem[]) => {
    const total = items.reduce(
      (sum: number, item: CartItem) => sum + item.product.price * item.quantity,
      0
    );
    setTotalPrice(total);
  };

  const updateQuantity = async (cartId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      const response = await fetch(`${ipAddress}/api/user-cart/${cartId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity }),
      });
      const updatedItem: CartItem = await response.json();
      if (response.ok) {
        setCartItems((prevItems: CartItem[]) =>
          prevItems.map((item: CartItem) =>
            item._id === cartId
              ? { ...item, quantity: updatedItem.quantity }
              : item
          )
        );
        calculateTotalPrice(
          cartItems.map((item: CartItem) =>
            item._id === cartId
              ? { ...item, quantity: updatedItem.quantity }
              : item
          )
        );
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật số lượng:", error);
    }
  };

  const removeItem = async (cartId: string) => {
    try {
      const response = await fetch(`${ipAddress}/api/user-cart/${cartId}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (response.ok) {
        setCartItems((prevItems: CartItem[]) =>
          prevItems.filter((item: CartItem) => item._id !== cartId)
        );
        calculateTotalPrice(
          cartItems.filter((item: CartItem) => item._id !== cartId)
        );
      }
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchCartItems();
    }
  }, [userId]);

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.item__container}>
      <Image
        source={{ uri: item.product.image }}
        style={styles.item__image}
      />
      <View style={styles.item__details}>
        <View style={styles.left__column}>
          <Text style={styles.item__name}>{item.product.name.toUpperCase()}</Text>
          <View style={styles.quantity__container}>
            <TouchableOpacity
              onPress={() => updateQuantity(item._id, item.quantity - 1)}
              style={styles.quantity__button}
            >
              <Text style={styles.button__text}>−</Text>
            </TouchableOpacity>
            <Text style={styles.quantity__text}>{item.quantity}</Text>
            <TouchableOpacity
              onPress={() => updateQuantity(item._id, item.quantity + 1)}
              style={styles.quantity__button}
            >
              <Text style={styles.button__text}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.right__column}>
          <TouchableOpacity
            onPress={() => removeItem(item._id)}
            style={styles.remove__button}
          >
            <Text style={styles.remove__text}>×</Text>
          </TouchableOpacity>
          <Text style={styles.item__price}>
            {formatPrice(item.product.price)} VND
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.header__button}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.header__title}>Giỏ hàng</Text>
        <View style={styles.header__spacer} />
      </View>
      {cartItems.length === 0 ? (
        <Text style={styles.empty}>Giỏ hàng của bạn trống.</Text>
      ) : (
        <FlatList
          data={cartItems}
          renderItem={renderItem}
          keyExtractor={(item: CartItem) => item._id}
          contentContainerStyle={styles.list}
        />
      )}
      <TouchableOpacity style={styles.checkout__button}>
        <Text style={styles.checkout__text}>Đi đến thanh toán</Text>
        <Text style={styles.checkout__price}>
          {formatPrice(totalPrice)} VND
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 20,
    marginTop: Platform.OS === "android" ? 50 : 0,
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  header__title: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  header__button: {
    padding: 8,
  },
  header__spacer: {
    width: 24,
  },
  empty: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  list: {
    paddingBottom: 100,
  },
  item__container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  item__image: {
    width: 70,
    height: 70,
    marginRight: 15,
    borderRadius: 20,
  },
  item__details: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  left__column: {
    flex: 1,
    justifyContent: "space-between",
  },
  right__column: {
    justifyContent: "center",
    alignItems: "flex-end",
  },
  item__name: {
    fontSize: 16,
    fontWeight: "500",
    color: "black",
    marginTop: 15,
  },
  quantity__container: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantity__button: {
    width: 35,
    height: 35,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  button__text: {
    fontSize: 18,
    color: Colors.primary,
    fontWeight: "bold",
  },
  quantity__text: {
    fontSize: 18,
    marginHorizontal: 15,
    color: "black",
  },
  remove__button: {
    paddingVertical: 5,
    marginBottom: 20,
  },
  remove__text: {
    fontSize: 30,
    color: "#666",
  },
  item__price: {
    fontSize: 18,
    fontWeight: "500",
    color: Colors.primary,
  },
  checkout__button: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: Colors.primary,
    paddingVertical: 20,
    borderRadius: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  checkout__text: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  checkout__price: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default Cart;