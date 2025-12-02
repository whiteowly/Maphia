
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Image, ImageBackground, Pressable, StatusBar, StyleSheet, Text, View } from "react-native";

const backgroundImage = require("../assets/images/lobby.png");
const roleReveal = () => {
    const handleShare = () => {
        router.push('/lobby');
    };
    const router = useRouter();

    const roomCode = 'JER116';
    const [copied, setCopied] = React.useState(false);



    return (
        <ImageBackground source={backgroundImage} style={styles.background}>
            <StatusBar hidden={true} />

            <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityLabel="Go back">
                <MaterialIcons name="arrow-back" size={30} color="white" />
                <Text style={{ fontFamily: 'Gruesome', fontSize: 20, color: 'white', marginLeft: 10 }}>Quit</Text>
            </Pressable>

            <Text style={[styles.Text, { marginBottom: 0, fontSize: 40, marginLeft: 30, marginTop: 30, alignSelf: 'flex-end', textAlign: 'right', marginRight: 30 }]}>Maphia</Text>

            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-start', marginBottom: 50 }}>
                <Image
                    style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
                    source={require('../assets/images/maphiaCard.png')}
                />
                <Text style={{ fontFamily: 'Gruesome', fontSize: 30, color: 'white', marginTop: 20, alignSelf: 'center' }}>You are a Maphia!</Text>
            </View>
        </ImageBackground>
    )
}

export default roleReveal


const styles = StyleSheet.create({
    background: {
        flex: 1,
        resizeMode: "cover",
    },
    Text: {
        color: "white",
        fontFamily: 'Gruesome',
    },
    cardContainer: {
        // Flexbox: defines the layout of its children (title and contentRow)
        flexDirection: 'column',
        padding: 15,
        borderRadius: 3,
        margin: 10,
        marginLeft: 200,
        marginRight: 200,
        backgroundColor: '#22010180', // Grey background
        shadowColor: '#250101ff',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,

    },
    cardContainer1: {
        // Flexbox: defines the layout of its children (title and contentRow)
        flexDirection: 'column',
        padding: 15,

        margin: 10,
        marginLeft: 10,
        marginRight: 600,
        flex: 0.3,


        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    contentColumn: {
        // Flexbox: groups Item 1 and Item 2 to display them in a row
        flexDirection: 'column',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    shareButton: {
        width: '80%', // Fixed width for the button area
        height: '35%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#610000ff', // Solid darker red for the button background
        borderRadius: 100,
        marginTop: 10,
        marginBottom: 20,
        marginRight: 20,
        // SHADOW/GLOW EFFECT (Crucial for the image's look)
        shadowColor: '#640303ff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 10,
        elevation: 10, // Android shadow effect
    },
    backButton: {
        position: 'absolute',
        top: 20,
        left: 15,
        padding: 6,
        zIndex: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
        fontFamily: 'Gruesome',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 8,
        fontSize: 20,
        alignItems: 'center',
    }
    ,
  
    roomPress: {
        marginBottom: 8,
        alignItems: 'flex-end',
    }
})
