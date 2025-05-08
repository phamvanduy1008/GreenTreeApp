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
  const [userId, setUserId] = useState<string>('');
  const [heart, setHeart] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isLoginModalVisible, setLoginModalVisible] = useState(false);


  useEffect(() => {
    const fetchUserIdAndCheckFavorite = async () => {
      const userData = await AsyncStorage.getItem("userData");
      console.log("userData raw:", userData);
      if (userData) {
        const user = JSON.parse(userData);
        console.log("user parsed:", user);
  
        if (user._id) {
          setUserId(user._id);
          console.log("user id:", user._id);
  
          try {
            const response = await fetch(`${ipAddress}/api/favourites/${user._id}`);
            if (!response.ok) throw new Error('Không thể lấy danh sách yêu thích');
            
            const favouriteData = await response.json();
            if (
              favouriteData &&
              favouriteData.products &&
              favouriteData.products.some((product: Products) => product._id === id)
            ) {
              setHeart(true);
            } else {
              setHeart(false);
            }
          } catch (err) {
            console.error('Lỗi khi kiểm tra sản phẩm trong danh sách yêu thích:', err);
          }
        }
      } else {
        console.log("Không có userData trong AsyncStorage");
      }
    };
  
    fetchUserIdAndCheckFavorite();
  }, []);
  
  

  useEffect(() => {  
    const fetchProductDetails = async () => {
      try {
        const response = await fetch(`${ipAddress}/api/products/${id}`);
        if (!response.ok) {
          throw new Error('Không thể lấy thông tin sản phẩm');
        }
        const data = await response.json();
        setProduct(data);

        if (data.category) {
          const categoryResponse = await fetch(`${ipAddress}/api/categories/${data.category}`);
          if (categoryResponse.ok) {
            const categoryData = await categoryResponse.json();
            setCategoryName(categoryData.name);
          }
          const resSimiler = await fetch(`${ipAddress}/api/products/category/${data.category}`);
          if (resSimiler.ok) {
            const similerData = await resSimiler.json();
            setProductSimiler(similerData);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Đã xảy ra lỗi không xác định');
        console.error('Lỗi khi lấy thông tin sản phẩm:', err);
      }
    };

    const checkIfFavorited = async () => {
      if(!userId) return;
      try {
        const response = await fetch(`${ipAddress}/api/favourites/${userId}`);
        
        if (!response.ok) {
          throw new Error('Không thể lấy danh sách yêu thích');
        }

        const favouriteData = await response.json();
        if (
          favouriteData &&
          favouriteData.products &&
          favouriteData.products.some((product: Products) => product._id === id)
        ) {
          setHeart(true);
        } else {
          setHeart(false);
        }
      } catch (err) {
        console.error('Lỗi khi kiểm tra sản phẩm trong danh sách yêu thích:', err);
      }
    };

    fetchProductDetails();
    checkIfFavorited();
  }, [id]);

  const handleGoBack = () => {
    router.back();
  };

  const formatPrice = (price: number): string => {
    return `${price.toLocaleString('vi-VN')} Đ`;
  };

  const handleAddToBasket = async () => {
    if (!product || product.status === 'out_of_stock') return;

    try {
      if (!userId) {
        setLoginModalVisible(true); 
        return;
      }
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
      setTimeout(() => setShowPopup(false), 1500);
    } catch (error) {
      console.error('Lỗi thêm vào giỏ hàng:', error);
      setError('Lỗi khi thêm vào giỏ hàng');
    }
  };

  const handleAddToFavourite = async () => {
    try {
      if (!userId) {
        setLoginModalVisible(true); 
        return;
      }

      if (!heart) {
        const response = await fetch(`${ipAddress}/api/favourites`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user: userId,
            product: id,
          }),
        });

        if (!response.ok) {
          throw new Error('Không thể thêm sản phẩm vào danh sách yêu thích');
        }

        setHeart(true);
      } else {
        const response = await fetch(`${ipAddress}/api/favourites/${userId}/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Không thể xóa sản phẩm khỏi danh sách yêu thích');
        }

        setHeart(false);
      }
    } catch (error) {
      console.error('Lỗi khi xử lý yêu thích:', error);
      setError('Lỗi khi xử lý danh sách yêu thích');
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

  const toggleDescription = () => {
    setIsDescriptionOpen(!isDescriptionOpen);
  };

  const handleViewReviews = () => {
    router.push({
      pathname: "/page/reviews/reviewList",
      params: { productId: id },
    });
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
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
        >
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
              <Ionicons name="chevron-back" size={24} color="black" />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleAddToFavourite}>
              <Ionicons name={heart ? "heart" : "heart-outline"} size={24} color={heart ? "red" : "black"} />
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
                <Text style={styles.price}>{product?.price ? formatPrice(quantity * product.price) : '0 VNĐ'}</Text>
              </View>
              <View style={styles.detail}>
                <TouchableOpacity style={styles.detailDropdown} onPress={toggleDescription}>
                  <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
                  <Ionicons
                    name={isDescriptionOpen ? 'chevron-up' : 'chevron-down'}
                    size={24}
                    color="black"
                  />
                </TouchableOpacity>
                {isDescriptionOpen && (
                  <Text style={styles.productDescription}>{product?.info || 'Không có mô tả'}</Text>
                )}
              </View>
    
              {product?.evaluate && (
                <TouchableOpacity onPress={handleViewReviews} style={styles.section}>
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
                    <ProductCard key={index} item={item} />
                  ))}
                </ScrollView>
              </View>
            </View>
          </ScrollView>
    
          <View style={styles.fixedButtonContainer}>
            <TouchableOpacity
              style={[
                styles.addToBasketButton,
                product?.status === 'out_of_stock' && styles.disabledButton,
              ]}
              onPress={handleAddToBasket}
              disabled={product?.status === 'out_of_stock'}
            >
              <Text style={styles.addToBasketText}>
                {product?.status === 'out_of_stock' ? 'Sản phẩm hết hàng' : 'Thêm vào giỏ hàng'}
              </Text>
            </TouchableOpacity>
          </View>
    
          {showPopup && (
            <View style={styles.popupContainer}>
              <View style={styles.popupContent}>
                <Text style={styles.popupIcon}>🛒</Text>
                <Text style={styles.popupText}>Đã thêm vào giỏ hàng!</Text>
              </View>
            </View>
          )}
    
          {isLoginModalVisible && (
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Yêu cầu đăng nhập</Text>
                <Text style={styles.modalText}>Bạn cần đăng nhập để thực hiện hành động này.</Text>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={styles.modalButton}
                    onPress={() => setLoginModalVisible(false)}
                  >
                    <Text style={styles.modalButtonText}>Quay lại</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.loginButton]}
                    onPress={() => {
                      setLoginModalVisible(false);
                      router.push('/auth/login'); 
                    }}
                  >
                    <Text style={[styles.modalButtonText, { color: '#fff' }]}>Đăng nhập</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>
      </>
    );
};

const styles = StyleSheet.create({
  productList: {
    paddingHorizontal: 15,
  },
  productSimilerArea: {
    paddingTop: 20,
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
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#F5F5F5",
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
    paddingHorizontal: 18,
    paddingVertical: 14,
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
  detail: {
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
    marginBottom: 5,
  },
  sectionTitleSimiler: {
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
    paddingBottom: 30,
  },
  addToBasketButton: {
    backgroundColor: '#53B175',
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#B0B0B0',
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
  modalOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#181725',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: '#7C7C7C',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    marginHorizontal: 5,
  },
  loginButton: {
    backgroundColor: '#53B175',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#181725',
  },
});

export default ProductDetail;