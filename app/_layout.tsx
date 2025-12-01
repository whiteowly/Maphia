import { fontFamily } from '@/dimensions/fontFamily';
import { useFonts } from 'expo-font';
import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import '../global.css';

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
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="create" options={{ headerShown: false }} />
    </Stack>
  );
}
