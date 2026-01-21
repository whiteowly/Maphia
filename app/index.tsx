import { MaterialIcons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { ImageBackground, StatusBar, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useMusic } from "./context/MusicContext";

const backgroundImage = require("../assets/images/background.jpeg");

export default function Index() {
  const { startMusic, isPlaying } = useMusic();
  const [showPlayButton, setShowPlayButton] = useState(false);

  // Start music when home screen loads
  useEffect(() => {
    const play = async () => {
      try {
        await startMusic();
        setShowPlayButton(false);
      } catch (e) {
        console.log("Autoplay failed, showing button");
        setShowPlayButton(true);
      }
    };
    play();
  }, []);

  const handleManualPlay = () => {
    startMusic().then(() => setShowPlayButton(false)).catch(() => { });
  };

  return (
    <ImageBackground source={backgroundImage} style={styles.background}>
      <StatusBar hidden={true} />

      {(!isPlaying || showPlayButton) && (
        <TouchableOpacity onPress={handleManualPlay} style={{ position: 'absolute', top: 40, right: 20, zIndex: 10 }}>
          <MaterialIcons name="volume-off" size={40} color="white" />
          <Text style={{ fontFamily: 'Gruesome', color: 'white', fontSize: 12 }}>Tap to Play</Text>
        </TouchableOpacity>
      )}

      <Text style={{ fontFamily: 'Gruesome', fontSize: 40, color: 'white', marginBottom: 50 }}>Maphia</Text>
      <Link href="/create" style={{ fontFamily: 'Gruesome', fontSize: 27, color: 'white', }}>Host a Game</Link>
      <Link href="/join" style={{ fontFamily: 'Gruesome', fontSize: 27, color: 'white', }}>Join</Link>
      <Link href="/Accounts" style={{ fontFamily: 'Gruesome', fontSize: 27, color: 'white', }}>Play Offline</Link>
      <Link href="/settings" style={{ fontFamily: 'Gruesome', fontSize: 27, color: 'white', }}>Settings</Link>
    </ImageBackground>

  );
}
const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "center",
    alignItems: "center",
  },
  Text: {
    color: "white",
    fontSize: 30,
    fontWeight: "bold",

  },
});
