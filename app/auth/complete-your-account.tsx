import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { set, useForm } from "react-hook-form";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useUser } from "@clerk/clerk-expo";
import { useEffect, useMemo, useState } from "react";

import TextInput from "@/app/components/common/Forms/TextInput";
import RadioButtonInput from "@/app/components/common/Forms/RadioButtonInput";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ipAddress } from "../constants/ip";
import { Colors } from "../constants/Colors";
const CompleteYourAccountScreen = () => {
  const { user, isLoaded } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { email: emailFromParams } = useLocalSearchParams();

  const { control, handleSubmit, setError, setValue } = useForm({
    defaultValues: {
      full_name: "",
      username: "",
      gender: "",
    },
  });

  const getEmail = async (): Promise<string | null> => {
    if (emailFromParams) {
      return Array.isArray(emailFromParams) ? emailFromParams[0] : emailFromParams;
    }
    if (isLoaded && user?.primaryEmailAddress?.emailAddress) {
      return user.primaryEmailAddress.emailAddress;
    }
    return await AsyncStorage.getItem("email");
  };

  useEffect(() => {
    const initializeForm = async () => {
      const email = await getEmail();
      if (email) {
        await AsyncStorage.setItem("email", email); 
      }

      if (isLoaded && user) {
        setValue("full_name", user.fullName || "");
        setValue("username", user.username || "");
        setValue("gender", String(user.unsafeMetadata?.gender) || "");
      }
    };
    initializeForm();
  }, [isLoaded, user, emailFromParams]);

  const onSubmit = async (data: any) => {
    const { full_name, username, gender } = data;

    try {
      setIsLoading(true);

      const email = await getEmail();
      if (!email) {
        setError("full_name", { message: "Không tìm thấy email để cập nhật" });
        return;
      }

      const response = await fetch(`${ipAddress}/update-infor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, full_name, username, gender }),
      });

      const responseData = await response.json();

      if (!response.ok || !responseData.message.includes("thành công")) {
        throw new Error(responseData.message || "Cập nhật thông tin thất bại");
      }

      const updatedUserData = {
        _id: responseData.user._id || "",
        email,
        profile: {
          full_name: responseData.user.profile.full_name || full_name,
          username: responseData.user.profile.username || username,
          gender: responseData.user.profile.gender || gender,
          birthday: responseData.user.profile.birthday || null,
          phone: responseData.user.profile.phone || "",
          avatar: responseData.user.profile.avatar || "",
        },
        onboarding_completed: responseData.user.onboarding_completed || 1,
        isActive: responseData.user.isActive ?? true,
        isVerified: responseData.user.isVerified ?? false,
        addresses: responseData.user.addresses || [],
        createdAt: responseData.user.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorage.multiSet([
        ["userId", updatedUserData._id],
        ["email", email],
        ["userData", JSON.stringify(updatedUserData)],
      ]);

      if (isLoaded && user) {
        await user.update({
          unsafeMetadata: {
            full_name,
            username,
            gender,
            onboarding_completed: true,
          },
        });
        await user.reload();
      }

      Alert.alert("Cập nhật thông tin thành công!");
      router.replace("/(tabs)");
    } catch (error: any) {
      console.error("Lỗi cập nhật:", error);
      if (error.message.includes("Tên người dùng")) {
        setError("username", { message: "Tên người dùng đã tồn tại" });
      } else if (error.message.includes("Thiếu thông tin")) {
        setError("full_name", { message: "Vui lòng điền đầy đủ thông tin" });
      } else {
        setError("full_name", { message: error.message || "Đã xảy ra lỗi. Vui lòng thử lại." });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 40, paddingBottom: insets.bottom },
      ]}
    >
      <View style={styles.headingContainer}>
        <Text style={styles.label}>Hoàn tất thông tin tài khoản</Text>
        <Text style={styles.description}>
          Hãy hoàn tất thông tin để bắt đầu hành trình của bạn.
        </Text>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          control={control}
          placeholder="Nhập họ và tên"
          label="Họ và tên"
          required
          name="full_name"
        />

        <TextInput
          control={control}
          placeholder="Nhập tên người dùng"
          label="Tên người dùng"
          required
          name="username"
        />

        <RadioButtonInput
          control={control}
          placeholder="Chọn giới tính"
          label="Giới tính"
          required
          name="gender"
          options={[
            { label: "Nam", value: "male" },
            { label: "Nữ", value: "female" },
            { label: "Khác", value: "other" },
          ]}
        />

        <View style={{ marginTop: 20 }}>
          <TouchableOpacity
            style={[styles.button, { opacity: isLoading ? 0.7 : 1 }]}
            onPress={handleSubmit(onSubmit)}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : null}
            <Text style={styles.buttonText}>
              {isLoading ? "Đang xử lý..." : "Hoàn tất"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default CompleteYourAccountScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
    gap: 20,
  },
  headingContainer: {
    width: "100%",
    gap: 5,
  },
  label: {
    fontSize: 20,
    fontWeight: "bold",
  },
  description: {
    fontSize: 16,
    color: "gray",
  },
  formContainer: {
    width: "100%",
    marginTop: 20,
    gap: 20,
  },
  textIput: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "gray",
    borderRadius: 5,
    padding: 10,
    width: "100%",
  },
  button: {
    width: "100%",
    backgroundColor: Colors.primary,
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
  },
  buttonText: {
    color: "white",
  },
});