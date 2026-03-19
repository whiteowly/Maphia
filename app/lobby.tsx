import { MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ImageBackground, Platform, Pressable, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ChatPanel from './components/ChatPanel';
import { useAlert } from './context/AlertContext';
import { useGame } from './context/GameContext';
import { useMusic } from './context/MusicContext';
import socketService, { Player, RoleAssignment, RoomUpdate } from './services/socketService';
import { formatTimeDisplay } from './types/game';

const backgroundImage = require("../assets/images/lobby.png");

export default function Lobby() {
    const router = useRouter();
    const { settings, isHost, setIsHost, myPlayerId, setMyRole, setPhase, updateSettings, setMaphiaTeammates } = useGame();
    const { stopMusic } = useMusic();
    const { showAlert } = useAlert();

    // State from socket
    const [players, setPlayers] = useState<Player[]>([]);
    const [roomState, setRoomState] = useState<any>(null);
    const [copied, setCopied] = useState(false);
    const [isReady, setIsReady] = useState(isHost); // Host is auto-ready
    const [isStarting, setIsStarting] = useState(false);

    const roomCode = settings.roomCode || 'XXXXX';

    // Set up socket listeners
    useEffect(() => {
        // Request current room state on mount (fixes race condition where
        // the room_update emitted during join is missed before this screen mounts)
        socketService.requestRoomState((response) => {
            if (response.success) {
                setPlayers(response.players || []);
                setRoomState(response.state);
                if (response.state?.hostId === myPlayerId) {
                    setIsHost(true);
                }
                if (response.state?.settings) {
                    updateSettings(response.state.settings);
                }
            }
        });

        // Listen for room updates
        const unsubRoomUpdate = socketService.on('room_update', (data: RoomUpdate) => {
            setPlayers(data.players);
            setRoomState(data.state);

            // Update host status in context
            if (data.state.hostId === myPlayerId) {
                // If I am now the host (and wasn't before, or just confirming), update context
                if (!isHost) { // Local check before context update to avoid loops if needed, though react handles it
                    // Assuming setIsHost is available from useGame which it is
                }
                // Actually context update handles diff check usually, but good to be explicit
            }
            // Better yet, just sync it always:
            // We need to access setIsHost from the closure or ref if it's not stable, but it comes from useGame. 
            // However, listeners are defined in useEffect with [] dependency. 
            // `myPlayerId` and `setIsHost` are from outside. 
            // IMPORTANT: myPlayerId in the closure of useEffect might be stale if it changes (it shouldn't in lobby).
            // But let's use the data from the event if possible, or ref.
            // data.players contains { id, isHost }
            const me = data.players.find(p => p.id === myPlayerId);
            if (me) {
                // Update context
                setIsHost(me.isHost);
            }

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
            unsubRoleAssigned();
        };
    }, []);

    // Listen separately to ensure navigation works
    useEffect(() => {
        const unsubKicked = socketService.on('player_kicked', () => {
            console.log('You were kicked from the room');
            showAlert('Kicked', 'You have been kicked from the room by the host.', [
                {
                    text: 'OK', onPress: () => {
                        socketService.disconnect();
                        router.replace('/');
                    }
                }
            ], 'blood');
        });

        return () => {
            unsubKicked();
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
            showAlert('Error', 'Only the host can start the game', undefined, 'error');
            return;
        }

        if (players.length < 5) {
            showAlert('Not Enough Players', `Need at least 5 players to start. Currently have ${players.length}.`, undefined, 'warning');
            return;
        }

        const notReady = players.filter(p => !p.isReady);
        if (notReady.length > 0) {
            showAlert('Players Not Ready', `${notReady.length} player(s) are not ready yet.`, undefined, 'warning');
            return;
        }

        setIsStarting(true);
        socketService.startGame((response) => {
            setIsStarting(false);
            if (!response.success) {
                showAlert('Error', response.error || 'Failed to start game', undefined, 'error');
            }
        });
    };

    const handleLeave = () => {
        showAlert(
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
            ],
            'blood'
        );
    };

    const handleKick = (playerId: string, playerName: string) => {
        showAlert(
            'Kick Player',
            `Are you sure you want to kick ${playerName}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Kick',
                    style: 'destructive',
                    onPress: () => {
                        socketService.kickPlayer(playerId, (response) => {
                            if (!response.success) {
                                showAlert('Error', response.error || 'Failed to kick player', undefined, 'error');
                            }
                        });
                    }
                },
            ],
            'blood'
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
        <ImageBackground source={backgroundImage} style={styles.background} imageStyle={styles.backgroundImage}>
            <StatusBar hidden={true} />

            {/* Back Button */}
            <Pressable onPress={handleLeave} style={styles.backButton} accessibilityLabel="Go back">
                <MaterialIcons name="arrow-back" size={30} color="#cabdb7" />
                <Text style={{ fontFamily: 'Gruesome', fontSize: 20, color: '#cabdb7', marginLeft: 10 }}>Leave Lobby</Text>
            </Pressable>

            {/* Title */}
            <Text style={[{ marginBottom: 0, color: 'white', fontFamily: 'Gruesome', fontSize: 40, marginLeft: 30, marginTop: 30, alignSelf: 'flex-end', textAlign: 'right', marginRight: 30 }]}>Maphia</Text>

            {/* Main Content */}
            <View style={styles.mainContent}>
                {/* Chat Panel (left) */}
                <View style={styles.chatCard}>
                    <ChatPanel myPlayerId={myPlayerId} allowQuickChat={false} />
                </View>

                {/* Players List Card (middle) */}
                <View style={styles.cardContainer1}>
                    <Text style={{ fontFamily: 'Gruesome', fontSize: 30, color: '#cabdb7', marginTop: 5, alignSelf: 'flex-start' }}>
                        Players ({players.length}/{maxPlayers})
                    </Text>
                    <ScrollView style={styles.playersList} showsVerticalScrollIndicator={true}>
                        <View style={styles.contentColumn}>
                            {players.map((player) => (
                                <View key={player.id} style={styles.playerRow}>
                                    <Text style={{
                                        fontFamily: 'Gruesome',
                                        fontSize: 20,
                                        color: player.id === myPlayerId ? '#FFD700' : '#cabdb7',
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
                                    {isHost && player.id !== myPlayerId && (
                                        <TouchableOpacity
                                            onPress={() => handleKick(player.id, player.name)}
                                            style={styles.kickButton}
                                        >
                                            <MaterialIcons name="remove-circle-outline" size={20} color="#FF6B6B" />
                                        </TouchableOpacity>
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

                {/* Game Settings Card (right) */}
                <View style={styles.settingsCard}>
                    <Text style={{ fontFamily: 'Gruesome', fontSize: 24, color: '#cabdb7', marginBottom: 10 }}>Game Settings</Text>
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
        width: '100%',
        height: '100%',
    },
    backgroundImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    Text: {
        color: "#cabdb7",
        fontFamily: 'Gruesome',
    },
    mainContent: {
        flexDirection: 'row',
        paddingHorizontal: 10,
        paddingVertical: 10,
        width: '100%',
        maxWidth: 1200,
        maxHeight: Platform.OS === 'web' ? '50%' : undefined,
        alignSelf: 'center',
    },
    cardContainer1: {
        flexDirection: 'column',
        padding: 15,
        margin: 10,
        marginLeft: 10,
        flex: 0.3,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: 8,
    },
    settingsCard: {
        flexDirection: 'column',
        padding: 15,
        margin: 10,
        backgroundColor: '#22010180',
        borderRadius: 8,
        flex: 0.2,
    },
    chatCard: {
        flex: 0.5,
        margin: 10,
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
        backgroundColor: '#640303ff',
        borderRadius: 100,
        marginTop: 5,
        marginRight: 20,
        shadowColor: '#640303ff',
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
    },
    kickButton: {
        marginLeft: 'auto',
        padding: 5,
    }
});
