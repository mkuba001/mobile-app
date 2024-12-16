import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { getSavedNews, getCurrentUser, deleteSavedNews } from '../../service/appwrite'; // Import delete function

interface SavedNewsItem {
  $id: string; // Unique ID from Appwrite
  title: string;
  description: string;
  linkPhoto?: string;
  link: string;
  isFavourite: boolean;
}

const Saved = () => {
  const [savedNews, setSavedNews] = useState<SavedNewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false); // State for pull-to-refresh

  // Fetch saved news from the database
  const fetchSavedNews = async () => {
    try {
      setLoading(true);

      // Get the current user
      const currentUser = await getCurrentUser();
      if (!currentUser || !currentUser.accountId) {
        Alert.alert('Error', 'Unable to fetch current user.');
        return;
      }

      // Fetch saved news for the current user
      const response = await getSavedNews(currentUser.accountId);

      // Map the response to match SavedNewsItem type
      const mappedNews: SavedNewsItem[] = response.map((doc) => ({
        $id: doc.$id,
        title: doc.title || 'No Title',
        description: doc.description || 'No description available.',
        linkPhoto: doc.linkPhoto || '',
        link: doc.link || '',
        isFavourite: doc.isFavourite || false,
      }));

      setSavedNews(mappedNews);
    } catch (error) {
      console.error('Error fetching saved news:', error);
      Alert.alert('Error', 'Failed to fetch saved news.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedNews();
  }, []);

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchSavedNews(); // Re-fetch saved news
    } catch (error) {
      console.error('Error refreshing saved news:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Handle opening the saved article
  const openArticle = (link: string) => {
    if (!link || !link.startsWith('http')) {
      Alert.alert('Error', 'Invalid or missing article URL.');
      return;
    }
    Linking.openURL(link).catch((err) => console.error('Error opening URL:', err));
  };

  // Handle deleting a saved article
  const handleDelete = async (newsId: string) => {
    try {
      Alert.alert(
        'Confirm Delete',
        'Are you sure you want to delete this saved news?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              await deleteSavedNews(newsId); // Call backend function
              setSavedNews((prev) => prev.filter((item) => item.$id !== newsId)); // Update local state
              Alert.alert('Success', 'News item deleted successfully!');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error deleting news:', error);
      Alert.alert('Error', 'Failed to delete the news.');
    }
  };

  // Render a single saved news item
  const renderSavedNewsItem = ({ item }: { item: SavedNewsItem }) => (
    <View style={styles.newsItem}>
      <TouchableOpacity onPress={() => openArticle(item.link)} style={styles.newsContent}>
        {item.linkPhoto ? (
          <Image source={{ uri: item.linkPhoto }} style={styles.newsImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}
        <View>
          <Text style={styles.newsTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.newsDescription} numberOfLines={3}>
            {item.description}
          </Text>
        </View>
      </TouchableOpacity>
      {/* Small delete button in the top-right corner */}
      <TouchableOpacity onPress={() => handleDelete(item.$id)} style={styles.deleteButton}>
        <Feather name="trash" size={20} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Saved News</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#FFA001" style={styles.loader} />
      ) : savedNews.length === 0 ? (
        <Text style={styles.noNewsText}>You haven't saved any news yet.</Text>
      ) : (
        <FlatList
          data={savedNews}
          renderItem={renderSavedNewsItem}
          keyExtractor={(item) => item.$id}
          contentContainerStyle={styles.newsList}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing} // Pull-to-refresh state
          onRefresh={handleRefresh} // Pull-to-refresh handler
        />
      )}
    </SafeAreaView>
  );
};

export default Saved;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E2C',
    padding: 10,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  loader: {
    marginTop: 20,
  },
  noNewsText: {
    color: '#CCCCCC',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 50,
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
    flexDirection: 'row',
    alignItems: 'center',
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
  deleteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'transparent',
    padding: 5,
  },
});
