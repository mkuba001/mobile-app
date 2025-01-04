import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useGlobalContext } from '../../contex/GlobalProvider';
import { logout } from '../../service/appwrite';
const Profile = () => {
  const router = useRouter();
  const { user, setUser, setIsLoggedIn } = useGlobalContext();

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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.label}>Użytkownik:</Text>
        <Text style={styles.username}>{user?.username || 'Unknown'}</Text>

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
  username: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFA001',
    marginBottom: 30,
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
