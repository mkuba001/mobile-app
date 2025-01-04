import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Redirect, useRouter } from 'expo-router';
import { useGlobalContext } from '../contex/GlobalProvider';

export default function Index() {
  const router = useRouter();

  const {isLoading, isLoggedIn} = useGlobalContext();

  if(!isLoading && isLoggedIn) return <Redirect href="/home" />

  return (
    <SafeAreaView style={styles.container}>
      {/* Logo */}
      <Image
        source={require('../assets/images/logo.png')} 
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Obrazy */}
      <View style={styles.imageContainer}>
      </View>

      {/* Nagłówki */}
      <Text style={styles.title}>Discover the Latest News</Text>
      <Text style={styles.subtitle}>
        Stay informed with real-time updates on global events, sports, technology, and more.
      </Text>

      {/* Przycisk */}
      <Button
        mode="contained"
        onPress={() => router.push('/(auth)/sing-in')} 
        //onPress={() => router.push('/home')} 
        style={styles.button}
        labelStyle={styles.buttonLabel}
      >
        Continue with News
      </Button>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#161622',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 100, 
    height: 100, 
    marginBottom: 20, 
  },
  imageContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  image: {
    width: 100,
    height: 150,
    borderRadius: 10,
    marginHorizontal: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  button: {
    backgroundColor: '#FFA001',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  buttonLabel: {
    fontSize: 16,
    color: '#161622',
  },
});
