import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Stack, useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ipAddress } from "@/app/constants/ip";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Address {
  _id: string;
  name: string;
  phone: string;
  address: string;
  ward?: string;
  district?: string;
  city?: string;
}

const AddressDelivery = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAddresses = async () => {
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (!userData) {
        setError("Bạn cần đăng nhập để xem địa chỉ.");
        setLoading(false);
        return;
      }

      const user = JSON.parse(userData);
      const userId = user._id;

      const response = await fetch(`${ipAddress}/api/user/addresses/${userId}`);
      if (!response.ok) {
        throw new Error("Không thể lấy danh sách địa chỉ");
      }

      const data = await response.json();
      console.log("data", data);

      setAddresses(data.addresses || []);
      setLoading(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định"
      );
      setLoading(false);
      console.error("Lỗi khi lấy địa chỉ:", err);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  useEffect(() => {
    if (params.refresh === "true") {
      fetchAddresses();
      router.setParams({ refresh: undefined });
    }
  }, [params.refresh, router]);

  const handleGoBack = () => {
    router.back();
  };

  const handleAddAddress = () => {
    router.push({
      pathname: "./add_address",
      params: { fromPayment: params.fromPayment },
    });
  };

  const handleEditAddress = (address: Address) => {
    router.push({
      pathname: "./edit_address",
      params: {
        addressId: address._id,
        name: address.name,
        phone: address.phone,
        address: address.address,
        ward: address.ward || "",
        district: address.district || "",
        city: address.city || "",
        fromPayment: params.fromPayment,
      },
    });
  };

  const handleSelectAddress = async (address: Address) => {
    try {
        const updatedAddress = {
        fullName: address.name,
        phone: address.phone,
        street: address.address,
        city: address.city,
        district:address.district ,
        ward: address.ward,
      };
    
      await AsyncStorage.setItem("address", JSON.stringify(updatedAddress));
      console.log("updatedAddress",updatedAddress);
      if (updatedAddress) {
        router.replace({
          pathname: "../payment/payment",
          params: {
            selectedItems: params.selectedItems,
            totalPrice: params.totalPrice,
          },
        });
      } else {
        router.back();
      }
    } catch (err) {
      console.error("Lỗi khi chọn địa chỉ:", err);
      setError("Đã xảy ra lỗi khi chọn địa chỉ.");
    }
  };

  const renderAddressItem = ({ item }: { item: Address }) => (
    <TouchableOpacity
      style={styles.addressCard}
      onPress={() => handleSelectAddress(item)}
    >
      <View style={styles.addressContent}>
        <View style={styles.addressHeader}>
          <Text style={styles.addressName}>{item.name}</Text>
          <Text style={styles.addressIcon}>|</Text>
          <Text style={styles.addressPhone}>{`(${item.phone})`}</Text>
        </View>
        <Text style={styles.addressDetail}>{item.address}</Text>
        {item.ward && item.district && item.city && (
          <Text style={styles.addressLocation}>
            {`${item.ward}, ${item.district}, ${item.city}`}
          </Text>
        )}
      </View>
      <TouchableOpacity
        style={styles.editButton}
        onPress={() => handleEditAddress(item)}
      >
        <Text style={styles.editText}>Sửa</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <ActivityIndicator size="large" color="#53B175" />
        <Text style={styles.loadingText}>Đang tải địa chỉ...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Ionicons name="alert-circle-outline" size={60} color="#53B175" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={handleGoBack} style={styles.goBackButton}>
          <Text style={styles.goBackText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.header}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chọn địa chỉ nhận hàng</Text>
          <View style={styles.headerRightPlaceholder} />
        </View>
        <View style={styles.searchBar}>
          <Text style={styles.searchText}>Địa chỉ</Text>
        </View>
        <FlatList
          data={addresses}
          renderItem={renderAddressItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.addressList}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddAddress}
            >
              <Ionicons name="add-circle" size={20} color="#53B175" />
              <Text style={styles.addButtonText}>Thêm Địa Chỉ Mới</Text>
            </TouchableOpacity>
          }
        />
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
  searchBar: {
    backgroundColor: "#F0F0F0",
    padding: 10,
    marginHorizontal: 16,
    marginTop: 10,
    borderRadius: 8,
  },
  searchText: {
    color: "#666666",
    fontSize: 14,
  },
  addressList: {
    padding: 16,
  },
  addressCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  addressContent: {
    flex: 1,
  },
  addressHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  addressName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333333",
  },
  addressIcon: {
    marginLeft: 10,
    color: "#888",
    fontWeight: "400",
  },
  addressPhone: {
    fontSize: 14,
    color: "#666666",
    marginLeft: 8,
  },
  addressDetail: {
    fontSize: 14,
    color: "#666666",
    marginTop: 4,
  },
  addressLocation: {
    fontSize: 14,
    color: "#666666",
    marginTop: 4,
  },
  editButton: {
    marginBottom: 40,
    paddingLeft: 4,
  },
  editText: {
    color: "#666666",
    fontSize: 15,
    fontWeight: "500",
    padding: 5,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    marginTop: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  addButtonText: {
    color: "#53B175",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
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
    color: "#53B175",
    fontSize: 16,
    marginTop: 12,
    marginBottom: 20,
  },
  goBackButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#53B175",
    borderRadius: 8,
  },
  goBackText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 14,
  },
});

export default AddressDelivery;
