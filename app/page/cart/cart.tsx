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
import { Colors } from "../../constants/Colors";
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
  const [selectAll, setSelectAll] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

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
          console.log("Không tìm thấy userData trong AsyncStorage");
        }
      } catch (error) {
        console.log("Lỗi khi lấy userData từ AsyncStorage:", error);
      }
    };
    getUserId();
  }, []);

  const calculateTotalPrice = (items: CartItem[], selected: string[]) => {
    const total = items
      .filter((item) => selected.includes(item._id))
      .reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    setTotalPrice(total);
  };

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
        setSelectedItems([]);
        calculateTotalPrice(data, []);
      } else {
        console.error("Lỗi khi lấy giỏ hàng:", data || "Lỗi không xác định");
      }
    } catch (error) {
      console.error("Lỗi khi lấy giỏ hàng:", error);
    }
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
        const updatedItems = cartItems.map((item: CartItem) =>
          item._id === cartId
            ? { ...item, quantity: updatedItem.quantity }
            : item
        );
        setCartItems(updatedItems);
        calculateTotalPrice(updatedItems, selectedItems);
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
        const updatedItems = cartItems.filter(
          (item: CartItem) => item._id !== cartId
        );
        setCartItems(updatedItems);
        setSelectedItems((prev) => prev.filter((id) => id !== cartId));
        calculateTotalPrice(
          updatedItems,
          selectedItems.filter((id) => id !== cartId)
        );
      }
    } catch (error) {
      console.error("Lỗi khi xóa sản phẩm:", error);
    }
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
      calculateTotalPrice(cartItems, []);
    } else {
      const allItemIds = cartItems.map((item) => item._id);
      setSelectedItems(allItemIds);
      calculateTotalPrice(cartItems, allItemIds);
    }
    setSelectAll(!selectAll);
  };

  const toggleItemSelection = (cartId: string) => {
    setSelectedItems((prev) => {
      if (prev.includes(cartId)) {
        const newSelection = prev.filter((id) => id !== cartId);
        setSelectAll(false);
        calculateTotalPrice(cartItems, newSelection);
        return newSelection;
      } else {
        const newSelection = [...prev, cartId];
        if (newSelection.length === cartItems.length) {
          setSelectAll(true);
        }
        calculateTotalPrice(cartItems, newSelection);
        return newSelection;
      }
    });
  };

  useEffect(() => {
    if (userId) {
      fetchCartItems();
    }
  }, [userId]);

  useEffect(() => {
    calculateTotalPrice(cartItems, selectedItems);
  }, [cartItems, selectedItems]);

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.item__container}>
      <View style={styles.left__column}>
        <TouchableOpacity
          style={styles.item__checkbox}
          onPress={() => toggleItemSelection(item._id)}
        >
          <Ionicons
            name={
              selectedItems.includes(item._id) ? "checkbox" : "square-outline"
            }
            size={24}
            color={Colors.primary}
          />
        </TouchableOpacity>
      </View>
      <Image source={{ uri: `${ipAddress}/${item.product.image}` }} style={styles.item__image} />
      <View style={styles.item__details}>
        <View style={styles.mid_column}>
          <Text style={styles.item__name}>
            {item.product.name.toUpperCase()}
          </Text>
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
            {formatPrice(item.product.price)} ₫
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
    <View style={styles.header}>
    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
      <Ionicons name="chevron-back" size={24} color={Colors.text} />
    </TouchableOpacity>
    <View style={styles.headerCenter}>
      <Text style={styles.headerTitle}>Giỏ hàng của bạn</Text>
    </View>
    <TouchableOpacity   onPress={() => router.push("../message/message")} style={styles.cartIcon}>
      <Ionicons name="chatbubble-outline" size={20} color={Colors.white} />
    </TouchableOpacity>
  </View>

    <View style={styles.main}>
      
      {cartItems.length === 0 ? (
        <Text style={styles.empty}>Giỏ hàng của bạn trống.</Text>
      ) : (
        <View style={{ flex: 1 }}>
          <TouchableOpacity
            style={styles.checkbox__container}
            onPress={toggleSelectAll}
          >
            <Ionicons
              name={selectAll ? "checkbox" : "square-outline"}
              size={24}
              color={Colors.primary}
            />
            <Text style={styles.checkbox__text}>Chọn tất cả</Text>
          </TouchableOpacity>
          <FlatList
            data={cartItems}
            renderItem={renderItem}
            keyExtractor={(item: CartItem) => item._id}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        </View>
      )}
      <TouchableOpacity
        style={[
          styles.checkout__button,
          selectedItems.length === 0 && { opacity: 0.5 },
        ]}
        disabled={selectedItems.length === 0}
        onPress={() => {
          if (selectedItems.length > 0) {
            const selectedCartItems = cartItems.filter((item) =>
              selectedItems.includes(item._id)
            );
            router.push({
              pathname: "../payment/payment",
              params: {
                selectedItems: JSON.stringify(selectedCartItems),
                totalPrice: totalPrice.toString(),
              },
            });
          }
        }}
      >
        <Text style={styles.checkout__text}>Đi đến thanh toán</Text>
        <Text style={styles.checkout__price}>{formatPrice(totalPrice)} ₫</Text>
      </TouchableOpacity>
    </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  main:{
    flex: 1,
    paddingHorizontal:15
  },
  header: {
     paddingTop: 50,
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
     marginBottom:10
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
  title__container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  message__button: {
    padding: 8,
  },
  empty: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
  },
  checkbox__container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  checkbox__text: {
    fontSize: 16,
    marginLeft: 10,
    color: Colors.primary,
  },
  item__container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    margin: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  item__checkbox: {
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  item__image: {
    width: 60,
    height: 60,
    marginRight: 15,
    borderRadius: 20,
  },
  item__details: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  left__column: {
    justifyContent: "center",
    alignItems: "center",
  },
  mid_column: {
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  right__column: {
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  item__name: {
    fontSize: 14,
    fontWeight: "500",
    color: "black",
    marginTop: 5,
    marginBottom: 25,
  },
  quantity__container: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantity__button: {
    width: 35,
    height: 35,
    marginBottom: 5,
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
    fontSize: 14,
    marginHorizontal: 10,
    color: "black",
  },
  remove__button: {
    marginTop: -7,
  },
  remove__text: {
    fontSize: 30,
    color: "#666",
  },
  item__price: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.primary,
    marginBottom: 10,
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