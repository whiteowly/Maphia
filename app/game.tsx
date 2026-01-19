import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ImageBackground, Pressable, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useGame } from './context/GameContext';
import socketService, { Player } from './services/socketService';
import { formatCountdown } from './types/game';

const backgroundImage = require("../assets/images/lobby.png");

export default function Game() {
    const router = useRouter();
    const { settings, myRole, myPlayerId, setPhase } = useGame();

    // State from socket
    const [timeRemaining, setTimeRemaining] = useState(settings.discussionTimeSeconds || 60);
    const [players, setPlayers] = useState<Player[]>([]);
    const [isMuted, setIsMuted] = useState(false);

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

    const handleMute = () => {
        const newMuted = !isMuted;
        setIsMuted(newMuted);
        socketService.toggleMute(newMuted);
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

    // Split players into columns
    const leftPlayers = players.slice(0, Math.ceil(players.length / 2));
    const rightPlayers = players.slice(Math.ceil(players.length / 2));

    // Get role display color
    const roleColor = myRole === 'maphia' ? '#FF4444' : '#7BFF7B';
    const roleText = myRole === 'maphia' ? 'Maphia' : 'Civilian';

    // Timer warning color (red when < 15 seconds)
    const timerColor = timeRemaining < 15 ? '#FF4444' : 'white';

    // Get player icon based on status
    const getPlayerIcon = (player: Player) => {
        if (player.isDead) return null;
        if (player.isMuted) return { type: 'ion', name: 'volume-mute' };
        return { type: 'ion', name: 'volume-high' };
    };

    return (
        <ImageBackground source={backgroundImage} style={styles.background}>
            <StatusBar hidden={true} />

            <Pressable onPress={handleLeave} style={styles.backButton} accessibilityLabel="Leave game">
                <MaterialIcons name="arrow-back" size={30} color="white" />
                <Text style={{ fontFamily: 'Gruesome', fontSize: 20, color: 'white', marginLeft: 10 }}>Leave game</Text>
            </Pressable>

            <View>
                {/* Timer */}
                <Text style={[styles.topCenterText, { fontSize: 26, color: timerColor }]}>
                    Discussion - {formatCountdown(timeRemaining)}
                </Text>

                {/* Role Display */}
                <Text style={[styles.Text, { marginBottom: 0, fontSize: 26, marginLeft: 30, marginTop: 30, alignSelf: 'flex-end', textAlign: 'right', marginRight: 30 }]}>
                    Role - <Text style={{ color: roleColor }}>{roleText}</Text>
                </Text>

                {/* Players Grid */}
                <View style={styles.cardContainer}>
                    <View style={styles.playersColumnsRow}>
                        <View style={styles.playerColumn}>
                            {leftPlayers.map((p) => {
                                const icon = getPlayerIcon(p);
                                const isMe = p.id === myPlayerId;
                                return (
                                    <View key={p.id} style={[styles.playerRow, p.isDead && styles.deadPlayer]}>
                                        {isMe && <Text style={styles.meIndicator}>→</Text>}
                                        <Text style={[
                                            styles.playerText,
                                            p.isDead && styles.deadText,
                                            isMe && styles.meText,
                                        ]}>
                                            {p.name}
                                            {p.isDead && ' ☠️'}
                                        </Text>
                                        {icon?.type === 'ion' && !p.isDead && (
                                            <Ionicons name={icon.name as any} size={18} color={p.isMuted ? 'gray' : 'white'} style={styles.iconAfter} />
                                        )}
                                    </View>
                                );
                            })}
                        </View>

                        <View style={styles.playerColumn}>
                            {rightPlayers.map((p) => {
                                const icon = getPlayerIcon(p);
                                const isMe = p.id === myPlayerId;
                                return (
                                    <View key={p.id} style={[styles.playerRow, p.isDead && styles.deadPlayer]}>
                                        {isMe && <Text style={styles.meIndicator}>→</Text>}
                                        <Text style={[
                                            styles.playerText,
                                            p.isDead && styles.deadText,
                                            isMe && styles.meText,
                                        ]}>
                                            {p.name}
                                            {p.isDead && ' ☠️'}
                                        </Text>
                                        {icon?.type === 'ion' && !p.isDead && (
                                            <Ionicons name={icon.name as any} size={18} color={p.isMuted ? 'gray' : 'white'} style={styles.iconAfter} />
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                </View>
            </View>

            {/* Bottom Controls */}
            <View style={styles.bottomRightContainer}>
                <Text style={[styles.Text, { fontSize: 17, marginRight: 10 }]}>
                    {alivePlayers.length} alive • {deadPlayers.length} dead
                </Text>

                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={[styles.muteButton, isMuted && styles.mutedButton]}
                        onPress={handleMute}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.Text, { fontSize: 20 }]}>
                            {isMuted ? '🔇 Muted' : '🔊 Mute'}
                        </Text>
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
    Text: {
        color: "white",
        fontFamily: 'Gruesome',
    },
    cardContainer: {
        flexDirection: 'column',
        alignItems: 'center',
        padding: 15,
        borderRadius: 3,
        margin: 10,
        marginLeft: 150,
        marginRight: 150,
        backgroundColor: 'transparent',
        shadowColor: '#250101ff',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    muteButton: {
        width: 120,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#610000ff',
        borderRadius: 100,
        marginTop: 10,
        marginRight: 10,
        shadowColor: '#640303ff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 10,
        elevation: 10,
    },
    mutedButton: {
        backgroundColor: '#444444',
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
        color: 'white',
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
        color: 'white',
        fontFamily: 'Gruesome',
        zIndex: 20,
    },
});
