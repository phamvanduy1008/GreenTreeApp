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
  Platform,
  ScrollView,
  Modal,
  FlatList,
} from "react-native";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ipAddress } from "@/app/constants/ip";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { places } from "../../constants/places";

const EditAddress = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { addressId, name, phone, address, ward, district, city } = params;

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editedName, setEditedName] = useState(name as string);
  const [editedPhone, setEditedPhone] = useState(phone as string);
  const [editedAddress, setEditedAddress] = useState(address as string);
  const [selectedCity, setSelectedCity] = useState(
    (city as string) || "Đà Nẵng"
  );
  const [selectedDistrict, setSelectedDistrict] = useState(
    (district as string) || ""
  );
  const [selectedWard, setSelectedWard] = useState((ward as string) || "");
  const [modalVisible, setModalVisible] = useState<
    "city" | "district" | "ward" | null
  >(null);
  const [modalItems, setModalItems] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false); // Modal xác nhận xóa

  const handleGoBack = () => {
    router.back();
  };

  const handleUpdateAddress = async () => {
    if (!editedName || !editedPhone || !editedAddress) {
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
        Alert.alert("Lỗi", "Bạn cần đăng nhập để cập nhật địa chỉ.");
        setLoading(false);
        return;
      }

      const user = JSON.parse(userData);
      const userId = user._id;
      console.log("userId", userId);
      console.log("addressId", addressId);

      const response = await fetch(
        `${ipAddress}/api/edit_addresses/${userId}/${addressId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: editedName,
            phone: editedPhone,
            address: editedAddress,
            ward: selectedWard,
            district: selectedDistrict,
            city: selectedCity,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Không thể cập nhật địa chỉ");
      }

      const data = await response.json();
      if (data.success) {
        router.push("/page/address/address_delivery");
      } else {
        throw new Error(data.message || "Lỗi khi cập nhật địa chỉ");
      }
    } catch (err) {
      Alert.alert(
        "Lỗi",
        err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định"
      );
      console.error("Lỗi khi cập nhật địa chỉ:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async () => {
    try {
      setLoading(true);
      const userData = await AsyncStorage.getItem("userData");
      if (!userData) {
        Alert.alert("Lỗi", "Bạn cần đăng nhập để xóa địa chỉ.");
        setLoading(false);
        return;
      }

      const user = JSON.parse(userData);
      const userId = user._id;
      console.log("userId", userId);
      console.log("addressId", addressId);

      const response = await fetch(
        `${ipAddress}/api/delete_addresses/${userId}/${addressId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error("Không thể xóa địa chỉ");
      }

      const data = await response.json();
      if (data.success) {
        router.replace({
          pathname: "./address_delivery",
          params: { refresh: "true" },
        });
      } else {
        throw new Error(data.message || "Lỗi khi xóa địa chỉ");
      }
    } catch (err) {
      Alert.alert(
        "Lỗi",
        err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định"
      );
      console.error("Lỗi khi xóa địa chỉ:", err);
    } finally {
      setLoading(false);
      setDeleteModalVisible(false);
    }
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
    setModalItems(items);
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
            <TouchableOpacity onPress={handleGoBack}>
              <Ionicons name="chevron-back" size={24} color="#000000" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Sửa địa chỉ</Text>
            <View style={styles.headerRightPlaceholder} />
          </View>
          <View style={styles.formContainer}>
            {/* Họ và tên */}
            <TouchableOpacity
              style={styles.inputGroup}
              onPress={() => setIsEditingName(true)}
            >
              <Text style={styles.label}>Họ và tên *</Text>
              {isEditingName ? (
                <TextInput
                  style={styles.input}
                  value={editedName}
                  onChangeText={setEditedName}
                  autoFocus
                  onBlur={() => setIsEditingName(false)}
                  placeholder="Nhập họ và tên"
                  placeholderTextColor="#999999"
                  returnKeyType="next"
                />
              ) : (
                <Text style={styles.inputText}>{editedName}</Text>
              )}
            </TouchableOpacity>

            {/* Số điện thoại */}
            <TouchableOpacity
              style={styles.inputGroup}
              onPress={() => setIsEditingPhone(true)}
            >
              <Text style={styles.label}>Số điện thoại *</Text>
              {isEditingPhone ? (
                <TextInput
                  style={styles.input}
                  value={editedPhone}
                  onChangeText={setEditedPhone}
                  autoFocus
                  onBlur={() => setIsEditingPhone(false)}
                  keyboardType="phone-pad"
                  placeholder="Nhập số điện thoại"
                  placeholderTextColor="#999999"
                  returnKeyType="next"
                />
              ) : (
                <Text style={styles.inputText}>{editedPhone}</Text>
              )}
            </TouchableOpacity>

            {/* Địa chỉ chi tiết */}
            <TouchableOpacity
              style={styles.inputGroup}
              onPress={() => setIsEditingAddress(true)}
            >
              <Text style={styles.label}>Địa chỉ chi tiết *</Text>
              {isEditingAddress ? (
                <TextInput
                  style={styles.input}
                  value={editedAddress}
                  onChangeText={setEditedAddress}
                  autoFocus
                  onBlur={() => setIsEditingAddress(false)}
                  placeholder="Nhập địa chỉ chi tiết"
                  placeholderTextColor="#999999"
                  returnKeyType="next"
                />
              ) : (
                <Text style={styles.inputText}>{editedAddress}</Text>
              )}
            </TouchableOpacity>

            {/* Thành phố */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Thành phố *</Text>
              <TouchableOpacity
                style={styles.selectField}
                onPress={() => openModal("city")}
              >
                <Text style={styles.selectText}>
                  {selectedCity || "Chọn thành phố"}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Quận/Huyện */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Quận/Huyện *</Text>
              <TouchableOpacity
                style={[styles.selectField, !selectedCity && styles.disabled]}
                onPress={() => openModal("district")}
                disabled={!selectedCity}
              >
                <Text style={styles.selectText}>
                  {selectedDistrict || "Chọn quận/huyện"}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Phường/Xã */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phường/Xã *</Text>
              <TouchableOpacity
                style={[
                  styles.selectField,
                  !selectedDistrict && styles.disabled,
                ]}
                onPress={() => openModal("ward")}
                disabled={!selectedDistrict}
              >
                <Text style={styles.selectText}>
                  {selectedWard || "Chọn phường/xã"}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Nút Lưu */}
            <TouchableOpacity
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleUpdateAddress}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? "Đang lưu..." : "Lưu địa chỉ"}
              </Text>
            </TouchableOpacity>

            {/* Nút Xóa */}
            <TouchableOpacity
              style={[
                styles.deleteButton,
                loading && styles.deleteButtonDisabled,
              ]}
              onPress={() => setDeleteModalVisible(true)}
              disabled={loading}
            >
              <Text style={styles.deleteButtonText}>Xóa địa chỉ</Text>
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
                  ? "Chọn thành phố"
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

        {/* Modal Xác Nhận Xóa */}
        <Modal
          visible={deleteModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setDeleteModalVisible(false)}
        >
          <View style={styles.deleteModalContainer}>
            <View style={styles.deleteModalContent}>
              <Text style={styles.deleteModalTitle}>Xóa địa chỉ</Text>
              <Text style={styles.deleteModalMessage}>
                Bạn có chắc chắn muốn xóa địa chỉ này?
              </Text>
              <View style={styles.deleteModalButtonContainer}>
                <TouchableOpacity
                  style={styles.cancelDeleteButton}
                  onPress={() => setDeleteModalVisible(false)}
                >
                  <Text style={styles.cancelDeleteButtonText}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmDeleteButton}
                  onPress={handleDeleteAddress}
                >
                  <Text style={styles.confirmDeleteButtonText}>Xác nhận</Text>
                </TouchableOpacity>
              </View>
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
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    paddingTop: 45,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  headerRightPlaceholder: {
    width: 24,
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
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  inputText: {
    fontSize: 16,
    color: "#333",
    padding: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
  },
  selectField: {
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
  selectText: {
    fontSize: 16,
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
  deleteButton: {
    backgroundColor: "#FF6A6A",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 10,
  },
  deleteButtonDisabled: {
    backgroundColor: "#FF0000",
    opacity: 0.7,
  },
  deleteButtonText: {
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
  deleteModalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    width: "80%",
    padding: 20,
    alignItems: "center",
  },
  deleteModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
  },
  deleteModalMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  deleteModalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  cancelDeleteButton: {
    flex: 1,
    backgroundColor: "#666",
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: "center",
    marginRight: 10,
  },
  cancelDeleteButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  confirmDeleteButton: {
    flex: 1,
    backgroundColor: "#FF6A6A",
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: "center",
    marginLeft: 10,
  },
  confirmDeleteButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default EditAddress;
