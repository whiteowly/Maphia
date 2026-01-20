import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, ImageBackground, Pressable, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useGame } from './context/GameContext';
import socketService, { Player } from './services/socketService';

const backgroundImage = require("../assets/images/lobby.png");

const Night = () => {
    const router = useRouter();
    const { myRole, myPlayerId, maphiaTeammates, setPhase, timeRemaining, setTimeRemaining, players, setPlayers } = useGame();
    const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
    const [hasVoted, setHasVoted] = useState(false);

    useEffect(() => {
        // Listen for phase changes
        const unsubPhase = socketService.on('phase_changed', (data: { phase: string }) => {
            setPhase(data.phase as any);
            if (data.phase === 'guardian') {
                router.replace('/guardian');
            } else if (data.phase === 'discussion') {
                router.replace('/game');
            }
        });

        // Listen for timer updates
        const unsubTimer = socketService.on('timer_update', (data: { timeRemaining: number }) => {
            setTimeRemaining(data.timeRemaining);
        });

        // Listen for room updates to get player list
        const unsubRoom = socketService.on('room_update', (data: { players: Player[] }) => {
            setPlayers(data.players);
        });

        // Listen for night results (in case night resolves while on this screen)
        const unsubResults = socketService.on('night_results', (data: any) => {
            // Store in sessionStorage for nightResults screen to read
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('nightResults', JSON.stringify(data));
            }
            router.replace('/nightResults');
        });

        return () => {
            unsubPhase();
            unsubTimer();
            unsubRoom();
            unsubResults();
        };
    }, []);

    const handleVote = () => {
        if (!selectedTarget) {
            Alert.alert('Select a target', 'Please select someone to eliminate');
            return;
        }

        socketService.submitNightVote(selectedTarget, (response) => {
            if (response.success) {
                setHasVoted(true);
            } else {
                Alert.alert('Error', response.error || 'Failed to submit vote');
            }
        });
    };

    const handleQuit = () => {
        socketService.disconnect();
        router.replace('/');
    };

    // Filter out dead players, self, and mafia teammates (mafia can't kill themselves or teammates)
    const teammateIds = maphiaTeammates.map(t => t.id);
    const alivePlayers = players.filter(p =>
        !p.isDead &&
        p.id !== undefined &&
        p.id !== myPlayerId &&  // Can't kill yourself
        !teammateIds.includes(p.id)  // Can't kill teammates
    );
    const isMaphia = myRole === 'maphia';

    return (
        <ImageBackground source={backgroundImage} style={styles.background}>
            <StatusBar hidden={true} />

            <Pressable onPress={handleQuit} style={styles.backButton}>
                <MaterialIcons name="arrow-back" size={30} color="white" />
                <Text style={styles.backText}>Quit</Text>
            </Pressable>

            <View style={styles.container}>
                <Text style={styles.title}>🌙 Night Phase</Text>
                <Text style={styles.timer}>Time: {timeRemaining}s</Text>

                {isMaphia ? (
                    <>
                        <Text style={styles.instruction}>
                            Select a player to eliminate
                        </Text>

                        {hasVoted ? (
                            <View style={styles.votedContainer}>
                                <MaterialIcons name="check-circle" size={60} color="#7BFF7B" />
                                <Text style={styles.votedText}>Vote submitted!</Text>
                                <Text style={styles.waitText}>Waiting for other Maphias...</Text>
                            </View>
                        ) : (
                            <>
                                <FlatList
                                    data={alivePlayers}
                                    keyExtractor={(item) => item.id}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={[
                                                styles.playerCard,
                                                selectedTarget === item.id && styles.selectedCard
                                            ]}
                                            onPress={() => setSelectedTarget(item.id)}
                                        >
                                            <Text style={styles.playerName}>{item.name}</Text>
                                            {selectedTarget === item.id && (
                                                <MaterialIcons name="check" size={24} color="#7BFF7B" />
                                            )}
                                        </TouchableOpacity>
                                    )}
                                    style={styles.list}
                                />

                                <TouchableOpacity
                                    style={[styles.voteButton, !selectedTarget && styles.disabledButton]}
                                    onPress={handleVote}
                                    disabled={!selectedTarget}
                                >
                                    <Text style={styles.voteText}>Confirm Kill</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </>
                ) : (
                    <View style={styles.waitingContainer}>
                        <Text style={styles.waitingText}>😴 The Maphia are plotting...</Text>
                        <Text style={styles.waitingSubtext}>Stay quiet and hope you're not targeted!</Text>
                    </View>
                )}
            </View>
        </ImageBackground>
    );
};

export default Night;

const styles = StyleSheet.create({
    background: {
        flex: 1,
        resizeMode: "cover",
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 80,
        alignItems: 'center',
    },
    title: {
        fontFamily: 'Gruesome',
        fontSize: 38,
        color: '#9CA3AF',
        marginBottom: 10,
    },
    timer: {
        fontFamily: 'Gruesome',
        fontSize: 24,
        color: '#FCD34D',
        marginBottom: 30,
    },
    instruction: {
        fontFamily: 'Gruesome',
        fontSize: 20,
        color: '#D1D5DB',
        marginBottom: 20,
        textAlign: 'center',
    },
    list: {
        width: '90%',
        maxHeight: 400,
    },
    playerCard: {
        backgroundColor: 'rgba(31, 41, 55, 0.8)',
        padding: 20,
        marginVertical: 8,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    selectedCard: {
        borderColor: '#7BFF7B',
        backgroundColor: 'rgba(123, 255, 123, 0.2)',
    },
    playerName: {
        fontFamily: 'Gruesome',
        fontSize: 20,
        color: 'white',
    },
    voteButton: {
        backgroundColor: '#DC2626',
        paddingHorizontal: 50,
        paddingVertical: 15,
        borderRadius: 50,
        marginTop: 30,
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
    },
    disabledButton: {
        backgroundColor: '#444444',
        shadowOpacity: 0,
    },
    voteText: {
        fontFamily: 'Gruesome',
        fontSize: 24,
        color: 'white',
    },
    votedContainer: {
        alignItems: 'center',
        marginTop: 50,
    },
    votedText: {
        fontFamily: 'Gruesome',
        fontSize: 28,
        color: '#7BFF7B',
        marginTop: 20,
    },
    waitText: {
        fontFamily: 'Gruesome',
        fontSize: 18,
        color: '#9CA3AF',
        marginTop: 10,
    },
    waitingContainer: {
        alignItems: 'center',
        marginTop: 100,
        paddingHorizontal: 40,
    },
    waitingText: {
        fontFamily: 'Gruesome',
        fontSize: 32,
        color: '#9CA3AF',
        textAlign: 'center',
    },
    waitingSubtext: {
        fontFamily: 'Gruesome',
        fontSize: 18,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: 20,
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
    backText: {
        fontFamily: 'Gruesome',
        fontSize: 20,
        color: 'white',
        marginLeft: 10,
    },
});
