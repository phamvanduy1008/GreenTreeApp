import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ipAddress } from '@/app/constants/ip';
import { Colors } from '@/app/constants/Colors';
import { router, useLocalSearchParams } from 'expo-router';

type TabType = 'Chờ xác nhận' | 'Chờ lấy hàng' | 'Chờ giao hàng' | 'Đã giao' | 'Đã hủy';

type RootStackParamList = {
  Orders: undefined;
  OrderDetailScreen: { orderId: string; products: Product[] };
};

type Product = {
  _id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
  info?: string;
};

type Order = {
  _id: string;
  orderCode: string;
  products: Product[];
  dateOrder: string;
  status: 'pending' | 'resolved' | 'processing' | 'delivered' | 'cancelled';
};

type Orders = {
  [key in TabType]: Order[];
};

const getStatusLabel = (statusParam: string | string[] | undefined): TabType => {
  switch (statusParam) {
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
      return 'Chờ xác nhận';
  }
};

type OrderNavigationProp = StackNavigationProp<RootStackParamList, 'Orders'>;

const OrderInterface: React.FC = () => {
  const [cate, setCate] = useState<Orders>({
    'Chờ xác nhận': [],
    'Chờ lấy hàng': [],
    'Chờ giao hàng': [],
    'Đã giao': [],
    'Đã hủy': [],
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const navigation = useNavigation<OrderNavigationProp>();
  const tabs: TabType[] = ['Chờ xác nhận', 'Chờ lấy hàng', 'Chờ giao hàng', 'Đã giao', 'Đã hủy'];

  const { status } = useLocalSearchParams();
  const defaultTab = getStatusLabel(status);

  const [activeTab, setActiveTab] = useState<TabType>(defaultTab ? defaultTab : 'Chờ xác nhận');

  const fetchOrders = async () => {
    try {
      setError(null);

      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        throw new Error('User ID không tìm thấy trong AsyncStorage');
      }

      const res = await fetch(`${ipAddress}/api/seller/${userId}`);
      if (!res.ok) {
        throw new Error('Không thể tải dữ liệu đơn hàng');
      }
      const data = await res.json();

      const categorizedOrders: Orders = {
        'Chờ xác nhận': (data.pending || []).map((order: any) => ({
          _id: order._id,
          orderCode: order.orderCode,
          products: order.products.map((p: any) => ({
            _id: p.product._id,
            name: p.product.name,
            quantity: p.quantity,
            price: p.price,
            image: p.product.image,
            info: p.product.info,
          })),
          dateOrder: order.dateOrder,
          status: order.status,
        })),
        'Chờ lấy hàng': (data.resolved || []).map((order: any) => ({
          _id: order._id,
          orderCode: order.orderCode,
          products: order.products.map((p: any) => ({
            _id: p.product._id,
            name: p.product.name,
            quantity: p.quantity,
            price: p.price,
            image: p.product.image,
            info: p.product.info,
          })),
          dateOrder: order.dateOrder,
          status: order.status,
        })),
        'Chờ giao hàng': (data.processing || []).map((order: any) => ({
          _id: order._id,
          orderCode: order.orderCode,
          products: order.products.map((p: any) => ({
            _id: p.product._id,
            name: p.product.name,
            quantity: p.quantity,
            price: p.price,
            image: p.product.image,
            info: p.product.info,
          })),
          dateOrder: order.dateOrder,
          status: order.status,
        })),
        'Đã giao': (data.delivered || []).map((order: any) => ({
          _id: order._id,
          orderCode: order.orderCode,
          products: order.products.map((p: any) => ({
            _id: p.product._id,
            name: p.product.name,
            quantity: p.quantity,
            price: p.price,
            image: p.product.image,
            info: p.product.info,
          })),
          dateOrder: order.dateOrder,
          status: order.status,
        })),
        'Đã hủy': (data.cancelled || []).map((order: any) => ({
          _id: order._id,
          orderCode: order.orderCode,
          products: order.products.map((p: any) => ({
            _id: p.product._id,
            name: p.product.name,
            quantity: p.quantity,
            price: p.price,
            image: p.product.image,
            info: p.product.info,
          })),
          dateOrder: order.dateOrder,
          status: order.status,
        })),
      };
      setCate(categorizedOrders);
    } catch (error) {
      setError('Không thể tải đơn hàng');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const handleCancelOrder = async (orderId: string, orderCode: string) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        throw new Error('User ID không tìm thấy trong AsyncStorage');
      }

      const response = await fetch(`${ipAddress}/api/orders/${orderId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Không thể hủy đơn hàng');
      }

      // Tạo thông báo
      await fetch(`${ipAddress}/api/notices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: userId,
          order: orderId,
          title: "Đơn hàng đã bị hủy",
          message: `Đơn hàng ${orderCode} đã được hủy thành công.`,
          type: "cancelled",
        }),
      });

      // Lấy lại danh sách đơn hàng
      const res = await fetch(`${ipAddress}/api/seller/${userId}`);
      if (!res.ok) {
        throw new Error('Không thể tải dữ liệu đơn hàng');
      }

      const data = await res.json();
      const categorizedOrders: Orders = {
        'Chờ xác nhận': (data.pending || []).map((order: any) => ({
          _id: order._id,
          orderCode: order.orderCode,
          products: order.products.map((p: any) => ({
            _id: p.product._id,
            name: p.product.name,
            quantity: p.quantity,
            price: p.price,
            image: p.product.image,
            info: p.product.info,
          })),
          dateOrder: order.dateOrder,
          status: order.status,
        })),
        'Chờ lấy hàng': (data.resolved || []).map((order: any) => ({
          _id: order._id,
          orderCode: order.orderCode,
          products: order.products.map((p: any) => ({
            _id: p.product._id,
            name: p.product.name,
            quantity: p.quantity,
            price: p.price,
            image: p.product.image,
            info: p.product.info,
          })),
          dateOrder: order.dateOrder,
          status: order.status,
        })),
        'Chờ giao hàng': (data.processing || []).map((order: any) => ({
          _id: order._id,
          orderCode: order.orderCode,
          products: order.products.map((p: any) => ({
            _id: p.product._id,
            name: p.product.name,
            quantity: p.quantity,
            price: p.price,
            image: p.product.image,
            info: p.product.info,
          })),
          dateOrder: order.dateOrder,
          status: order.status,
        })),
        'Đã giao': (data.delivered || []).map((order: any) => ({
          _id: order._id,
          orderCode: order.orderCode,
          products: order.products.map((p: any) => ({
            _id: p.product._id,
            name: p.product.name,
            quantity: p.quantity,
            price: p.price,
            image: p.product.image,
            info: p.product.info,
          })),
          dateOrder: order.dateOrder,
          status: order.status,
        })),
        'Đã hủy': (data.cancelled || []).map((order: any) => ({
          _id: order._id,
          orderCode: order.orderCode,
          products: order.products.map((p: any) => ({
            _id: p.product._id,
            name: p.product.name,
            quantity: p.quantity,
            price: p.price,
            image: p.product.image,
            info: p.product.info,
          })),
          dateOrder: order.dateOrder,
          status: order.status,
        })),
      };

      setCate(categorizedOrders);
    } catch (err) {
      console.error("Lỗi khi hủy đơn hàng:", err);
      setError('Lỗi khi hủy đơn hàng');
    }
  };

  const handleConfirmReceipt = async (orderId: string, orderCode: string) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        throw new Error('User ID không tìm thấy trong AsyncStorage');
      }

      const response = await fetch(`${ipAddress}/api/orders/${orderId}/confirm`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, status: 'delivered' }),
      });

      if (!response.ok) {
        throw new Error('Không thể xác nhận nhận hàng');
      }

      // Tạo thông báo
      await fetch(`${ipAddress}/api/notices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user: userId,
          order: orderId,
          title: "Đơn hàng đã giao thành công",
          message: `Đơn hàng ${orderCode} đã giao thành công.`,
          type: "delivered",
        }),
      });

      // Lấy lại danh sách đơn hàng
      const res = await fetch(`${ipAddress}/api/seller/${userId}`);
      if (!res.ok) {
        throw new Error('Không thể tải dữ liệu đơn hàng');
      }
      const data = await res.json();
      const categorizedOrders: Orders = {
        'Chờ xác nhận': (data.pending || []).map((order: any) => ({
          _id: order._id,
          orderCode: order.orderCode,
          products: order.products.map((p: any) => ({
            _id: p.product._id,
            name: p.product.name,
            quantity: p.quantity,
            price: p.price,
            image: p.product.image,
            info: p.product.info,
          })),
          dateOrder: order.dateOrder,
          status: order.status,
        })),
        'Chờ lấy hàng': (data.resolved || []).map((order: any) => ({
          _id: order._id,
          orderCode: order.orderCode,
          products: order.products.map((p: any) => ({
            _id: p.product._id,
            name: p.product.name,
            quantity: p.quantity,
            price: p.price,
            image: p.product.image,
            info: p.product.info,
          })),
          dateOrder: order.dateOrder,
          status: order.status,
        })),
        'Chờ giao hàng': (data.processing || []).map((order: any) => ({
          _id: order._id,
          orderCode: order.orderCode,
          products: order.products.map((p: any) => ({
            _id: p.product._id,
            name: p.product.name,
            quantity: p.quantity,
            price: p.price,
            image: p.product.image,
            info: p.product.info,
          })),
          dateOrder: order.dateOrder,
          status: order.status,
        })),
        'Đã giao': (data.delivered || []).map((order: any) => ({
          _id: order._id,
          orderCode: order.orderCode,
          products: order.products.map((p: any) => ({
            _id: p.product._id,
            name: p.product.name,
            quantity: p.quantity,
            price: p.price,
            image: p.product.image,
            info: p.product.info,
          })),
          dateOrder: order.dateOrder,
          status: order.status,
        })),
        'Đã hủy': (data.cancelled || []).map((order: any) => ({
          _id: order._id,
          orderCode: order.orderCode,
          products: order.products.map((p: any) => ({
            _id: p.product._id,
            name: p.product.name,
            quantity: p.quantity,
            price: p.price,
            image: p.product.image,
            info: p.product.info,
          })),
          dateOrder: order.dateOrder,
          status: order.status,
        })),
      };
      setCate(categorizedOrders);
    } catch (err) {
      setError('Lỗi khi xác nhận nhận hàng');
    }
  };

  const calculateShippingFee = (totalQuantity: number) => {
    if (totalQuantity < 20) return 20000;
    if (totalQuantity < 30) return 30000;
    if (totalQuantity < 40) return 40000;
    if (totalQuantity < 50) return 50000;
    return 60000;
  };


  const TabNavigation: React.FC = () => (
    <View style={styles.tabContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScrollView}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const getDeliveryStatus = (status: Order['status']) => {
    switch (status) {
      case 'pending':
        return {
          text: 'Đang Chờ xác nhận',
          showActionButton: true,
          textBtn: 'Hủy đơn hàng',
          actionHandler: handleCancelOrder,
        };
      case 'resolved':
        return {
          text: 'Đã chuẩn bị hàng, chờ lấy',
          showActionButton: false,
          textBtn: '',
          actionHandler: () => {},
        };
      case 'processing':
        return {
          text: 'Đơn hàng đã đến kho phân loại',
          showActionButton: true,
          textBtn: 'Đã nhận được hàng',
          actionHandler: handleConfirmReceipt,
        };
      case 'delivered':
        return {
          text: 'Đã giao hàng',
          showActionButton: false,
          textBtn: '',
          actionHandler: () => {},
        };
      case 'cancelled':
        return {
          text: 'Đơn hàng đã bị hủy',
          showActionButton: false,
          textBtn: '',
          actionHandler: () => {},
        };
      default:
        return {
          text: 'Trạng thái không xác định',
          showActionButton: false,
          textBtn: '',
          actionHandler: () => {},
        };
    }
  };

  const renderOrderList = (tab: TabType) => {
    if (loading) {
      return <Text style={styles.loadingText}>Đang tải...</Text>;
    }

    if (error) {
      return <Text style={styles.errorText}>{error}</Text>;
    }

    const orderList = Array.isArray(cate[tab]) ? cate[tab] : [];

    if (orderList.length === 0) {
      return (
        <View style={styles.AreaNoOrder}>
          <Image
            style={styles.ImgNoOrder}
            source={require('../../../../assets/images/order/order-now.png')}
          />
          <Text style={styles.noOrdersText}>Không có đơn hàng trong danh mục này.</Text>
        </View>
      );
    }

    return orderList.map((order, index) => {
      const deliveryStatus = getDeliveryStatus(order.status);
      const estimatedDeliveryDate = new Date(
        new Date(order.dateOrder).setDate(new Date(order.dateOrder).getDate() + 3)
      );
      const totalQuantity = order.products.reduce((sum, p) => sum + p.quantity, 0);
      const totalPrice = order.products.reduce((sum, p) => sum + p.price * p.quantity, 0);

      return (
        <TouchableOpacity
          onPress={() => {
            router.push({
              pathname: '/page/account/acc/OrderDetail/[id]',
              params: { id: order._id },
            });
          }}
          key={index}
          style={styles.orderItem}
        >
          <View style={styles.orderHeader}>
            <Text style={styles.orderCode}>Mã đơn: {order.orderCode}</Text>
            <Text style={styles.orderStatus}>{tab}</Text>
          </View>

          {order.products.map((product, idx) => (
            <View key={idx} style={styles.orderContent}>
              {product.image ? (
                <Image
                  source={{ uri: `${ipAddress}/${product.image}` }}
                  style={styles.productImage}
                />
              ) : (
                <View style={[styles.productImage, { backgroundColor: '#fff' }]} />
              )}

              <View style={styles.orderDetails}>
                <Text style={styles.productName} numberOfLines={2}>
                  {product.name}
                </Text>
                <Text style={styles.orderText}>Mô tả: {product.info || 'Không có thông tin'}</Text>
                <Text style={styles.orderText}>Số lượng: x{product.quantity}</Text>
                <Text style={styles.totalPriceValue}>
                  đ{(product.price * product.quantity).toLocaleString()}
                </Text>
              </View>
            </View>
          ))}

          <View style={styles.totalPriceContainer}>
            <Text style={styles.totalPriceText}>Tổng số tiền ({totalQuantity} sản phẩm):</Text>
            <Text style={styles.priceText}>
              {(totalPrice + calculateShippingFee(totalQuantity)).toLocaleString()}đ
            </Text>
          </View>

          <View style={styles.deliveryInfo}>
            <Text style={styles.deliveryText}>
              Thời gian giao dự kiến: {new Date(order.dateOrder).toLocaleDateString()} -{' '}
              {estimatedDeliveryDate.toLocaleDateString()}
            </Text>
            <Text style={styles.deliveryText}>{deliveryStatus.text}</Text>
          </View>

          <View style={styles.buttonContainer}>
            {deliveryStatus.showActionButton && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => deliveryStatus.actionHandler(order._id, order.orderCode)}
              >
                <Text style={styles.actionButtonText}>{deliveryStatus.textBtn}</Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      );
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>{'←'}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đơn đã mua</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => {
              router.push('/page/account/support/contact');
            }}
            style={styles.messagesButton}
          >
            <Ionicons name="chatbubble-ellipses-outline" size={30} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <TabNavigation />

      <ScrollView
        style={styles.orderListContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {renderOrderList(activeTab)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingTop: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 5,
  },
  backButtonText: {
    fontSize: 24,
    color: Colors.primary,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 15,
  },
  messagesButton: {
    padding: 5,
  },
  tabContainer: {
    height: 60,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tabScrollView: {
    flexGrow: 0,
  },
  tabButton: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTabButton: {
    borderBottomWidth: 3,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  orderListContainer: {
     flex: 1,
    padding: 10,
    backgroundColor: '#f8f8f8',
  },
  orderItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderCode: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  orderStatus: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
  orderContent: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  productImage: {
    width: 90,
    height: 90,
    borderRadius: 10,
    marginRight: 15,
    backgroundColor: '#f0f0f0',
  },
  orderDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  orderText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.primary,
    marginTop: 5,
  },
  AreaNoOrder: {
    marginTop: 110,
    alignItems: 'center',
  },
  ImgNoOrder: {
    width: 110,
    height: 90,
  },
  totalPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  totalPriceText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  totalPriceValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  deliveryInfo: {
    backgroundColor: '#e8f0fe',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  deliveryText: {
    fontSize: 14,
    color: Colors.primary,
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 15,
    gap: 12,
  },
  trackButton: {
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  trackButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  actionButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  noOrdersText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 30,
    fontStyle: 'italic',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 30,
  },
  errorText: {
    fontSize: 16,
    color: '#e63946',
    textAlign: 'center',
    marginTop: 30,
  },
});

export default OrderInterface;