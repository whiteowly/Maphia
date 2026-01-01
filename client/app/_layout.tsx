import { fontFamily } from '@/dimensions/fontFamily';
import { useFonts } from 'expo-font';
import { Stack, usePathname } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import '../global.css';
import { SocketProvider } from '../context/SocketContext';
import { SettingsProvider, useSettings } from '../context/SettingsContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';



SplashScreen.preventAutoHideAsync();



export default function RootLayout() {
    const [fontsLoaded] = useFonts({
    [fontFamily.IrishGrover]: require('../assets/fonts/IrishGrover-Regular.ttf'),
    [fontFamily.Gruesome]: require('../assets/fonts/Gruesome.ttf'), 
  });

useEffect(() =>  {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }
  return (
    <SettingsProvider>
    <SafeAreaProvider>
    <SocketProvider>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="create" options={{ headerShown: false }} />
        <Stack.Screen name="join" options={{ headerShown: false }} />
        <Stack.Screen name="lobby" options={{ headerShown: false }} />
        <Stack.Screen name="roleRevealMaphia" options={{ headerShown: false }} />
        <Stack.Screen name="roleRevealCiv" options={{ headerShown: false }} />
        <Stack.Screen name="game" options={{ headerShown: false }} />
        <Stack.Screen name="voting" options={{ headerShown: false }} />
        <Stack.Screen name="revealUI" options={{ headerShown: false }} />
        <Stack.Screen name="settings" options={{ headerShown: false }} />
        <Stack.Screen name="offline" options={{ headerShown: false }} />
      </Stack>
    </SocketProvider>
    </SafeAreaProvider>
    </SettingsProvider>
  );
}
