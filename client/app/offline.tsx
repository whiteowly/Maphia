import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { ImageBackground, Pressable, StatusBar, StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import { useSocket } from '../context/SocketContext';
import SliderComponent from './sliderComponent';
import SliderMafia from "./sliderMafia";

const backgroundImage = require("../assets/images/background.jpeg");

export default function Offline() {
    const router = useRouter();
    const { socket } = useSocket();
    
    const [maxPlayers, setMaxPlayers] = useState(7);
    const [maphiaCount, setMaphiaCount] = useState(2);
    const [discussionTime, setDiscussionTime] = useState(60);
    const [votingTime, setVotingTime] = useState(30);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!socket) return;

        // Update connection status
        setIsConnected(socket.connected);
        const onConnect = () => setIsConnected(true);
        const onDisconnect = () => setIsConnected(false);

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);

        const onLobbyCreated = ({ roomCode, userId }: { roomCode: string, userId: any }) => {
            console.log("LOCAL_LOBBY_CREATED received:", roomCode, userId);
            router.push({
                pathname: '/lobby',
                params: { roomCode, userId }
            });
        };

        socket.on("LOBBY_CREATED", onLobbyCreated);

        return () => {
            socket.off("LOBBY_CREATED", onLobbyCreated);
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
        };
    }, [socket, router]);

    const handleCreate = () => {
        if (!socket || !socket.connected) {
            Alert.alert("Connection Error", "Not connected to server. Ensure server is running on local network.");
            return;
        }
        const username = "Host" + Math.floor(Math.random() * 1000);
        // We use the same event as online for now, assuming the server handles both
        socket.emit("CREATE_LOBBY", { username, maxPlayers, maphiaCount, discussionTime, votingTime });
    };

    const maxMaphiaAllowed = Math.min(3, Math.floor((maxPlayers - 1) / 2));

    const handleSetMaxPlayers = (val: number) => {
        setMaxPlayers(val);
        const newMaxMaphia = Math.min(3, Math.floor((val - 1) / 2));
        if (maphiaCount > newMaxMaphia) {
            setMaphiaCount(newMaxMaphia);
        }
    };

    return (
        <ImageBackground blurRadius={10} source={backgroundImage} style={styles.background}>
            <StatusBar hidden={true} />
            <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityLabel="Go back">
                <MaterialIcons name="arrow-back" size={30} color="white" />
            </Pressable>
         
            <Text style={styles.headerTitle}>Local Play</Text>
            <Text style={[styles.subHeader, { color: isConnected ? '#4caf50' : '#ff4444', fontWeight: 'bold' }]}>
                {isConnected ? "Connected to Server" : "Disconnected (Check IP in SocketContext)"}
            </Text>
            <Text style={styles.subHeader}>Ensure all players are on the same Wi-Fi</Text>

           <View style={styles.container}>
            <View style={styles.cardContainer} >
                 <Text style={{ fontFamily: 'Gruesome', fontSize: 30, color: 'white', marginTop: 4, alignSelf: 'flex-start' }}>Game rules</Text>
                <View style={styles.contentRow}>
                       <SliderComponent initialValue={maxPlayers} onValueChange={handleSetMaxPlayers} />
                          <SliderMafia initialValue={maphiaCount} onValueChange={setMaphiaCount} maximumValue={maxMaphiaAllowed} />
                      </View>
                       <SliderComponent 
                            label="Discussion Time" 
                            initialValue={discussionTime} 
                            minimumValue={10} 
                            maximumValue={120} 
                            step={10} 
                            onValueChange={setDiscussionTime} 
                       />
                       <SliderComponent 
                            label="Voting Time" 
                            initialValue={votingTime} 
                            minimumValue={10} 
                            maximumValue={120} 
                            step={10} 
                            onValueChange={setVotingTime} 
                       />
                   
            </View>
            <View style={styles.cardContainer1} >
                 <Text style={{ fontFamily: 'Gruesome', fontSize: 30, color: 'white', marginTop: 5, alignSelf: 'flex-start' }}>Roles</Text>
                <View style={styles.contentColumn}>
                       <Text style={{ fontFamily: 'Gruesome', fontSize: 20, color: 'white', marginLeft: 10, marginTop:20 }}>{maxPlayers} Players</Text>
                       <Text style={{ fontFamily: 'Gruesome', fontSize: 20, color: 'white', marginLeft: 10, marginTop:20 }}>{maphiaCount} Maphias</Text>
                       <Text style={{ fontFamily: 'Gruesome', fontSize: 20, color: 'white', marginLeft: 10, marginTop:20 }}>{maxPlayers - maphiaCount} Civilians</Text>
                       
                      </View>         
                     
            </View>
            
            </View>
              <View style={{ alignItems: 'center', justifyContent: 'flex-end', flex: 1 }}>  
                          <TouchableOpacity
                                style={styles.shareButton}
                                onPress={handleCreate}
                                activeOpacity={1}
                              >
                                <Text style={{ fontFamily: 'Gruesome', fontSize: 30, color: 'white' }}>Create Local</Text>
                              </TouchableOpacity>      
                      </View>   
        </ImageBackground>
    );
}
const styles = StyleSheet.create({
    background: { flex: 1, resizeMode: "cover" },
    headerTitle: { fontFamily: 'Gruesome', fontSize: 40, color: 'white', marginBottom: 0, marginLeft: 30, marginTop: 30,  alignSelf: 'flex-end', textAlign: 'right', marginRight: 30 },
    subHeader: { fontFamily: 'Gruesome', fontSize: 20, color: '#ccc', marginBottom: 0, marginLeft: 30, marginTop: 5,  alignSelf: 'flex-end', textAlign: 'right', marginRight: 30 },
    container: { flex: 1, flexDirection: 'row', marginTop: 5, marginBottom: 50, alignItems: "flex-start", justifyContent: "space-between", marginLeft: 10, marginRight: 10 },
    cardContainer: {
        flexDirection: 'column', padding: 15, borderRadius: 3, margin: 10, marginLeft: 70, marginRight: 10, flex: 0.7,
        backgroundColor: '#22010180', shadowColor: '#250101ff', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
    },
    shareButton: {
        width: '30%', height: '40%', justifyContent: 'center', alignItems: 'center', backgroundColor: '#610000ff', borderRadius: 100, marginTop: 10, marginBottom:10,
        shadowColor: '#640303ff', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 10, elevation: 10,
    },
    cardContainer1: {
        flexDirection: 'column', padding: 15, borderRadius: 3, margin: 10, marginLeft: 10, marginRight: 20, flex: 0.3,
        backgroundColor: '#22010180', shadowColor: '#250101ff', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
    },
    contentRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
    contentColumn: { flexDirection: 'column', justifyContent: 'space-between', paddingVertical: 4 },
    backButton: { position: 'absolute', top: 20, left: 15, padding: 6, zIndex: 20 },
});
