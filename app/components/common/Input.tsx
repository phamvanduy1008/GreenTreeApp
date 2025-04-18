import React from "react";
import { View, TextInput, StyleSheet, TextInputProps } from "react-native";

type InputProps = {
  typeInput?: TextInputProps["keyboardType"];
  placeholder?: string;
  type?: "login" | "password" | "search-product";
  inputStyles?: object;
  value?: string;
  onChange?: (value: string) => void;
};

export default function Input({
  typeInput = "default",
  placeholder,
  type,
  inputStyles,
  value,
  onChange,
}: InputProps) {
  const getTypeStyle = () => {
    switch (type) {
      case "login":
        return styles.login;
      case "password":
        return styles.password;
      case "search-product":
        return styles.searchProduct;
      default:
        return {};
    }
  };

  const isPassword = type === "password";

  return (
    <View>
      <TextInput
        style={[styles.defaultInput, getTypeStyle(), inputStyles]}
        keyboardType={typeInput}
        placeholder={placeholder}
        value={value}
        onChangeText={onChange}
        secureTextEntry={isPassword}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  defaultInput: {
    height: 50,
    width: "98%",
  },
  login: {
    backgroundColor: "#fff",
    borderColor: "gray",
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    borderRadius: 15,
    fontSize: 16,
    paddingLeft: 20,
  },
  password: {
    backgroundColor: "#fff",
    borderColor: "gray",
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    borderRadius: 15,
    fontSize: 16,
    paddingLeft: 20,
  },
  searchProduct: {
    backgroundColor: "#fff3cd",
  },
});
