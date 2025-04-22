import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const favoriteItems = [
  {
    id: "1",
    name: "Sprite Can",
    volume: "325ml",
    price: "$1.50",
    image: require("../../assets/images/cayanqua.png"),
  },
  {
    id: "2",
    name: "Diet Coke",
    volume: "355ml",
    price: "$1.99",
    image: require("../../assets/images/caycongnghiep.png"),
  },
  {
    id: "3",
    name: "Apple & Grape Juice",
    volume: "2L",
    price: "$15.50",
    image: require("../../assets/images/cayluongthuc.png"),
  },
  {
    id: "4",
    name: "Coca Cola Can",
    volume: "325ml",
    price: "$4.99",
    image: require("../../assets/images/raucu.png"),
  },
  {
    id: "5",
    name: "Pepsi Can",
    volume: "330ml",
    price: "$4.99",
    image: require("../../assets/images/cayanqua.png"),
  },
];

export default function FavouriteScreen() {
  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.itemContainer}>
      <Image source={item.image} style={styles.itemImage} />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemVolume}>
          {item.volume ? `${item.volume}, PRICE` : "PRICE"}
        </Text>
      </View>
      <View style={styles.itemRight}>
        <Text style={styles.itemPrice}>{item.price}</Text>
        <TouchableOpacity>
          <Text style={styles.itemArrow}>›</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.itemCancelContainer}>
        <Ionicons name="close" size={16} color="#666" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Favourite</Text>
      </View>

      {/* Danh sách sản phẩm yêu thích */}
      <FlatList
        data={favoriteItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />

      {/* Nút Add All To Cart */}
      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>Add All To Cart</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingVertical: 40,
  },
  header: {
    padding: 20,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerText: {
    fontSize: 23,
    fontWeight: "600",
  },
  list: {
    padding: 26,
    paddingBottom: 120,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 20,
    position: "relative",
  },
  itemImage: {
    width: 50,
    height: 50,
    resizeMode: "contain",
    marginRight: 30,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    marginVertical: 3,
  },
  itemVolume: {
    fontSize: 12,
    color: "#666",
    marginVertical: 4,
  },
  itemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginRight: 4,
    marginTop: 4,
  },
  itemCancelContainer: {
    position: "absolute",
    right: -4,
    bottom: 70,
  },
  // itemCancel: {
  //   fontSize: 16,
  //   color: "#666",
  // },
  itemArrow: {
    fontSize: 24,
    color: "#666",
  },
  addButton: {
    backgroundColor: "#28a745",
    paddingVertical: 19,
    margin: 39,
    marginBottom: 80,
    borderRadius: 16,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
});
