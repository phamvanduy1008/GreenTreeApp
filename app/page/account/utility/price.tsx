import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { Colors } from "../../../constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { ipAddress } from "../../../constants/ip";

interface Category {
  _id: string;
  name: string;
  status: string;
  image: string;
}

interface Plant {
  _id: string;
  name: string;
  avgPriceYesterday: number;
  avgPriceNow: number;
  category: Category;
}

interface GroupedPlant {
  categoryName: string;
  categoryId: string;
  plants: Plant[];
}

const Price = () => {
  const [groupedPlants, setGroupedPlants] = useState<GroupedPlant[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get current date (April 30, 2025) and format it as DD/MM/YYYY
  const currentDate = new Date("2025-04-30");
  const formattedDate = `${currentDate.getDate().toString().padStart(2, "0")}/${(currentDate.getMonth() + 1).toString().padStart(2, "0")}/${currentDate.getFullYear()}`;

  const formatPrice = (price: number) => {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const calculatePriceChange = (yesterday: number, now: number) => {
    return now - yesterday;
  };

  const fetchData = async () => {
    try {
      setIsRefreshing(true);
      console.log("Bắt đầu lấy dữ liệu từ API...");
  
      const categoriesResponse = await fetch(`${ipAddress}/api/categories`);
      if (!categoriesResponse.ok) {
        throw new Error(`Lỗi khi lấy danh mục: ${categoriesResponse.status}`);
      }
      const categories: Category[] = await categoriesResponse.json();
      console.log("Danh mục nhận được:", categories);
  
      const plantsResponse = await fetch(`${ipAddress}/api/plants`);
      if (!plantsResponse.ok) {
        throw new Error(`Lỗi khi lấy cây trồng: ${plantsResponse.status}`);
      }
      const plants: Plant[] = await plantsResponse.json();
      console.log("Cây trồng nhận được:", plants);
  
      const grouped = categories.map((category) => {
        const plantsInCategory = plants.filter((plant) => {
          const isMatch = plant.category._id === category._id;
          console.log(
            `So sánh plant.category._id (${plant.category._id}) với category._id (${category._id}): ${isMatch}`
          );
          return isMatch;
        });
        console.log(`Danh mục ${category.name} có ${plantsInCategory.length} cây trồng`);
        return {
          categoryName: category.name,
          categoryId: category._id,
          plants: plantsInCategory,
        };
      });
  
      const filteredGrouped = grouped.filter((group) => group.plants.length > 0);
      console.log("Danh mục sau khi lọc (có cây trồng):", filteredGrouped);
  
      setGroupedPlants(filteredGrouped);
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
    } finally {
      setIsRefreshing(false);
      console.log("Hoàn tất quá trình lấy dữ liệu");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    fetchData();
  };

  const renderplant__item = ({ item }: { item: Plant }) => {
    const priceChange = calculatePriceChange(item.avgPriceYesterday, item.avgPriceNow);
    const isPriceUp = priceChange > 0;
    const isPriceDown = priceChange < 0;

    return (
      <View style={styles.plant__item}>
        <View style={styles.plant__info}>
          <Text style={styles.plant__name}>{item.name}</Text>
          <Text style={styles.price__now}>{formatPrice(item.avgPriceNow)} ₫</Text>
        </View>
        <View style={styles.price__change}>
          {isPriceUp && (
            <Ionicons name="caret-up" size={16} color={Colors.primary} style={styles.arrow} />
          )}
          {isPriceDown && (
            <Ionicons name="caret-down" size={16} color="#FF3B30" style={styles.arrow} />
          )}
          <Text
            style={[
              styles.text__change,
              isPriceUp ? styles.price__up : isPriceDown ? styles.price__down : styles.price__neutral,
            ]}
          >
            {priceChange > 0 ? "+" : ""}{formatPrice(priceChange)} ₫
          </Text>
        </View>
      </View>
    );
  };

  const rendercategory__section = ({ item }: { item: GroupedPlant }) => (
    <View style={styles.category__section}>
      <View style={styles.category__header}>
        <Text style={styles.category__title}>{item.categoryName}</Text>
        <Ionicons name="leaf" size={20} color={Colors.primary} style={styles.category__icon} />
      </View>
      <FlatList
        data={item.plants}
        renderItem={renderplant__item}
        keyExtractor={(plant) => plant._id}
        scrollEnabled={false}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.header__button}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <View style={styles.title__container}>
          <Text style={styles.header__title}>Biến động giá</Text>
          <Text style={styles.header__date}>Ngày {formattedDate}</Text>
        </View>
        <TouchableOpacity
          onPress={handleRefresh}
          style={styles.header__button}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isRefreshing ? "refresh" : "refresh-outline"}
            size={24}
            color={Colors.primary}
            style={isRefreshing && styles.refresh__icon}
          />
        </TouchableOpacity>
      </View>

      {isRefreshing ? (
        <View style={styles.loading__container}>
          <Ionicons name="refresh" size={30} color={Colors.primary} style={styles.loading__icon} />
          <Text style={styles.loading__text}>Đang tải dữ liệu...</Text>
        </View>
      ) : groupedPlants.length === 0 ? (
        <View style={styles.empty__container}>
          <Ionicons name="leaf-outline" size={50} color="#B0BEC5" />
          <Text style={styles.empty__text}>Không có dữ liệu giá để hiển thị.</Text>
        </View>
      ) : (
        <FlatList
          data={groupedPlants}
          renderItem={rendercategory__section}
          keyExtractor={(item) => item.categoryId}
          contentContainerStyle={styles.list__container}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
    marginHorizontal: 10,
    marginTop: 50,
    backgroundColor: "#FFFFFF",
    padding: 10,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  header__button: {
    padding: 8,
  },
  title__container: {
    alignItems: "center",
  },
  header__title: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  header__date: {
    fontSize: 14,
    fontWeight: "400",
    color: "#666",
    marginTop: 2,
  },
  refresh__icon: {
    transform: [{ rotate: "360deg" }],
  },
  list__container: {
    padding: 10,
    paddingBottom: 20,
  },
  category__section: {
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  category__header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  category__title: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.primary,
    marginRight: 8,
  },
  category__icon: {
    marginLeft: 5,
  },
  plant__item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#FAFAFA",
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  plant__info: {
    flex: 1,
  },
  plant__name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212121",
    marginBottom: 5,
  },
  price__now: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.primary,
  },
  price__change: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  arrow: {
    marginRight: 5,
  },
  text__change: {
    fontSize: 14,
    fontWeight: "600",
  },
  price__up: {
    color: Colors.primary,
  },
  price__down: {
    color: "#FF3B30",
    backgroundColor: "#FFEBEE",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  price__neutral: {
    color: "#666",
  },
  empty__container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  empty__text: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 10,
    color: "#B0BEC5",
    fontWeight: "500",
  },
  loading__container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loading__icon: {
    marginBottom: 10,
  },
  loading__text: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.primary,
  },
});

export default Price;