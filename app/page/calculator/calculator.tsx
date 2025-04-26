import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function Calculator() {
  const [firstNumber, setFirstNumber] = useState("");
  const [secondNumber, setSecondNumber] = useState("");
  const [operation, setOperation] = useState("");
  const [result, setResult] = useState<number | null>(null);

  const handleNumberPress = (buttonValue: string) => {
    if (firstNumber.length < 10) {
      setFirstNumber(firstNumber + buttonValue);
    }
  };

  const handleOperationPress = (buttonValue: string) => {
    setOperation(buttonValue);
    setSecondNumber(firstNumber);
    setFirstNumber("");
  };

  const clear = () => {
    setFirstNumber("");
    setSecondNumber("");
    setOperation("");
    setResult(null);
  };

  const calculateResult = () => {
    const num1 = parseFloat(secondNumber);
    const num2 = parseFloat(firstNumber);

    if (!isNaN(num1) && !isNaN(num2)) {
      switch (operation) {
        case "+":
          setResult(num1 + num2);
          break;
        case "-":
          setResult(num1 - num2);
          break;
        case "*":
          setResult(num1 * num2);
          break;
        case "/":
          setResult(num2 !== 0 ? num1 / num2 : 0);
          break;
      }
      setFirstNumber("");
      setSecondNumber("");
      setOperation("");
    }
  };

  const renderDisplay = () => {
    if (result !== null) {
      return <Text style={styles.resultText}>{result}</Text>;
    }
    if (firstNumber) {
      return <Text style={styles.resultText}>{firstNumber}</Text>;
    }
    return <Text style={styles.resultText}>0</Text>;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="chevron-back-outline" size={28} />
      </TouchableOpacity>

      <View style={styles.displayContainer}>
        <Text style={styles.secondaryText}>
          {secondNumber} {operation}
        </Text>
        {renderDisplay()}
      </View>

      <View style={styles.buttonsContainer}>
        <View style={styles.buttonRow}>
          <Button title="C" onPress={clear} isGray />
          <Button title="+/-" onPress={() => {}} isGray />
          <Button title="%" onPress={() => {}} isGray />
          <Button title="÷" onPress={() => handleOperationPress("/")} isBlue />
        </View>

        <View style={styles.buttonRow}>
          <Button title="7" onPress={() => handleNumberPress("7")} />
          <Button title="8" onPress={() => handleNumberPress("8")} />
          <Button title="9" onPress={() => handleNumberPress("9")} />
          <Button title="×" onPress={() => handleOperationPress("*")} isBlue />
        </View>

        <View style={styles.buttonRow}>
          <Button title="4" onPress={() => handleNumberPress("4")} />
          <Button title="5" onPress={() => handleNumberPress("5")} />
          <Button title="6" onPress={() => handleNumberPress("6")} />
          <Button title="-" onPress={() => handleOperationPress("-")} isBlue />
        </View>

        <View style={styles.buttonRow}>
          <Button title="1" onPress={() => handleNumberPress("1")} />
          <Button title="2" onPress={() => handleNumberPress("2")} />
          <Button title="3" onPress={() => handleNumberPress("3")} />
          <Button title="+" onPress={() => handleOperationPress("+")} isBlue />
        </View>

        <View style={styles.buttonRow}>
          <Button title="." onPress={() => handleNumberPress(".")} />
          <Button title="0" onPress={() => handleNumberPress("0")} />
          <Button title="⌫" onPress={() => setFirstNumber(firstNumber.slice(0, -1))} />
          <Button title="=" onPress={calculateResult} isBlue />
        </View>
      </View>
    </View>
  );
}

interface ButtonProps {
  title: string;
  onPress: () => void;
  isBlue?: boolean;
  isGray?: boolean;
}

function Button({ title, onPress, isBlue, isGray }: ButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        isBlue ? styles.buttonBlue : {},
        isGray ? styles.buttonGray : {},
      ]}
      onPress={onPress}
    >
      <Text style={[styles.buttonText, (isBlue || isGray) ? styles.textWhite : styles.textDark]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom:10,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  displayContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    paddingBottom: 20,
  },
  secondaryText: {
    fontSize: 24,
    color: "gray",
  },
  resultText: {
    fontSize: 48,
    color: "#000",
    fontWeight: "bold",
  },
  buttonsContainer: {
    paddingBottom: 10,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  button: {
    flex: 1,
    height: 70,
    margin: 5,
    borderRadius: 15,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonBlue: {
    backgroundColor: "#4e8df5",
  },
  buttonGray: {
    backgroundColor: "#a5a5a5",
  },
  buttonText: {
    fontSize: 28,
  },
  textWhite: {
    color: "#fff",
  },
  textDark: {
    color: "#000",
  },
});
