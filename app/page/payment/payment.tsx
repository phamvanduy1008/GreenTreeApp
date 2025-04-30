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

      const response = await fetch(`${ipAddress}/api/users/${userData._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile: {
            full_name: editedFullName,
            phone: editedPhone,
            address: updatedAddress,
          },
        }),
      });

      if (response.ok) {
        console.log("Cập nhật thông tin người dùng thành công");
        setIsEditing(false);
      } else {
        console.error("Lỗi khi cập nhật thông tin người dùng qua API");
      }
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
    console.log(
      "Opening modal for:",
      type,
      "Selected City:",
      selectedCity,
      "Selected District:",
      selectedDistrict,
      "Items:",
      items
    );
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
    <View style={styles.item__container}>
      <Image source={{ uri: `${ipAddress}/${item.product.image}` }} style={styles.item__image} />
      <View style={styles.item__details}>
        <Text style={styles.item__name}>{item.product.name.toUpperCase()}</Text>
        <Text style={styles.item__quantity}>Số lượng: {item.quantity}</Text>
        <Text style={styles.item__price}>
          {formatPrice(item.product.price * item.quantity)} ₫
        </Text>
      </View>
    </View>
  );

  const rendermodel__item = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.model__item}
      onPress={() => handleSelect(item)}
    >
      <Text style={styles.item__text}>{item}</Text>
    </TouchableOpacity>
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
        <Text style={styles.header__title}>Thanh toán</Text>
        <View style={styles.header__button} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll__content}
        showsVerticalScrollIndicator={false}
      >
        {/* Address Section */}
        <View style={styles.section}>
          <View style={styles.section__header}>
            <Text style={styles.section__title}>Thông tin địa chỉ</Text>
            {!isEditing && (
              <TouchableOpacity onPress={() => setIsEditing(true)}>
                <Ionicons name="pencil" size={20} color={Colors.primary} />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.address__container}>
            {isEditing ? (
              <>
                <TextInput
                  style={styles.input}
                  value={editedFullName}
                  onChangeText={setEditedFullName}
                  placeholder="Họ tên"
                />
                <TextInput
                  style={styles.input}
                  value={editedPhone}
                  onChangeText={setEditedPhone}
                  placeholder="Số điện thoại"
                  keyboardType="phone-pad"
                />
                <TextInput
                  style={styles.input}
                  value={editedStreet}
                  onChangeText={setEditedStreet}
                  placeholder="Số nhà, tên đường"
                />
                <TouchableOpacity
                  style={styles.select__field}
                  onPress={() => openModal("city")}
                >
                  <Text style={styles.select__text}>
                    {selectedCity || "Chọn thành phố"}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#333" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.select__field,
                    !selectedCity && styles.disabled,
                  ]}
                  onPress={() => openModal("district")}
                  disabled={!selectedCity}
                >
                  <Text style={styles.select__text}>
                    {selectedDistrict || "Chọn quận/huyện"}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#333" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.select__field,
                    !selectedDistrict && styles.disabled,
                  ]}
                  onPress={() => openModal("ward")}
                  disabled={!selectedDistrict}
                >
                  <Text style={styles.select__text}>
                    {selectedWard || "Chọn phường/xã"}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color="#333" />
                </TouchableOpacity>
                <View style={styles.button__container}>
                  <TouchableOpacity
                    style={[styles.action__button, styles.save__button]}
                    onPress={saveUserData}
                  >
                    <Text style={styles.button__text}>Lưu</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.action__button, styles.cancel__button]}
                    onPress={cancelEditing}
                  >
                    <Text style={styles.button__text}>Hủy</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.address__text}>
                  Họ tên: {userData?.profile.full_name || "Đang tải..."}
                </Text>
                <Text style={styles.address__text}>
                  Địa chỉ: {userData?.profile.address || "Đang tải..."}
                </Text>
                <Text style={styles.address__text}>
                  Số điện thoại: {userData?.profile.phone || "Đang tải..."}
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Product List Section */}
        <View style={styles.section}>
          <Text style={styles.section__title}>Sản phẩm</Text>
          <FlatList
            data={cartItems}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
          />
        </View>

        {/* Payment Method Section */}
        <View style={styles.section}>
          <Text style={styles.section__title}>Phương thức thanh toán</Text>
          <TouchableOpacity
            style={styles.radio__container}
            onPress={() => setPaymentMethod("cod")}
          >
            <Ionicons
              name={
                paymentMethod === "cod" ? "radio-button-on" : "radio-button-off"
              }
              size={24}
              color={Colors.primary}
            />
            <Text style={styles.radio__text}>Thanh toán khi nhận hàng</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.radio__container}
            onPress={() => setPaymentMethod("qr")}
          >
            <Ionicons
              name={
                paymentMethod === "qr" ? "radio-button-on" : "radio-button-off"
              }
              size={24}
              color={Colors.primary}
            />
            <Text style={styles.radio__text}>Thanh toán qua QR code</Text>
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
          <Text style={styles.section__title}>Chi tiết thanh toán</Text>
          <View style={styles.detail__row}>
            <Text style={styles.detail__label}>Tổng tiền hàng</Text>
            <Text style={styles.detail__value}>
              {formatPrice(Number(totalPrice))} ₫
            </Text>
          </View>
          <View style={styles.detail__row}>
            <Text style={styles.detail__label}>Chi phí vận chuyển</Text>
            <Text style={styles.detail__value}>
              {formatPrice(shippingFee)} ₫
            </Text>
          </View>
          <View style={styles.detail__row}>
            <Text style={styles.detail__label}>Tổng thanh toán</Text>
            <Text style={styles.detail__value}>
              {formatPrice(Number(totalPrice) + shippingFee)} ₫
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Selection Modal */}
      <Modal
        visible={!!modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(null)}
      >
        <View style={styles.model__container}>
          <View style={styles.model__content}>
            <Text style={styles.model__title}>
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
              style={styles.model__list}
            />
            <TouchableOpacity
              style={styles.close__button}
              onPress={() => setModalVisible(null)}
            >
              <Text style={styles.button__text}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TouchableOpacity
        style={styles.confirm__button}
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
      >
        <Text style={styles.confirm__text}>
          {paymentMethod === "cod" ? "Mua hàng" : "Xác nhận thanh toán"}
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
    marginBottom: 15,
    marginHorizontal: 10,
    marginTop: 50,
    backgroundColor: "#FFFFFF",
    padding: 10,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  header__button: {
    padding: 8,
  },
  header__title: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  scroll__content: {
    paddingBottom: 100,
    paddingHorizontal: 10,
  },
  section: {
    marginBottom: 20,
  },
  section__header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  section__title: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.primary,
    marginBottom: 10,
  },
  address__container: {
    padding: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  address__text: {
    fontSize: 16,
    color: "#333",
    margin: 5,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  select__field: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  select__text: {
    fontSize: 16,
    color: "#333",
  },
  disabled: {
    backgroundColor: "#F0F0F0",
    borderColor: "#DDD",
  },
  button__container: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  action__button: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginHorizontal: 5,
  },
  save__button: {
    backgroundColor: Colors.primary,
  },
  cancel__button: {
    backgroundColor: "#666",
  },
  button__text: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  model__container: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  model__content: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    width: "80%",
    maxHeight: "80%",
    padding: 20,
  },
  model__title: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.primary,
    marginBottom: 10,
  },
  model__list: {
    maxHeight: 300,
  },
  model__item: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  item__text: {
    fontSize: 16,
    color: "#333",
  },
  close__button: {
    marginTop: 10,
    padding: 10,
    backgroundColor: Colors.primary,
    borderRadius: 5,
    alignItems: "center",
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
  item__image: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 15,
  },
  item__details: {
    flex: 1,
    justifyContent: "center",
  },
  item__name: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 5,
  },
  item__quantity: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  item__price: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.primary,
  },
  radio__container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  radio__text: {
    fontSize: 16,
    color: "#333",
    marginLeft: 10,
  },
  qr: {
    width: 200,
    height: 200,
    alignSelf: "center",
    marginTop: 10,
  },
  detail__row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  detail__label: {
    fontSize: 16,
    color: "#333",
  },
  detail__value: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.primary,
  },
  confirm__button: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: Colors.primary,
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: "center",
  },
  confirm__text: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default Payment;