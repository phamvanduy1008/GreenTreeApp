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
      console.log("email", email);

      await user?.update({
        unsafeMetadata: {
          full_name, 
          username, 
          gender,
          onboarding_completed: true,
        },
      });
      await AsyncStorage.setItem(
        "userData",
        JSON.stringify({ full_name, username, gender })
      );
      
      if(email){
        await fetch(`${ipAddress}/update-infor`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, full_name, username, gender }),
        });
      }
      
      await user?.reload();
      return router.push("/(tabs)");
    } catch (error: any) {
      if (error.message === "That username is taken. Please try another.") {
        return setError("username", { message: "Username is already taken" });
      }
      return setError("full_name", { message: "An error occurred" });
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
        <Text style={styles.label}>Complete your account</Text>
        <Text style={styles.description}>
          Complete your account to start your journey with thousands of
          developers around the world.
        </Text>
      </View>

      <View style={styles.formContainer}>
        <TextInput
          control={control}
          placeholder="Enter your full name"
          label="Full Name"
          required
          name="full_name"
        />

        <TextInput
          control={control}
          placeholder="Enter your username"
          label="Username"
          required
          name="username"
        />

        <RadioButtonInput
          control={control}
          placeholder="Select your gender"
          label="Gender"
          required
          name="gender"
          options={[
            { label: "Male", value: "male" },
            { label: "Female", value: "female" },
            { label: "Other", value: "other" },
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
              {isLoading ? "Loading..." : "Complete Account"}
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
    backgroundColor: "blue",
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
