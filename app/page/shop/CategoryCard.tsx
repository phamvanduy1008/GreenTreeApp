
import { useRouter } from 'expo-router';
import { ipAddress } from '../../constants/ip';
import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';

type Category = {
  _id: string;
  name: string;
  image: string;
  backgroundColor: string;
};

  const CategoryCard = ({ item }: { item: Category }) => {
    const router = useRouter();

    const handlePress = () => {
      router.push(`../category/index`);
    };
  
    return (
      <TouchableOpacity
        onPress={handlePress}
        style={[styles.categoryCard, { backgroundColor: item.backgroundColor }]}
      >
        <Image
          source={
            item.image
              ? { uri: `${ipAddress}/${item.image}` }
              : require("../../../assets/images/test.png")
          }
          style={styles.categoryImage}
        />
        <Text style={styles.categoryName}>{item.name}</Text>
      </TouchableOpacity>
    );
  };
  

const styles = StyleSheet.create({
  categoryCard: {
    padding: 10,
    height: 80,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  categoryImage: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#181725',
  },
});

export default CategoryCard;
