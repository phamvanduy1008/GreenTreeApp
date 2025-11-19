import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Image,
  Platform,
  useWindowDimensions,
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
  { url: require("../../assets/images/home/slider1.jpg"), title: "Slider 1" },
  { url: require("../../assets/images/home/slider2.jpg"), title: "Slider 2" },
  { url: require("../../assets/images/home/slider3.jpg"), title: "Slider 3" },
];

const Home: React.FC = () => {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [inforData, setInforData] = useState<InforData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { width } = useWindowDimensions();

  const getCardWidth = () => {
    if (width < 1024) {
      return "48%";
    } else {
      return "30%";
    }
  };

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
    router.push({ pathname: "/page/home/plant", params: { plantId } });
  };
  const handleEditWater = (plantId: string) => {
    router.push({ pathname: "/page/home/water", params: { plantId } });
  };
  const handleEditPreservation = (plantId: string) => {
    router.push({ pathname: "/page/home/preservate", params: { plantId } });
  };
  const handleEditPackaging = (plantId: string) => {
    router.push({ pathname: "/page/home/package", params: { plantId } });
  };

  const renderCardViews = () => {
    if (loading) return <Text style={styles.loadingText}>Đang tải...</Text>;
    if (error) return <Text style={styles.errorText}>{error}</Text>;

    return (
      <View style={styles.cardContainer}>
        {inforData.map((item) => {
          const isExpanded = item._id === expandedRow;
          return (
            <TouchableOpacity
              key={item._id}
              style={[
                styles.card,
                { flexBasis: getCardWidth(), maxWidth: getCardWidth() }, // 👈 responsive width
                isExpanded && styles.card__expanded,
              ]}
              onPress={() => toggleRowExpansion(item._id)}
              disabled={isExpanded}
            >
              <View style={styles.card__wrapper}>
                <ImageBackground
                  source={getImageForPlant(item.plant?.name || "")}
                  style={styles.card__image}
                  imageStyle={styles.card__imageStyle}
                >
                  {isExpanded && (
                    <>
                      <View style={styles.card__row}>
                        <TouchableOpacity
                          style={styles.card__menu_item}
                          onPress={() => handleEditPlant(item.plant._id)}
                        >
                          <Image
                            source={require("../../assets/icons/home/plant.png")}
                            style={styles.card__icon}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.card__menu_item}
                          onPress={() => handleEditWater(item.plant._id)}
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
                          onPress={() => handleEditPreservation(item.plant._id)}
                        >
                          <Image
                            source={require("../../assets/icons/home/shield.png")}
                            style={styles.card__icon}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.card__menu_item}
                          onPress={() => handleEditPackaging(item.plant._id)}
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
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll__content}
      >
        <View style={styles.header_container}>
          <View style={styles.header}>
            <Text style={styles.header__title}>Chăm sóc cây trồng</Text>
          </View>
          <Slider images={images} initialIndex={0} />
          <View style={styles.content}>
            <View style={styles.section}>{renderCardViews()}</View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF", alignItems: "center" },
  header_container: { flex: 1 },
  scroll__content: { flexGrow: 1, paddingBottom: 120, marginTop: 5 },
  header: {
    width: Platform.OS === "web" ? "100%" : "90%",
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
    marginTop: Platform.OS === "ios" ? 50 : 40,
  },
  header__title: { fontSize: 24, fontWeight: "700", color: Colors.primary },
  content: {
    width: "100%",
    paddingHorizontal: Platform.OS === "web" ? 80 : 20,
    paddingTop: 10,
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  section: { width: "100%", flex: 1 },
  cardContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    height: Platform.OS === "web" ? 200 : 170,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    marginBottom: 15,
  },
  card__expanded: { height: Platform.OS === "web" ? 200 : 170, },
  card__wrapper: { flex: 1, borderRadius: 15, overflow: "hidden" },
  card__image: { flex: 1, width: "100%", height: "100%" },
  card__imageStyle: { resizeMode: "cover", borderRadius: 15 },
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