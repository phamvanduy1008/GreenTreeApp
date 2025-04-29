import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Giả định bạn có một global router object
const router = {
  navigate: (screen: string) => {
    console.log(`Điều hướng đến màn hình: ${screen}`);
    // Logic điều hướng thực tế của bạn sẽ ở đây
  },
  goBack: () => {
    console.log("Quay lại màn hình trước đó");
    // Logic quay lại thực tế của bạn sẽ ở đây
  },
};

export default function ProfileScreen() {
  const handleGoBack = () => {
    router.goBack();
  };

  const handleNavigate = (screen: string) => {
    router.navigate(screen);
  };

  const handleSave = () => {
    console.log("Lưu thông tin hồ sơ");
    // Logic lưu thông tin thực tế của bạn sẽ ở đây
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack}>
          <Ionicons name="chevron-back" size={24} color="#F05A22" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Sửa Hồ sơ</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveButton}>Lưu</Text>
        </TouchableOpacity>
      </View>

      {/* Avatar Section */}
      <View style={styles.avatarContainer}>
        <ImageBackground
          source={{ uri: "https://via.placeholder.com/150" }} // Placeholder cho nền cam
          style={styles.avatarBackground}
        >
          <View style={styles.avatarWrapper}>
            <Ionicons name="person-circle-outline" size={80} color="#fff" />
            <Text style={styles.editText}>Sửa</Text>
          </View>
        </ImageBackground>
      </View>

      {/* Danh sách các mục */}
      <View style={styles.menuContainer}>
        <MenuItem
          title="Tên"
          value="Hà Khắc Huy"
          onPress={() => handleNavigate("EditName")}
        />
        <MenuItem
          title="Bio"
          value="hh"
          onPress={() => handleNavigate("EditBio")}
        />
        <MenuItem
          title="Giới tính"
          value="Nam"
          onPress={() => handleNavigate("EditGender")}
        />
        <MenuItem
          title="Ngày sinh"
          value="****03/20**"
          onPress={() => handleNavigate("EditBirthday")}
        />
        <MenuItem
          title="Điện thoại"
          value="******04"
          onPress={() => handleNavigate("EditPhone")}
        />
        <MenuItem
          title="Email"
          value="h******3@gmail.com"
          extraText="Xác nhận ngay"
          extraTextColor="#F05A22"
          onPress={() => handleNavigate("EditEmail")}
        />
        <MenuItem
          title="Tài khoản liên kết"
          onPress={() => handleNavigate("LinkedAccounts")}
        />
      </View>
    </SafeAreaView>
  );
}

function MenuItem({
  title,
  value,
  extraText,
  extraTextColor,
  onPress,
}: {
  title: string;
  value?: string;
  extraText?: string;
  extraTextColor?: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemContent}>
        <Text style={styles.menuItemText}>{title}</Text>
        <View style={styles.valueContainer}>
          {value && <Text style={styles.menuItemValue}>{value}</Text>}
          {extraText && (
            <Text
              style={[styles.extraText, { color: extraTextColor || "#999" }]}
            >
              {extraText}
            </Text>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#999" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  saveButton: {
    fontSize: 16,
    color: "#999",
    fontWeight: "500",
  },
  avatarContainer: {
    height: 150,
    backgroundColor: "#F05A22",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarBackground: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarWrapper: {
    alignItems: "center",
  },
  editText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    marginTop: 5,
  },
  menuContainer: {
    marginTop: 5,
    paddingHorizontal: 20,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomColor: "#f0f0f0",
    borderBottomWidth: 1,
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    color: "#444",
    flex: 1,
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemValue: {
    fontSize: 16,
    color: "#999",
    marginRight: 5,
  },
  extraText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
