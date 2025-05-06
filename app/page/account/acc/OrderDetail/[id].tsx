
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StatusBar,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ipAddress } from '@/app/constants/ip';
import { Colors } from '@/app/constants/Colors';

type Product = {
  _id: string;
  name: string;
  price: number;
  image?: string;
  info?: string;
  quantity: number;
};

type Order = {
  _id: string;
  products: Product[];
  status: string;
  orderCode: string;
  full_name?: string;
  phone?: string;
  address?: string;
  paymentMethod?: string;
  dateOrder?: string;
  createdAt: string;
  updatedAt: string;
};

const OrderDetailScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`${ipAddress}/api/orders/${id}`);
      if (!res.ok) {
        throw new Error('Không thể tải thông tin đơn hàng');
      }
      const data = await res.json();
      const formattedOrder: Order = {
        _id: data._id,
        orderCode: data.orderCode,
        status: data.status,
        products: data.products.map((p: any) => ({
          _id: p.product._id,
          name: p.product.name,
          price: p.price,
          quantity: p.quantity,
          image: p.product.image,
          info: p.product.info,
        })),
        full_name: data.full_name,
        phone: data.phone,
        address: data.address,
        paymentMethod: data.paymentMethod,
        dateOrder: data.dateOrder,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
      setOrder(formattedOrder);
      setLoading(false);
    } catch (err) {
      setError('Lỗi khi tải thông tin đơn hàng');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

  const calculateShippingFee = (totalQuantity: number) => {
    if (totalQuantity < 20) return 20000;
    if (totalQuantity < 30) return 30000;
    if (totalQuantity < 40) return 40000;
    if (totalQuantity < 50) return 50000;
    return 60000;
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Chờ xác nhận';
      case 'resolved':
        return 'Chờ lấy hàng';
      case 'processing':
        return 'Chờ giao hàng';
      case 'delivered':
        return 'Đã giao';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return 'Không xác định';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return '#f5a623'; 
      case 'resolved':
        return '#9333ea'; 
      case 'processing':
        return '#4a90e2'; 
      case 'delivered':
        return '#7ed321';
      case 'cancelled':
        return '#e53935'; 
      default:
        return '#999'; 
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (e) {
      return 'Không xác định';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Đang tải thông tin đơn hàng...</Text>
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <Ionicons name="alert-circle-outline" size={64} color="#e63946" />
        <Text style={styles.errorText}>{error || 'Không tìm thấy đơn hàng'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchOrderDetails}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.backButtonError}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const totalQuantity = order.products.reduce((sum, p) => sum + p.quantity, 0);
  const totalPrice = order.products.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const shippingFee = calculateShippingFee(totalQuantity);
  const grandTotal = totalPrice + shippingFee;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View style={styles.orderSummaryCard}>
          <View style={styles.orderCodeContainer}>
            <Text style={styles.orderCode}>Mã đơn: {order.orderCode}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
              <Text style={styles.statusText}>{getStatusLabel(order.status)}</Text>
            </View>
          </View>
          <View style={styles.orderDateContainer}>
            <Ionicons name="calendar-outline" size={16} color="#666" style={styles.icon} />
            <Text style={styles.orderDate}>
              Ngày đặt: {formatDate(order.dateOrder || order.createdAt)}
            </Text>
          </View>
        </View>

        {/* Product Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin sản phẩm</Text>
          {order.products.map((product, index) => (
            <View key={index} style={styles.productContainer}>
              <Image
                source={{
                  uri: product.image
                    ? `${ipAddress}/${product.image}`
                    : `${ipAddress}/images/product/placeholder.png`
                }}
                style={styles.productImage}
              />
              <View style={styles.productDetails}>
                <Text style={styles.productName} numberOfLines={2}>
                  {product.name}
                </Text>
                <Text style={styles.productPrice}>
                  đ{product.price.toLocaleString()}
                </Text>
                <View style={styles.quantityContainer}>
                  <Text style={styles.quantityText}>Số lượng: </Text>
                  <Text style={styles.quantityValue}>x{product.quantity}</Text>
                </View>
              </View>
            </View>
          ))}
          {order.products.some((p) => p.info) && (
            <View style={styles.productInfoContainer}>
              <Text style={styles.productInfoLabel}>Mô tả sản phẩm:</Text>
              {order.products.map((product, index) => (
                product.info && (
                  <Text key={index} style={styles.productInfoValue}>
                    {product.name}: {product.info}
                  </Text>
                )
              ))}
            </View>
          )}
        </View>

        {/* Shipping Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin giao hàng</Text>
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="person-outline" size={18} color={Colors.primary} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Người nhận:</Text>
              <Text style={styles.infoValue}>{order.full_name || 'Chưa cung cấp'}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="call-outline" size={18} color={Colors.primary} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Số điện thoại:</Text>
              <Text style={styles.infoValue}>{order.phone || 'Chưa cung cấp'}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="location-outline" size={18} color={Colors.primary} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Địa chỉ giao hàng:</Text>
              <Text style={styles.infoValue}>{order.address || 'Chưa cung cấp'}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="card-outline" size={18} color={Colors.primary} />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Phương thức thanh toán:</Text>
              <Text style={styles.infoValue}>
                {order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : order.paymentMethod || 'Chưa cung cấp'}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tổng thanh toán</Text>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Tổng tiền hàng:</Text>
            <Text style={styles.paymentValue}>đ{totalPrice.toLocaleString()}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>Phí vận chuyển:</Text>
            <Text style={styles.paymentValue}>đ{shippingFee.toLocaleString()}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.paymentRowTotal}>
            <Text style={styles.paymentLabelTotal}>Tổng thanh toán:</Text>
            <Text style={styles.paymentValueTotal}>
              đ{grandTotal.toLocaleString()}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  orderSummaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  orderCodeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderCode: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  orderDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 5,
  },
  orderDate: {
    fontSize: 13,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  productContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  productDetails: {
    flex: 1,
    paddingLeft: 16,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 6,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 14,
    color: '#666',
  },
  quantityValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  productInfoContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  productInfoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productInfoValue: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  infoIconContainer: {
    width: 30,
    alignItems: 'center',
    marginRight: 10,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 4,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#666',
  },
  paymentValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  paymentRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    marginTop: 4,
  },
  paymentLabelTotal: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  paymentValueTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  errorText: {
    fontSize: 16,
    color: '#e63946',
    marginVertical: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 12,
    width: 200,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backButtonError: {
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: 200,
    alignItems: 'center',
  },
  backButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OrderDetailScreen;