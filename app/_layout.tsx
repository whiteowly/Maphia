import { fontFamily } from '@/dimensions/fontFamily';
import { useFonts } from 'expo-font';
import { Stack } from "expo-router";
import '../global.css';
import { AlertProvider } from './context/AlertContext';
import { GameProvider } from './context/GameContext';
import { MusicProvider } from './context/MusicContext';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    [fontFamily.IrishGrover]: require('../assets/fonts/IrishGrover-Regular.ttf'),
    [fontFamily.Gruesome]: require('../assets/fonts/Gruesome.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AlertProvider>
      <MusicProvider>
        <GameProvider>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="create" options={{ headerShown: false }} />
            <Stack.Screen name="join" options={{ headerShown: false }} />
            <Stack.Screen name="lobby" options={{ headerShown: false }} />
            <Stack.Screen name="roleRevealMaphia" options={{ headerShown: false }} />
            <Stack.Screen name="roleRevealCiv" options={{ headerShown: false }} />
            <Stack.Screen name="roleRevealGuardian" options={{ headerShown: false }} />
            <Stack.Screen name="roleRevealJoker" options={{ headerShown: false }} />
            <Stack.Screen name="game" options={{ headerShown: false }} />
            <Stack.Screen name="voting" options={{ headerShown: false }} />
            <Stack.Screen name="night" options={{ headerShown: false }} />
            <Stack.Screen name="guardian" options={{ headerShown: false }} />
            <Stack.Screen name="nightResults" options={{ headerShown: false }} />
            <Stack.Screen name="revealUI" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="Accounts" options={{ headerShown: false }} />
            <Stack.Screen name="settings" options={{ headerShown: false }} />
            <Stack.Screen name="gameOver" options={{ headerShown: false }} />
          </Stack>
        </GameProvider>
      </MusicProvider>
    </AlertProvider>
  );
}

