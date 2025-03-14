import React, { ReactNode } from "react";
import { TouchableOpacity, View, StyleSheet, ViewStyle, Text } from "react-native";

type ButtonProps = {
  onClick?: () => void;
  type?: "btnLogin" | "btnUnderline" | "btnPrimary" | "btn";
  text?: string;
  children?: ReactNode;
  icon?: React.ReactNode;
  buttonStyle?: ViewStyle;
};

export default function Button({
  onClick,
  type = "btn",
  children,
  icon,
  text,
  buttonStyle,
}: ButtonProps) {
  const getButtonStyle = () => {
    switch (type) {
      case "btnLogin":
        return styles.btnLogin;
      case "btnUnderline":
        return styles.btnUnderline;
      case "btnPrimary":
        return styles.btnPrimary;
      case "btn":
      default:
        return styles.defaultBtn;
    }
  };

  return (
    <View>
      <TouchableOpacity onPress={onClick} style={[getButtonStyle(), buttonStyle]}>
        <View style={{ flexDirection: "row", padding: 10, alignItems: "center" }}>
          {icon}
          {typeof children === "string" ? <Text>{children}</Text> : children}
          {text ? <Text>{text}</Text> : null}
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  defaultBtn: {
    padding: 10,
    backgroundColor: "#F6FAFF",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  btnLogin: {
    padding: 10,
    backgroundColor: "#F6FAFF",
    borderRadius: 10,
  },
  btnUnderline: {
    padding: 10,
    backgroundColor: "transparent",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrimary: {
    padding: 10,
    backgroundColor: "#007BFF",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
});
