import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image, TouchableOpacity, Linking, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { saveNews, getCurrentUser } from '../../service/appwrite'; // Import your backend functions

const API_KEY = 'aa74878ced5144a4a149a69ff0db10df'; // Your NewsAPI key
const NEWS_API_URL = `https://newsapi.org/v2/top-headlines?country=us&pageSize=10&apiKey=${API_KEY}`;

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

  // Fetch current user
  const fetchCurrentUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser && currentUser.accountId) {
        setAccountId(currentUser.accountId);
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

  // Fetch news from API
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

  // Open news article in browser
  const openArticle = (url: string) => {
    if (!url || !url.startsWith('http')) {
      Alert.alert('Error', 'Invalid or missing article URL');
      return;
    }
    Linking.openURL(url).catch((err) =>
      console.error('Error opening URL:', err)
    );
  };

  // Save article
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

  // Filter news based on search query
  const filteredNews = news.filter((article) =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render a single news item
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.username}>{accountId || 'Guest'}</Text>
        </View>
        <Feather name="camera" size={24} color="#FFF" />
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
});
