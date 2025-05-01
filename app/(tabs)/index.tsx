import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Image,
} from "react-native";
import { router } from "expo-router";
import { Colors } from "../constants/Colors";
import { ipAddress } from "../constants/ip";
import Slider from "../components/common/Slider/slider";

interface InforData {
  _id: string;
  climate: string;
  land: string;
  target: string;
  time: string;
  water: string;
  fertilize: string;
  grass: string;
  insect: string;
  disease: string;
  harvest: string;
  preserve: string;
  plant: {
    _id: string;
    name: string;
    image: string;
  };
}

const images = [
  {
    url: require("../../assets/images/home/slider1.jpg"),
    title: "Slider 1",
  },
  {
    url: require("../../assets/images/home/slider2.jpg"),
    title: "Slider 2",
  },
  {
    url: require("../../assets/images/home/slider3.jpg"),
    title: "Slider 3",
  },
];

const Home: React.FC = () => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [inforData, setInforData] = useState<InforData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInforPlants = async () => {
      try {
        const response = await fetch(`${ipAddress}/api/infor-plants`);
        if (!response.ok) {
          throw new Error("Lỗi khi lấy dữ liệu cây trồng");
        }
        const data = await response.json();
        setInforData(data);
        setLoading(false);
      } catch (err: any) {
        setError(err.message || "Lỗi khi tải dữ liệu");
        setLoading(false);
        console.error("❌ Lỗi khi gọi API:", err);
      }
    };
    fetchInforPlants();
  }, []);

  const toggleRowExpansion = (inforId: string) => {
    setExpandedRow(expandedRow === inforId ? null : inforId);
  };

  const getImageForPlant = (plantName: string) => {
    switch (plantName) {
      case "Cây cà phê":
        return require("../../assets/images/home/caphe1.png");
      case "Cây cao su":
        return require("../../assets/images/home/caosu1.png");
      case "Cây tiêu":
        return require("../../assets/images/home/tieu1.png");
      case "Cây Điều":
        return require("../../assets/images/home/dieu1.png");
      case "Cây mía":
        return require("../../assets/images/home/mia1.png");
      case "Cây thông":
        return require("../../assets/images/home/thong1.png");
      default:
        return require("../../assets/images/home/caphe1.png");
    }
  };

  const handleEditPlant = (plantId: string) => {
    try {
      router.push({
        pathname: "/page/home/plant",
        params: { plantId },
      });
    } catch (error) {
      console.error("❌ Lỗi khi điều hướng đến màn hình Plant:", error);
    }
  };

  const handleEditWater = (plantId: string) => {
    try {
      router.push({
        pathname: "/page/home/water",
        params: { plantId },
      });
    } catch (error) {
      console.error("❌ Lỗi khi điều hướng đến màn hình Water:", error);
    }
  };

  const handleEditPreservation = (plantId: string) => {
    try {
      router.push({
        pathname: "/page/home/preservate",
        params: { plantId },
      });
    } catch (error) {
      console.error("❌ Lỗi khi điều hướng đến màn hình Preservation:", error);
    }
  };

  const handleEditPackaging = (plantId: string) => {
    try {
      router.push({
        pathname: "/page/home/package",
        params: { plantId },
      });
    } catch (error) {
      console.error("❌ Lỗi khi điều hướng đến màn hình Packaging:", error);
    }
  };

  const renderCardViews = () => {
    if (loading) {
      return <Text style={styles.loadingText}>Đang tải...</Text>;
    }

    if (error) {
      return <Text style={styles.errorText}>{error}</Text>;
    }

    const rows: JSX.Element[] = [];
    for (let i = 0; i < inforData.length; i += 2) {
      const rowData: JSX.Element[] = [];
      for (let j = i; j < Math.min(i + 2, inforData.length); j++) {
        const data = inforData[j];
        const isExpanded = data._id === expandedRow;

        rowData.push(
          <TouchableOpacity
            key={data._id}
            style={[styles.card, isExpanded && styles.card__expanded]}
            onPress={() => toggleRowExpansion(data._id)}
            disabled={isExpanded}
          >
             <View style={styles.card__wrapper}>
            <ImageBackground
              source={getImageForPlant(data.plant.name)}
              style={styles.card__image}
            >
              {isExpanded && (
                <>
                  <View style={styles.card__row}>
                    <TouchableOpacity
                      style={styles.card__menu_item}
                      onPress={() => handleEditPlant(data.plant._id)}
                    >
                      <Image
                        source={require("../../assets/icons/home/plant.png")}
                        style={styles.card__icon}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.card__menu_item}
                      onPress={() => handleEditWater(data.plant._id)}
                    >
                      <Image
                        source={require("../../assets/icons/home/water.png")}
                        style={styles.card__icon}
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.card__row}>
                    <TouchableOpacity
                      style={styles.card__menu_item}
                      onPress={() => handleEditPreservation(data.plant._id)}
                    >
                      <Image
                        source={require("../../assets/icons/home/shield.png")}
                        style={styles.card__icon}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.card__menu_item}
                      onPress={() => handleEditPackaging(data.plant._id)}
                    >
                      <Image
                        source={require("../../assets/icons/home/package.png")}
                        style={styles.card__icon}
                      />
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ImageBackground>
              </View>
          </TouchableOpacity>
        );
      }
      rows.push(
        <View key={i} style={styles.card__row_container}>
          {rowData}
        </View>
      );
    }
    return rows;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView   showsVerticalScrollIndicator={false}  contentContainerStyle={styles.scroll__content}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.header__title}>Chăm sóc cây trồng</Text>
          </View>
          <Slider images={images} />
          <View style={styles.content}>
            <View style={styles.section}>{renderCardViews()}</View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  scroll__content: {
    flexGrow: 1,
    paddingBottom: 150,
    marginTop: 50,
  },
  header: {
    width: "90%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
    padding: 25,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header__title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.primary,
    alignItems: "center",
  },
  card__wrapper: {
    flex: 1,
    borderRadius: 15,
    overflow: "hidden", 
  },
  content: {
    width: "100%",
    paddingHorizontal: 20,
    paddingTop: 10,
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  section: {
    width: "100%",
    flex: 1,
  },
  card__row_container: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom:15,
  },

  card: {
    width: "48%",
    height: 170,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
      elevation: 3,
      shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  
  card__expanded: {
    height: 170,
  },
  card__image: {
    flex: 1,
  },
  card__row: {
    width: "100%",
    height: "50%",
    flexDirection: "row",
  },
  card__menu_item: {
    width: "50%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  card__icon: {
    width: "50%",
    height: "50%",
    resizeMode: "contain",
    tintColor: "#FFFFFF",
  },
  loadingText: {
    fontSize: 18,
    color: Colors.primary,
    textAlign: "center",
    marginTop: 20,
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
});

export default Home;