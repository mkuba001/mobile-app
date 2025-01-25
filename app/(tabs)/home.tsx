import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image, TouchableOpacity, Linking, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { saveNews, getCurrentUser } from '../../service/appwrite'; 
import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system'; // Import FileSystem

const API_KEY = 'aa74878ced5144a4a149a69ff0db10df'; 
const NEWS_API_URL = `https://newsapi.org/v2/top-headlines?country=us&pageSize=25&apiKey=${API_KEY}`;

interface NewsItem {
  title: string;
  description: string;
  urlToImage: string;
  url: string;
}

const Home = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [savedArticles, setSavedArticles] = useState<Set<string>>(new Set());
  const [accountId, setAccountId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null> (null);
  const [location, setLocation] = useState<string | null>('Fetching location...');
  const [weather, setWeather] = useState<string | null>(null);

  const fetchCurrentUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser && currentUser.accountId) {
        setAccountId(currentUser.accountId);
        setUsername(currentUser.username);
      } else {
        console.error('No user found');
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await fetch(NEWS_API_URL);
      const data = await response.json();

      if (data.articles) {
        setNews(data.articles);
      } else {
        console.error('No articles found in API response');
      }
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const openArticle = (url: string) => {
    if (!url || !url.startsWith('http')) {
      Alert.alert('Error', 'Invalid or missing article URL');
      return;
    }
    Linking.openURL(url).catch((err) =>
      console.error('Error opening URL:', err)
    );
  };

  const toggleSaveArticle = async (article: NewsItem) => {
    try {
      if (!accountId) {
        Alert.alert('Error', 'User is not logged in.');
        return;
      }

      if (savedArticles.has(article.url)) {
        Alert.alert('Already Saved', 'This article is already in your favorites.');
        return;
      }

      const newsData = {
        title: article.title,
        newsId: article.url,
        description: article.description,
        link: article.url,
        linkPhoto: article.urlToImage || '',
      };

      const response = await saveNews(newsData, accountId);

      if (response.success) {
        setSavedArticles((prev) => new Set(prev).add(article.url));
        Alert.alert('Success', 'Article added to favorites!');
      } else {
        Alert.alert('Error', response.message || 'Failed to save the article.');
      }
    } catch (error) {
      console.error('Error saving article:', error);
      Alert.alert('Error', 'Failed to save the article.');
    }
  };

  const filteredNews = news.filter((article) =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderNewsItem = ({ item }: { item: NewsItem }) => {
    const isSaved = savedArticles.has(item.url);

    return (
      <TouchableOpacity onPress={() => openArticle(item.url)} style={styles.newsItem}>
        {item.urlToImage ? (
          <Image source={{ uri: item.urlToImage }} style={styles.newsImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
        <View style={styles.newsContent}>
          <Text style={styles.newsTitle} numberOfLines={2}>
            {item.title || 'No Title'}
          </Text>
          <Text style={styles.newsDescription} numberOfLines={3}>
            {item.description || 'No description available.'}
          </Text>
        </View>
        <TouchableOpacity onPress={() => toggleSaveArticle(item)}>
          <Feather
            name="bookmark"
            size={24}
            color={isSaved ? '#FFA001' : '#CCCCCC'}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const requestPermissions = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocation('Permission to access location denied');
        return;
      }

      const { coords } = await Location.getCurrentPositionAsync({});
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.latitude},${coords.longitude}&key=AIzaSyDeHk_D-Czh18ygIQKcTjuAPTs9oyl7oDA`
      );
      const data = await response.json();

      const country = data.results
        ?.find((result: { types: string[] }) => result.types.includes('country'))
        ?.formatted_address || 'Unknown';
      setLocation(country);

      // Fetch weather based on coordinates
      await fetchWeather(coords.latitude, coords.longitude);
    } catch (error) {
      console.error('Error fetching location:', error);
      setLocation('Error fetching location');
    }
  };

  const fetchWeather = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
      );
      const data = await response.json();
      if (data && data.current_weather) {
        const { temperature } = data.current_weather;
        setWeather(`${temperature}°C`);
      } else {
        setWeather('Unable to fetch weather');
      }
    } catch (error) {
      console.error('Error fetching weather:', error);
      setWeather('Error fetching weather');
    }
  };

  useEffect(() => {
    requestPermissions();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.username}>{username || 'Guest'}</Text>
        </View>

        {/* Location and Weather Info */}
        <View style={styles.locationContainer}>
          <Text style={styles.locationText}>{location}</Text>
          <Text style={styles.weatherText}>{weather || 'Fetching weather...'}</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a video topic"
          placeholderTextColor="#7B7B8B"
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)}
        />
        <TouchableOpacity onPress={() => console.log('Searching...')}>
          <Feather name="search" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#FFA001" style={styles.loader} />
      ) : (
        <FlatList
          data={filteredNews}
          renderItem={renderNewsItem}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={styles.newsList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E2C',
    padding: 10,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: '#CCCCCC',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
  },
  locationContainer: {
    alignItems: 'flex-end',
  },
  locationText: {
    fontSize: 16,
    color: '#FFA001',
  },
  weatherText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#292938',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    paddingHorizontal: 10,
  },
  loader: {
    marginTop: 20,
  },
  newsList: {
    paddingBottom: 20,
  },
  newsItem: {
    backgroundColor: '#292938',
    borderRadius: 10,
    marginBottom: 15,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  newsImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#AAA',
    fontSize: 12,
  },
  newsContent: {
    flex: 1,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  newsDescription: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  locationButton: {
    backgroundColor: '#FFA001',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
    marginTop: 10,
  },
  locationButtonText: {
    color: '#1E1E2C',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
