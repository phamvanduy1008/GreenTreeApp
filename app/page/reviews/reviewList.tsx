import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from "react-native";
import { useLocalSearchParams, Stack, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ipAddress } from "@/app/constants/ip";
import AsyncStorage from "@react-native-async-storage/async-storage";

type User = {
  _id: string;
  email: string;
  profile: {
    full_name: string;
    username: string;
    gender: string;
  };
};

type Review = {
  _id: string;
  user: {
    profile: {
      full_name: string;
    };
  } | null;
  rating: number;
  comment: string;
  characteristic: string;
  fit: string;
  createdAt: string;
};

const ReviewList = () => {
  const { productId } = useLocalSearchParams();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [newCharacteristic, setNewCharacteristic] = useState("Đúng chuẩn");
  const [newFit, setNewFit] = useState("Phù hợp với mô tả");
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem("userData");
        console.log("AsyncStorage user data:", userData);
        if (userData) {
          setCurrentUser(JSON.parse(userData) as User);
        }
      } catch (err) {
        console.error("Lỗi khi lấy thông tin user:", err);
      }
    };

    const fetchReviews = async () => {
      try {
        const response = await fetch(`${ipAddress}/api/reviews/${productId}`);
        if (!response.ok) {
          if (response.status === 404) {
            setReviews([]);
            return;
          }
          throw new Error("Không thể lấy đánh giá sản phẩm");
        }
        const data = await response.json();
        setReviews(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định"
        );
        console.error("Lỗi khi lấy đánh giá:", err);
      }
    };

    loadUser();
    fetchReviews();
  }, [productId]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      setError("Vui lòng nhập bình luận trước khi gửi");
      return;
    }
    if (!currentUser) {
      setError("Bạn cần đăng nhập để gửi đánh giá. Vui lòng đăng nhập lại.");
      return;
    }

    const newReview = {
      user: currentUser._id,
      rating: newRating,
      comment: newComment,
      characteristic: newCharacteristic,
      fit: newFit,
    };

    try {
      const response = await fetch(`${ipAddress}/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, ...newReview }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không thể gửi đánh giá");
      }

      const savedReview = await response.json();
      setReviews([savedReview, ...reviews]);
      setNewComment("");
      setNewCharacteristic("Đúng chuẩn");
      setNewFit("Phù hợp với mô tả");
      setNewRating(5);
      setShowCommentInput(false);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Đã xảy ra lỗi khi gửi đánh giá"
      );
      console.error("Lỗi khi gửi đánh giá:", err);
    }
  };

  const renderReviewItem = ({ item }: { item: Review }) => (
    <View style={styles.reviewItem}>
      <View style={styles.reviewHeader}>
        <Text style={styles.reviewerName}>
          {item.user?.profile?.full_name || "Người dùng ẩn danh"}
        </Text>
        <View style={styles.starRating}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons
              key={star}
              name={star <= item.rating ? "star" : "star-outline"}
              size={16}
              color="#53B175"
            />
          ))}
        </View>
      </View>
      <Text style={styles.reviewComment}>{item.comment}</Text>
      <Text style={styles.reviewDetails}>Đặc điểm: {item.characteristic}</Text>
      <Text style={styles.reviewDetails}>Phù hợp: {item.fit}</Text>
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Ionicons name="arrow-back" size={24} color="#181725" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Đánh giá sản phẩm</Text>
            <TouchableOpacity
              onPress={() => setShowCommentInput(true)}
              style={styles.addButton}
            >
              <Ionicons name="add" size={24} color="#181725" />
            </TouchableOpacity>
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Lỗi: {error}</Text>
            </View>
          )}

          <Modal
            animationType="slide"
            transparent={true}
            visible={showCommentInput}
            onRequestClose={() => setShowCommentInput(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Thêm đánh giá</Text>
                <View style={styles.starRatingContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setNewRating(star)}
                      onPressIn={() => setHoverRating(star)}
                      onPressOut={() => setHoverRating(0)}
                    >
                      <Ionicons
                        name={
                          star <= (hoverRating || newRating)
                            ? "star"
                            : "star-outline"
                        }
                        size={32}
                        color={
                          star <= (hoverRating || newRating)
                            ? "#53B175"
                            : "#CCCCCC"
                        }
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Nhập bình luận..."
                  value={newComment}
                  onChangeText={setNewComment}
                  multiline
                />
                <TextInput
                  style={styles.modalInput}
                  placeholder="Đặc điểm (ví dụ: Đúng chuẩn)..."
                  value={newCharacteristic}
                  onChangeText={setNewCharacteristic}
                />
                <TextInput
                  style={styles.modalInput}
                  placeholder="Phù hợp (ví dụ: Phù hợp với mô tả)..."
                  value={newFit}
                  onChangeText={setNewFit}
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.cancelButton]}
                    onPress={() => setShowCommentInput(false)}
                  >
                    <Text style={styles.modalButtonText}>Hủy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.submitButton]}
                    onPress={handleSubmitComment}
                  >
                    <Text style={styles.modalButtonText}>Gửi</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          <FlatList
            data={reviews}
            renderItem={renderReviewItem}
            keyExtractor={(item) => item._id}
            ListEmptyComponent={
              <Text style={styles.noReviews}>Chưa có đánh giá nào</Text>
            }
          />
        </View>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#FFFFFF",
    paddingVertical: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    left: 0,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#181725",
    textAlign: "center",
  },
  addButton: {
    position: "absolute",
    right: 0,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#181725",
    marginBottom: 10,
  },
  starRatingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginVertical: 15,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#E2E2E2",
    borderRadius: 5,
    padding: 8,
    marginBottom: 10,
    minHeight: 40,
    fontSize: 14,
    color: "#181725",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#CCCCCC",
  },
  submitButton: {
    backgroundColor: "#53B175",
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  reviewItem: {
    marginBottom: 16,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E2E2",
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  reviewerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#181725",
    flex: 1,
  },
  starRating: {
    flexDirection: "row",
    marginLeft: 10,
    alignItems: "center",
  },
  reviewComment: {
    fontSize: 14,
    color: "#181725",
    marginBottom: 4,
  },
  reviewDetails: {
    fontSize: 14,
    color: "#7C7C7C",
  },
  noReviews: {
    fontSize: 14,
    color: "#7C7C7C",
    textAlign: "center",
    marginTop: 10,
  },
  errorContainer: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#FFEBEE",
    borderRadius: 5,
  },
  errorText: {
    color: "#D32F2F",
    fontSize: 14,
    textAlign: "center",
  },
});

export default ReviewList;
