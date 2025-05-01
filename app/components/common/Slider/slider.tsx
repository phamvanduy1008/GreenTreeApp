import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Image, FlatList, StyleSheet, Dimensions, TouchableOpacity, ImageSourcePropType } from 'react-native';

interface SliderImage {
  url: ImageSourcePropType;
  title: string;
}

interface ImageSliderProps {
  images: SliderImage[];
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const Slider: React.FC<ImageSliderProps> = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const [isSmallScreen, setIsSmallScreen] = useState(SCREEN_WIDTH <= 768);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const isLastImage = currentIndex === images.length - 1;
      const newIndex = isLastImage ? 0 : currentIndex + 1;
      setCurrentIndex(newIndex);
      flatListRef.current?.scrollToIndex({ index: newIndex, animated: true });
    }, 2000);

    return () => clearInterval(intervalId);
  }, [currentIndex, images.length]);

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(SCREEN_WIDTH <= 768);
    };

    Dimensions.addEventListener('change', handleResize);
    return () => {
    };
  }, []);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: any[] }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const renderItem = ({ item }: { item: SliderImage }) => (
    <View style={styles.image__container}>
      <Image
        source={ item.url }
        style={styles.image}
        resizeMode="cover"
      />
    </View>
  );

  return (
    <View style={styles.slider}>
      <FlatList
        ref={flatListRef}
        data={images}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
        }}
        nestedScrollEnabled={true}
      />
      <View style={styles.dots__container}>
        {images.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => {
              setCurrentIndex(index);
              flatListRef.current?.scrollToIndex({ index, animated: true });
            }}
          >
            {isSmallScreen ? (
              <View
                style={[
                  styles.dot,
                  { backgroundColor: index === currentIndex ? '#007AFF' : '#ccc' },
                  { width: 20, height: 4, borderRadius: 2 },
                ]}
              />
            ) : (
              <View
                style={[
                  styles.dot,
                  { backgroundColor: index === currentIndex ? '#007AFF' : '#ccc' },
                ]}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  slider: {
    maxWidth: SCREEN_WIDTH,
    height: SCREEN_WIDTH * 0.4,
    marginVertical: 10,
  },
  image__container: {
    width: SCREEN_WIDTH,
    height: '100%',
    alignItems:"center",
    paddingHorizontal: 20,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
    elevation: 2,
  },
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