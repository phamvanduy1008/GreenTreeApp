import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  StatusBar,
  Platform,
  TextInput,
  Image,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FontFamily } from "../constants/FontFamily";
import { ipAddress } from "../constants/ip";
import ProductCard from "../page/shop/ProductCard";
import { useRouter } from "expo-router";
import { Colors } from "../constants/Colors";

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  status: string;
  image: string;
  evaluate: number;
  info?: string;
  category?: string;
  plant?: string;
}

interface Category {
  _id: string;
  name: string;
  image: string;
  backgroundColor: string;
}

interface Section {
  type: string;
  data?: Product[] | Category[];
  title?: string;
}

const ShopScreen: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productCate, setProductCate] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState<string>("");

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resCat, resProd] = await Promise.all([
          fetch(`${ipAddress}/api/categories`),
          fetch(`${ipAddress}/api/products`),
        ]);

        if (!resCat.ok || !resProd.ok)
          throw new Error("Lỗi khi tải dữ liệu từ server");

        const catData: any[] = await resCat.json();
        const prodData: Product[] = await resProd.json();

        const categoriesWithColor: Category[] = catData.map((cat) => ({
          _id: cat._id,
          name: cat.name,
          image: cat.image,
          backgroundColor: cat.backgroundColor || "#fff",
        }));

        setCategories(categoriesWithColor);
        setProducts(prodData);
      } catch (err) {
        console.error("Lỗi fetch dữ liệu:", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      }
    };

    fetchData();
  }, []);

  const handleCate = async (categoryId: string) => {
    if (!categoryId) {
      console.error("Category ID is undefined");
      setError("Vui lòng chọn danh mục hợp lệ.");
      return;
    }
    try {
      const res = await fetch(
        `${ipAddress}/api/products/category/${categoryId}`
      );
      if (!res.ok) throw new Error("Lỗi khi fetch sản phẩm theo danh mục");
      const data: Product[] = await res.json();
      setProductCate(data);
      const selectedCategory = categories.find((cat) => cat._id === categoryId);
      setCategoryName(selectedCategory ? selectedCategory.name : "");
      setSelectedCategory(categoryId);
    } catch (error) {
      console.error("Lỗi kết nối:", error);
      setError("Không thể tải sản phẩm. Vui lòng thử lại sau.");
    }
  };

  const toSearch = () => {
    router.push("../page/search/Search");
  };

  const renderProductRow = (data: Product[]) => {
    const rows: JSX.Element[] = [];
    for (let i = 0; i < data.length; i += 2) {
      rows.push(
        <View key={i} style={styles.gridRow}>
          <View style={styles.productCardWrapper}>
            <ProductCard item={data[i]} />
          </View>
          {data[i + 1] && (
            <View style={[styles.productCardWrapper, { marginLeft: 10 }]}>
              <ProductCard item={data[i + 1]} />
            </View>
          )}
        </View>
      );
    }
    return rows;
  };

  const sections: Section[] = [
    { type: "header" },
    { type: "search" },
    { type: "banner" },
    { type: "categories", data: categories, title: "Danh mục" },
    { type: "productsByCategory", data: productCate, title: categoryName },
    {
      type: "specialOffers",
      data: products.slice(0, 3),
      title: "Ưu đãi đặc biệt",
    },
    { type: "bestSellers", data: products, title: "Bán chạy nhất" },
    { type: "allProducts", data: products, title: "Tất cả sản phẩm" },
  ];

  const renderSection = ({ item }: { item: Section }) => {
    switch (item.type) {
      case "header":
        return (
          <View style={styles.header}>
            <View style={styles.location}>
              <Image
                style={styles.logo}
                source={require("../../assets/images/logo.jpg")}
              />
              <Text style={styles.locationText}>GreenTree App</Text>
            </View>
            <View style={styles.icon}>
              <TouchableOpacity onPress={() => router.push("../page/cart/cart")}>
                <Ionicons name="cart-outline" size={28} color={"#000"} />
              </TouchableOpacity>
            </View>
          </View>
        );

      case "search":
        return (
          <View style={styles.searchContainer}>
            <TouchableOpacity style={styles.searchWrapper} onPress={toSearch}>
              <Ionicons
                name="search-outline"
                size={20}
                color="#888"
                style={styles.searchIcon}
              />
              <View pointerEvents="none" style={{ flex: 1 }}>
                <TextInput
                  editable={false}
                  style={styles.searchInput}
                  placeholder="Tìm kiếm"
                  placeholderTextColor="#888"
                />
              </View>
            </TouchableOpacity>
          </View>
        );

      case "banner":
        return (
          <View style={styles.banner}>
            <Image
              source={require("../../assets/images/baner.jpg")}
              style={styles.bannerImage}
            />
          </View>
        );

      case "categories":
        return (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{item.title}</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={item.data as Category[]}
              keyExtractor={(category) => category._id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryListHorizontal}
              renderItem={({ item: category }) => (
                <TouchableOpacity
                  onPress={() => handleCate(category._id)}
                  style={[
                    styles.categoryCardHorizontal,
                    selectedCategory === category._id &&
                      styles.categoryCardSelected,
                  ]}
                >
                  <View style={styles.categoryImageWrapper}>
                    <Image
                      source={{ uri: `${ipAddress}/images/${category.image}` }}
                      style={styles.categoryImage}
                    />
                  </View>
                  <Text style={styles.categoryName}>{category.name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        );

      case "productsByCategory":
        return (
          <View>
            {item.data && item.data.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>{item.title}</Text>
                </View>
                <FlatList
                  style={styles.cateProduct}
                  data={item.data as Product[]}
                  keyExtractor={(product) => product._id}
                  columnWrapperStyle={{
                    justifyContent: "space-between",
                    marginBottom: 16,
                  }}
                  numColumns={2}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={[styles.productList]}
                  renderItem={({ item: product }) => (
                    <ProductCard item={product} />
                  )}
                />
              </>
            )}
          </View>
        );

      case "specialOffers":
        return (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{item.title}</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={item.data as Product[]}
              keyExtractor={(product) => product._id}
              renderItem={({ item: product }) => <ProductCard item={product} />}
              contentContainerStyle={styles.productList}
            />
          </View>
        );

      case "bestSellers":
        return (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{item.title}</Text>
              <TouchableOpacity>
                <Text style={styles.seeAll}>Xem tất cả</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={item.data as Product[]}
              keyExtractor={(product) => product._id}
              renderItem={({ item: product }) => <ProductCard item={product} />}
              contentContainerStyle={styles.productList}
            />
          </View>
        );

      case "allProducts":
        return (
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{item.title}</Text>
            </View>
            <View style={styles.allProductContainer}>
              {renderProductRow(item.data as Product[])}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {error && (
        <Text style={{ color: "red", textAlign: "center", padding: 20 }}>
          {error}
        </Text>
      )}
      <FlatList
        data={sections}
        keyExtractor={(item, index) => `${item.type}-${index}`}
        renderItem={renderSection}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: Platform.OS === "ios" ? 50 : 30,
  },
  header: {
    position: "relative",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 15,
    marginLeft: 30,
  },
  logo: {
    width: 50,
    height: 50,
  },
  location: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  icon: {
    position: "absolute",
    width: 100,
    right: -40,
  },
  allProductList: {
    padding: 15,
    paddingBottom: 10,
  },
  categoryListHorizontal: {
    paddingHorizontal: 15,
    paddingBottom: 10,
    marginLeft: 10,
  },
  categoryCardHorizontal: {
    width: 90,
    height: 110,
    borderRadius: 16,
    marginRight: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E2E2E2",
  },
  categoryImageWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  categoryImage: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  categoryName: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    color: "#333",
  },
  categoryCardSelected: {
    borderColor: "#4CAF50",
    borderWidth: 2,
    backgroundColor: "#E6F5EA",
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 20,
  },
  allProductContainer: {
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  gridRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  productCardWrapper: {
    width: "48%",
  },
  locationText: {
    fontSize: 17,
    marginLeft: 5,
    fontFamily: FontFamily.medium,
  },
  searchContainer: {
    paddingHorizontal: 15,
    marginVertical: 10,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2F3F2",
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
  },
  banner: {
    marginHorizontal: 15,
    borderRadius: 10,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    marginTop: 20,
    borderWidth: 0.3,
    borderColor: Colors.primary,
  },
  bannerImage: {
    width: "100%",
    height: 95,
    borderRadius: 10,
    resizeMode: "cover",
    borderWidth: 0.2,
    borderColor: "#eee",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    marginVertical: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "600",
  },
  seeAll: {
    fontSize: 16,
    color: "#53B175",
    fontWeight: "600",
    marginRight: 10,
  },
  productList: {
    padding: 15,
    paddingBottom: 12,
  },
  cateProduct: {
    marginLeft: 15,
  },
});

export default ShopScreen;