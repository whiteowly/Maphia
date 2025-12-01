
import { ImageBackground, StatusBar, StyleSheet, Text } from "react-native";


const backgroundImage= require("../assets/images/background.jpeg");

export default function Index() {
  return (
    
    <ImageBackground  blurRadius={8} source={backgroundImage} style={styles.background}>
      <StatusBar hidden={true} />
      <Text style={{fontFamily: 'Gruesome', fontSize: 40, color: 'white', marginBottom: 50, marginLeft: 30, marginTop: 30, alignItems: "flex-end", justifyContent: "flex-end"}}>Maphia</Text>
    
    </ImageBackground>
  );
}
const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    
    
  },
  Text: {
    color: "white",
    fontSize: 30,
    fontWeight: "bold",
    
  },
});
