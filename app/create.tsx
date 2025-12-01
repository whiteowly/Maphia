
import { ImageBackground, StatusBar, StyleSheet, Text, View } from "react-native";
import SliderComponent from './sliderComponent';
import SliderMafia from "./sliderMafia";

const backgroundImage = require("../assets/images/background.jpeg");

export default function Create() {
    return (

        <ImageBackground blurRadius={8} source={backgroundImage} style={styles.background}>
            <StatusBar hidden={true} />
           
            <Text style={{ fontFamily: 'Gruesome', fontSize: 40, color: 'red', marginBottom: 0, marginLeft: 30, marginTop: 30,  alignSelf: 'center', textAlign: 'center'  }}>Maphia</Text>
           
            <View style={styles.cardContainer} >
                 <Text style={{ fontFamily: 'Gruesome', fontSize: 30, color: 'red', marginTop: 10, alignSelf: 'center', textAlign: 'center' }}>Host a Game</Text>
                {/* <Text style={{ fontFamily: 'IrishGrover', fontSize: 17, color: 'red', marginLeft: 30 }}>Game Setup</Text> */}
                <View style={styles.contentRow}>
                       <SliderComponent initialValue={7} />
                          <SliderMafia initialValue={2} />
                      </View>
                      
                       <View style={styles.contentRow}>
                        <Text style={{ fontFamily: 'Gruesome', fontSize: 17, color: 'red', marginLeft: 30 }}>Game Mode</Text>
                        <Text style={{ fontFamily: 'Gruesome', fontSize: 17, color: 'red', marginLeft: 30 }}>Round Time</Text>
                      </View>
                
                <Text style={{ fontFamily: 'Gruesome', fontSize: 17, color: 'red', marginLeft: 30 }}>Join Settings</Text>
            </View>

            <Text style={{ fontFamily: 'Gruesome', fontSize: 17, color: 'red', marginLeft: 30 }}>Create</Text>
        </ImageBackground>
    );
}
const styles = StyleSheet.create({
    background: {
        flex: 1,
        resizeMode: "cover",
    },
    Text: {
        color: "red",
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
    marginLeft: 150,
    marginRight: 150,
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
});
//  <View style={styles.cardContainer}>
//       <Text style={styles.title}>Card Title</Text>
      
//       {/* This nested <View> acts as a second grouping container */}
//       <View style={styles.contentRow}>
//         <Text>Item 1</Text>
//         <Text>Item 2</Text>
//       </View>
//     </View>

// cardContainer: {
//     // Flexbox: defines the layout of its children (title and contentRow)
//     flexDirection: 'column', 
//     backgroundColor: '#f0f0f0', // Grey background
//     padding: 15,
//     borderRadius: 8,
//     margin: 10,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3, // Android shadow
//   },