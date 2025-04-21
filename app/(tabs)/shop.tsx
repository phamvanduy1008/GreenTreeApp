import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  StatusBar,
  Platform,
  TextInput,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FontFamily } from '../constants/FontFamily';
import { ipAddress } from '../constants/ip';
import CategoryCard from '../components/specific/shop/CategoryCard';
import ProductCard from '../components/specific/shop/ProductCard';

type Product = {
  _id: string;
  name: string;
  description: string;
  price: string;
  status: string;
  image: string;
  evaluate: number;
};


type Category = {
  _id: string;
  name: string;
  image: string;
  backgroundColor: string;
};

export default function ShopScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const categoryColors = ['#FFF5EE', '#E8F9E9', '#E0F7FA', '#FCE4EC', '#FFF9C4', '#F3E5F5', '#E8EAF6'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resCat = await fetch(`${ipAddress}/api/categories`);
        const catData = await resCat.json();

        const categoriesWithColor = catData.map((cat: any) => ({
          id: cat._id,
          name: cat.name,
          image: cat.image,
          backgroundColor: categoryColors[Math.floor(Math.random() * categoryColors.length)],
        }));

        setCategories(categoriesWithColor);

        const resProd = await fetch(`${ipAddress}/api/products`);
        const prodData = await resProd.json();
        setProducts(prodData);
      } catch (err) {
        console.error('Lỗi fetch dữ liệu:', err);
      }
    };

    fetchData();
  }, []);

  const formatPrice = (price:string) => {
    const formatted = typeof price === 'string' ? parseInt(price, 10) : price;
    return formatted.toLocaleString('vi-VN') + ' Đ';
  };

  return (
    <ScrollView   showsVerticalScrollIndicator={false} 
    style={styles.container} contentContainerStyle={{ paddingBottom: 120 }}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <View style={styles.location}>
          <Image style={styles.logo} source={require('../../assets/images/logo.jpg')} />
          <Text style={styles.locationText}>GreenTree App</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchWrapper}>
          <Ionicons name="search-outline" size={20} color="#888" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm"
            placeholderTextColor="#888"
          />
        </View>
      </View>

      <View style={styles.banner}>
        <Image source={require('../../assets/images/baner.jpg')} style={styles.bannerImage} />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Danh mục</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        renderItem={({ item }) => <CategoryCard item={item} />}
        contentContainerStyle={styles.productList}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Ưu đãi đặc biệt</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={products.slice(0, 3)}
        renderItem={({ item }) => <ProductCard item={item} formatPrice={formatPrice} />}
        contentContainerStyle={styles.productList}
      />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Bán chạy nhất</Text>
        <TouchableOpacity>
          <Text style={styles.seeAll}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={products}
        renderItem={({ item }) => <ProductCard item={item} formatPrice={formatPrice} />}
        contentContainerStyle={styles.productList}
      />

<View style={styles.sectionHeader}>
  <Text style={styles.sectionTitle}>Tất cả sản phẩm</Text>
</View>

<View style={styles.allProductContainer}>
  {Array(Math.ceil(products.length / 2))
    .fill(null)
    .map((_, rowIndex) => (
      <View key={rowIndex} style={styles.gridRow}>
        {products[rowIndex * 2] && (
          <View style={styles.productCardWrapper}>
            <ProductCard
              item={products[rowIndex * 2]}
              formatPrice={formatPrice}
            />
          </View>
        )}
        {products[rowIndex * 2 + 1] && (
          <View style={[styles.productCardWrapper, { marginLeft: 10 }]}>
            <ProductCard
              item={products[rowIndex * 2 + 1]}
              formatPrice={formatPrice}
            />
          </View>
        )}
      </View>
    ))}
</View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  logo: {
    width: 50,
    height: 50,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  allProductList: {
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  allProductContainer: {
    paddingHorizontal: 15,
    paddingBottom: 10,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  productCardWrapper: {
    width: '48%',
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F3F2',
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
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginTop: 20,
  },
  bannerImage: {
    width: '100%',
    height: 95,
    borderRadius: 10,
    resizeMode: 'cover',
    borderWidth:0.2,
    color:"#ccc",
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginVertical: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
  },
  seeAll: {
    fontSize: 16,
    color: '#53B175',
    fontWeight: '600',
    marginRight: 10,
  },
  productList: {
    paddingHorizontal: 15,
  },
});
