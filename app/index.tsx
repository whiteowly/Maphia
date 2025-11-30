
import { ImageBackground, StyleSheet, Text } from "react-native";


const backgroundImage= require("../assets/images/background.jpeg");

export default function Index() {
  return (
    <ImageBackground source={backgroundImage} style={styles.background}>
    
      <Text style={styles.Text}>Host a Game</Text>
      <Text style={styles.Text}>Join</Text>
      <Text style={styles.Text}>Play Offline</Text>
      <Text style={styles.Text}>Settings</Text>
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
    fontFamily: "GruesomeRegular",
  },
});
