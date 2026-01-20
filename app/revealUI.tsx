import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ImageBackground, Pressable, StatusBar, StyleSheet, Text, View } from "react-native";
import { useGame } from './context/GameContext';
import socketService from './services/socketService';

const backgroundImage = require("../assets/images/lobby.png");

export default function VotingResults() {
    const router = useRouter();
    const { setPhase } = useGame();
    const params = useLocalSearchParams();

    // Parse params
    const eliminated = params.eliminated as string || null;
    const eliminatedName = params.eliminatedName as string || null;
    const eliminatedRole = params.eliminatedRole as string || '';
    const tie = params.tie === 'true';
    const gameOver = params.gameOver === 'true';
    const winner = params.winner as string || '';

    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        // Listen for phase changes to navigate
        const unsubPhase = socketService.on('phase_changed', (data: { phase: string }) => {
            console.log('[VotingResults] Phase changed to:', data.phase);
            if (data.phase === 'night') {
                setPhase('night');
                router.replace('/night');
            } else if (data.phase === 'discussion') {
                setPhase('discussion');
                router.replace('/game');
            }
        });

        // Listen for game over
        const unsubGameOver = socketService.on('game_over', (data: any) => {
            console.log('[VotingResults] Game over:', data);
            setPhase('game_over');
            // Stay on this screen but update display
        });

        // Countdown timer for display
        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            unsubPhase();
            unsubGameOver();
            clearInterval(timer);
        };
    }, []);

    const handleQuit = () => {
        socketService.disconnect();
        router.replace('/');
    };

    // Get role color
    const getRoleColor = (role: string) => {
        switch (role) {
            case 'maphia': return '#FF4444';
            case 'guardian': return '#3B82F6';
            case 'joker': return '#EC4899';
            default: return '#7BFF7B';
        }
    };

    const getRoleDisplayName = (role: string) => {
        switch (role) {
            case 'maphia': return 'Maphia';
            case 'guardian': return 'Guardian Angel';
            case 'joker': return 'Joker';
            default: return 'Civilian';
        }
    };

    // Game over display
    if (gameOver) {
        const winnerDisplay = winner === 'maphia' ? 'The Maphia' :
            winner === 'joker' ? 'The Joker' :
                'The Town';
        const winnerColor = winner === 'maphia' ? '#FF4444' :
            winner === 'joker' ? '#EC4899' :
                '#7BFF7B';

        return (
            <ImageBackground source={backgroundImage} style={styles.background}>
                <StatusBar hidden={true} />

                <Pressable onPress={handleQuit} style={styles.backButton} accessibilityLabel="Leave game">
                    <MaterialIcons name="arrow-back" size={30} color="white" />
                    <Text style={{ fontFamily: 'Gruesome', fontSize: 20, color: 'white', marginLeft: 10 }}>Leave</Text>
                </Pressable>

                <View style={styles.container}>
                    <Text style={styles.gameOverText}>🎮 Game Over!</Text>
                    <View style={styles.resultCard}>
                        <Text style={[styles.winnerText, { color: winnerColor }]}>
                            {winnerDisplay} Wins!
                        </Text>
                        <Text style={styles.subText}>
                            {winner === 'maphia' ? 'The Maphia has taken over the town!' :
                                winner === 'joker' ? 'The Joker got voted out and won!' :
                                    'All Maphia have been eliminated!'}
                        </Text>
                    </View>
                </View>
            </ImageBackground>
        );
    }

    // Voting result display
    return (
        <ImageBackground source={backgroundImage} style={styles.background}>
            <StatusBar hidden={true} />

            <Pressable onPress={handleQuit} style={styles.backButton} accessibilityLabel="Leave game">
                <MaterialIcons name="arrow-back" size={30} color="white" />
                <Text style={{ fontFamily: 'Gruesome', fontSize: 20, color: 'white', marginLeft: 10 }}>Quit</Text>
            </Pressable>

            <View style={styles.container}>
                <Text style={styles.phaseTitle}>Voting Results</Text>

                <View style={styles.resultCard}>
                    {tie ? (
                        <>
                            <Text style={styles.tieIcon}>⚖️</Text>
                            <Text style={styles.tieText}>It's a Tie!</Text>
                            <Text style={styles.subText}>No one was eliminated</Text>
                        </>
                    ) : eliminated ? (
                        <>
                            <Text style={styles.eliminatedIcon}>☠️</Text>
                            <Text style={styles.eliminatedText}>{eliminatedName}</Text>
                            <Text style={styles.wasText}>was eliminated!</Text>
                            <Text style={[styles.roleReveal, { color: getRoleColor(eliminatedRole) }]}>
                                They were a {getRoleDisplayName(eliminatedRole)}
                            </Text>
                        </>
                    ) : (
                        <>
                            <Text style={styles.tieIcon}>🤷</Text>
                            <Text style={styles.tieText}>No Votes Cast</Text>
                            <Text style={styles.subText}>No one was eliminated</Text>
                        </>
                    )}
                </View>

                <Text style={styles.countdown}>
                    {countdown > 0 ? `Next phase in ${countdown}s...` : 'Starting...'}
                </Text>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        resizeMode: "cover",
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    phaseTitle: {
        fontFamily: 'Gruesome',
        fontSize: 28,
        color: '#9CA3AF',
        marginBottom: 40,
    },
    resultCard: {
        backgroundColor: 'rgba(31, 41, 55, 0.9)',
        padding: 50,
        borderRadius: 20,
        alignItems: 'center',
        minWidth: 350,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    eliminatedIcon: {
        fontSize: 80,
        marginBottom: 20,
    },
    eliminatedText: {
        fontFamily: 'Gruesome',
        fontSize: 36,
        color: '#FF4444',
        marginBottom: 10,
    },
    wasText: {
        fontFamily: 'Gruesome',
        fontSize: 24,
        color: '#D1D5DB',
        marginBottom: 20,
    },
    roleReveal: {
        fontFamily: 'Gruesome',
        fontSize: 20,
        marginTop: 10,
    },
    tieIcon: {
        fontSize: 80,
        marginBottom: 20,
    },
    tieText: {
        fontFamily: 'Gruesome',
        fontSize: 32,
        color: '#FCD34D',
        marginBottom: 10,
    },
    subText: {
        fontFamily: 'Gruesome',
        fontSize: 18,
        color: '#9CA3AF',
        textAlign: 'center',
    },
    countdown: {
        fontFamily: 'Gruesome',
        fontSize: 16,
        color: '#6B7280',
        marginTop: 40,
    },
    gameOverText: {
        fontFamily: 'Gruesome',
        fontSize: 48,
        color: '#FCD34D',
        marginBottom: 40,
    },
    winnerText: {
        fontFamily: 'Gruesome',
        fontSize: 38,
        marginBottom: 20,
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
});
