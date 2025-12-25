import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
  TextInput,
  Modal,
  Platform,
  StatusBar,
  Linking,
  Alert,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Colors } from "../../constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ipAddress } from "../../constants/ip";
import { getShippingFee, getShippingZone, getProvinceCodeFromName } from "../../constants/shippingZones";

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

interface UserData {
  _id: string;
  email: string;
  profile: {
    full_name: string;
    username: string;
    gender: string;
    birthday: string;
    phone: string;
    avatar: string;
    address: string;
  };
}

const Payment = () => {
  const { selectedItems, totalPrice } = useLocalSearchParams();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<"momo" | "cod">("cod");
  const [totalQuantity, setTotalQuantity] = useState<number>(0);
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [editedFullName, setEditedFullName] = useState<string>("");
  const [editedPhone, setEditedPhone] = useState<string>("");
  const [editedStreet, setEditedStreet] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("Đà Nẵng");
  const [selectedCityCode, setSelectedCityCode] = useState<number>(48); // Default to Đà Nẵng
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedWard, setSelectedWard] = useState<string>("");
  const [momoId, setMomoId] = useState<string>("");
  const [modalVisible, setModalVisible] = useState<"city" | "district" | "ward" | null>(null);
  const [modelItems, setModelItems] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [calculatedTotalPrice, setCalculatedTotalPrice] = useState<number>(0);

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Load user data and address from AsyncStorage
  useEffect(() => {
    const fetchUserDataAndAddress = async () => {
      try {
        setIsLoading(true);

        // Load user data
        const storedUserData = await AsyncStorage.getItem("userData");
        if (storedUserData) {
          const parsedUserData = JSON.parse(storedUserData);
          setUserData(parsedUserData);
          setEditedFullName(parsedUserData.profile.full_name);
          setEditedPhone(parsedUserData.profile.phone);
        } else {
          setError("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
        }

        // Load address
        const storedAddress = await AsyncStorage.getItem("address");
        if (storedAddress) {
          const parsedAddress = JSON.parse(storedAddress);
          setEditedFullName(parsedAddress.fullName || "");
          setEditedPhone(parsedAddress.phone || "");
          setEditedStreet(parsedAddress.street || "");
          const city = parsedAddress.city || "Đà Nẵng";
          const cityCode = parsedAddress.cityCode || getProvinceCodeFromName(city);  // Ưu tiên cityCode từ storage
          setSelectedCity(city);
          setSelectedCityCode(cityCode);
          setSelectedDistrict(parsedAddress.district || "");
          setSelectedWard(parsedAddress.ward || "");
        } else {
          // Initialize with default city code if no saved address
          setSelectedCityCode(getProvinceCodeFromName("Đà Nẵng"));
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu từ AsyncStorage:", error);
        setError("Đã xảy ra lỗi khi tải thông tin. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDataAndAddress();
  }, []);

  // Load cart items and calculate totalPrice
  useEffect(() => {
    const loadCartItems = async () => {
      try {
        let items: CartItem[] = [];
        let price: number = 0;

        // Try to load from params first
        if (selectedItems && totalPrice) {
          items = JSON.parse(selectedItems as string);
          price = Number(totalPrice) || 0;
        } else {
          // Fallback to AsyncStorage
          const checkoutData = await AsyncStorage.getItem("checkoutData");
          if (checkoutData) {
            const parsedData = JSON.parse(checkoutData);
            items = parsedData.selectedItems || [];
            price = Number(parsedData.totalPrice) || 0;
          } else {
            setError("Không tìm thấy thông tin đơn hàng. Vui lòng quay lại giỏ hàng.");
            return;
          }
        }

        setCartItems(items);

        // Calculate totalPrice from cartItems if price is NaN or 0
        if (isNaN(price) || price === 0) {
          price = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
        }
        setCalculatedTotalPrice(price);

        const quantity = items.reduce((sum, item) => sum + item.quantity, 0);
        setTotalQuantity(quantity);

        // Calculate shipping fee based on zone
        let fee = 20000; // Default fee for Hà Nội
        if (selectedCityCode && selectedCityCode > 0) {
          fee = getShippingFee(selectedCityCode);
        }
        setShippingFee(fee);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu giỏ hàng:", error);
        setError("Đã xảy ra lỗi khi tải đơn hàng. Vui lòng thử lại.");
      }
    };

    loadCartItems();
  }, [selectedItems, totalPrice, selectedCityCode]);

  // Recalculate shipping fee when city code changes
  useEffect(() => {
    if (selectedCityCode && selectedCityCode > 0) {
      const fee = getShippingFee(selectedCityCode);
      setShippingFee(fee);
    }
  }, [selectedCityCode]);

  const handleSelectAddress = () => {
    router.push({
      pathname: "../address/address_delivery",
      params: {
        fromPayment: "true",
        selectedItems: selectedItems || JSON.stringify(cartItems),
        totalPrice: (totalPrice || calculatedTotalPrice).toString(),
        fullName: editedFullName,
        phone: editedPhone,
        street: editedStreet,
        ward: selectedWard,
        district: selectedDistrict,
        city: selectedCity,
      },
    });
  };

  const handleSelect = (item: string) => {
    if (modalVisible === "city") {
      setSelectedCity(item);
      setSelectedCityCode(getProvinceCodeFromName(item));
      setSelectedDistrict("");
      setSelectedWard("");
    } else if (modalVisible === "district") {
      setSelectedDistrict(item);
      setSelectedWard("");
    } else if (modalVisible === "ward") {
      setSelectedWard(item);
    }
    setModalVisible(null);
  };

  const checkTransactionStatus = async (orderId: string) => {
    if (!userData) {
      Alert.alert("Lỗi", "Không tìm thấy thông tin người dùng.");
      return;
    }

    const startTime = Date.now();
    const timeout = 5 * 60 * 1000; // 5 minutes
    const interval = 10 * 1000; // Check every 10 seconds

    const intervalId = setInterval(async () => {
      try {
        const response = await fetch(`${ipAddress}/check-status-transaction`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId }),
        });

        const result = await response.json();

        if (result.resultCode === 0) {
          // Payment successful
          clearInterval(intervalId);
          const orderData = {
            userId: userData._id,
            items: cartItems.map((item) => ({
              productId: item.product._id,
              quantity: item.quantity,
              price: item.product.price,
            })),
            paymentMethod: paymentMethod,
            name: editedFullName,
            address: `${editedStreet}, ${selectedWard}, ${selectedDistrict}, ${selectedCity}`,
            phone: editedPhone,
            fee: shippingFee,
            total_price: calculatedTotalPrice + shippingFee,
            momoId: orderId,
          };

          const orderResponse = await fetch(`${ipAddress}/api/sellers`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderData),
          });

          if (orderResponse.ok) {
            const seller = await orderResponse.json();
            await fetch(`${ipAddress}/api/notices`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                user: userData._id,
                order: seller.order._id,
                title: "Đơn hàng mới",
                message: `Đơn hàng ${seller.order.orderCode} đã được đặt thành công.`,
                type: "pending",
              }),
            });

            await Promise.all(
              cartItems.map(async (item) => {
                await fetch(`${ipAddress}/api/user-cart/${item._id}`, {
                  method: "DELETE",
                });
              })
            );

            // Clear checkout data
            await AsyncStorage.removeItem("checkoutData");
            router.push("/popup/success/success");
          } else {
            const errorData = await orderResponse.json();
            Alert.alert("Lỗi", errorData.message || "Lưu đơn hàng thất bại.");
          }
        } else if (Date.now() - startTime >= timeout) {
          clearInterval(intervalId);
          Alert.alert("Lỗi", "Thời gian xác nhận thanh toán đã hết. Vui lòng thử lại.");
        }
      } catch (error) {
        console.error("Lỗi khi kiểm tra trạng thái giao dịch:", error);
        if (Date.now() - startTime >= timeout) {
          clearInterval(intervalId);
          Alert.alert("Lỗi", "Thời gian xác nhận thanh toán đã hết. Vui lòng thử lại.");
        }
      }
    }, interval);

    return () => clearInterval(intervalId);
  };

  const handleMomo = async () => {
    if (!userData) {
      Alert.alert("Lỗi", "Không tìm thấy thông tin người dùng.");
      return;
    }

    try {
      const orderData = {
        userId: userData._id,
        items: cartItems.map((item) => ({
          productId: item.product._id,
          quantity: item.quantity,
          price: item.product.price,
        })),
        paymentMethod: paymentMethod,
        name: editedFullName,
        address: `${editedStreet}, ${selectedWard}, ${selectedDistrict}, ${selectedCity}`,
        phone: editedPhone,
        fee: shippingFee,
        total_price: calculatedTotalPrice + shippingFee,
      };

      const response = await fetch(`${ipAddress}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const momoData = await response.json();
        setMomoId(momoData.requestId);
        if (momoData.payUrl) {
          const canOpen = await Linking.canOpenURL(momoData.payUrl);
          if (canOpen) {
            await Linking.openURL(momoData.payUrl);
            await AsyncStorage.setItem("pendingMomoOrderId", momoData.orderId);
            checkTransactionStatus(momoData.orderId);
          } else {
            Alert.alert("Lỗi", "Không thể mở liên kết thanh toán MoMo. Vui lòng thử lại.");
          }
        } else {
          Alert.alert("Lỗi", "Không nhận được liên kết thanh toán từ MoMo.");
        }
      } else {
        const errorData = await response.json();
        Alert.alert("Lỗi", errorData.message || "Đặt hàng thất bại. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Lỗi khi thanh toán qua MoMo:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra khi thanh toán qua MoMo. Vui lòng thử lại.");
    }
  };

  const handlePay = async () => {
    if (!userData) {
      Alert.alert("Lỗi", "Không tìm thấy thông tin người dùng.");
      return;
    }

    if (!editedFullName || !editedPhone || !editedStreet || !selectedWard || !selectedDistrict || !selectedCity) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin địa chỉ.");
      return;
    }

    try {
      const orderData = {
        userId: userData._id,
        items: cartItems.map((item) => ({
          productId: item.product._id,
          quantity: item.quantity,
          price: item.product.price,
        })),
        paymentMethod: paymentMethod,
        name: editedFullName,
        address: `${editedStreet}, ${selectedWard}, ${selectedDistrict}, ${selectedCity}`,
        phone: editedPhone,
        fee: shippingFee,
        total_price: calculatedTotalPrice + shippingFee,
      };

      const response = await fetch(`${ipAddress}/api/sellers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const seller = await response.json();
        await fetch(`${ipAddress}/api/notices`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user: userData._id,
            order: seller.order._id,
            title: "Đơn hàng mới",
            message: `Đơn hàng ${seller.order.orderCode} đã được đặt thành công.`,
            type: "pending",
          }),
        });

        await Promise.all(
          cartItems.map(async (item) => {
            await fetch(`${ipAddress}/api/user-cart/${item._id}`, {
              method: "DELETE",
            });
          })
        );

        // Clear checkout data
        await AsyncStorage.removeItem("checkoutData");
        router.push("/popup/success/success");
      } else {
        const errorData = await response.json();
        Alert.alert("Lỗi", errorData.message || "Đặt hàng thất bại. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Lỗi khi đặt hàng:", error);
      Alert.alert("Lỗi", "Có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.itemContainer}>
      <Image
        source={{ uri: `${ipAddress}/${item.product.image}` }}
        style={styles.itemImage}
      />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={1}>
          {item.product.name.toUpperCase()}
        </Text>
        <Text style={styles.itemQuantity}>Số lượng: {item.quantity}</Text>
        <Text style={styles.itemPrice}>
          {formatPrice(item.product.price * item.quantity)} ₫
        </Text>
      </View>
    </View>
  );

  const renderModelItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => handleSelect(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.modalItemText}>{item}</Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </View>
    );
  }

  if (error || cartItems.length === 0) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
        <Ionicons name="alert-circle-outline" size={60} color={Colors.primary} />
        <Text style={styles.errorText}>{error || "Không có sản phẩm để thanh toán."}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Thanh toán</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Thông tin địa chỉ</Text>
          </View>
          <TouchableOpacity
            style={styles.addressContainer}
            onPress={handleSelectAddress}
            activeOpacity={0.7}
          >
            <Text style={styles.addressText}>
              <Text style={styles.addressLabel}>Họ tên: </Text>
              {editedFullName || "Đang tải..."}
            </Text>
            <Text style={styles.addressText}>
              <Text style={styles.addressLabel}>Địa chỉ: </Text>
              {editedStreet ? `${editedStreet}, ${selectedWard}, ${selectedDistrict}, ${selectedCity}` : "Đang tải..."}
            </Text>
            <Text style={styles.addressText}>
              <Text style={styles.addressLabel}>Số điện thoại: </Text>
              {editedPhone || "Đang tải..."}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sản phẩm</Text>
          <FlatList
            data={cartItems}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
            contentContainerStyle={styles.listContent}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          <TouchableOpacity
            style={styles.radioContainer}
            onPress={() => setPaymentMethod("cod")}
            activeOpacity={0.7}
          >
            <Ionicons
              name={paymentMethod === "cod" ? "radio-button-on" : "radio-button-off"}
              size={20}
              color={Colors.primary}
            />
            <Text style={styles.radioText}>Thanh toán khi nhận hàng</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.radioContainer}
            onPress={() => setPaymentMethod("momo")}
            activeOpacity={0.7}
          >
            <Ionicons
              name={paymentMethod === "momo" ? "radio-button-on" : "radio-button-off"}
              size={20}
              color={Colors.primary}
            />
            <Text style={styles.radioText}>Thanh toán qua ví MoMo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chi tiết thanh toán</Text>
          <View style={styles.detailContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tổng tiền hàng</Text>
              <Text style={styles.detailValue}>
                {formatPrice(calculatedTotalPrice)} ₫
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Chi phí vận chuyển</Text>
              <View>
                <Text style={styles.detailValue}>
                  {formatPrice(shippingFee)} ₫
                </Text>
                {selectedCityCode > 0 && (
                  <Text style={styles.zoneText}>
                    ({getShippingZone(selectedCityCode)})
                  </Text>
                )}
              </View>
            </View>
            <View style={styles.paymentRowTotal}>
              <Text style={styles.paymentLabelTotal}>Tổng thanh toán:</Text>
              <Text style={styles.paymentValueTotal}>
                {formatPrice(calculatedTotalPrice + shippingFee)} ₫
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={!!modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(null)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {modalVisible === "city"
                ? "Chọn thành phố"
                : modalVisible === "district"
                ? "Chọn quận/huyện"
                : "Chọn phường/xã"}
            </Text>
            <FlatList
              data={modelItems}
              renderItem={renderModelItem}
              keyExtractor={(item) => item}
              style={styles.modalList}
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(null)}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {paymentMethod === "cod" ? (
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handlePay}
          activeOpacity={0.7}
        >
          <Text style={styles.confirmText}>Xác nhận thanh toán</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleMomo}
          activeOpacity={0.7}
        >
          <Text style={styles.confirmText}>Thanh toán với ví MoMo</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

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
  },
  headerButton: {
    padding: 8,
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
    letterSpacing: 0.3,
    marginRight: 40,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 120,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: 20,
  },
  addressContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingTop:20,
    paddingBottom:5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  addressText: {
    fontSize: 15,
    color: Colors.textSecondary,
    paddingBottom: 15,
    lineHeight: 22,
  },
  zoneText:{
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    marginLeft: 3,
  },
  addressLabel: {
    fontWeight: "600",
    color: Colors.text,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    fontSize: 15,
    color: Colors.text,
    height: 48,
  },
  selectField: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    height: 48,
  },
  selectText: {
    fontSize: 15,
    color: Colors.text,
  },
  disabled: {
    backgroundColor: Colors.background,
    borderColor: Colors.border,
    opacity: 0.5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginHorizontal: 6,
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  cancelButton: {
    backgroundColor: Colors.textSecondary,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
    padding: 20,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 16,
  },
  modalList: {
    marginBottom: 16,
  },
  modalItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalItemText: {
    fontSize: 15,
    color: Colors.text,
  },
  closeButton: {
    padding: 14,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    alignItems: "center",
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  itemImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    marginRight: 16,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 6,
  },
  itemQuantity: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.primary,
  },
  radioContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  radioText: {
    fontSize: 15,
    color: Colors.text,
    marginLeft: 12,
  },
  detailContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  detailLabel: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  detailValue: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
  },
  paymentRowTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    marginTop: 4,
  },
  paymentLabelTotal: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  paymentValueTotal: {
    fontSize: 18,
    fontWeight: "700",
    color: Colors.primary,
  },
  confirmButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    marginBottom: 10,
  },
  confirmText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  listContent: {
    paddingVertical: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.white,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.text,
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.white,
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: Colors.text,
    textAlign: "center",
    marginTop: 10,
  },
  backButton: {
    backgroundColor: Colors.primary,
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  backButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "600",
  },
});

export default Payment;