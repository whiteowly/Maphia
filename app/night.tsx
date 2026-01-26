import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ImageBackground, Pressable, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useGame } from './context/GameContext';
import socketService from './services/socketService';
import { formatCountdown } from './types/game';

const backgroundImage = require("../assets/images/lobby.png");

export default function Night() {
    const router = useRouter();
    const { settings, myRole, myPlayerId, setPhase, maphiaTeammates, players, setPlayers, timeRemaining, setTimeRemaining } = useGame();

    // State
    const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
    const [hasVoted, setHasVoted] = useState(false);

    // Set up socket listeners
    useEffect(() => {
        // Listen for room updates (player list)
        const unsubRoomUpdate = socketService.on('room_update', (data: any) => {
            setPlayers(data.players);
        });

        // Listen for timer updates
        const unsubTimer = socketService.on('timer_update', (data: { timeRemaining: number }) => {
            setTimeRemaining(data.timeRemaining);
        });

        // Listen for night results
        const unsubResults = socketService.on('night_results', (data: any) => {
            // Store in sessionStorage for nightResults screen to read
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('nightResults', JSON.stringify(data));
            }
            router.replace('/nightResults');
        });

        // Listen for phase changes
        const unsubPhase = socketService.on('phase_changed', (data: { phase: string; timeRemaining: number }) => {
            setPhase(data.phase as any);
            if (data.phase === 'discussion') {
                router.replace('/game');
            }
            setTimeRemaining(data.timeRemaining);
        });

        // Cleanup
        return () => {
            unsubRoomUpdate();
            unsubTimer();
            unsubResults();
            unsubPhase();
        };
    }, []);

    // Filter to alive players only (functional for display logic if needed)
    // const alivePlayers = players.filter(p => !p.isDead);

    const handleSelectPlayer = (playerId: string) => {
        if (hasVoted) return;

        // Validation logic
        const player = players.find(p => p.id === playerId);
        if (!player || player.isDead) return;

        // Maphia validation
        if (myRole === 'maphia') {
            // Cannot target teammates
            const isTeammate = maphiaTeammates.some(t => t.id === playerId);
            if (isTeammate) return;
        }

        // Guardian validation
        if (myRole === 'guardian') {
            // Cannot save self
            if (playerId === myPlayerId) return;
        }

        setSelectedPlayer(playerId === selectedPlayer ? null : playerId);
    };

    const handleConfirmAction = () => {
        if (!selectedPlayer) {
            Alert.alert('Select a player', 'Please select a player.');
            return;
        }

        const callback = (response: any) => {
            if (response.success) {
                setHasVoted(true);
            } else {
                Alert.alert('Error', response.error || 'Failed to submit action');
            }
        };

        if (myRole === 'guardian') {
            socketService.submitGuardianSave(selectedPlayer, callback);
        } else if (myRole === 'maphia') {
            socketService.submitNightVote(selectedPlayer, callback);
        }
    };

    const handleSkipAction = () => {
        const callback = (response: any) => {
            if (response.success) {
                setHasVoted(true);
                setSelectedPlayer(null);
            }
        };

        if (myRole === 'guardian') {
            socketService.submitGuardianSave(null, callback);
        } else if (myRole === 'maphia') {
            socketService.submitNightVote(null, callback);
        }
    };

    const handleLeave = () => {
        Alert.alert(
            'Leave Game',
            'Are you sure you want to leave the game?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Leave',
                    style: 'destructive',
                    onPress: () => {
                        socketService.disconnect();
                        router.replace('/');
                    }
                },
            ]
        );
    };

    // Get role display color and text
    const getRoleDisplay = () => {
        switch (myRole) {
            case 'maphia':
                return { color: '#FF4444', text: 'Maphia' };
            case 'guardian':
                return { color: '#3B82F6', text: 'Guardian Angel' };
            case 'joker':
                return { color: '#EC4899', text: 'Joker' };
            default:
                return { color: '#7BFF7B', text: 'Civilian' };
        }
    };
    const roleDisplay = getRoleDisplay();

    // Timer warning color (red when < 10 seconds)
    const timerColor = timeRemaining < 10 ? '#FF4444' : '#cabdb7';

    // Split players into columns for display
    const displayPlayers = players; // Show all players
    const numColumns = 3;
    const playersPerColumn = Math.ceil(displayPlayers.length / numColumns);

    const columns = [
        displayPlayers.slice(0, playersPerColumn),
        displayPlayers.slice(playersPerColumn, playersPerColumn * 2),
        displayPlayers.slice(playersPerColumn * 2),
    ].filter(col => col.length > 0);

    // Dynamic Instruction Text
    const getInstructionText = () => {
        if (hasVoted) return 'Waiting for night to end';
        if (myRole === 'guardian') return 'Who do you want to save?';
        if (myRole === 'maphia') return 'Who do you want to eliminate?';
        return 'Night Phase'; // For Civilians
    };

    const canAct = myRole === 'maphia' || myRole === 'guardian';

    return (
        <ImageBackground blurRadius={8} source={backgroundImage} style={styles.background}>
            <StatusBar hidden={true} />

            <Pressable onPress={handleLeave} style={styles.backButton} accessibilityLabel="Leave game">
                <MaterialIcons name="arrow-back" size={30} color="#cabdb7" />
                <Text style={{ fontFamily: 'Gruesome', fontSize: 20, color: '#cabdb7', marginLeft: 10 }}>Leave game</Text>
            </Pressable>

            <View>
                {/* Timer */}
                <Text style={[styles.topCenterText, { fontSize: 26, color: timerColor }]}>
                    {formatCountdown(timeRemaining)}
                </Text>

                {/* Role Display */}
                <Text style={[styles.Text, { marginBottom: 0, fontSize: 26, marginLeft: 30, marginTop: 30, alignSelf: 'flex-end', textAlign: 'right', marginRight: 30 }]}>
                    Role - <Text style={{ color: roleDisplay.color }}>{roleDisplay.text}</Text>
                </Text>

                {/* Voting Area */}
                <View style={styles.cardContainer}>
                    <Text style={{ fontFamily: 'Gruesome', fontSize: 21, color: '#cabdb7', marginTop: 0, alignSelf: 'center' }}>
                        {getInstructionText()}
                    </Text>

                    {canAct && (
                        <ScrollView
                            style={styles.playersScroll}
                            contentContainerStyle={styles.playersScrollContent}
                            showsVerticalScrollIndicator={true}
                            nestedScrollEnabled={true}
                        >
                            <View style={styles.playersColumnsRow}>
                                {columns.map((column, colIndex) => (
                                    <View key={colIndex} style={styles.playerColumn}>
                                        {column.map((p) => {
                                            const isMe = p.id === myPlayerId;
                                            const isSelected = selectedPlayer === p.id;
                                            const isDead = p.isDead;
                                            // Check if this player is a mafia teammate (only visible to mafia)
                                            const isMaphiaTeammate = myRole === 'maphia' &&
                                                maphiaTeammates.some(t => t.id === p.id);

                                            // Valid target checks for disabling visual
                                            const isInvalidTarget = isDead ||
                                                (myRole === 'maphia' && isMaphiaTeammate) ||
                                                (myRole === 'guardian' && isMe);

                                            return (
                                                <TouchableOpacity
                                                    key={p.id}
                                                    style={[
                                                        styles.playerCard,
                                                        isSelected && styles.selectedCard,
                                                        hasVoted && styles.disabledCard,
                                                        (hasVoted || isInvalidTarget) && styles.disabledCard,
                                                        isMe && styles.myCard,
                                                    ]}
                                                    onPress={() => handleSelectPlayer(p.id)}
                                                    disabled={hasVoted || isInvalidTarget}
                                                    activeOpacity={0.7}
                                                >
                                                    <View style={styles.playerCardContent}>
                                                        <View style={styles.playerRow}>
                                                            {/* Mafia hat icon - only visible to mafia players */}
                                                            {isMaphiaTeammate && (
                                                                <Text style={{ marginRight: 6 }}>🎩</Text>
                                                            )}
                                                            <Text style={[
                                                                styles.playerText,
                                                                isMe && styles.meText,
                                                                isDead && styles.deadText,
                                                            ]}>
                                                                {p.name}

                                                                {isMe && ' (You)'}
                                                                {isDead && ' ☠️'}
                                                            </Text>
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                ))}
                            </View>
                        </ScrollView>
                    )}

                    {!canAct && (
                        <View style={styles.waitingContainer}>
                            <Text style={[styles.Text, { fontSize: 18, color: '#9CA3AF', textAlign: 'center', marginTop: 50 }]}>
                                Maphias are killing, guardian is saving
                            </Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Bottom Controls */}
            <View style={styles.bottomRightContainer}>
                {canAct && (
                    <>
                        {/* Check if current player is dead */}
                        {players.find(p => p.id === myPlayerId)?.isDead ? (
                            <View style={styles.spectatorContainer}>
                                <Text style={[styles.Text, { fontSize: 20, color: '#888', textAlign: 'center' }]}>
                                    👻 You are spectating
                                </Text>
                                <Text style={[styles.Text, { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 5 }]}>
                                    Dead players cannot act
                                </Text>
                            </View>
                        ) : !hasVoted ? (
                            <View style={styles.buttonRow}>
                                <TouchableOpacity
                                    style={styles.skipButton}
                                    onPress={handleSkipAction}
                                    activeOpacity={0.8}
                                >
                                    <Text style={[styles.Text, { fontSize: 20 }]}>Skip</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.voteButton, !selectedPlayer && styles.disabledButton]}
                                    onPress={handleConfirmAction}
                                    activeOpacity={0.8}
                                    disabled={!selectedPlayer}
                                >
                                    <Text style={[styles.Text, { fontSize: 20 }]}>
                                        {myRole === 'guardian' ? 'Protect' : 'Confirm'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View style={styles.waitingContainer}>
                                <Text style={[styles.Text, { fontSize: 18, color: '#7BFF7B' }]}>
                                    ✓ {myRole === 'guardian' ? 'Protection' : 'Vote'} submitted
                                </Text>
                            </View>
                        )}
                    </>
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
        color: '#cabdb7',
        fontFamily: 'Gruesome',
    },
    cardContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        padding: 15,
        borderRadius: 3,
        margin: 0,
        width: '90%',
        maxWidth: 1000,
        alignSelf: 'center',
        backgroundColor: 'transparent',
    },
    skipButton: {
        width: 100,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#444444',
        borderRadius: 100,
        marginTop: 10,
        marginRight: 10,
    },
    voteButton: {
        width: 100,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#610000ff',
        borderRadius: 100,
        marginTop: 10,
        shadowColor: '#640303ff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 10,
        elevation: 10,
    },
    disabledButton: {
        backgroundColor: '#333333',
        shadowOpacity: 0,
    },
    buttonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    spectatorContainer: {
        marginTop: 10,
        padding: 15,
        alignItems: 'center',
    },
    waitingContainer: {
        marginTop: 10,
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
        bottom: 20,
        right: 16,
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        zIndex: 100,
    },
    playersColumnsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingHorizontal: 8,
        marginTop: 6,
    },
    playerColumn: {
        flex: 1,
        paddingHorizontal: 8,
        alignItems: 'center',
        marginHorizontal: 6,
    },
    playerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    playerText: {
        color: '#cabdb7',
        fontFamily: 'Gruesome',
        fontSize: 18,
        textAlign: 'center',
    },
    meText: {
        color: '#FFD700',
    },
    deadText: {
        color: 'gray',
        textDecorationLine: 'line-through',
    },
    topCenterText: {
        position: 'absolute',
        top: 20,
        left: 0,
        right: 0,
        textAlign: 'center',
        color: '#cabdb7',
        fontFamily: 'Gruesome',
        zIndex: 20,
    },
    playerCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 30,
        marginVertical: 6,
        minWidth: 180,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedCard: {
        borderColor: '#FF4444',
        backgroundColor: 'rgba(255, 0, 0, 0.2)',
    },
    myCard: {
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        borderColor: 'rgba(255, 215, 0, 0.3)',
    },
    disabledCard: {
        opacity: 0.6,
    },
    playersScroll: {
        width: '100%',
        maxHeight: 300,
        paddingHorizontal: 8,
        marginTop: 8,
    },
    playersScrollContent: {
        paddingBottom: 12,
        alignItems: 'center',
    },
    playerCardContent: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});
