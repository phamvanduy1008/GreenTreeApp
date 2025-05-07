import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  Keyboard,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Image,
} from 'react-native';
import ProductCard from '../page/shop/ProductCard';
import { Ionicons } from '@expo/vector-icons';
import { ipAddress } from '@/app/constants/ip';

type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  status: string;
  image: string;
  evaluate: number;
};

const SearchPage = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const suggestFadeAnim = useRef(new Animated.Value(0)).current;
  const resultFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (query.trim() !== '' && !isSearching) {
      const delaySuggest = setTimeout(() => {
        fetch(`${ipAddress}/products/suggest?q=${encodeURIComponent(query)}`)
          .then((res) => res.json())
          .then((data) => {
            setSuggestions(data);
            Animated.timing(suggestFadeAnim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }).start();
          })
          .catch((err) => console.log('Suggest error:', err));
      }, 200);

      return () => clearTimeout(delaySuggest);
    } else {
      setSuggestions([]);
      suggestFadeAnim.setValue(0);
    }
  }, [query, isSearching]);

  useEffect(() => {
    if (query.trim() !== '' && isSearching) {
      setLoading(true);
      const delaySearch = setTimeout(() => {
        fetch(`${ipAddress}/products/search?q=${encodeURIComponent(query)}`)
          .then((res) => res.json())
          .then((data) => {
            setResults(data);
            Animated.timing(resultFadeAnim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }).start();
          })
          .catch((err) => console.log('Fetch error:', err))
          .finally(() => {
            setLoading(false);
          });
      }, 300);

      return () => clearTimeout(delaySearch);
    } else {
      setResults([]);
      resultFadeAnim.setValue(0);
    }
  }, [query, isSearching]);

  const handleSubmit = () => {
    setIsSearching(true);
    Keyboard.dismiss();
    setSuggestions([]);
  };

  const handleSuggestionPress = (name: string) => {
    setQuery(name);
    setSuggestions([]);
    setIsSearching(true);
    Keyboard.dismiss();
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          autoFocus
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            setIsSearching(false);
          }}
          placeholder="Tìm sản phẩm..."
          returnKeyType="search"
          onSubmitEditing={handleSubmit}
        />
      </View>

      {!isSearching && suggestions.length > 0 && (
        <Animated.View style={{ opacity: suggestFadeAnim }}>
          <FlatList
            data={suggestions}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleSuggestionPress(item.name)} style={styles.suggestionItemContainer}>
                <Image source={{ uri:  `${ipAddress}/${item.image}` }} style={styles.suggestionImage} />
                <Text style={styles.suggestionText}>{item.name}</Text>
              </TouchableOpacity>
            )}
            style={styles.suggestionList}
          />
        </Animated.View>
      )}

      {loading ? (
        <ActivityIndicator size="small" color="#888" style={{ marginTop: 20 }} />
      ) : isSearching && results.length === 0 && query.trim() !== '' ? (
        <Text style={{ textAlign: 'center', marginTop: 20 }}>Không tìm thấy sản phẩm</Text>
      ) : (
        isSearching && (
          <Animated.View style={{ opacity: resultFadeAnim }}>
            <FlatList
              data={results}
              keyExtractor={(item) => item._id}
              columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 16 }}
              numColumns={2}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => <ProductCard item={item} />}
              contentContainerStyle={{ paddingVertical: 10, paddingHorizontal: 16 }}
            />
          </Animated.View>
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 16,
    backgroundColor: '#f9f9f9',
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  suggestionList: {
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    marginBottom: 8,
  },
  suggestionItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  suggestionImage: {
    width: 30,
    height: 30,
    marginRight: 10,
    borderRadius: 6,
  },
  suggestionText: {
    fontSize: 16,
  },
});

export default SearchPage;
