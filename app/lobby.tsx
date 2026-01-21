import { MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ImageBackground, Pressable, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useGame } from './context/GameContext';
import { useMusic } from './context/MusicContext';
import socketService, { Player, RoleAssignment, RoomUpdate } from './services/socketService';
import { formatTimeDisplay } from './types/game';

const backgroundImage = require("../assets/images/lobby.png");

export default function Lobby() {
    const router = useRouter();
    const { settings, isHost, myPlayerId, setMyRole, setPhase, updateSettings, setMaphiaTeammates } = useGame();
    const { stopMusic } = useMusic();

    // State from socket
    const [players, setPlayers] = useState<Player[]>([]);
    const [roomState, setRoomState] = useState<any>(null);
    const [copied, setCopied] = useState(false);
    const [isReady, setIsReady] = useState(isHost); // Host is auto-ready
    const [isStarting, setIsStarting] = useState(false);

    const roomCode = settings.roomCode || 'XXXXX';

    // Set up socket listeners
    useEffect(() => {
        // Listen for room updates
        const unsubRoomUpdate = socketService.on('room_update', (data: RoomUpdate) => {
            setPlayers(data.players);
            setRoomState(data.state);

            // Update settings from server
            if (data.state.settings) {
                updateSettings(data.state.settings);
            }
        });

        // Listen for player joined
        const unsubPlayerJoined = socketService.on('player_joined', (data: { playerId: string; name: string }) => {
            console.log(`${data.name} joined the room`);
        });

        // Listen for player left
        const unsubPlayerLeft = socketService.on('player_left', (data: { playerId: string; name: string; newHostId: string }) => {
            console.log(`${data.name} left the room`);
        });

        // Listen for game started
        const unsubGameStarted = socketService.on('game_started', (data: { phase: string }) => {
            console.log('Game started!');
        });

        // Listen for role assignment
        const unsubRoleAssigned = socketService.on('role_assigned', (data: RoleAssignment) => {
            setMyRole(data.role);
            setPhase('role_reveal');

            // Stop background music when game starts
            stopMusic();

            // Store teammates for mafia players (used to filter night targets)
            if (data.role === 'maphia' && data.teammates) {
                setMaphiaTeammates(data.teammates);
            }

            // Navigate to role reveal screen based on role
            switch (data.role) {
                case 'maphia':
                    router.replace('/roleRevealMaphia');
                    break;
                case 'guardian':
                    router.replace('/roleRevealGuardian');
                    break;
                case 'joker':
                    router.replace('/roleRevealJoker');
                    break;
                default:
                    router.replace('/roleRevealCiv');
            }
        });

        // Cleanup listeners on unmount
        return () => {
            unsubRoomUpdate();
            unsubPlayerJoined();
            unsubPlayerLeft();
            unsubGameStarted();
            unsubRoleAssigned();
        };
    }, []);

    const copyCode = async () => {
        try {
            await Clipboard.setStringAsync(roomCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch (e) {
            console.error('Failed to copy:', e);
        }
    };

    const handleReady = () => {
        const newReady = !isReady;
        setIsReady(newReady);
        socketService.setReady(newReady);
    };

    const handleStartGame = () => {
        if (!isHost) {
            Alert.alert('Error', 'Only the host can start the game');
            return;
        }

        if (players.length < 5) {
            Alert.alert('Not Enough Players', `Need at least 5 players to start. Currently have ${players.length}.`);
            return;
        }

        const notReady = players.filter(p => !p.isReady);
        if (notReady.length > 0) {
            Alert.alert('Players Not Ready', `${notReady.length} player(s) are not ready yet.`);
            return;
        }

        setIsStarting(true);
        socketService.startGame((response) => {
            setIsStarting(false);
            if (!response.success) {
                Alert.alert('Error', response.error || 'Failed to start game');
            }
        });
    };

    const handleLeave = () => {
        Alert.alert(
            'Leave Lobby',
            'Are you sure you want to leave?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Leave',
                    style: 'destructive',
                    onPress: () => {
                        console.log('Leaving lobby...');
                        socketService.disconnect();
                        router.replace('/');
                    }
                },
            ]
        );
    };

    // Calculate civilians
    const maxPlayers = roomState?.settings?.maxPlayers || settings.maxPlayers || 7;
    const maphiaCount = roomState?.settings?.maphiaCount || settings.maphiaCount || 2;
    const civilianCount = maxPlayers - maphiaCount;
    const discussionTime = roomState?.settings?.discussionTimeSeconds || settings.discussionTimeSeconds || 60;
    const votingTime = roomState?.settings?.votingTimeSeconds || settings.votingTimeSeconds || 30;

    // Check if all players are ready
    const allReady = players.length >= 5 && players.every(p => p.isReady);

    return (
        <ImageBackground source={backgroundImage} style={styles.background}>
            <StatusBar hidden={true} />

            {/* Back Button */}
            <Pressable onPress={handleLeave} style={styles.backButton} accessibilityLabel="Go back">
                <MaterialIcons name="arrow-back" size={30} color="white" />
                <Text style={{ fontFamily: 'Gruesome', fontSize: 20, color: 'white', marginLeft: 10 }}>Leave Lobby</Text>
            </Pressable>

            {/* Title */}
            <Text style={[styles.Text, { marginBottom: 0, fontSize: 40, marginLeft: 30, marginTop: 30, alignSelf: 'flex-end', textAlign: 'right', marginRight: 30 }]}>Maphia</Text>

            {/* Main Content */}
            <View style={styles.mainContent}>
                {/* Players List Card */}
                <View style={styles.cardContainer1}>
                    <Text style={{ fontFamily: 'Gruesome', fontSize: 30, color: 'white', marginTop: 5, alignSelf: 'flex-start' }}>
                        Players ({players.length}/{maxPlayers})
                    </Text>
                    <ScrollView style={styles.playersList} showsVerticalScrollIndicator={true}>
                        <View style={styles.contentColumn}>
                            {players.map((player) => (
                                <View key={player.id} style={styles.playerRow}>
                                    <Text style={{
                                        fontFamily: 'Gruesome',
                                        fontSize: 20,
                                        color: player.id === myPlayerId ? '#FFD700' : 'white',
                                        marginLeft: 10,
                                        marginTop: 5
                                    }}>
                                        {player.name}
                                        {player.isHost ? ' 👑' : ''}
                                        {player.id === myPlayerId ? ' (You)' : ''}
                                    </Text>
                                    {player.isReady && (
                                        <Text style={{ fontFamily: 'Gruesome', fontSize: 18, color: '#7BFF7B', marginLeft: 10 }}>✓</Text>
                                    )}
                                </View>
                            ))}
                            {/* Empty slots */}
                            {Array.from({ length: Math.max(0, maxPlayers - players.length) }).map((_, i) => (
                                <Text key={`empty-${i}`} style={{ fontFamily: 'Gruesome', fontSize: 18, color: '#666666', marginLeft: 10, marginTop: 5 }}>
                                    Waiting for player...
                                </Text>
                            ))}
                        </View>
                    </ScrollView>

                    {/* Minimum players warning */}
                    {players.length < 5 && (
                        <Text style={{ fontFamily: 'Gruesome', fontSize: 14, color: '#FF6B6B', marginTop: 10 }}>
                            Need {5 - players.length} more player(s) to start
                        </Text>
                    )}
                </View>

                {/* Game Settings Card */}
                <View style={styles.settingsCard}>
                    <Text style={{ fontFamily: 'Gruesome', fontSize: 24, color: 'white', marginBottom: 10 }}>Game Settings</Text>
                    <Text style={{ fontFamily: 'Gruesome', fontSize: 16, color: '#AAAAAA' }}>
                        Players: {maxPlayers}
                    </Text>
                    <Text style={{ fontFamily: 'Gruesome', fontSize: 16, color: '#FF6B6B' }}>
                        Maphias: {maphiaCount}
                    </Text>
                    <Text style={{ fontFamily: 'Gruesome', fontSize: 16, color: '#7BFF7B' }}>
                        Civilians: {civilianCount}
                    </Text>
                    <View style={styles.timeDivider} />
                    <Text style={{ fontFamily: 'Gruesome', fontSize: 14, color: '#AAAAAA' }}>
                        Discussion: {formatTimeDisplay(discussionTime)}
                    </Text>
                    <Text style={{ fontFamily: 'Gruesome', fontSize: 14, color: '#AAAAAA' }}>
                        Voting: {formatTimeDisplay(votingTime)}
                    </Text>
                </View>
            </View>

            {/* Bottom Right Container */}
            <View style={styles.bottomRightContainer}>
                <Pressable onPress={copyCode} accessibilityLabel="Copy room code" style={styles.roomPress}>
                    <Text style={[styles.Text, { fontSize: 25 }]}>
                        Room Code - {roomCode}
                    </Text>
                    <Text style={[styles.Text, { fontSize: 13 }]}>
                        click to copy
                    </Text>
                    {copied && (
                        <Text style={[styles.Text, { fontSize: 14, marginTop: 4, color: '#7BFF7B' }]}>Copied!</Text>
                    )}
                </Pressable>

                <TouchableOpacity
                    style={[styles.readyButton, isReady && styles.readyButtonActive]}
                    onPress={handleReady}
                    activeOpacity={0.8}
                >
                    <Text style={[styles.Text, { fontSize: 25 }]}>
                        {isReady ? 'Ready ✓' : 'Ready?'}
                    </Text>
                </TouchableOpacity>

                {/* Start Game Button (host only) */}
                {isHost && (
                    <TouchableOpacity
                        style={[styles.startButton, (!allReady || isStarting) && styles.disabledButton]}
                        onPress={handleStartGame}
                        activeOpacity={0.8}
                        disabled={!allReady || isStarting}
                    >
                        <Text style={[styles.Text, { fontSize: 20 }]}>
                            {isStarting ? 'Starting...' : 'Start Game'}
                        </Text>
                    </TouchableOpacity>
                )}
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
    mainContent: {
        flex: 1,
        flexDirection: 'row',
        paddingHorizontal: 10,
    },
    cardContainer1: {
        flexDirection: 'column',
        padding: 15,
        margin: 10,
        marginLeft: 10,
        flex: 0.4,
        maxHeight: 350,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: 8,
    },
    settingsCard: {
        flexDirection: 'column',
        padding: 15,
        margin: 10,
        backgroundColor: '#22010180',
        borderRadius: 8,
        flex: 0.3,
        maxHeight: 200,
    },
    timeDivider: {
        height: 1,
        backgroundColor: 'rgba(255,255,255,0.2)',
        marginVertical: 8,
    },
    contentColumn: {
        flexDirection: 'column',
        justifyContent: 'flex-start',
        paddingVertical: 4,
    },
    playersList: {
        maxHeight: 250,
    },
    playerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    readyButton: {
        width: '80%',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#610000ff',
        borderRadius: 100,
        marginTop: 10,
        marginBottom: 8,
        marginRight: 20,
        shadowColor: '#640303ff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 10,
        elevation: 10,
    },
    readyButtonActive: {
        backgroundColor: '#006100',
        shadowColor: '#036403',
    },
    startButton: {
        width: '60%',
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#4a0080',
        borderRadius: 100,
        marginTop: 5,
        marginRight: 20,
        shadowColor: '#4a0080',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 8,
    },
    disabledButton: {
        backgroundColor: '#333333',
        shadowOpacity: 0,
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
