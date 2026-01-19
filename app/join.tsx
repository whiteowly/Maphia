import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, ImageBackground, Pressable, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useGame } from './context/GameContext';
import socketService, { SERVER_URL } from './services/socketService';

const backgroundImage = require("../assets/images/background.jpeg");

export default function Join() {
    const router = useRouter();
    const { updateSettings, setIsHost, setMyPlayerId } = useGame();

    const [roomCode, setRoomCode] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [isConnecting, setIsConnecting] = useState(false);

    const handleJoin = async () => {
        // Validate inputs
        if (!roomCode.trim()) {
            Alert.alert('Error', 'Please enter a room code');
            return;
        }

        if (!playerName.trim()) {
            Alert.alert('Error', 'Please enter your name');
            return;
        }

        setIsConnecting(true);

        try {
            // Connect to server
            await socketService.connect();

            // Join room
            socketService.joinRoom(roomCode.toUpperCase(), playerName, (response) => {
                setIsConnecting(false);

                if (response.success) {
                    // Update game context
                    updateSettings({
                        roomCode: response.roomCode!,
                    });
                    setIsHost(false);
                    setMyPlayerId(response.playerId!);

                    // Navigate to lobby
                    router.push('/lobby');
                } else {
                    Alert.alert('Error', response.error || 'Failed to join room');
                }
            });
        } catch (error) {
            setIsConnecting(false);
            Alert.alert('Connection Error', 'Failed to connect to server. Make sure the server is running.');
            console.error('Connection error:', error);
        }
    };

    return (
        <ImageBackground blurRadius={10} source={backgroundImage} style={styles.background}>
            <StatusBar hidden={true} />
            <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityLabel="Go back">
                <MaterialIcons name="arrow-back" size={30} color="white" />
            </Pressable>

            <Text style={[styles.Text, { marginBottom: 0, fontSize: 40, marginLeft: 30, marginTop: 30, alignSelf: 'flex-end', textAlign: 'right', marginRight: 30 }]}>Maphia</Text>

            <View style={styles.cardContainer}>
                <Text style={[styles.Text, { fontSize: 30, marginTop: 4, alignSelf: 'center' }]}>Join a Game</Text>

                {/* Player Name Input */}
                <Text style={[styles.Text, { fontSize: 20, marginLeft: 10, marginTop: 20 }]}>Your Name</Text>
                <TextInput
                    style={styles.input}
                    value={playerName}
                    onChangeText={setPlayerName}
                    placeholder="Enter your name..."
                    placeholderTextColor="#999"
                    maxLength={15}
                />

                {/* Room Code Input */}
                <Text style={[styles.Text, { fontSize: 20, marginLeft: 10, marginTop: 15 }]}>Room Code</Text>
                <TextInput
                    style={styles.input}
                    value={roomCode}
                    onChangeText={(text) => setRoomCode(text.toUpperCase())}
                    placeholder="Enter room code..."
                    placeholderTextColor="#999"
                    maxLength={5}
                    autoCapitalize="characters"
                />

                {/* Server Status */}
                <View style={styles.serverStatus}>
                    <Text style={{ fontFamily: 'Gruesome', fontSize: 12, color: '#888' }}>
                        Server: {SERVER_URL.replace('http://', '')}
                    </Text>
                </View>
            </View>

            <View style={{ alignItems: 'center', justifyContent: 'flex-end', flex: 1 }}>
                <TouchableOpacity
                    style={[styles.shareButton, isConnecting && styles.disabledButton]}
                    onPress={handleJoin}
                    activeOpacity={0.8}
                    disabled={isConnecting}
                >
                    {isConnecting ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator color="white" size="small" />
                            <Text style={[styles.Text, { fontSize: 20, marginLeft: 10 }]}>Joining...</Text>
                        </View>
                    ) : (
                        <Text style={[styles.Text, { fontSize: 25 }]}>Join Game</Text>
                    )}
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
        flexDirection: 'column',
        padding: 15,
        borderRadius: 8,
        margin: 10,
        marginLeft: 200,
        marginRight: 200,
        backgroundColor: '#22010180',
        shadowColor: '#250101ff',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    shareButton: {
        width: '25%',
        height: '40%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#610000ff',
        borderRadius: 100,
        marginTop: 10,
        marginBottom: 35,
        shadowColor: '#640303ff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 10,
        elevation: 10,
    },
    disabledButton: {
        backgroundColor: '#444444',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        position: 'absolute',
        top: 20,
        left: 15,
        padding: 6,
        zIndex: 20,
    },
    input: {
        height: 45,
        marginHorizontal: 12,
        marginTop: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 0, 0, 0.3)',
        padding: 12,
        fontFamily: 'Gruesome',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderRadius: 8,
        fontSize: 18,
        color: '#333',
    },
    serverStatus: {
        marginTop: 20,
        alignItems: 'center',
    },
});
