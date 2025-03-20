import React, { useEffect, useState, useRef } from "react";
import {
  Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View, Platform, StyleSheet, Image,
  KeyboardAvoidingView, Keyboard
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ipAddress } from "../ip";
import { useUser } from "@clerk/clerk-expo";
import * as ImagePicker from "expo-image-picker";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";

interface Product {
  _id: string;
  tensp: string;
  loaisp: string;
  gia: number;
  hinhanh: string;
}

const HomeScreen = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [userID, setUserID] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [id, setId] = useState("");
  const [cate, setCate] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [tempSearchQuery, setTempSearchQuery] = useState(""); 

  const { user } = useUser();

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current); 
    }

    debounceTimeout.current = setTimeout(() => {
      setSearchQuery(tempSearchQuery); 
    }, 500); 

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, [tempSearchQuery]);

  useEffect(() => {
    const fetchUserID = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          setUserID(storedUserId);
          return;
        }

        const email = user?.primaryEmailAddress?.emailAddress;
        if (!email) throw new Error("User email not found");

        const response = await fetch(`${ipAddress}/get_userid?email=${email}`);
        const data = await response.json();

        if (data.success && data.user_id) {
          setUserID(data.user_id);
          await AsyncStorage.setItem("userId", data.user_id);
        }
      } catch (error) {
        console.error("Error fetching user ID:", error);
      }
    };

    fetchUserID();
  }, [user]);

  useEffect(() => {
    if (userID) {
      fetchCategories(userID);
      fetchProducts(userID, searchQuery, selectedCategory);
    }
  }, [userID]);

  useEffect(() => {
    if (userID) {
      fetchProducts(userID, searchQuery, selectedCategory);
    }
  }, [searchQuery, selectedCategory, userID]);

  const fetchCategories = async (userId: string) => {
    try {
      const response = await fetch(`${ipAddress}/categories?user_id=${userId}`);
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
      } else {
        Alert.alert("Error", data.message || "Failed to fetch categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      Alert.alert("Error", "Failed to fetch categories");
    }
  };

  const fetchProducts = async (userId: string, search: string, category: string | null) => {
    try {
      setLoading(true);

      let url = `${ipAddress}/search-products?user_id=${userId}`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      if (category) {
        url += `&category=${encodeURIComponent(category)}`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setProducts(data.products);
        setFilteredProducts(data.products);
      } else {
        Alert.alert("Error", data.message || "Failed to fetch products");
        setProducts([]);
        setFilteredProducts([]);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      Alert.alert("Error", "Failed to fetch products");
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPress = (category: string) => {
    if (category === "All") {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      const filename = uri.split("/").pop() || "unknown.png";
      setImage(uri);
      setImageName(filename);
    }
  };

  const addProduct = async () => {
    if (!userID || !id || !cate || !price) {
      Alert.alert("Error", "Please fill in all fields!");
      return;
    }
    const formData = new FormData();
    formData.append("user_id", userID);
    formData.append("tensp", id);
    formData.append("loaisp", cate);
    formData.append("gia", price);
    if (image) {
      formData.append("hinhanh", {
        uri: image,
        name: imageName,
        type: "image/jpeg",
      } as any);
    }

    try {
      const response = await fetch(`${ipAddress}/add_product`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (data.success) {
        Alert.alert("Success", "Product added successfully!");
        setModalVisible(false);
        fetchProducts(userID, searchQuery, selectedCategory);
        fetchCategories(userID);
      } else {
        Alert.alert("Error", data.message || "Failed to add product");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      Alert.alert("Error", "Failed to add product");
    }
  };

  const updateProduct = async () => {
    if (!selectedProduct || !id || !cate || !price) {
      Alert.alert("Error", "Please fill in all fields!");
      return;
    }

    const formData = new FormData();
    formData.append("tensp", id);
    formData.append("loaisp", cate);
    formData.append("gia", price);
    if (image && imageName) {
      formData.append("hinhanh", {
        uri: image,
        name: imageName,
        type: "image/jpeg",
      } as any);
    }

    try {
      const response = await fetch(`${ipAddress}/update-product/${selectedProduct._id}`, {
        method: "PUT",
        body: formData,
      });
      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", data.message);
        setEditModalVisible(false);
        if (userID) {
          fetchProducts(userID, searchQuery, selectedCategory);
          fetchCategories(userID);
        }
      } else {
        Alert.alert("Error", data.message);
      }
    } catch (error) {
      console.error("Error updating product:", error);
      Alert.alert("Error", "Failed to update product!");
    }
  };

  const deleteProduct = async () => {
    if (!selectedProduct) return;

    Alert.alert("Confirm Delete", "Are you sure you want to delete this product?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const response = await fetch(`${ipAddress}/delete-product/${selectedProduct._id}`, {
              method: "DELETE",
            });
            const result = await response.json();

            if (response.ok) {
              Alert.alert("Success", "Product deleted successfully!");
              setEditModalVisible(false);
              setProducts(products.filter((p) => p._id !== selectedProduct._id));
              setFilteredProducts(filteredProducts.filter((p) => p._id !== selectedProduct._id));
              fetchCategories(userID!);
            } else {
              Alert.alert("Error", result.message || "Failed to delete product!");
            }
          } catch (error) {
            console.error("Error deleting product:", error);
            Alert.alert("Error", "Server connection error!");
          }
        },
      },
    ]);
  };

  const openEditModal = (item: Product) => {
    setSelectedProduct(item);
    setId(item.tensp);
    setCate(item.loaisp);
    setPrice(item.gia.toString());
    setImage(`${ipAddress}/uploads/${item.hinhanh}`);
    setEditModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Product Manager</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setId("");
            setCate("");
            setPrice("");
            setImage(null);
            setModalVisible(true);
          }}
        >
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm sản phẩm..."
          value={tempSearchQuery} 
          onChangeText={setTempSearchQuery} 
        />
      </View>

      {/* Category View */}
      <View style={styles.catecate}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScrollView}
        contentContainerStyle={styles.categoryContainer}
      >
        <TouchableOpacity
          style={[
            styles.categoryButton,
            selectedCategory === null && styles.categoryButtonSelected,
          ]}
          onPress={() => handleCategoryPress("All")}
        >
          <Text
            style={[
              styles.categoryText,
              selectedCategory === null && styles.categoryTextSelected,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.categoryButton,
              selectedCategory === category && styles.categoryButtonSelected,
            ]}
            onPress={() => handleCategoryPress(category)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category && styles.categoryTextSelected,
              ]}
            >
              {category}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      </View>

      {/* Product List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.noProducts}>
            <Text style={styles.noProductsText}>Loading...</Text>
          </View>
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map((item) => (
            <View key={item._id} style={styles.productCard}>
              <Image source={{ uri: `${ipAddress}/uploads/${item.hinhanh}` }} style={styles.productImage} />
              <View style={styles.productDetails}>
                <Text style={styles.productTitle}>{item.tensp}</Text>
                <Text style={styles.productCategory}>{item.loaisp}</Text>
                <Text style={styles.productPrice}>{item.gia.toLocaleString()} VNĐ</Text>
                <TouchableOpacity
                  style={styles.addToCartButton}
                  onPress={() => openEditModal(item)}
                >
                  <Text style={styles.addToCartText}>Product Details</Text>
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.favoriteButton}>
                <Text style={styles.favoriteIcon}>♥</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : (
          <View style={styles.noProducts}>
            <Text style={styles.noProductsText}>No products available</Text>
          </View>
        )}
      </ScrollView>

      {/* Add Product Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              keyboardVerticalOffset={Platform.OS === "ios" ? 40 : 20}
              style={styles.modalContainer}
            >
              <ScrollView contentContainerStyle={styles.modalScrollContent}>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Add Product</Text>
                  <TextInput style={styles.input} placeholder="Product Name" value={id} onChangeText={setId} />
                  <TextInput style={styles.input} placeholder="Category" value={cate} onChangeText={setCate} />
                  <TextInput style={styles.input} placeholder="Price" value={price} keyboardType="numeric" onChangeText={setPrice} />
                  <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
                    <Text style={styles.buttonText}>Select Image</Text>
                  </TouchableOpacity>
                  {image && <Image source={{ uri: image }} style={styles.previewImage} />}
                  <View style={styles.modalButtonContainer}>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                      <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.saveButton} onPress={addProduct}>
                      <Text style={styles.buttonText}>Add</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </View>
      </Modal>

      {/* Edit Product Modal */}
      <Modal visible={editModalVisible} transparent animationType="fade">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 30 : 20}
          style={styles.modalOverlay}
        >
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <TouchableOpacity style={styles.closeButton} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Edit Product</Text>
              <TextInput style={styles.input} placeholder="Product ID" value={id} onChangeText={setId} />
              <TextInput style={styles.input} placeholder="Category" value={cate} onChangeText={setCate} />
              <TextInput style={styles.input} placeholder="Price" value={price} keyboardType="numeric" onChangeText={setPrice} />
              <TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
                {image ? <Image source={{ uri: image }} style={styles.previewImage} /> : <Text>No Image</Text>}
              </TouchableOpacity>
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity style={styles.deleteButton} onPress={deleteProduct}>
                  <Text style={styles.buttonText}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={updateProduct}>
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    backgroundColor: "#FFFFFF",
    paddingBottom: 100,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalContainer: {},
  headerText: {
    fontSize: 24,
    fontWeight: "700",
    color: "rgb(42, 78, 202)",
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#3461FD",
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    marginBottom: 15,
  },
  searchInput: {
    height: 45,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  catecate:{
    height:80,
  },
  categoryScrollView: {
    height: 100,
    marginBottom: 20,
  },
  categoryContainer: {
    flexDirection: "row",
    paddingHorizontal: 5,
    alignItems: "center",
    height: "100%",
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    marginRight: 10,
    height: 40,
    justifyContent: "center",
  },
  categoryButtonSelected: {
    backgroundColor: "#3461FD",
  },
  categoryText: {
    fontSize: 14,
    color: "rgb(97, 103, 125)",
    fontWeight: "600",
  },
  categoryTextSelected: {
    color: "#FFFFFF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 15,
    color: "rgb(81, 81, 83)",
  },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: "#FFFFFF",
    color: "rgb(97, 103, 125)",
  },
  uploadButton: {
    padding: 12,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
  },
  uploadBtn: {
    padding: 12,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    backgroundColor: "rgb(108, 79, 209)",
    marginBottom: 15,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#7C8BA0",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 5,
  },
  saveButton: {
    flex: 1,
    backgroundColor: "rgb(108, 79, 209)",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginLeft: 5,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: "#7C8BA0",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 5,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 10,
    marginBottom: 15,
  },
  scrollView: {
    flex: 1,
  },
  productCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 15,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: "center",
    position: "relative",
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 15,
  },
  productDetails: {
    flex: 1,
    justifyContent: "center",
  },
  productTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "rgb(42, 78, 202)",
    marginBottom: 5,
  },
  productCategory: {
    fontSize: 14,
    color: "rgb(97, 103, 125)",
    marginBottom: 5,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "rgb(97, 103, 125)",
    marginBottom: 10,
  },
  addToCartButton: {
    borderWidth: 1,
    borderColor: "#3461FD",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 15,
    alignItems: "center",
  },
  addToCartText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#3461FD",
  },
  favoriteButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  favoriteIcon: {
    fontSize: 20,
    color: "#3461FD",
  },
  noProducts: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noProductsText: {
    fontSize: 16,
    color: "rgb(97, 103, 125)",
  },
  modalButtonContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "rgb(97, 103, 125)",
  },
});

export default HomeScreen;