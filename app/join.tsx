import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, ImageBackground, Pressable, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const backgroundImage = require("../assets/images/background.jpeg");

export default function Create() {
    const handleShare = () => {
        // Replace this with actual sharing logic (e.g., using Expo's Sharing API)
        Alert.alert('Game Created', `Your game has been created successfully!`);
    };
    const router = useRouter();
    const [text, onChangeText] = React.useState('Code...');

    return (
        <ImageBackground blurRadius={10} source={backgroundImage} style={styles.background}>
            <StatusBar hidden={true} />
            <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityLabel="Go back">
                <MaterialIcons name="arrow-back" size={30} color="white" />
            </Pressable>

            <Text style={[styles.Text, { marginBottom: 0,fontSize: 40, marginLeft: 30, marginTop: 30, alignSelf: 'flex-end', textAlign: 'right', marginRight: 30 }]}>Maphia</Text>

            <View style={styles.cardContainer} >
                <Text style={[styles.Text, {  fontSize: 30,  marginTop: 4, alignSelf: 'center' }]}>Join a Game</Text>

                <Text style={[styles.Text, {  fontSize: 20,  marginLeft: 10, marginTop: 20 }]}>Enter Room Code</Text>
                <TextInput
                    style={styles.input}
                    value={text}
                    onChangeText={onChangeText}
                />
            </View>
            <View style={{ alignItems: 'center', justifyContent: 'flex-end', flex: 1 }}>
                <TouchableOpacity
                    style={styles.shareButton}
                    onPress={handleShare}
                    activeOpacity={1}
                >
                    <Text style={[styles.Text, {  fontSize: 25 }]}>Join</Text>
                </TouchableOpacity>
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
    shareButton: {
        width: '25%', // Fixed width for the button area
        height: '40%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#610000ff', // Solid darker red for the button background
        borderRadius: 100,
        marginTop: 10,
        marginBottom: 35,
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
    }
});
