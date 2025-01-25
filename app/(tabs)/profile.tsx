import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useGlobalContext } from '../../contex/GlobalProvider';
import { logout } from '../../service/appwrite';
import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system'; // Import FileSystem

const Profile = () => {
  const router = useRouter();
  const { user, setUser, setIsLoggedIn } = useGlobalContext();
  const [location, setLocation] = useState<string | null>('Fetching location...');
  const [weather, setWeather] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setIsLoggedIn(false);
      router.replace('../(auth)/sing-in');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to log out');
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

  const saveDataToFile = async (locationData: string, weatherData: string) => {
    try {
      const fileUri = FileSystem.documentDirectory + 'APKA.txt'; // Define file path
      const content = `Location: ${locationData}\nWeather: ${weatherData}\n`; // Combine location and weather data
      await FileSystem.writeAsStringAsync(fileUri, content); // Save to file
      console.log('Data saved to file:', fileUri);
    } catch (error) {
      console.error('Error saving data to file:', error);
    }
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

      // Save location and weather data to local file
      saveDataToFile(country, weather || 'Fetching weather...');

      // Fetch weather based on coordinates
      await fetchWeather(coords.latitude, coords.longitude);
    } catch (error) {
      console.error('Error fetching location:', error);
      setLocation('Error fetching location');
    }
  };

  useEffect(() => {
    requestPermissions();
  }, [weather]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.label}>Użytkownik:</Text>
        <Text style={styles.highlight}>{user?.username || 'Unknown'}</Text>
        <Text style={styles.label}>Lokalizacja:</Text>
        <Text style={styles.highlight}>{location}</Text>
        <Text style={styles.label}>Pogoda:</Text>
        <Text style={styles.highlight}>{weather || 'Fetching weather...'}</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E2C',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '90%',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#2E2E3D',
    borderRadius: 10,
  },
  label: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 10,
  },
  highlight: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFA001',
    marginBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#FFA001',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
  },
  logoutButtonText: {
    color: '#1E1E2C',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
