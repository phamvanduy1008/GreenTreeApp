import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
type Product = {
  _id: string;
  name: string;
  description: string;
  price: string;
  status: string;
  image: string;
  evaluate: number;
};

const ProductCard = ({ item, formatPrice }: { item: Product; formatPrice: (price: string) => string }) => {
  const router = useRouter();

  const handlePress = () => {
    router.push(`../productDetail/${item._id}`);
  };

  return (
    <TouchableOpacity style={styles.productCard} onPress={handlePress}>
      <Image
        source={item.image ? { uri: item.image } : require('../../../assets/images/test.png')}
        style={styles.productImage}
      />
      <Text style={styles.productName}>{item.name}</Text>
      <Text style={styles.productDescription}>
        {item.status === 'available' ? 'Còn hàng' : 'Hết hàng'}
      </Text>
      <View style={styles.priceContainer}>
        <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
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
    marginBottom:20,
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
});

export default ProductCard;