import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ImageBackground,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { ipAddress } from "@/app/constants/ip";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [profileData, setProfileData] = useState({
    name: "",
    gender: "",
    birthday: "",
    phone: "",
    email: "",
    avatar: "",
  });
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (dateString: string): string => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const parseDateToISO = (dateString: string): string => {
    if (!dateString) return "";
    const [day, month, year] = dateString.split("/");
    if (!day || !month || !year) return dateString;
    const date = new Date(`${year}-${month}-${day}T00:00:00.000Z`);
    return date.toISOString();
  };

  // Hàm chọn ảnh từ thiết bị
  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert(
        "Quyền truy cập bị từ chối",
        "Bạn cần cấp quyền truy cập thư viện ảnh!"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const imageUri = result.assets[0].uri;
      await uploadAvatar(imageUri);
    }
  };

  // Hàm upload ảnh avatar lên server
  const uploadAvatar = async (imageUri: string) => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        Alert.alert("Lỗi", "Không tìm thấy userId. Vui lòng đăng nhập lại.");
        return;
      }

      const formData = new FormData();
      formData.append("avatar", {
        uri: imageUri,
        name: `avatar-${Date.now()}.jpg`,
        type: "image/jpeg",
      } as any);

      const response = await fetch(
        `${ipAddress}/api/user/${userId}/upload-avatar`,
        {
          method: "POST",
          body: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setProfileData((prev) => ({
          ...prev,
          avatar: data.avatar, // Lưu tên ảnh (không thêm tiền tố URL)
        }));
        Alert.alert("Thành công", "Ảnh avatar đã được cập nhật!");
      } else {
        Alert.alert("Lỗi", data.message || "Không thể upload ảnh avatar");
      }
    } catch (err) {
      console.error("Lỗi khi upload ảnh avatar:", err);
      Alert.alert("Lỗi", "Không thể upload ảnh avatar. Vui lòng thử lại.");
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = await AsyncStorage.getItem("userId");
        if (!userId) {
          setError("Không tìm thấy userId. Vui lòng đăng nhập lại.");
          setLoading(false);
          return;
        }

        const response = await fetch(
          `${ipAddress}/api/user/${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Lỗi khi lấy thông tin người dùng từ server");
        }

        const data = await response.json();
        if (data.success && data.user) {
          setProfileData({
            name: data.user.profile.full_name || "",
            gender: data.user.profile.gender || "",
            birthday: formatDate(data.user.profile.birthday || ""),
            phone: data.user.profile.phone || "",
            email: data.user.email || "",
            avatar: data.user.profile.avatar || "", // Lưu tên ảnh (không thêm tiền tố URL)
          });
        } else {
          setError("Không thể lấy thông tin người dùng");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Lỗi không xác định";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleSave = async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        setError("Không tìm thấy userId. Vui lòng đăng nhập lại.");
        return;
      }

      const response = await fetch(
        `${ipAddress}/api/user/${userId}/update`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            profile: {
              full_name: profileData.name,
              gender: profileData.gender,
              birthday: parseDateToISO(profileData.birthday),
              phone: profileData.phone,
            },
            email: profileData.email,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Lỗi khi cập nhật thông tin người dùng");
      }

      const data = await response.json();
      if (data.success) {
        console.log("Cập nhật thông tin người dùng thành công:", data.user);
        alert("Cập nhật hồ sơ thành công!");
      } else {
        setError(data.message || "Không thể cập nhật thông tin người dùng");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Lỗi không xác định";
      setError(errorMessage);
    }
  };

  const handleEditField = (field: string, currentValue: string) => {
    setEditingField(field);
    setTempValue(currentValue);
  };

  const handleSaveField = (field: string) => {
    setProfileData({
      ...profileData,
      [field]: tempValue,
    });
    setEditingField(null);
  };

  const handleCancelEdit = () => {
    setEditingField(null);
  };

  // Hàm tạo URL đầy đủ từ tên ảnh
  const getAvatarUrl = (avatarName: string) => {
    if (!avatarName) return "";
    return `${ipAddress}/images/profile/${avatarName}`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Đang tải thông tin...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={handleGoBack}>
            <Text style={styles.retryText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleGoBack}>
              <Ionicons name="chevron-back" size={24} color="#33CC66" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Sửa Hồ sơ</Text>
            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.saveButton}>Lưu</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.avatarContainer}>
            <ImageBackground
              source={{ uri: "https://via.placeholder.com/150" }}
              style={styles.avatarBackground}
            >
              <View style={styles.avatarWrapper}>
                {profileData.avatar ? (
                  <Image
                    source={{ uri: getAvatarUrl(profileData.avatar) }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Ionicons
                    name="person-circle-outline"
                    size={80}
                    color="#fff"
                  />
                )}
                <TouchableOpacity onPress={pickImage}>
                  <Text style={styles.editText}>Sửa</Text>
                </TouchableOpacity>
              </View>
            </ImageBackground>
          </View>

          <View style={styles.menuContainer}>
            <MenuItem
              title="Tên"
              value={profileData.name}
              onPress={() => handleEditField("name", profileData.name)}
              isEditing={editingField === "name"}
            />
            {editingField === "name" && (
              <EditField
                value={tempValue}
                onChangeText={setTempValue}
                onSave={() => handleSaveField("name")}
                onCancel={handleCancelEdit}
              />
            )}

            <MenuItem
              title="Giới tính"
              value={profileData.gender}
              onPress={() => handleEditField("gender", profileData.gender)}
              isEditing={editingField === "gender"}
            />
            {editingField === "gender" && (
              <EditField
                value={tempValue}
                onChangeText={setTempValue}
                onSave={() => handleSaveField("gender")}
                onCancel={handleCancelEdit}
              />
            )}

            <MenuItem
              title="Ngày sinh"
              value={profileData.birthday}
              onPress={() => handleEditField("birthday", profileData.birthday)}
              isEditing={editingField === "birthday"}
            />
            {editingField === "birthday" && (
              <EditField
                value={tempValue}
                placeholder="DD/MM/YYYY"
                onChangeText={setTempValue}
                onSave={() => handleSaveField("birthday")}
                onCancel={handleCancelEdit}
              />
            )}

            <MenuItem
              title="Điện thoại"
              value={profileData.phone}
              onPress={() => handleEditField("phone", profileData.phone)}
              isEditing={editingField === "phone"}
            />
            {editingField === "phone" && (
              <EditField
                value={tempValue}
                onChangeText={setTempValue}
                onSave={() => handleSaveField("phone")}
                onCancel={handleCancelEdit}
              />
            )}

            <MenuItem
              title="Email"
              value={profileData.email}
              onPress={() => handleEditField("email", profileData.email)}
              isEditing={editingField === "email"}
            />
            {editingField === "email" && (
              <EditField
                value={tempValue}
                onChangeText={setTempValue}
                onSave={() => handleSaveField("email")}
                onCancel={handleCancelEdit}
              />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function MenuItem({
  title,
  value,
  extraText,
  extraTextColor,
  onPress,
  isEditing,
}: {
  title: string;
  value?: string;
  extraText?: string;
  extraTextColor?: string;
  onPress: () => void;
  isEditing?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.menuItem, isEditing && styles.editingMenuItem]}
      onPress={onPress}
    >
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

function EditField({
  value,
  placeholder,
  onChangeText,
  onSave,
  onCancel,
}: {
  value: string;
  placeholder?: string;
  onChangeText: (text: string) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <View style={styles.editFieldContainer}>
      <TextInput
        style={styles.editInput}
        value={value}
        placeholder={placeholder}
        onChangeText={onChangeText}
        autoFocus
      />
      <View style={styles.editButtons}>
        <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Hủy</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onSave} style={styles.saveFieldButton}>
          <Text style={styles.saveFieldButtonText}>Lưu</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    flexGrow: 1,
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
    backgroundColor: "#33CC66",
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
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#fff",
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
  editingMenuItem: {
    backgroundColor: "#f9f9f9",
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
  editFieldContainer: {
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  editInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
  },
  editButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  cancelButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
  cancelButtonText: {
    color: "#999",
    fontSize: 16,
  },
  saveFieldButton: {
    backgroundColor: "#33CC66",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  saveFieldButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#F05A22",
    marginBottom: 20,
    textAlign: "center",
  },
  retryText: {
    fontSize: 16,
    color: "#333",
    textDecorationLine: "underline",
  },
});
