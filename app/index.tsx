import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { ImageBackground, StatusBar, StyleSheet, View } from "react-native";
import { useMusic } from "./context/MusicContext";

const backgroundImage = require("../assets/images/background.png");

export default function Index() {
  const { startMusic, isPlaying } = useMusic();
  const [showPlayButton, setShowPlayButton] = useState(false);


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
    <ImageBackground source={backgroundImage} style={styles.background} imageStyle={styles.backgroundImage}>
      <StatusBar hidden={true} />
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
    width: '100%',
    height: '100%',
    justifyContent: "center",
    alignItems: "center",
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  container: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    padding: 0,
    marginTop: 100,
    alignSelf: 'center',
    gap: 0
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
    color: '#cabdb7',
    marginVertical: 0,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    marginTop: 0
  }
});
