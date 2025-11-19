import React, { useState, useEffect, useRef } from 'react';
import { View, Image, FlatList, StyleSheet, Dimensions, TouchableOpacity, ImageSourcePropType, Platform, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

interface SliderImage {
  url: ImageSourcePropType;
  title: string;
}

interface ImageSliderProps {
  images: SliderImage[];
}

const Slider: React.FC<ImageSliderProps & { initialIndex?: number }> = ({ images, initialIndex = 0 }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(initialIndex);
  const flatListRef = useRef<FlatList<any> | null>(null);
  const [screenWidth, setScreenWidth] = useState<number>(Dimensions.get('window').width);
  const isSmallScreen = screenWidth <= 768;

  useEffect(() => {
    const subscription = Dimensions.addEventListener?.('change', ({ window }) => {
      if (window && window.width) {
        setScreenWidth(window.width);
      }
    });
    return () => {
      // cleanup for both RN versions
      if (subscription && typeof subscription.remove === 'function') {
        subscription.remove();
      }
    };
  }, []);

  // auto-advance slider
  useEffect(() => {
    if (!images || images.length <= 1) return;
    const id = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev >= images.length - 1 ? 0 : prev + 1;
        try {
          flatListRef.current?.scrollToOffset({ offset: next * screenWidth, animated: true });
        } catch (e) {
          // ignore scroll errors
        }
        return next;
      });
    }, 3000);
    return () => clearInterval(id);
  }, [images.length, screenWidth]);

  const onMomentumScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x || 0;
    const index = Math.round(offsetX / screenWidth) || 0;
    setCurrentIndex(index);
  };

  const renderItem = ({ item }: { item: SliderImage }) => (
    <View style={[styles.image__container, { width: screenWidth, height: Platform.OS === "web" ? screenWidth * 0.3 : screenWidth * 0.4,}]}>
      <Image
        source={item.url}
        style={{ width: '100%', height: '100%', borderRadius: 12 }}
        resizeMode="cover"
      />
    </View>
  );

  const dots = images.map((_, index) => {
    const active = index === currentIndex;
    const dotStyle = isSmallScreen
      ? { width: 20, height: 4, borderRadius: 2 }
      : { width: 10, height: 10, borderRadius: 5 };
    return (
      <TouchableOpacity
        key={index}
        onPress={() => {
          setCurrentIndex(index);
          try {
            flatListRef.current?.scrollToOffset({ offset: index * screenWidth, animated: true });
          } catch (e) {
            // ignore
          }
        }}
        style={{ marginHorizontal: 4 }}
      >
        <View style={[styles.dot, { backgroundColor: active ? '#007AFF' : '#ccc' }, dotStyle]} />
      </TouchableOpacity>
    );
  });

  return (
    <View style={[styles.slider, { width: screenWidth, height: Platform.OS === "web" ? screenWidth * 0.3 : screenWidth * 0.4, }]}>
      <FlatList
        ref={flatListRef}
        data={images}
        horizontal
        pagingEnabled
        snapToInterval={screenWidth}
        decelerationRate={Platform.OS === 'ios' ? 'fast' : 0.8}
        showsHorizontalScrollIndicator={false}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
        onMomentumScrollEnd={onMomentumScrollEnd}
        getItemLayout={(_, index) => ({ length: screenWidth, offset: screenWidth * index, index })}
        nestedScrollEnabled
        removeClippedSubviews
      />
      <View style={styles.dots__container}>{dots}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  slider: {
    marginVertical: 10,
    alignSelf: 'center',
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  image__container: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    paddingHorizontal: 20,
    elevation: 2,
  },
  image: {},
  dots__container: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 3,
  },
});

export default Slider;