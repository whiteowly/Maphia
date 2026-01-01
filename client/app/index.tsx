
import { Link } from "expo-router";
import { ImageBackground, StatusBar, StyleSheet, Text } from "react-native";

const backgroundImage= require("../assets/images/background.jpeg");

export default function Index() {
  return (
    
  
    <ImageBackground source={backgroundImage} style={styles.background}>
      <StatusBar hidden={true} />
      <Text style={{fontFamily: 'Gruesome', fontSize: 40, color: 'white', marginBottom: 50}}>Maphia</Text>
      <Link href="/create" style={{fontFamily: 'Gruesome', fontSize: 27, color: 'white', }}>Host a Game</Link>
      <Link href="/join" style={{fontFamily: 'Gruesome', fontSize: 27, color: 'white', }}>Join</Link>
      <Link href="/offline" style={{fontFamily: 'Gruesome', fontSize: 27, color: 'white', }}>Play Offline</Link>
      <Link href="/settings" style={{fontFamily: 'Gruesome', fontSize: 27, color: 'white', }}>Settings</Link>
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
