import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ImageBackground, Pressable, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAlert } from './context/AlertContext';
import { useGame } from './context/GameContext';
import socketService, { Player, VotingResults } from './services/socketService';
import { formatCountdown } from './types/game';

const backgroundImage = require("../assets/images/day_background.png");

export default function Voting() {
    const router = useRouter();
    const { settings, myRole, myPlayerId, setPhase, maphiaTeammates } = useGame();
    const { showAlert } = useAlert();

    // State from socket
    const [timeRemaining, setTimeRemaining] = useState(settings.votingTimeSeconds || 30);
    const [players, setPlayers] = useState<Player[]>([]);
    const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
    const [hasVoted, setHasVoted] = useState(false);
    const [totalVotes, setTotalVotes] = useState(0);
    const [totalVoters, setTotalVoters] = useState(0);
    // Track who each player voted for
    const [playerVotes, setPlayerVotes] = useState<Record<string, string>>({}); // voterId -> targetName

    // Set up socket listeners
    useEffect(() => {
        // Listen for room updates (player list)
        const unsubRoomUpdate = socketService.on('room_update', (data: any) => {
            setPlayers(data.players);
            // Count alive players as voters
            const alive = data.players.filter((p: Player) => !p.isDead);
            setTotalVoters(alive.length);
        });

        // Listen for timer updates
        const unsubTimer = socketService.on('timer_update', (data: { timeRemaining: number }) => {
            setTimeRemaining(data.timeRemaining);
        });

        // Listen for vote submitted (count update AND who voted for whom)
        const unsubVote = socketService.on('vote_submitted', (data: {
            voterId: string;
            targetName: string;
            totalVotes: number;
            totalVoters: number
        }) => {
            setTotalVotes(data.totalVotes);
            setTotalVoters(data.totalVoters);
            // Track who this player voted for
            setPlayerVotes(prev => ({
                ...prev,
                [data.voterId]: data.targetName
            }));
        });

        // Listen for voting results
        const unsubResults = socketService.on('voting_results', (data: VotingResults) => {
            setPhase('results');
            router.replace({
                pathname: '/revealUI',
                params: {
                    eliminated: data.eliminated || '',
                    eliminatedName: data.eliminatedName || '',
                    eliminatedRole: data.eliminatedRole || '',
                    tie: data.tie ? 'true' : 'false',
                },
            });
        });

        // Listen for phase changes
        const unsubPhase = socketService.on('phase_changed', (data: { phase: string; timeRemaining: number }) => {
            if (data.phase === 'discussion') {
                setPhase('discussion');
                router.replace('/game');
            } else if (data.phase === 'night') {
                setPhase('night');
                router.replace('/night');
            }
            setTimeRemaining(data.timeRemaining);
        });

        // Listen for game over
        const unsubGameOver = socketService.on('game_over', (data: any) => {
            setPhase('game_over');
            // Store game over data for the gameOver screen
            socketService.setGameOverData(data);
            router.replace('/gameOver' as any);
        });

        // Cleanup
        return () => {
            unsubRoomUpdate();
            unsubTimer();
            unsubVote();
            unsubResults();
            unsubPhase();
            unsubGameOver();
        };
    }, []);

    // Filter to alive players only
    const alivePlayers = players.filter(p => !p.isDead);
    // Use all players for display (dead players will be visually disabled)
    // const alivePlayers = players.filter(p => !p.isDead);

    const handleSelectPlayer = (playerId: string) => {
        if (hasVoted) return;
        // if (playerId === myPlayerId) return; // Can't vote for yourself (Removed to allow self-voting)
        setSelectedPlayer(playerId === selectedPlayer ? null : playerId);
    };

    const handleConfirmVote = () => {
        if (!selectedPlayer) {
            showAlert('Select a player', 'Please select a player to vote for.', undefined, 'warning');
            return;
        }

        socketService.submitVote(selectedPlayer, (response) => {
            if (response.success) {
                setHasVoted(true);
            } else {
                showAlert('Error', response.error || 'Failed to submit vote', undefined, 'error');
            }
        });
    };

    const handleSkipVote = () => {
        socketService.submitVote(null, (response) => {
            if (response.success) {
                setHasVoted(true);
                setSelectedPlayer(null);
            }
        });
    };

    const handleLeave = () => {
        showAlert(
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
            ],
            'blood'
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

    // Split players into columns for display (show all players, dead ones are visually disabled)
    const displayPlayers = players; // Show all players
    const numColumns = 3;
    const playersPerColumn = Math.ceil(displayPlayers.length / numColumns);

    const columns = [
        displayPlayers.slice(0, playersPerColumn),
        displayPlayers.slice(playersPerColumn, playersPerColumn * 2),
        displayPlayers.slice(playersPerColumn * 2),
    ].filter(col => col.length > 0);

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
                    Voting - {formatCountdown(timeRemaining)}
                </Text>

                {/* Role Display */}
                <Text style={[styles.Text, { marginBottom: 0, fontSize: 26, marginLeft: 30, marginTop: 30, alignSelf: 'flex-end', textAlign: 'right', marginRight: 30 }]}>
                    Role - <Text style={{ color: roleDisplay.color }}>{roleDisplay.text}</Text>
                </Text>

                {/* Voting Area */}
                <View style={styles.cardContainer}>
                    <Text style={{ fontFamily: 'Gruesome', fontSize: 21, color: '#cabdb7', marginTop: 0, alignSelf: 'center' }}>
                        {hasVoted ? 'Waiting for other players...' : 'Who do you want to vote for?'}
                    </Text>

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
                                        const votedFor = playerVotes[p.id]; // Who this player voted for
                                        // Check if this player is a mafia teammate (only visible to mafia)
                                        const isMaphiaTeammate = myRole === 'maphia' &&
                                            maphiaTeammates.some(t => t.id === p.id);

                                        return (
                                            <TouchableOpacity
                                                key={p.id}
                                                style={[
                                                    styles.playerCard,
                                                    isSelected && styles.selectedCard,
                                                    hasVoted && styles.disabledCard,
                                                    (hasVoted || isDead) && styles.disabledCard,
                                                    isMe && styles.myCard,
                                                ]}
                                                onPress={() => handleSelectPlayer(p.id)}
                                                disabled={hasVoted || isDead}
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
                                                    {/* Show who this player voted for */}
                                                    {votedFor && (
                                                        <Text style={styles.votedForText}>
                                                            {votedFor}
                                                        </Text>
                                                    )}
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            ))}
                        </View>
                    </ScrollView>
                </View>
            </View>

            {/* Bottom Controls */}
            <View style={styles.bottomRightContainer}>
                <Text style={[styles.Text, { fontSize: 17, marginRight: 10 }]}>
                    {totalVotes}/{totalVoters} voted
                </Text>


                {/* Check if current player is dead */}
                {players.find(p => p.id === myPlayerId)?.isDead ? (
                    <View style={styles.spectatorContainer}>
                        <Text style={[styles.Text, { fontSize: 20, color: '#888', textAlign: 'center' }]}>
                            You are spectating
                        </Text>
                        <Text style={[styles.Text, { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 5 }]}>
                            Dead players cannot vote
                        </Text>
                    </View>
                ) : !hasVoted ? (
                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={styles.skipButton}
                            onPress={handleSkipVote}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.Text, { fontSize: 20 }]}>Skip</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.voteButton, !selectedPlayer && styles.disabledButton]}
                            onPress={handleConfirmVote}
                            activeOpacity={0.8}
                            disabled={!selectedPlayer}
                        >
                            <Text style={[styles.Text, { fontSize: 20 }]}>Vote</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={styles.waitingContainer}>
                        <Text style={[styles.Text, { fontSize: 18, color: '#7BFF7B' }]}>
                            ✓ Vote submitted
                        </Text>
                    </View>
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
    votedForText: {
        fontFamily: 'Gruesome',
        fontSize: 14,
        color: '#9CA3AF',
        marginTop: 2,
    },
});
