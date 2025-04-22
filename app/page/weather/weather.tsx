import { Colors } from "@/app/constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Image,
  Text,
  Keyboard,
  Platform,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

// Interface for weather data from OpenWeatherMap API
interface WeatherData {
  name: string;
  sys: { country: string; sunrise: number; sunset: number };
  main: {
    temp: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
    feels_like: number;
    pressure: number;
  };
  weather: Array<{ main: string; description: string }>;
  wind: { speed: number };
  clouds: { all: number };
  visibility: number;
}

interface Translations {
  [key: string]: string;
}

interface WeatherIcons {
  [key: string]: any;
}

// WeatherInput Props
interface WeatherInputProps {
  input: string;
  setInput: (text: string) => void;
  fetchDataHandler: () => void;
}

// WeatherInfo Props
interface WeatherInfoProps {
  data: WeatherData;
  cityTranslations: Translations;
  weatherTranslations: Translations;
  weatherIcons: WeatherIcons;
}

// WeatherInput Component
const WeatherInput: React.FC<WeatherInputProps> = ({
  input,
  setInput,
  fetchDataHandler,
}) => {
  const hideKeyboard = () => {
    Keyboard.dismiss();
  };

  return (
    <View style={styles.input__area}>
      <View style={styles.input__wrapper}>
        <View style={styles.input__container}>
          <TextInput
            placeholder="Nhập tên tỉnh thành"
            onChangeText={setInput}
            value={input}
            placeholderTextColor="#666"
            style={styles.input__text}
          />
          <TouchableOpacity
            onPress={() => {
              fetchDataHandler();
              hideKeyboard();
            }}
            style={styles.input__icon}
            activeOpacity={0.7}
          >
            <Image
              source={require("../../../assets/icons/weather/search.png")}
              style={styles.icon__mini}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// WeatherInfo Component
const WeatherInfo: React.FC<WeatherInfoProps> = ({
  data,
  cityTranslations,
  weatherTranslations,
  weatherIcons,
}) => {
  const weatherIcon =
    weatherIcons[data.weather[0].main] ||
    require("../../../assets/icons/weather/default.png");
  const descriptionTranslations: Translations = {
    "few clouds": "Ít mây",
    "scattered clouds": "Mây rải rác",
    "broken clouds": "Mây đứt quãng",
    "overcast clouds": "Mây u ám",
    "light rain": "Mưa nhẹ",
    "moderate rain": "Mưa vừa",
    "heavy rain": "Mưa lớn",
    "clear sky": "Trời quang",
  };
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View style={styles.info__wrapper}>
      <View style={styles.info__container}>
        <Text style={styles.info__cityCountry}>
          {cityTranslations[data.name] || data.name}, {data.sys.country}
        </Text>
        <Text style={styles.info__more}>
          {new Date().toLocaleString("vi-VN")}
        </Text>
        <View style={styles.info__tempGroup}>
          <Image style={styles.info__icon} source={weatherIcon} />
          <View>
            <Text style={styles.info__temp}>
              {Math.round(data.main.temp)}°C
            </Text>
            <Text style={styles.info__more}>
              Cảm giác: {Math.round(data.main.feels_like)}°C
            </Text>
            <Text style={styles.info__more}>
              Thấp: {Math.round(data.main.temp_min)}°C / Cao:{" "}
              {Math.round(data.main.temp_max)}°C
            </Text>
          </View>
        </View>
        <View style={styles.info__group}>
          <Text style={styles.info__weather}>
            {weatherTranslations[data.weather[0].main]}
          </Text>
          <Text style={styles.info__more}>
            {descriptionTranslations[data.weather[0].description] ||
              data.weather[0].description}
          </Text>
        </View>
        <View style={styles.info__conditions}>
          <Text style={styles.info__more}>Mây: {data.clouds.all}%</Text>
        </View>
      </View>
      <View style={styles.info__additional}>
        <View style={styles.info__row}>
          <View style={[styles.advanced__container, { marginRight: 10 }]}>
            <Image
              source={require("../../../assets/icons/weather/wind.png")}
              style={[styles.icon__mini, { marginRight: 5 }]}
            />
            <Text style={styles.advanced__text}>
              Gió: {data.wind.speed} m/s
            </Text>
          </View>
          <View style={styles.advanced__container}>
            <Image
              source={require("../../../assets/icons/weather/humidity.png")}
              style={[styles.icon__mini, { marginRight: 5 }]}
            />
            <Text style={styles.advanced__text}>
              Độ ẩm: {data.main.humidity}%
            </Text>
          </View>
        </View>
        <View style={styles.info__row}>
          <View style={[styles.advanced__container, { marginRight: 10 }]}>
            <Image
              source={require("../../../assets/icons/weather/sunrise.png")}
              style={[styles.icon__mini, { marginRight: 5 }]}
            />
            <Text style={styles.advanced__text}>
              Bình minh: {formatTime(data.sys.sunrise)}
            </Text>
          </View>
          <View style={styles.advanced__container}>
            <Image
              source={require("../../../assets/icons/weather/sunset.png")}
              style={[styles.icon__mini, { marginRight: 5 }]}
            />
            <Text style={styles.advanced__text}>
              Hoàng hôn: {formatTime(data.sys.sunset)}
            </Text>
          </View>
        </View>
        <View style={styles.info__row}>
          <View style={[styles.advanced__container, { marginRight: 10 }]}>
            <Ionicons
              name="speedometer"
              size={20}
              color="#333"
              style={[styles.icon__mini, { marginRight: 5 }]}
            />
            <Text style={styles.advanced__text}>
              Áp suất: {data.main.pressure} hPa
            </Text>
          </View>
          <View style={styles.advanced__container}>
            <Ionicons
              name="eye"
              size={20}
              color="#333"
              style={[styles.icon__mini, { marginRight: 5 }]}
            />
            <Text style={styles.advanced__text}>
              Tầm nhìn: {data.visibility / 1000} km
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

// Main Weather Component
const Weather: React.FC = () => {
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<WeatherData | null>(null);

  const weatherTranslations: Translations = {
    Clear: "Trời quang đãng",
    Clouds: "Trời có mây",
    Drizzle: "Mưa phùn",
    Rain: "Mưa",
    Thunderstorm: "Dông",
    Snow: "Tuyết",
    Mist: "Sương mù",
    Smoke: "Khói",
    Haze: "Sương mù",
    Dust: "Bụi",
    Fog: "Sương mù",
    Sand: "Cát",
    Ash: "Tro",
    Squall: "Bão giông",
    Tornado: "Lốc xoáy",
  };

  const cityTranslations: Translations = {
    Turan: "TP. Đà Nẵng",
    "Ho Chi Minh City": "TP. Hồ Chí Minh",
    Haiphong: "Hải Phòng",
    Hanoi: "Thủ đô Hà Nội",
    Dalat: "Đà Lạt",
  };

  const weatherIcons: WeatherIcons = {
    Clear: require("../../../assets/icons/weather/clear.png"),
    Clouds: require("../../../assets/icons/weather/clouds.png"),
    Drizzle: require("../../../assets/icons/weather/drizzle.png"),
    Rain: require("../../../assets/icons/weather/rain.png"),
    Thunderstorm: require("../../../assets/icons/weather/thunderstorm.png"),
    Snow: require("../../../assets/icons/weather/snow.png"),
    Mist: require("../../../assets/icons/weather/mist.png"),
    Smoke: require("../../../assets/icons/weather/smoke.png"),
    Haze: require("../../../assets/icons/weather/haze.png"),
    Dust: require("../../../assets/icons/weather/dust.png"),
    Fog: require("../../../assets/icons/weather/fog.png"),
    Sand: require("../../../assets/icons/weather/sand.png"),
    Ash: require("../../../assets/icons/weather/ash.png"),
    Squall: require("../../../assets/icons/weather/squall.png"),
    Tornado: require("../../../assets/icons/weather/tornado.png"),
  };

  const api = {
    key: "e53fb7bbe0678e4c71109589050d01c4",
    baseUrl: "http://api.openweathermap.org/data/2.5/",
  };

  const fetchDataHandler = useCallback(() => {
    if (!input) {
      return;
    }
    setLoading(true);
    setInput("");

    fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${input}&units=metric&appid=${api.key}`
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data: WeatherData) => {
        setData(data);
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [api.key, input]);

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={["#2980b9", "#6dd5fa"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.header__button}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.header__title}>Thời tiết</Text>
          <View style={styles.header__spacer} />
        </View>
        <WeatherInput
          input={input}
          setInput={setInput}
          fetchDataHandler={fetchDataHandler}
        />
        {loading && <ActivityIndicator size="large" color="#fff" />}
        {data && (
          <WeatherInfo
            data={data}
            cityTranslations={cityTranslations}
            weatherTranslations={weatherTranslations}
            weatherIcons={weatherIcons}
          />
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    flexDirection: "column",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 20,
    marginTop: Platform.OS === "android" ? 50 : 0,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  header__title: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  header__button: {
    padding: 8,
  },
  header__spacer: {
    width: 24,
  },
  input__area: {
    flexDirection: "row",
    alignItems: "center",
  },
  input__wrapper: {
    width: "100%",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  input__container: {
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  input__text: {
    flex: 1,
    paddingLeft: 16,
    paddingRight: 48,
    paddingVertical: 14,
    fontSize: 16,
    color: "#333",
    borderRadius: 16,
  },
  input__icon: {
    position: "absolute",
    right: 12,
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
  icon__mini: {
    width: 20,
    height: 20,
  },
  info__wrapper: {
    marginTop: 16,
    marginHorizontal: 16,
  },
  info__container: {
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  info__cityCountry: {
    fontSize: 28,
    color: "#333",
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  info__tempGroup: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  info__temp: {
    fontSize: 44,
    color: Colors.primary,
    fontWeight: "700",
    marginBottom: 4,
  },
  info__more: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  info__icon: {
    width: 100,
    height: 100,
    marginRight: 12,
  },
  info__group: {
    alignItems: "center",
    marginBottom: 12,
  },
  info__weather: {
    fontSize: 22,
    color: "#333",
    fontWeight: "600",
    marginBottom: 4,
  },
  info__conditions: {
    alignItems: "center",
  },
  info__additional: {
    marginTop: 12,
  },
  info__row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  advanced__container: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  advanced__text: {
    fontSize: 13,
    color: "#333",
    fontWeight: "500",
  },
});

export default Weather;