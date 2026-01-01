import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Alert, ImageBackground, Pressable, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSocket } from '../context/SocketContext';

const backgroundImage = require("../assets/images/background.jpeg");

export default function Join() {
    const router = useRouter();
    const { socket } = useSocket();
    const [text, onChangeText] = React.useState('ABC123');

    useEffect(() => {
        if (!socket) return;

        // Listen for a successful join event from the server
       socket.on("JOIN_SUCCESS", (roomData) => {
            console.log("Successfully joined room:", roomData.code);
            // Pass the code to the lobby screen
            router.push({
                pathname: '/game',
                params: { roomCode: roomData.code, userId: roomData.userId }
            });
        });
        // Listen for errors (e.g., room doesn't exist)
        socket.on("JOIN_ERROR", (message) => {
            Alert.alert("Error", message);
        });

        return () => {
            socket.off("JOIN_SUCCESS");
            socket.off("JOIN_ERROR");
        };
    }, [socket]);

    const handleShare = () => {
        console.log("Button pressed. Current text:", text);
        if (text.length === 0) {
            Alert.alert("Error", "Please enter a room code");
            return;
        }
        if (socket) {
            const username = "Player" + Math.floor(Math.random() * 1000);
            // Send the code typed in the TextInput to the server
            socket.emit("JOIN_GAME", {
                roomCode: text.trim().toUpperCase(),
                username
            });
        } else {
            console.log("Socket not connected");
        }
    };

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
                onChangeText={onChangeText} // This updates your 'text' state
                value={text}
                placeholder="Enter Room Code"
                placeholderTextColor="#999"
                autoCapitalize="characters" // Automatically makes it ABC123
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
        alignItems: 'center',
    }
});
