
import { Alert, ImageBackground, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import RedSelector from "./RedSelector";
import RoomCodeShare from "./RoomCodeShare";
import SliderComponent from './sliderComponent';
import SliderMafia from "./sliderMafia";
const backgroundImage = require("../assets/images/background.jpeg");


export default function Create() {
     const handleShare = () => {
        // Replace this with actual sharing logic (e.g., using Expo's Sharing API)
        Alert.alert('Game Created', `Your game has been created successfully!`);
      };
    return (
        <ImageBackground blurRadius={8} source={backgroundImage} style={styles.background}>
            <StatusBar hidden={true} />
            <Text style={{ fontFamily: 'Gruesome', fontSize: 40, color: 'white', marginBottom: 0, marginLeft: 30, marginTop: 30,  alignSelf: 'center', textAlign: 'center'  }}>Maphia</Text>
           <View style={styles.container}>
            <View style={styles.cardContainer} >
                 <Text style={{ fontFamily: 'Gruesome', fontSize: 30, color: 'white', marginTop: 10, alignSelf: 'flex-start' }}>Game rules</Text>
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
                   
            </View>
            <View style={styles.cardContainer1} >
                 <Text style={{ fontFamily: 'Gruesome', fontSize: 30, color: 'white', marginTop: 5, alignSelf: 'flex-start' }}>Roles</Text>
                <View style={styles.contentColumn}>
                       <Text style={{ fontFamily: 'Gruesome', fontSize: 17, color: 'white', marginLeft: 10, marginTop:20 }}>7 Players</Text>
                       <Text style={{ fontFamily: 'Gruesome', fontSize: 17, color: 'white', marginLeft: 10, marginTop:20 }}>2 Maphias</Text>
                       <Text style={{ fontFamily: 'Gruesome', fontSize: 17, color: 'white', marginLeft: 10, marginTop:20 }}>5 Civilians</Text>
                       
                      </View>         
                      <View style={{ alignItems: 'flex-end', justifyContent: 'flex-end', flex: 1 }}>  
                          <TouchableOpacity
                                style={styles.shareButton}
                                onPress={handleShare}
                                activeOpacity={0.6}
                              >
                                <Text style={{ fontFamily: 'Gruesome', fontSize: 17, color: 'white',  }}>Create Game</Text>
                              </TouchableOpacity>      
                      </View>    
            </View>
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
        flexDirection: 'row', 
        marginTop: 5,
        marginBottom: 50,
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginLeft: 10,
        marginRight: 10,
    },
    cardContainer: {
    // Flexbox: defines the layout of its children (title and contentRow)
    flexDirection: 'column', 
    padding: 15,
    borderRadius: 3,
    margin: 10,
    marginLeft: 70,
    marginRight: 10,
    flex: 0.7,
    backgroundColor: '#22010180', // Grey background
    shadowColor: '#250101ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shareButton: {
    width: '80%', // Fixed width for the button area
    height: '45%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#CC0000', // Solid darker red for the button background
    borderRadius: 8,
    marginTop: 10,
    marginBottom:20,
    // SHADOW/GLOW EFFECT (Crucial for the image's look)
    shadowColor: '#FF0000', 
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1, 
    shadowRadius: 10, 
    elevation: 10, // Android shadow effect
  },
  cardContainer1: {
    // Flexbox: defines the layout of its children (title and contentRow)
    flexDirection: 'column', 
    padding: 15,
    borderRadius: 3,
    margin: 10,
    marginLeft: 10,
    marginRight: 20,
    flex: 0.3,
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
    contentColumn: {
    // Flexbox: groups Item 1 and Item 2 to display them in a row
    flexDirection: 'column', 
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  smallerCard:{
 
  }
});
