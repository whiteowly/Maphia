import { MaterialIcons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { ImageBackground, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useMusic } from "./context/MusicContext";

const backgroundImage = require("../assets/images/background.png");

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

      <View style={styles.container}>

        <Link href="/create" style={styles.link}>Host a Game</Link>
        <Link href="/join" style={styles.link}>Join</Link>
        <Link href="/settings" style={styles.link}>Settings</Link>
      </View>
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
  container: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    padding: 20,
    marginTop: 100,
    marginLeft: 140
  },
  title: {
    fontFamily: 'Gruesome',
    fontSize: 60,
    color: 'white',
    marginBottom: 50,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10
  },
  link: {
    fontFamily: 'Gruesome',
    fontSize: 35,
    color: 'white',
    marginVertical: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    marginTop: 0
  }
});
