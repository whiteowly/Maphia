import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ImageBackground, Pressable, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ChatPanel from './components/ChatPanel';
import { useAlert } from './context/AlertContext';
import { useGame } from './context/GameContext';
import socketService, { Player } from './services/socketService';
import { formatCountdown } from './types/game';

const backgroundImage = require("../assets/images/day_background.png");

export default function Game() {
    const router = useRouter();
    const { settings, myRole, myPlayerId, setPhase, players, setPlayers } = useGame();
    const { showAlert } = useAlert();

    // State from socket
    const [timeRemaining, setTimeRemaining] = useState(settings.discussionTimeSeconds || 60);

    const [isChatOpen, setIsChatOpen] = useState(false);

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

        // Listen for phase changes
        const unsubPhase = socketService.on('phase_changed', (data: { phase: string; timeRemaining: number }) => {
            if (data.phase === 'voting') {
                setPhase('voting');
                router.replace('/voting');
            } else if (data.phase === 'night') {
                setPhase('night');
                router.replace('/night');
            }
            setTimeRemaining(data.timeRemaining);
        });

        // Cleanup
        return () => {
            unsubRoomUpdate();
            unsubTimer();
            unsubPhase();
        };
    }, []);

    // Count alive and dead players
    const alivePlayers = players.filter(p => !p.isDead);
    const deadPlayers = players.filter(p => p.isDead);
    const amIDead = players.find(p => p.id === myPlayerId)?.isDead ?? false;

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

    // Split players into columns
    const leftPlayers = players.slice(0, Math.ceil(players.length / 2));
    const rightPlayers = players.slice(Math.ceil(players.length / 2));

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

    // Timer warning color (red when < 15 seconds)
    const timerColor = timeRemaining < 15 ? '#FF4444' : '#cabdb7';

    // Get player icon based on status
    const getPlayerIcon = (player: Player) => {
        if (player.isDead) return null;
        return { type: 'ion', name: 'volume-high' };
    };

    return (
        <ImageBackground source={backgroundImage} style={styles.background} imageStyle={styles.backgroundImage}>
            <StatusBar hidden={true} />

            <Pressable onPress={handleLeave} style={styles.backButton} accessibilityLabel="Leave game">
                <MaterialIcons name="arrow-back" size={30} color="#cabdb7" />
                <Text style={{ fontFamily: 'Gruesome', fontSize: 20, color: '#cabdb7', marginLeft: 10 }}>Leave game</Text>
            </Pressable>

            <View>
                {/* Timer */}
                <Text style={[styles.topCenterText, { fontSize: 26, color: timerColor }]}>
                    Discussion - {formatCountdown(timeRemaining)}
                </Text>

                {/* Role Display */}
                <Text style={[styles.Text, { marginBottom: 0, fontSize: 26, marginLeft: 30, marginTop: 30, alignSelf: 'flex-end', textAlign: 'right', marginRight: 30 }]}>
                    Role - <Text style={{ color: roleDisplay.color }}>{roleDisplay.text}</Text>
                </Text>

                {/* Players Grid */}
                <View style={styles.cardContainer}>
                    <View style={styles.playersColumnsRow}>
                        <View style={styles.playerColumn}>
                            {leftPlayers.map((p) => {
                                const isMe = p.id === myPlayerId;
                                return (
                                    <View key={p.id} style={[styles.playerRow, p.isDead && styles.deadPlayer]}>
                                        {isMe && <Text style={styles.meIndicator}></Text>}
                                        <Text style={[
                                            styles.playerText,
                                            p.isDead && styles.deadText,
                                            isMe && styles.meText,
                                        ]}>
                                            {p.name}
                                            {p.isDead && ' ☠️'}
                                        </Text>
                                    </View>
                                );
                            })}
                        </View>

                        <View style={styles.playerColumn}>
                            {rightPlayers.map((p) => {
                                const isMe = p.id === myPlayerId;
                                return (
                                    <View key={p.id} style={[styles.playerRow, p.isDead && styles.deadPlayer]}>
                                        {isMe && <Text style={styles.meIndicator}></Text>}
                                        <Text style={[
                                            styles.playerText,
                                            p.isDead && styles.deadText,
                                            isMe && styles.meText,
                                        ]}>
                                            {p.name}
                                            {p.isDead && ' ☠️'}
                                        </Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                </View>
            </View>

            {/* Chat Toggle Button */}
            <TouchableOpacity
                style={styles.chatToggleButton}
                onPress={() => setIsChatOpen(prev => !prev)}
                activeOpacity={0.7}
            >
                <MaterialIcons name={isChatOpen ? "close" : "chat"} size={24} color="#cabdb7" />
                <Text style={styles.chatToggleText}>{isChatOpen ? 'Close Chat' : 'Open Chat'}</Text>
            </TouchableOpacity>

            {/* Chat Overlay */}
            {isChatOpen && (
                <View style={styles.chatOverlay}>
                    <ChatPanel myPlayerId={myPlayerId} isDead={amIDead} />
                </View>
            )}

            {/* Bottom Controls */}
            <View style={styles.bottomRightContainer}>
                <Text style={[styles.Text, { fontSize: 17, marginRight: 10 }]}>
                    {alivePlayers.length} alive • {deadPlayers.length} dead
                </Text>
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
    cardContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        padding: 15,
        borderRadius: 3,
        margin: 10,
        width: '90%',
        maxWidth: 1000,
        alignSelf: 'center',
        backgroundColor: 'transparent',
        shadowColor: '#250101ff',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
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
    chatToggleButton: {
        position: 'absolute',
        bottom: 20,
        left: 16,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        zIndex: 50,
    },
    chatToggleText: {
        fontFamily: 'Gruesome',
        color: '#cabdb7',
        fontSize: 16,
        marginLeft: 8,
    },
    chatOverlay: {
        position: 'absolute',
        bottom: 80, // Above the toggle button
        left: 16,
        width: 380,
        maxWidth: '90%',
        height: 400,
        maxHeight: '60%',
        zIndex: 40,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 10,
    },
    playersColumnsRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 8,
        marginTop: 6,
    },
    playerColumn: {
        flex: 0.5,
        paddingHorizontal: 8,
        alignItems: 'center',
        marginHorizontal: 12,
    },
    playerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    deadPlayer: {
        opacity: 0.5,
    },
    iconAfter: {
        marginLeft: 8,
    },
    playerText: {
        color: '#cabdb7',
        fontFamily: 'Gruesome',
        fontSize: 20,
        marginTop: 0,
        marginBottom: 4,
        textAlign: 'center',
    },
    meText: {
        color: '#FFD700',
    },
    meIndicator: {
        color: '#FFD700',
        fontFamily: 'Gruesome',
        fontSize: 16,
        marginRight: 5,
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
});
