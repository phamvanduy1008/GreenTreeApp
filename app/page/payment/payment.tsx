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
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Colors } from "../../constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { places } from "../../constants/places";
import { ipAddress } from "../../constants/ip";

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
  const [paymentMethod, setPaymentMethod] = useState<"qr" | "cod">("cod");
  const [totalQuantity, setTotalQuantity] = useState<number>(0);
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editedFullName, setEditedFullName] = useState<string>("");
  const [editedPhone, setEditedPhone] = useState<string>("");
  const [editedStreet, setEditedStreet] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("Đà Nẵng");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");
  const [selectedWard, setSelectedWard] = useState<string>("");
  const [modalVisible, setModalVisible] = useState<
    "city" | "district" | "ward" | null
  >(null);
  const [model__items, setmodel__items] = useState<string[]>([]);

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem("userData");
        if (storedUserData) {
          const parsedUserData = JSON.parse(storedUserData);
          setUserData(parsedUserData);
          setEditedFullName(parsedUserData.profile.full_name);
          setEditedPhone(parsedUserData.profile.phone);

          const addressParts = parsedUserData.profile.address.split(", ");
          if (addressParts.length === 4) {
            setEditedStreet(addressParts[0]);
            setSelectedWard(addressParts[1]);
            setSelectedDistrict(addressParts[2]);
            setSelectedCity(addressParts[3]);
          } else {
            setEditedStreet("");
            setSelectedWard("");
            setSelectedDistrict("");
            setSelectedCity("Đà Nẵng");
          }
        } else {
          console.error("Không tìm thấy userData trong AsyncStorage");
        }
      } catch (error) {
        console.error(
          "Lỗi khi lấy thông tin người dùng từ AsyncStorage:",
          error
        );
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    if (selectedItems) {
      const parsedItems: CartItem[] = JSON.parse(selectedItems as string);
      setCartItems(parsedItems);
      const quantity = parsedItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      setTotalQuantity(quantity);

      let fee = 0;
      if (quantity < 20) {
        fee = 20000;
      } else if (quantity < 30) {
        fee = 30000;
      } else if (quantity < 40) {
        fee = 40000;
      } else if (quantity < 50) {
        fee = 50000;
      } else {
        fee = 60000;
      }
      setShippingFee(fee);
    }
  }, [selectedItems]);

  const saveUserData = async () => {
    if (!userData) return;
    if (
      !editedFullName ||
      !editedPhone ||
      !editedStreet ||
      !selectedWard ||
      !selectedDistrict
    ) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (!/^\d{10}$/.test(editedPhone)) {
      alert("Số điện thoại phải có 10 chữ số");
      return;
    }
    if (!places[selectedCity]?.[selectedDistrict]?.includes(selectedWard)) {
      alert("Địa chỉ không hợp lệ");
      return;
    }
    try {
      const updatedAddress = `${editedStreet}, ${selectedWard}, ${selectedDistrict}, ${selectedCity}`;
      const updatedUserData = {
        ...userData,
        profile: {
          ...userData.profile,
          full_name: editedFullName,
          phone: editedPhone,
          address: updatedAddress,
        },
      };

      await AsyncStorage.setItem("userData", JSON.stringify(updatedUserData));
      setUserData(updatedUserData);
      setIsEditing(false);
    } catch (error) {
      console.error("Lỗi khi lưu thông tin người dùng:", error);
    }
  };

  const cancelEditing = () => {
    if (userData) {
      setEditedFullName(userData.profile.full_name);
      setEditedPhone(userData.profile.phone);
      const addressParts = userData.profile.address.split(", ");
      if (addressParts.length === 4) {
        setEditedStreet(addressParts[0]);
        setSelectedWard(addressParts[1]);
        setSelectedDistrict(addressParts[2]);
        setSelectedCity(addressParts[3]);
      } else {
        setEditedStreet("");
        setSelectedWard("");
        setSelectedDistrict("");
        setSelectedCity("Đà Nẵng");
      }
    }
    setIsEditing(false);
  };

  const openModal = (type: "city" | "district" | "ward") => {
    let items: string[] = [];
    if (type === "city") {
      items = ["Đà Nẵng"];
    } else if (type === "district" && selectedCity && places[selectedCity]) {
      items = Object.keys(places[selectedCity]);
    } else if (
      type === "ward" &&
      selectedCity &&
      selectedDistrict &&
      places[selectedCity]?.[selectedDistrict]
    ) {
      items = places[selectedCity][selectedDistrict];
    }
    setmodel__items(items);
    setModalVisible(type);
  };

  const handleSelect = (item: string) => {
    if (modalVisible === "city") {
      setSelectedCity(item);
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

  const renderItem = ({ item }: { item: CartItem }) => (
    <View style={styles.itemContainer}>
      <Image source={{ uri: `${ipAddress}/${item.product.image}` }} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={1}>{item.product.name.toUpperCase()}</Text>
        <Text style={styles.itemQuantity}>Số lượng: {item.quantity}</Text>
        <Text style={styles.itemPrice}>
          {formatPrice(item.product.price * item.quantity)} ₫
        </Text>
      </View>
    </View>
  );

  const rendermodel__item = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => handleSelect(item)}
      activeOpacity={0.7}
    >
      <Text style={styles.modalItemText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.white} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={() => router.back()}>
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
        {/* Address Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Thông tin địa chỉ</Text>
            {!isEditing && (
              <TouchableOpacity style={{marginTop:-17}} onPress={() => setIsEditing(true)} activeOpacity={0.7}>
                <Ionicons name="pencil" size={18} color={Colors.primary} />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.addressContainer}>
            {isEditing ? (
              <>
                <TextInput
                  style={styles.input}
                  value={editedFullName}
                  onChangeText={setEditedFullName}
                  placeholder="Họ tên"
                  placeholderTextColor={Colors.textLight}
                />
                <TextInput
                  style={styles.input}
                  value={editedPhone}
                  onChangeText={setEditedPhone}
                  placeholder="Số điện thoại"
                  placeholderTextColor={Colors.textLight}
                  keyboardType="phone-pad"
                />
                <TextInput
                  style={styles.input}
                  value={editedStreet}
                  onChangeText={setEditedStreet}
                  placeholder="Số nhà, tên đường"
                  placeholderTextColor={Colors.textLight}
                />
                <TouchableOpacity
                  style={styles.selectField}
                  onPress={() => openModal("city")}
                  activeOpacity={0.7}
                >
                  <Text style={styles.selectText}>
                    {selectedCity || "Chọn thành phố"}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color={Colors.text} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.selectField, !selectedCity && styles.disabled]}
                  onPress={() => openModal("district")}
                  disabled={!selectedCity}
                  activeOpacity={0.7}
                >
                  <Text style={styles.selectText}>
                    {selectedDistrict || "Chọn quận/huyện"}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color={Colors.text} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.selectField, !selectedDistrict && styles.disabled]}
                  onPress={() => openModal("ward")}
                  disabled={!selectedDistrict}
                  activeOpacity={0.7}
                >
                  <Text style={styles.selectText}>
                    {selectedWard || "Chọn phường/xã"}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color={Colors.text} />
                </TouchableOpacity>
                <View style={styles.buttonContainer}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.saveButton]}
                    onPress={saveUserData}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.buttonText}>Lưu</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={cancelEditing}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.buttonText}>Hủy</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.addressText}>
                  <Text style={styles.addressLabel}>Họ tên: </Text>
                  {userData?.profile.full_name || "Đang tải..."}
                </Text>
                <Text style={styles.addressText}>
                  <Text style={styles.addressLabel}>Địa chỉ: </Text>
                  {userData?.profile.address || "Đang tải..."}
                </Text>
                <Text style={styles.addressText}>
                  <Text style={styles.addressLabel}>Số điện thoại: </Text>
                  {userData?.profile.phone || "Đang tải..."}
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Product List Section */}
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

        {/* Payment Method Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          <TouchableOpacity
            style={styles.radioContainer}
            onPress={() => setPaymentMethod("cod")}
            activeOpacity={0.7}
          >
            <Ionicons
              name={
                paymentMethod === "cod" ? "radio-button-on" : "radio-button-off"
              }
              size={20}
              color={Colors.primary}
            />
            <Text style={styles.radioText}>Thanh toán khi nhận hàng</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.radioContainer}
            onPress={() => setPaymentMethod("qr")}
            activeOpacity={0.7}
          >
            <Ionicons
              name={
                paymentMethod === "qr" ? "radio-button-on" : "radio-button-off"
              }
              size={20}
              color={Colors.primary}
            />
            <Text style={styles.radioText}>Thanh toán qua QR code</Text>
          </TouchableOpacity>
          {paymentMethod === "qr" && (
            <Image
              source={require("../../../assets/images/payment/qr.png")}
              style={styles.qr}
            />
          )}
        </View>

        {/* Payment Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chi tiết thanh toán</Text>
          <View style={styles.detailContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tổng tiền hàng</Text>
              <Text style={styles.detailValue}>
                {formatPrice(Number(totalPrice))} ₫
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Chi phí vận chuyển</Text>
              <Text style={styles.detailValue}>
                {formatPrice(shippingFee)} ₫
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tổng thanh toán</Text>
              <Text style={styles.detailValue}>
                {formatPrice(Number(totalPrice) + shippingFee)} ₫
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Selection Modal */}
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
              data={model__items}
              renderItem={rendermodel__item}
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

      <TouchableOpacity
        style={styles.confirmButton}
        onPress={async () => {
          if (!userData) {
            alert("Không tìm thấy thông tin người dùng");
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
              name: userData.profile.full_name,
              address: userData.profile.address,
              phone: userData.profile.phone,
              fee: shippingFee,
              total_price: Number(totalPrice) + shippingFee,
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

              router.push("../../popup/success/success");
            } else {
              const errorData = await response.json();
              alert(
                errorData.message || "Đặt hàng thất bại. Vui lòng thử lại."
              );
            }
          } catch (error) {
            console.error("Lỗi khi đặt hàng:", error);
            alert("Có lỗi xảy ra. Vui lòng thử lại.");
          }
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.confirmText}>
          {paymentMethod === "cod" ? "Mua hàng" : "Xác nhận thanh toán"}
        </Text>
      </TouchableOpacity>
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
    marginBottom:20
  },
  addressContainer: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20, // Tăng padding để thoáng hơn
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  addressText: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 10,
    lineHeight: 22,
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
  qr: {
    width: 180,
    height: 180,
    alignSelf: "center",
    marginVertical: 16,
    borderRadius: 12,
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
  },
  confirmText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  listContent: {
    paddingVertical: 4,
  },
});

export default Payment;