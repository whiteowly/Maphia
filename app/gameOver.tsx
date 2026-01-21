import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Animated, Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useGame } from './context/GameContext';
import { useMusic } from './context/MusicContext';
import socketService from './services/socketService';

const backgroundImage = require("../assets/images/lobby.png");
const jokerCard = require("../assets/images/jokerCard.png");
const maphiaCard = require("../assets/images/roles/EmptyMaphia.png");

interface WinnerPlayer {
    id: string;
    name: string;
    role: string;
    isDead: boolean;
}

interface GameOverData {
    winner: 'maphia' | 'civilians' | 'joker';
    allRoles: Record<string, WinnerPlayer>;
}

export default function GameOver() {
    const router = useRouter();
    const { isHost, resetGame } = useGame();
    const { startMusic } = useMusic();

    const [gameData, setGameData] = useState<GameOverData | null>(null);
    const [waitingForHost, setWaitingForHost] = useState(false);
    const [fadeAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        // Get game over data from socket service (stored when event received)
        const storedData = socketService.getGameOverData?.();
        if (storedData) {
            setGameData(storedData);
        }

        // Animate in
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();

        // Listen for play again response
        const unsubPlayAgain = socketService.on('return_to_lobby', () => {
            // Resume music when returning to lobby
            startMusic();
            router.replace('/lobby' as any);
        });

        // Listen for host leaving
        const unsubHostLeft = socketService.on('host_left', () => {
            Alert.alert('Host Left', 'The host has left the room.', [
                { text: 'OK', onPress: () => handleQuit() }
            ]);
        });

        // Listen for waiting state
        const unsubWaiting = socketService.on('waiting_for_host', () => {
            setWaitingForHost(true);
        });

        return () => {
            unsubPlayAgain();
            unsubHostLeft();
            unsubWaiting();
        };
    }, []);

    const handlePlayAgain = () => {
        if (isHost) {
            socketService.sendEvent('play_again', {});
        } else {
            setWaitingForHost(true);
            socketService.sendEvent('request_play_again', {});
        }
    };

    const handleQuit = () => {
        socketService.disconnect();
        resetGame();
        router.replace('/');
    };

    // Get winning players based on winner type
    const getWinningPlayers = (): WinnerPlayer[] => {
        if (!gameData) return [];

        const players = Object.values(gameData.allRoles);

        switch (gameData.winner) {
            case 'joker':
                return players.filter(p => p.role === 'joker');
            case 'maphia':
                return players.filter(p => p.role === 'maphia');
            case 'civilians':
                return players.filter(p => p.role !== 'maphia' && p.role !== 'joker');
            default:
                return [];
        }
    };

    const winningPlayers = getWinningPlayers();
    const guardianPlayer = gameData ? Object.values(gameData.allRoles).find(p => p.role === 'guardian') : null;

    // Render Joker Win
    const renderJokerWin = () => (
        <View style={styles.jokerContainer}>
            <Animated.View style={[styles.cardWrapper, { opacity: fadeAnim }]}>
                <View>
                    <Image source={jokerCard} style={styles.card} resizeMode="contain" />
                    <View style={styles.nameOverlay}>
                        <Text style={styles.cardNameText}>{winningPlayers[0]?.name || 'Joker'}</Text>
                    </View>
                </View>
            </Animated.View>
            <Text style={styles.winTitle}>🃏 JOKER WINS! 🃏</Text>
            <Text style={styles.winSubtitle}>Successfully got voted out!</Text>
        </View>
    );

    // Render Maphia Win
    const renderMaphiaWin = () => (
        <View style={styles.maphiaContainer}>
            <Text style={styles.winTitle}>🔪 MAPHIA WINS! 🔪</Text>
            <View style={styles.cardsRow}>
                {winningPlayers.map((player, index) => (
                    <Animated.View
                        key={player.id}
                        style={[styles.cardWrapper, { opacity: fadeAnim }]}
                    >
                        <View>
                            <Image source={maphiaCard} style={styles.maphiaCardImage} resizeMode="contain" />
                            <View style={styles.nameOverlay}>
                                <Text style={styles.maphiaCardNameText}>
                                    {player.name}
                                    {player.isDead && ' ☠️'}
                                </Text>
                            </View>
                        </View>
                    </Animated.View>
                ))}
            </View>
            <Text style={styles.winSubtitle}>The town has been eliminated!</Text>
        </View>
    );

    // Render Civilian Win
    const renderCivilianWin = () => {
        const civilianPlayers = winningPlayers;

        return (
            <View style={styles.civilianContainer}>
                <Text style={styles.civilianWinTitle}>✨ CIVILIANS WIN! ✨</Text>
                <Text style={styles.winSubtitle}>The Maphia has been eliminated!</Text>

                <View style={styles.namesScatter}>
                    {civilianPlayers.map((player, index) => {
                        const isGuardian = player.role === 'guardian';
                        // Use modulo to pick position style
                        const posIndex = index % 8;

                        return (
                            <Animated.View
                                key={player.id}
                                style={[
                                    styles.scatteredName,
                                    posIndex === 0 && styles.pos0,
                                    posIndex === 1 && styles.pos1,
                                    posIndex === 2 && styles.pos2,
                                    posIndex === 3 && styles.pos3,
                                    posIndex === 4 && styles.pos4,
                                    posIndex === 5 && styles.pos5,
                                    posIndex === 6 && styles.pos6,
                                    posIndex === 7 && styles.pos7,
                                    { opacity: fadeAnim }
                                ]}
                            >
                                {isGuardian && <Text style={styles.haloIcon}>😇</Text>}
                                <Text style={[
                                    styles.civilianName,
                                    isGuardian && styles.guardianName,
                                    player.isDead && styles.deadName
                                ]}>
                                    {player.name}
                                    {player.isDead && ' ☠️'}
                                </Text>
                            </Animated.View>
                        );
                    })}
                </View>
            </View>
        );
    };

    const renderWinDisplay = () => {
        if (!gameData) return null;

        switch (gameData.winner) {
            case 'joker':
                return renderJokerWin();
            case 'maphia':
                return renderMaphiaWin();
            case 'civilians':
                return renderCivilianWin();
            default:
                return null;
        }
    };

    // Choose background based on winner
    const getBackgroundStyle = () => {
        if (gameData?.winner === 'civilians') {
            return { backgroundColor: '#0a2e0a' }; // Dark green
        }
        return {};
    };

    return (
        <ImageBackground source={backgroundImage} style={[styles.background, getBackgroundStyle()]}>
            {gameData?.winner === 'civilians' && (
                <LinearGradient
                    colors={['rgba(0, 100, 0, 0.3)', 'rgba(0, 50, 0, 0.5)', 'rgba(0, 100, 0, 0.3)']}
                    style={StyleSheet.absoluteFill}
                />
            )}

            <View style={styles.container}>
                {renderWinDisplay()}

                {/* Buttons */}
                <View style={styles.buttonContainer}>
                    {waitingForHost ? (
                        <View style={styles.waitingContainer}>
                            <Text style={styles.waitingText}>⏳ Waiting for host...</Text>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.playAgainButton}
                            onPress={handlePlayAgain}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.buttonText}>Play Again</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={styles.quitButton}
                        onPress={handleQuit}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buttonText}>Quit</Text>
                    </TouchableOpacity>
                </View>
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
        padding: 20,
    },
    // Joker styles
    jokerContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardWrapper: {
        alignItems: 'center',
        marginHorizontal: 10,
    },
    card: {
        width: 180,
        height: 280,
    },
    nameOverlay: {
        position: 'absolute',
        bottom: 40,
        width: '100%',
        alignItems: 'center',
    },
    cardNameText: {
        fontFamily: 'Gruesome',
        fontSize: 32,
        color: '#ff69b4', // Hot pink for visibility
        textShadowColor: 'black',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
        textAlign: 'center',
    },
    winTitle: {
        fontFamily: 'Gruesome',
        fontSize: 40,
        color: 'white',
        marginTop: 20,
        textAlign: 'center',
    },
    winSubtitle: {
        fontFamily: 'Gruesome',
        fontSize: 18,
        color: '#AAAAAA',
        marginTop: 10,
    },
    // Maphia styles
    maphiaContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginTop: 20,
    },
    maphiaCardImage: {
        width: 140,
        height: 200,
    },
    maphiaCardNameText: {
        fontFamily: 'Gruesome',
        fontSize: 22,
        color: '#FF4444',
        textShadowColor: 'black',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
        textAlign: 'center',
    },
    // Civilian styles
    civilianContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    civilianWinTitle: {
        fontFamily: 'Gruesome',
        fontSize: 44,
        color: '#7BFF7B',
        textAlign: 'center',
        textShadowColor: 'rgba(0, 255, 0, 0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
        zIndex: 10,
    },
    namesScatter: {
        position: 'absolute',
        width: '100%',
        height: '100%',
    },
    scatteredName: {
        position: 'absolute',
        alignItems: 'center',
    },
    haloIcon: {
        fontSize: 24,
        marginBottom: -5,
    },
    civilianName: {
        fontFamily: 'Gruesome',
        fontSize: 22,
        color: '#7BFF7B',
        textShadowColor: 'rgba(0, 255, 0, 0.3)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    guardianName: {
        color: '#87CEEB',
        textShadowColor: 'rgba(135, 206, 235, 0.5)',
    },
    deadName: {
        opacity: 0.6,
    },
    // Position styles for scattered names
    pos0: { top: '10%', left: '20%' },
    pos1: { top: '15%', right: '15%' },
    pos2: { top: '35%', left: '10%' },
    pos3: { top: '40%', right: '25%' },
    pos4: { top: '55%', left: '30%' },
    pos5: { top: '60%', right: '10%' },
    pos6: { top: '75%', left: '15%' },
    pos7: { top: '80%', right: '20%' },
    // Buttons
    buttonContainer: {
        flexDirection: 'row',
        marginTop: 30,
        gap: 20,
    },
    playAgainButton: {
        backgroundColor: '#006100',
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 50,
        shadowColor: '#00FF00',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 10,
    },
    quitButton: {
        backgroundColor: '#610000',
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 50,
        shadowColor: '#FF0000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 10,
    },
    buttonText: {
        fontFamily: 'Gruesome',
        fontSize: 24,
        color: 'white',
    },
    waitingContainer: {
        backgroundColor: '#333',
        paddingHorizontal: 40,
        paddingVertical: 15,
        borderRadius: 50,
    },
    waitingText: {
        fontFamily: 'Gruesome',
        fontSize: 20,
        color: '#AAAAAA',
    },
});
