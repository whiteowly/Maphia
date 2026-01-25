import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, ImageBackground, Platform, Pressable, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useGame } from './context/GameContext';
import socketService from './services/socketService';

// Web-compatible alert helper
const showAlert = (title: string, message: string, buttons?: { text: string; onPress?: () => void }[]) => {
    if (Platform.OS === 'web') {
        if (buttons && buttons.length > 0) {
            const confirmed = window.confirm(`${title}\n\n${message}`);
            if (confirmed && buttons[0]?.onPress) {
                buttons[0].onPress();
            }
        } else {
            window.alert(`${title}\n\n${message}`);
        }
    } else {
        Alert.alert(title, message, buttons);
    }
};

const backgroundImage = require("../assets/images/background.png");

export default function Join() {
    const router = useRouter();
    const { updateSettings, setIsHost, setMyPlayerId, playerName: savedName } = useGame();

    const [roomCode, setRoomCode] = useState('');
    const [playerName, setPlayerName] = useState(savedName || '');
    const [isConnecting, setIsConnecting] = useState(false);

    // Bug 2 Fix: Map server errors to user-friendly messages
    const getErrorMessage = (error: string): { title: string; message: string } => {
        switch (error) {
            case 'Room not found':
                return {
                    title: 'Room Not Found',
                    message: 'Check if the code is correct and try again. The room may have been closed or the code might be wrong.'
                };
            case 'Room is full':
                return {
                    title: 'Lobby Full',
                    message: 'This lobby has reached its maximum player limit. Ask the host to increase the player count or try joining a different game.'
                };
            case 'Game already in progress':
                return {
                    title: 'Game Already Started',
                    message: 'This game has already begun. You cannot join a game that is in progress.'
                };
            default:
                return {
                    title: 'Unable to Join',
                    message: error || 'Failed to join room. Please check the code and try again.'
                };
        }
    };

    const handleJoin = async () => {
        // Validate inputs
        if (!roomCode.trim()) {
            showAlert('Error', 'Please enter a room code');
            return;
        }

        if (!playerName.trim()) {
            showAlert(
                'Name Required',
                'Please set your display name in Settings first.',
                [{ text: 'Go to Settings', onPress: () => router.push('/settings') }]
            );
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
                    // Bug 2 Fix: Show user-friendly error messages
                    const errorInfo = getErrorMessage(response.error || '');
                    showAlert(errorInfo.title, errorInfo.message);
                }
            });
        } catch (error) {
            setIsConnecting(false);
            showAlert('Connection Error', 'Failed to connect to server. Make sure the server is running and try again.');
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
                <Text style={[styles.Text, { fontSize: 30, marginTop: 0, alignSelf: 'center', color: '#cabdb7' }]}>Join a Game</Text>

                {/* Player Name Input */}
                <Text style={[styles.Text, { fontSize: 20, marginLeft: 10, marginTop: 5, color: '#cabdb7' }]}>Your Name</Text>
                <TextInput
                    style={styles.input}
                    value={playerName}
                    onChangeText={setPlayerName}
                    placeholder="Enter your name..."
                    placeholderTextColor="#999"
                    maxLength={15}
                />
                <Text style={[styles.Text, { fontSize: 20, marginLeft: 10, marginTop: 5, color: '#cabdb7' }]}>Room Code</Text>
                <TextInput
                    style={styles.input}
                    value={roomCode}
                    onChangeText={(text) => setRoomCode(text.toUpperCase())}
                    placeholder="Enter room code..."
                    placeholderTextColor="#999"
                    maxLength={5}
                    autoCapitalize="characters"
                />

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
                        <Text style={[styles.Text, { fontSize: 25 }]}>Join</Text>
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

    },
    shareButton: {
        width: '25%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#610000ff',
        borderRadius: 100,
        marginTop: 0,
        marginBottom: 7,
        shadowColor: '#640303ff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 10,

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
        height: 43,
        marginHorizontal: 12,
        marginTop: 3,
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
