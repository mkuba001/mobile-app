import React, { useEffect } from "react";
import { SplashScreen } from "expo-router";
import { useFonts } from "expo-font";
import { Stack } from 'expo-router';
import GlobalProvider from '../contex/GlobalProvider'

const RootLayout = () => {
  const [fontsLoaded] = useFonts({
    "Oswald-SemiBold": require("../assets/fonts/Oswald-SemiBold.ttf"),
    "Oswald-ExtraLight": require("../assets/fonts/Oswald-ExtraLight.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null; 
  }

  return (
    <GlobalProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </GlobalProvider>
  );
};

export default RootLayout;
