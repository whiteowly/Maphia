
import { ImageBackground, StatusBar, StyleSheet, Text, View } from "react-native";
import RedSelector from "./RedSelector";
import RoomCodeShare from "./RoomCodeShare";
import SliderComponent from './sliderComponent';
import SliderMafia from "./sliderMafia";
const backgroundImage = require("../assets/images/background.jpeg");

export default function Create() {
    return (

        <ImageBackground blurRadius={8} source={backgroundImage} style={styles.background}>
            <StatusBar hidden={true} />
           
            <Text style={{ fontFamily: 'Gruesome', fontSize: 40, color: 'white', marginBottom: 0, marginLeft: 30, marginTop: 30,  alignSelf: 'center', textAlign: 'center'  }}>Maphia</Text>
           
            <View style={styles.cardContainer} >
                 <Text style={{ fontFamily: 'Gruesome', fontSize: 30, color: 'white', marginTop: 5, alignSelf: 'flex-start' }}>Game rules</Text>
                <View style={styles.contentRow}>
                       <SliderComponent initialValue={7} />
                          <SliderMafia initialValue={2} />
                      </View>
                       <View style={styles.contentRow}>
                        <Text style={{ fontFamily: 'Gruesome', fontSize: 17, color: 'white', marginLeft: 10, marginTop:20 }}>Join Settings</Text>
                        
                        <Text style={{ fontFamily: 'Gruesome', fontSize: 17, color: 'white', marginLeft: 30, marginTop:20 }}>Discussion Time(min)</Text>
                      </View>
                      <View style={styles.contentRow}>
                        <RoomCodeShare code="J27FX" />
                        <RedSelector currentValue={2} onSelectPress={() => console.log('Selector clicked!')}/>
                      </View>
               <Text style={{ fontFamily: 'Gruesome', fontSize: 25, color: 'white', marginLeft: 30, alignSelf: 'center', marginTop:20 }}>Create Game</Text>
                 
            </View>
            

          
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
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",

    },
    cardContainer: {
    // Flexbox: defines the layout of its children (title and contentRow)
    flexDirection: 'column', 
    padding: 15,
    borderRadius: 3,
    margin: 10,
    marginLeft: 70,
    marginRight: 280,
    backgroundColor: '#22010180', // Grey background
    shadowColor: '#250101ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contentRow: {
    // Flexbox: groups Item 1 and Item 2 to display them in a row
    flexDirection: 'row', 
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  smallerCard:{
 
  }
});
