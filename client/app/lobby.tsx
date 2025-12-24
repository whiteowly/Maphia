import { MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useRouter, useLocalSearchParams } from 'expo-router'; 
import React, { useState, useEffect } from 'react';
import { ImageBackground, Pressable, StatusBar, StyleSheet, Text, TouchableOpacity, View, FlatList } from "react-native";
import { useSocket } from '../context/SocketContext'; 

const backgroundImage = require("../assets/images/lobby.png");

export default function Join() {
   const router = useRouter();
    const { socket } = useSocket(); 
    const { roomCode } = useLocalSearchParams(); // Dynamic code from Join screen
    const [players, setPlayers] = useState([]); 

    useEffect(() => {
        if (!socket) return;

        // 1. Tell the server to send us the current list of players
        socket.emit("GET_LOBBY_PLAYERS", roomCode);

        // 2. Listen for the initial list
        socket.on("ROOM_PLAYERS", (list) => {
            setPlayers(list);
        });

        // 3. Listen for new players joining while you are on this screen
        socket.on("PLAYER_JOINED", (newPlayer) => {
            setPlayers((prev) => [...prev, newPlayer]);
        });

        return () => {
            socket.off("ROOM_PLAYERS");
            socket.off("PLAYER_JOINED");
        };
    }, [socket]);
    
    return (
        <ImageBackground  source={backgroundImage} style={styles.background}>
            <StatusBar hidden={true} />
           
            <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityLabel="Go back">
                <MaterialIcons name="arrow-back" size={30} color="white" />
                <Text style={{ fontFamily: 'Gruesome', fontSize: 20, color: 'white', marginLeft: 10 }}>Leave Lobby</Text>
            </Pressable>

            <Text style={[styles.Text, { marginBottom: 0,fontSize: 40, marginLeft: 30, marginTop: 30, alignSelf: 'flex-end', textAlign: 'right', marginRight: 30 }]}>Maphia</Text>
 <View style={styles.cardContainer1} >
                 <Text style={{ fontFamily: 'Gruesome', fontSize: 30, color: 'white', marginTop: 5, alignSelf: 'flex-start' }}>Players list</Text>
                <View style={styles.contentColumn}>
                       <Text style={{ fontFamily: 'Gruesome', fontSize: 20, color: 'white', marginLeft: 10, marginTop: 0 }}>Jer(host)</Text>
                       <Text style={{ fontFamily: 'Gruesome', fontSize: 20, color: 'white', marginLeft: 10, marginTop: 0 }}>Jeri(You) ✅</Text>
                       <Text style={{ fontFamily: 'Gruesome', fontSize: 20, color: 'white', marginLeft: 10, marginTop: 0 }}>Jerbear ✅</Text>
                       
                      </View>         
                     
            </View>
          
            <View style={styles.bottomRightContainer}>
                <Pressable onPress={copyCode} accessibilityLabel="Copy room code" style={styles.roomPress}>
                    <Text style={[styles.Text, { fontSize: 25 }]}>
                        Room Code - {roomCode}
                    </Text>
                      <Text style={[styles.Text, { fontSize: 13 }]}>
                        click to copy
                    </Text>
                    {copied ? (
                        <Text style={[styles.Text, { fontSize: 14, marginTop: 4 }]}>Copied!</Text>
                    ) : null}
                </Pressable>
                <TouchableOpacity
                    style={styles.shareButton}
                    onPress={handleShare}
                    activeOpacity={1}
                >
                    <Link href="/roleRevealMaphia" style={[styles.Text, {  fontSize: 25 }]}>Ready✅</Link>
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
        marginBottom: 16,
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
    bottomRightContainer: {
        position: 'absolute',
        right: 16,
        bottom: 20,
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        zIndex: 20,
    },
    roomPress: {
        marginBottom: 8,
        alignItems: 'flex-end',
    }
});
