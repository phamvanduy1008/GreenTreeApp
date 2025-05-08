import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Modal,
  FlatList,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ipAddress } from "@/app/constants/ip";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { places } from "../../constants/places";

const AddAddress = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [ward, setWard] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState<"city" | "district" | "ward" | null>(null);
  const [modalItems, setModalItems] = useState<string[]>([]);

  const handleGoBack = () => {
    router.back();
  };

  const handleAddAddress = async () => {
    if (!name || !phone || !address) {
      Alert.alert(
        "Lỗi",
        "Vui lòng nhập đầy đủ các trường bắt buộc (Họ tên, Số điện thoại, Địa chỉ chi tiết)"
      );
      return;
    }

    try {
      setLoading(true);
      const userData = await AsyncStorage.getItem("userData");
      if (!userData) {
        Alert.alert("Lỗi", "Bạn cần đăng nhập để thêm địa chỉ.");
        setLoading(false);
        return;
      }

      const user = JSON.parse(userData);
      const userId = user._id;

      const response = await fetch(`${ipAddress}/api/add_addresses/${userId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, address, ward, district, city }),
      });

      if (!response.ok) {
        throw new Error("Không thể thêm địa chỉ");
      }

      const data = await response.json();
      if (data.success) {
        router.replace({
          pathname: "./address_delivery",
          params: { refresh: "true" },
        });
      } else {
        throw new Error(data.message || "Lỗi khi thêm địa chỉ");
      }
    } catch (err) {
      Alert.alert(
        "Lỗi",
        err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định"
      );
      console.error("Lỗi khi thêm địa chỉ:", err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type: "city" | "district" | "ward") => {
    let items: string[] = [];
    if (type === "city") {
      items = ["Đà Nẵng"];
    } else if (type === "district" && city && places[city]) {
      items = Object.keys(places[city]);
    } else if (type === "ward" && city && district && places[city]?.[district]) {
      items = places[city][district];
    }
    setModalItems(items);
    setModalVisible(type);
  };

  const handleSelect = (item: string) => {
    if (modalVisible === "city") {
      setCity(item);
      setDistrict("");
      setWard("");
    } else if (modalVisible === "district") {
      setDistrict(item);
      setWard("");
    } else if (modalVisible === "ward") {
      setWard(item);
    }
    setModalVisible(null);
  };

  const renderModalItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={styles.modalItem}
      onPress={() => handleSelect(item)}
    >
      <Text style={styles.itemText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
          <View style={styles.header}>
            <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color="#53B175" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Thêm địa chỉ mới</Text>
            <View style={styles.headerRightPlaceholder} />
          </View>
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Họ và tên *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập họ và tên"
                value={name}
                onChangeText={setName}
                placeholderTextColor="#999999"
                returnKeyType="next"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Số điện thoại *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập số điện thoại"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholderTextColor="#999999"
                returnKeyType="next"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Địa chỉ chi tiết *</Text>
              <TextInput
                style={styles.input}
                placeholder="Nhập địa chỉ chi tiết"
                value={address}
                onChangeText={setAddress}
                placeholderTextColor="#999999"
                returnKeyType="next"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tỉnh/Thành phố *</Text>
              <TouchableOpacity
                style={styles.selectField}
                onPress={() => openModal("city")}
              >
                <Text style={styles.selectText}>
                  {city || "Chọn tỉnh/thành phố"}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Quận/Huyện *</Text>
              <TouchableOpacity
                style={[styles.selectField, !city && styles.disabled]}
                onPress={() => openModal("district")}
                disabled={!city}
              >
                <Text style={styles.selectText}>
                  {district || "Chọn quận/huyện"}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#333" />
              </TouchableOpacity>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phường/Xã *</Text>
              <TouchableOpacity
                style={[styles.selectField, !district && styles.disabled]}
                onPress={() => openModal("ward")}
                disabled={!district}
              >
                <Text style={styles.selectText}>
                  {ward || "Chọn phường/xã"}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#333" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleAddAddress}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? "Đang lưu..." : "Lưu địa chỉ"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Modal Selection */}
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
                  ? "Chọn tỉnh/thành phố"
                  : modalVisible === "district"
                  ? "Chọn quận/huyện"
                  : "Chọn phường/xã"}
              </Text>
              <FlatList
                data={modalItems}
                renderItem={renderModalItem}
                keyExtractor={(item) => item}
                style={styles.modalList}
              />
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(null)}
              >
                <Text style={styles.buttonText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollContainer: {
    flexGrow: 1,
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
  formContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#333333",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  selectField: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  selectText: {
    fontSize: 14,
    color: "#333",
  },
  disabled: {
    backgroundColor: "#F0F0F0",
    borderColor: "#DDD",
  },
  saveButton: {
    backgroundColor: "#53B175",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonDisabled: {
    backgroundColor: "#53B175",
    opacity: 0.7,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    width: "80%",
    maxHeight: "80%",
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#53B175",
    marginBottom: 10,
  },
  modalList: {
    maxHeight: 300,
  },
  modalItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },
  itemText: {
    fontSize: 16,
    color: "#333",
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#53B175",
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default AddAddress;