import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, FlatList, ImageBackground, Pressable, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useGame } from './context/GameContext';
import socketService, { Player } from './services/socketService';

const backgroundImage = require("../assets/images/lobby.png");

const Guardian = () => {
    const router = useRouter();
    const { myRole, myPlayerId, setPhase, timeRemaining, setTimeRemaining, players, setPlayers } = useGame();
    const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
    const [hasSaved, setHasSaved] = useState(false);

    useEffect(() => {
        const unsubPhase = socketService.on('phase_changed', (data: { phase: string }) => {
            setPhase(data.phase as any);
            // Navigate to game screen when discussion starts
            if (data.phase === 'discussion') {
                router.replace('/game');
            }
        });

        const unsubTimer = socketService.on('timer_update', (data: { timeRemaining: number }) => {
            setTimeRemaining(data.timeRemaining);
        });

        const unsubRoom = socketService.on('room_update', (data: { players: Player[] }) => {
            setPlayers(data.players);
        });

        // Listen for night results to navigate - store data first then navigate
        const unsubResults = socketService.on('night_results', (data: any) => {
            console.log('[CLIENT] Received night_results:', data);
            // Store in sessionStorage for nightResults screen to read
            // Store in socketService for nightResults screen to read (mobile-friendly)
            socketService.setNightResultsData(data);
            router.replace('/nightResults');
        });

        return () => {
            unsubPhase();
            unsubTimer();
            unsubRoom();
            unsubResults();
        };
    }, []);

    const handleSave = () => {
        if (!selectedTarget) {
            Alert.alert('Select someone', 'Please select someone to protect');
            return;
        }

        socketService.submitGuardianSave(selectedTarget, (response) => {
            if (response.success) {
                setHasSaved(true);
            } else {
                Alert.alert('Error', response.error || 'Failed to save');
            }
        });
    };

    const handleQuit = () => {
        socketService.disconnect();
        router.replace('/');
    };

    const alivePlayers = players.filter(p => !p.isDead && p.id !== myPlayerId);
    const isGuardian = myRole === 'guardian';

    return (
        <ImageBackground source={backgroundImage} style={styles.background} imageStyle={styles.backgroundImage}>
            <StatusBar hidden={true} />

            <Pressable onPress={handleQuit} style={styles.backButton}>
                <MaterialIcons name="arrow-back" size={30} color="#cabdb7" />
                <Text style={styles.backText}>Quit</Text>
            </Pressable>

            <View style={styles.container}>
                <Text style={styles.title}>💙 Guardian Angel</Text>
                <Text style={styles.timer}>Time: {timeRemaining}s</Text>

                {isGuardian ? (
                    <>
                        <Text style={styles.instruction}>
                            Choose someone to save (not yourself!)
                        </Text>
                        <Text style={styles.warning}>
                            ⚠️ Warning: Saving a Maphia will kill you!
                        </Text>

                        {hasSaved ? (
                            <View style={styles.savedContainer}>
                                <MaterialIcons name="check-circle" size={60} color="#3B82F6" />
                                <Text style={styles.savedText}>Save submitted!</Text>
                                <Text style={styles.waitText}>Resolving night...</Text>
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
                                                <MaterialIcons name="check" size={24} color="#3B82F6" />
                                            )}
                                        </TouchableOpacity>
                                    )}
                                    style={styles.list}
                                />

                                <TouchableOpacity
                                    style={[styles.saveButton, !selectedTarget && styles.disabledButton]}
                                    onPress={handleSave}
                                    disabled={!selectedTarget}
                                >
                                    <Text style={styles.saveText}>Protect</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </>
                ) : (
                    <View style={styles.waitingContainer}>
                        <Text style={styles.waitingText}>👼 Someone is being saved...</Text>
                        <Text style={styles.waitingSubtext}>The Guardian Angel is working!</Text>
                    </View>
                )}
            </View>
        </ImageBackground>
    );
};

export default Guardian;

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
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 80,
        alignItems: 'center',
    },
    title: {
        fontFamily: 'Gruesome',
        fontSize: 38,
        color: '#3B82F6',
        marginBottom: 10,
    },
    timer: {
        fontFamily: 'Gruesome',
        fontSize: 24,
        color: '#FCD34D',
        marginBottom: 20,
    },
    instruction: {
        fontFamily: 'Gruesome',
        fontSize: 18,
        color: '#D1D5DB',
        marginBottom: 10,
        textAlign: 'center',
    },
    warning: {
        fontFamily: 'Gruesome',
        fontSize: 16,
        color: '#FCA5A5',
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
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
    },
    playerName: {
        fontFamily: 'Gruesome',
        fontSize: 20,
        color: '#cabdb7',
    },
    saveButton: {
        backgroundColor: '#1E40AF',
        paddingHorizontal: 50,
        paddingVertical: 15,
        borderRadius: 50,
        marginTop: 30,
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
    },
    disabledButton: {
        backgroundColor: '#444444',
        shadowOpacity: 0,
    },
    saveText: {
        fontFamily: 'Gruesome',
        fontSize: 24,
        color: '#cabdb7',
    },
    savedContainer: {
        alignItems: 'center',
        marginTop: 50,
    },
    savedText: {
        fontFamily: 'Gruesome',
        fontSize: 28,
        color: '#3B82F6',
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
        color: '#cabdb7',
        marginLeft: 10,
    },
});
