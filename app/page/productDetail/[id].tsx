import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ipAddress } from '@/app/constants/ip';
import ProductCard from '../shop/ProductCard';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Products = {
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
};

const ProductDetail = () => {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [product, setProduct] = useState<Products | null>(null);
  const [productSimiler, setProductSimiler] = useState<Products[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const [categoryName, setCategoryName] = useState<string>('Không xác định');
  const [heart, setHeart] = useState(false);
  const [showPopup, setShowPopup] = useState(false);


  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        const response = await fetch(`${ipAddress}/api/products/${id}`);
        if (!response.ok) {
          throw new Error('Không thể lấy thông tin sản phẩm');
        }
        const data = await response.json();
        setProduct(data);
        console.log("data1",data.category);

        if (data.category) {
          const categoryResponse = await fetch(`${ipAddress}/api/categories/${data.category}`);
          if (categoryResponse.ok) {
            const data = await categoryResponse.json();
            setCategoryName(data.name);
          }
          const resSimiler = await fetch(`${ipAddress}/api/products/category/${data.category}`);
          if (resSimiler.ok) {
            const data = await resSimiler.json();
            setProductSimiler(data);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định');
        console.error('Lỗi khi lấy thông tin sản phẩm:', err);
      }
    };
    fetchProductDetails();
  }, [id]);

  const handleGoBack = () => {
    router.back();
  };

  const formatPrice = (price: number): string => {
    return `${price.toLocaleString('vi-VN')} Đ`;
  };
  

  const handleAddToBasket = async () => {
    if (!product) return;
  
    try {
      const userData = await AsyncStorage.getItem("userData");
      if (!userData) {
        setError("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng.");
        return;
      }
  
      const user = JSON.parse(userData);
      const userId = user._id;
  
      const response = await fetch(`${ipAddress}/api/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product: product._id,
          user: userId,
          quantity: quantity,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Thêm vào giỏ hàng thất bại');
      }
  
      
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 1500);;
    } catch (error) {
      console.error('Lỗi thêm vào giỏ hàng:', error);
      setError('Lỗi khi thêm vào giỏ hàng');
    }
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  const handleAddToHeart = () => {
    setHeart(!heart);

  }

  const toggleDescription = () => {
    setIsDescriptionOpen(!isDescriptionOpen);
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text>Lỗi: {error}</Text>
        <TouchableOpacity onPress={handleGoBack}>
          <Text style={styles.goBackText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={handleGoBack}>
              <Ionicons name="chevron-back" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleAddToHeart}>
              <Ionicons name="heart-outline" size={24}  color={heart ? "red" : "black"} />
            </TouchableOpacity>
          </View>

          <View style={styles.areaImage}>
            <Image
              source={product?.image ? { uri: `${ipAddress}/${product.image}` } : require('../../../assets/images/test.png')}
              style={styles.imgPlant}
            />
          </View>

          <View style={styles.productInfoContainer}>
            <View style={styles.titleRow}>
              <Text style={styles.productName}>{product?.name || 'Tên sản phẩm'}</Text>
              <Text
                style={[
                  styles.statusText,
                  product?.status === 'available' ? styles.statusAvailable : styles.statusOutOfStock,
                ]}
              >
                {product?.status === 'available' ? 'Còn hàng' : 'Hết hàng'}
              </Text>
            </View>
            <View style={styles.infoRow}>
            <Text style={styles.infoText}>{categoryName}</Text>
          </View>

            <View style={styles.quantityPriceRow}>
              <View style={styles.quantitySelector}>
                <TouchableOpacity style={styles.quantityButton} onPress={decreaseQuantity}>
                  <Ionicons name="remove" size={24} color="black" />
                </TouchableOpacity>
                <Text style={styles.quantity}>{quantity}</Text>
                <TouchableOpacity style={styles.quantityButton} onPress={increaseQuantity}>
                  <Ionicons name="add" size={24} color="green" />
                </TouchableOpacity>
              </View>
              <Text style={styles.price}>{product?.price ? formatPrice(quantity*product.price) : '0 VNĐ'}</Text>
            </View>
            <View style={styles.detail} >
            <TouchableOpacity style={styles.detailDropdown} onPress={toggleDescription}>
              <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
              <Ionicons
                name={isDescriptionOpen ? 'chevron-up' : 'chevron-down'}
                size={24}
                color="black"
              />
            </TouchableOpacity>
            {showPopup && (
          <View style={styles.popupContainer}>
            <View style={styles.popupContent}>
              <Text style={styles.popupIcon}>🛒</Text>
              <Text style={styles.popupText}>Đã thêm vào giỏ hàng!</Text>
            </View>
          </View>
        )}
            {isDescriptionOpen && (
              <Text style={styles.productDescription}>{product?.info || 'Không có mô tả'}</Text>
            )}
            </View>

            {product?.evaluate && (
              <TouchableOpacity style={styles.section}>
                <Text style={styles.sectionTitle}>Đánh giá</Text>
                <View style={styles.sectionRight}>
                  <View style={styles.starRating}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Ionicons
                        key={star}
                        name={star <= Math.round(product.evaluate) ? 'star' : 'star-outline'}
                        size={16}
                        color="#F3603F"
                      />
                    ))}
                  </View>
                  <Ionicons name="chevron-forward" size={24} color="black" />
                </View>
              </TouchableOpacity>
            )}
              <View style={styles.productSimilerArea}>
            <Text style={styles.sectionTitleSimiler}>Sản phẩm tương tự</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {productSimiler.map((item, index) => (
                <ProductCard key={index} item={item}  />
              ))}
            </ScrollView>
          </View>

          </View>
        </ScrollView>

        <View style={styles.fixedButtonContainer}>
          <TouchableOpacity style={styles.addToBasketButton} onPress={handleAddToBasket}>
            <Text style={styles.addToBasketText}>Thêm vào giỏ hàng</Text>
          </TouchableOpacity>
        </View>



      </View>
    </>
  );
};

const styles = StyleSheet.create({
  productList: {
    paddingHorizontal: 15,
  },
  productSimilerArea:{
    paddingTop:20,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 100,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  goBackText: {
    color: 'blue',
    marginTop: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 40,
  },
  areaImage: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    overflow: 'hidden',
  },
  imgPlant: {
    width: 280,
    height: 280,
    borderRadius: 80,
    marginHorizontal: 10,
  },
  productInfoContainer: {
    padding: 16,
    marginTop: 10,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  productName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#181725',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  statusAvailable: {
    color: '#53B175',
    backgroundColor: '#E8F5E9',
  },
  statusOutOfStock: {
    color: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  quantityPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 20,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',

    borderRadius: 15,
    overflow: 'hidden',
  },
  quantityButton: {
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantity: {
    paddingHorizontal:18,
    paddingVertical:14,
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    borderRadius: 20,
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#181725',
  },
  detail:{
    borderBottomWidth: 1,
    borderBottomColor: '#E2E2E2',
    borderTopWidth: 1,
    borderTopColor: '#E2E2E2',
  },
  detailDropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  popupContainer: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    alignItems: 'center',
    zIndex: 999,
  },
  popupContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  popupIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  popupText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#181725',
    marginBottom:5,
  },
  sectionTitleSimiler:{
    fontSize: 16,
    fontWeight: 'bold',
    color: '#181725',
    marginBottom: 20,
  },
  productDescription: {
    color: '#7C7C7C',
    lineHeight: 21,
    marginVertical: 16,
  },
  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E2E2',
  },
  sectionRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starRating: {
    flexDirection: 'row',
    marginRight: 10,
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#FFFFFF', 
    paddingBottom:30,
  },
  addToBasketButton: {
    backgroundColor: '#53B175',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
  },
  addToBasketText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#181725',
    marginRight: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#7C7C7C',
    fontWeight: '500',
  },
});

export default ProductDetail;