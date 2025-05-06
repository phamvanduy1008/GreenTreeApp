import { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { ipAddress } from '../../../constants/ip';
import { router } from 'expo-router';

const Identification: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<string | null>(null);
  const [solutions, setSolutions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Request permission to access gallery
  const requestPermission = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền bị từ chối', 'Chúng tôi cần quyền truy cập thư viện ảnh để sử dụng tính năng này!');
      return false;
    }
    return true;
  };

  // Pick image from gallery
  const pickImage = async (): Promise<void> => {
    const hasPermission = await requestPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setPrediction(null);
      setSolutions([]);
    }
  };

  // Upload image to server using fetch
  const uploadImage = async (): Promise<void> => {
    if (!image) {
      Alert.alert('Chưa chọn ảnh', 'Vui lòng chọn một ảnh trước.');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('image', {
      uri: image,
      name: 'plant_image.jpg',
      type: 'image/jpeg',
    } as any);

    try {
      const response = await fetch(`${ipAddress}/predict`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Phản hồi mạng không ổn: ${response.status} - ${errorText}`);
      }

      const data: { prediction: string; solutions: string[] } = await response.json();
      setPrediction(data.prediction);
      setSolutions(data.solutions);
    } catch (error: any) {
      console.error('Lỗi upload:', error);
      let errorMessage = 'Không thể upload ảnh hoặc nhận dự đoán.';
      if (error.message.includes('Network request failed')) {
        errorMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối và thử lại.';
      } else if (error.message.includes('Phản hồi mạng không ổn')) {
        errorMessage = error.message;
      }
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.header__button} onPress={router.back}>
          <Ionicons name="arrow-back" size={24} color="#4CAF50" />
        </TouchableOpacity>
        <View style={styles.title_container}>
          <Text style={styles.header__title}>Phân loại bệnh cây trồng</Text>
        </View>
        <View style={styles.header__button} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Buttons */}
        <View style={styles.buttonon__container}>
          <TouchableOpacity style={styles.button} onPress={pickImage}>
            <Text style={styles.button__text}>Chọn ảnh</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, (!image || loading) && styles.button__disabled]}
            onPress={uploadImage}
            disabled={!image || loading}
          >
            <Text style={styles.button__text}>
              {loading ? 'Đang xử lý...' : 'Upload và dự đoán'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Image Preview */}
        {image && (
          <View style={styles.image__container}>
            <Image source={{ uri: image }} style={styles.image} />
          </View>
        )}

        {/* Prediction Result */}
        {prediction && (
          <View style={styles.prediction__container}>
            <Text style={styles.prediction__label}>Kết quả dự đoán:</Text>
            <Text style={styles.prediction__text}>{prediction}</Text>
            <Text style={styles.solutions__label}>Giải pháp khắc phục:</Text>
            {solutions.map((solution, index) => (
              <Text key={index} style={styles.solutions__text}>
                • {solution}
              </Text>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    marginTop: 50,
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  header__button: {
    padding: 8,
  },
  title_container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header__title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#4CAF50',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  buttonon__container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  button: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 16,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  button__disabled: {
    opacity: 0.5,
  },
  button__text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  image__container: {
    marginVertical: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  prediction__container: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  prediction__label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 10,
  },
  prediction__text: {
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
  },
  solutions__label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 10,
  },
  solutions__text: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
    lineHeight: 20,
  },
});

export default Identification;