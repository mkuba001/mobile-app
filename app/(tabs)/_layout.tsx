import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

const TabsLayout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#FFA001', 
        tabBarInactiveTintColor: "#CDCDE0", 
        tabBarStyle: {
          backgroundColor: '#161622',
          borderTopWidth: 1,
          borderTopColor: '#232533',
          height: 84,
        },
        tabBarLabelStyle: {
          fontSize: 12, 
          paddingBottom: 6, 
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons name="home" size={24} color={focused ? color : '#9BA1A6'} />
          ),
          tabBarLabel: "Home", 
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons name="bookmark" size={24} color={focused ? color : '#9BA1A6'} />
          ),
          tabBarLabel: "Saved", 
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <MaterialIcons name="person" size={24} color={focused ? color : '#9BA1A6'} />
          ),
          tabBarLabel: "Profile", 
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
