import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
} from "react-native";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/Colors";
import { ipAddress } from "@/app/constants/ip";

interface InforData {
  climate: string;
  land: string;
  target: string;
  time: string;
  plant: {
    name: string;
  };
}

const PlantTheTree: React.FC = () => {
  const { plantId } = useLocalSearchParams();
  const [inforData, setInforData] = useState<InforData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInforData = async () => {
      if (!plantId) {
        setError("Không có plantId");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${ipAddress}/api/infor-plants/${plantId}`);
        if (!response.ok) {
          throw new Error("Lỗi khi tải dữ liệu từ server");
        }
        const data = await response.json();
        setInforData(data);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "Lỗi khi tải dữ liệu");
        setLoading(false);
        console.error("❌ Lỗi khi gọi API:", err);
      }
    };

    fetchInforData();
  }, [plantId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Đang tải...</Text>
      </SafeAreaView>
    );
  }

  if (error || !inforData) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>{error || "Không có dữ liệu"}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={styles.scroll__content}>
        <View style={styles.header__container}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.header__title}>Trồng cây: {inforData.plant.name}</Text>
        </View>

        <View style={styles.container}>
          <View style={styles.content}>
            <Image
              source={ require('../../../assets/images/home/menu1.jpg') }
              style={styles.image}
            />
            <Text style={styles.subtitle}>1. Khí hậu:</Text>
            <Text style={styles.text}>{inforData.climate || "Không có dữ liệu"}</Text>
            <Text style={styles.subtitle}>2. Đất:</Text>
            <Text style={styles.text}>{inforData.land || "Không có dữ liệu"}</Text>
            <Text style={styles.subtitle}>3. Mục tiêu:</Text>
            <Text style={styles.text}>{inforData.target || "Không có dữ liệu"}</Text>
            <Text style={styles.subtitle}>4. Thời gian:</Text>
            <Text style={styles.text}>{inforData.time || "Không có dữ liệu"}</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scroll__content: {
    paddingTop: Platform.OS === "android" ? 50 : 0,
  },
  header__container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: 20,
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
  },
  header__title: {
    fontSize: 20,
    paddingHorizontal: 10,
    fontWeight: "bold",
    color: Colors.primary,
  },
  container: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 10,
  },
  content: {
    padding: 20,
  },
  image: {
    width: "100%",
    height: 300,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "black",
  },
  text: {
    fontSize: 18,
    color: "black",
    marginBottom: 10,
  },
  loadingText: {
    fontSize: 18,
    color: Colors.primary,
    textAlign: "center",
    marginTop: 20,
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
});

export default PlantTheTree;