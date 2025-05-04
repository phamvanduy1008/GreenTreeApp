import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Modal, Pressable, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ipAddress } from '@/app/constants/ip';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  status: string;
  image: string;
  evaluate: number;
};

const ProductCard = ({ item }: { item: Product }) => {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showPopup, setShowPopup] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const formatPrice = (price: number): string => {
    return `${price.toLocaleString('vi-VN')} Đ`;
  };

  const handlePress = () => {
    router.push(`/page/productDetail/${item._id}`);
  };

  const handleAddPress = () => {
    if (item.status === 'out_of_stock') {
      setError('Sản phẩm đã hết hàng');
      setShowPopup(true);
      setTimeout(() => {
        setShowPopup(false);
        setError(null);
      }, 1500);
      return;
    }
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedColor(null);
    setQuantity(1);
    setError(null);
  };

  const handleIncreaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecreaseQuantity = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleAddToBasket = async () => {
    if (!item) return;

    try {
      setIsLoading(true);
      setError(null);

      const userData = await AsyncStorage.getItem('userData');
      if (!userData) {
        setError('Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng.');
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
          product: item._id,
          user: userId,
          quantity: quantity,
        }),
      });

      if (!response.ok) {
        throw new Error('Thêm vào giỏ hàng thất bại');
      }

      const result = await response.json();
      console.log('Thêm vào giỏ hàng thành công:', result);

      // Close modal first
      handleCloseModal();

      // Then show success popup
      setShowPopup(true);
      setTimeout(() => {
        setShowPopup(false);
      }, 1500);
    } catch (error) {
      console.error('Lỗi thêm vào giỏ hàng:', error);
      setError('Lỗi khi thêm vào giỏ hàng');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View>
      <TouchableOpacity style={styles.productCard} onPress={handlePress}>
        <Image
          source={item.image ? { uri: `${ipAddress}/${item.image}` } : require('../../../assets/images/test.png')}
          style={styles.productImage}
        />
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productDescription}>
          {item.status === 'available' ? 'Còn hàng' : 'Hết hàng'}
        </Text>
        <View style={styles.priceContainer}>
          <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddPress}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* Popup Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={handleCloseModal}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Image
              source={item.image ? { uri: `${ipAddress}/${item.image}` } : require('../../../assets/images/test.png')}
              style={styles.modalImage}
            />
            <Text style={styles.modalName}>{item.name}</Text>
            <Text style={styles.modalPrice}>{formatPrice(item.price)}</Text>
            <Text style={styles.modalStorage}>Kho: {item.status === 'available' ? '150' : '0'}</Text>

            <View style={styles.quantityContainer}>
              <Text style={styles.quantityLabel}>Số lượng</Text>
              <View style={styles.quantityControls}>
                <TouchableOpacity style={styles.quantityButton} onPress={handleDecreaseQuantity}>
                  <Ionicons name="remove" size={20} color="#333" />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity style={styles.quantityButton} onPress={handleIncreaseQuantity}>
                  <Ionicons name="add" size={20} color="#333" />
                </TouchableOpacity>
              </View>
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity
              style={[styles.addToCartButton, isLoading && styles.disabledButton]}
              onPress={handleAddToBasket}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.addToCartText}>Thêm vào Giỏ hàng</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Error/Success Popup */}
      {showPopup && (
        <View style={[styles.successPopup, error ? styles.errorPopup : null]}>
          <Text style={styles.successText}>{error || 'Đã thêm vào giỏ hàng!'}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  productCard: {
    width: 170,
    marginRight: 20,
    borderWidth: 1,
    borderColor: '#E2E2E2',
    borderRadius: 18,
    padding: 15,
    alignItems: 'flex-start',
    backgroundColor: '#fff',
  },
  productImage: {
    width: 130,
    height: 130,
    alignSelf: 'center',
    borderRadius: 30,
    marginBottom: 20,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#181725',
    marginTop: 10,
  },
  productDescription: {
    fontSize: 14,
    color: '#7C7C7C',
    marginTop: 5,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginTop: 5,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '600',
    color: '#181725',
  },
  addButton: {
    backgroundColor: '#53B175',
    borderRadius: 12,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContainer: {
    width: 320,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  modalImage: {
    width: 120,
    height: 120,
    borderRadius: 15,
    marginBottom: 15,
    backgroundColor: '#f5f5f5',
  },
  modalName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalPrice: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E91E63',
    marginBottom: 8,
  },
  modalStorage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 5,
  },
  quantityButton: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quantityText: {
    marginHorizontal: 15,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  addToCartButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#A5D6A7',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'center',
  },
  successPopup: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -20 }],
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 10,
    zIndex: 1000,
  },
  errorPopup: {
    backgroundColor: '#D32F2F',
  },
  successText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProductCard;