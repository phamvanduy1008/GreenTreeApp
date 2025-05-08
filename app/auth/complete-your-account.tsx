import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { set, useForm } from "react-hook-form";
import { useRouter } from "expo-router";
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

  const { control, handleSubmit, setError, setValue } = useForm({
    defaultValues: {
      full_name: "",
      username: "",
      gender: "",
    },
  });

  const onSubmit = async (data: any) => {
    const { full_name, username, gender } = data;

    try {
      setIsLoading(true);
      const emailApi = await AsyncStorage.getItem("email");
      const emailClerk = user?.primaryEmailAddress?.emailAddress || "";
      const email = emailApi || emailClerk;

      await user?.update({
        unsafeMetadata: {
          full_name,
          username,
          gender,
          onboarding_completed: true,
        },
      });

      if (email) {
        const response = await fetch(`${ipAddress}/update-infor`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, full_name, username, gender }),
        });

        if (response.ok) {
          await AsyncStorage.setItem("ok", "true");
          const updatedUserData = {
            email,
            profile: {
              full_name,
              username,
              gender,
              birthday: null,
              phone: "",
              avatar: "",
            },
            onboarding_completed: 1,
            isActive: true,
            isVerified: false,
            addresses: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await AsyncStorage.setItem("userData", JSON.stringify(updatedUserData));
        }
      }

      await user?.reload();
      return router.push("/(tabs)");
    } catch (error: any) {
      if (error.message === "That username is taken. Please try another.") {
        return setError("username", { message: "Tên người dùng đã tồn tại" });
      }
      return setError("full_name", { message: "Đã xảy ra lỗi" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded || !user) return;

    setValue("full_name", user.fullName || "");
    setValue("username", user.username || "");
    setValue("gender", String(user.unsafeMetadata?.gender) || "");

    const userEmail = user.primaryEmailAddress?.emailAddress;
    if (userEmail) {
      AsyncStorage.setItem("email", userEmail);
    }
  }, [isLoaded, user]);

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