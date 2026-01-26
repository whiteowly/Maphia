import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, Image, ImageBackground, Pressable, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useGame } from './context/GameContext';
import socketService, { RoleAssignment } from './services/socketService';

const backgroundImage = require("../assets/images/lobby.png");

const RoleRevealMaphia = () => {
    const router = useRouter();
    const { settings, setPhase } = useGame();

    // Animation for dramatic reveal
    const [fadeAnim] = useState(new Animated.Value(0));
    const [scaleAnim] = useState(new Animated.Value(0.5));
    const [canContinue, setCanContinue] = useState(false);
    const [teammates, setTeammates] = useState<{ id: string; name: string }[]>([]);

    useEffect(() => {
        // Animate the reveal
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 4,
                useNativeDriver: true,
            }),
        ]).start();

        // Enable continue button after animation
        const timer = setTimeout(() => setCanContinue(true), 2000);

        // Listen for role assignment to get teammates
        const unsubRole = socketService.on('role_assigned', (data: RoleAssignment) => {
            if (data.teammates) {
                setTeammates(data.teammates);
            }
        });

        // Listen for phase change (game start)
        const unsubPhase = socketService.on('phase_changed', (data: { phase: string; timeRemaining: number }) => {
            if (data.phase === 'night') {
                setPhase('night');
                router.replace('/night');
            }
        });

        return () => {
            clearTimeout(timer);
            unsubRole();
            unsubPhase();
        };
    }, []);

    const handleContinue = () => {
        socketService.continueFromReveal();
        // The phase_changed event will navigate us
    };

    const handleQuit = () => {
        socketService.disconnect();
        router.replace('/');
    };

    // Show other maphias
    const otherMaphias = teammates.length;

    return (
        <ImageBackground source={backgroundImage} style={styles.background}>
            <StatusBar hidden={true} />

            <Pressable onPress={handleQuit} style={styles.backButton} accessibilityLabel="Quit game">
                <MaterialIcons name="arrow-back" size={30} color="white" />
                <Text style={{ fontFamily: 'Gruesome', fontSize: 20, color: 'white', marginLeft: 10 }}>Quit</Text>
            </Pressable>

            <Text style={[styles.Text, { marginBottom: 0, fontSize: 40, marginLeft: 30, marginTop: 30, alignSelf: 'flex-end', textAlign: 'right', marginRight: 30 }]}>Maphia</Text>

            <View style={styles.centerContainer}>
                <Animated.View style={[styles.cardReveal, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                    <Image
                        style={styles.roleImage}
                        source={require('../assets/images/roles/maphia.png')}
                    />
                </Animated.View>

                <Animated.Text style={[styles.roleText, { opacity: fadeAnim, color: '#FF4444' }]}>
                    You are a Maphia!
                </Animated.Text>

                {otherMaphias > 0 && (
                    <View style={styles.teammatesContainer}>
                        <Text style={styles.teamInfo}>
                            Your teammate{otherMaphias > 1 ? 's' : ''}:
                        </Text>
                        {teammates.map((t) => (
                            <Text key={t.id} style={styles.teammateName}>
                                🔪 {t.name}
                            </Text>
                        ))}
                    </View>
                )}



                <TouchableOpacity
                    style={[styles.continueButton, !canContinue && styles.disabledButton]}
                    onPress={handleContinue}
                    activeOpacity={0.8}
                    disabled={!canContinue}
                >
                    <Text style={styles.continueText}>
                        {canContinue ? 'Continue' : 'Please wait...'}
                    </Text>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
};

export default RoleRevealMaphia;

const styles = StyleSheet.create({
    background: {
        flex: 1,
        resizeMode: "cover",
    },
    Text: {
        color: "white",
        fontFamily: 'Gruesome',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    cardReveal: {
        width: 200,
        height: 280,
        marginBottom: 20,
    },
    roleImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
    },
    roleText: {
        fontFamily: 'Gruesome',
        fontSize: 36,
        marginTop: 20,
        textShadowColor: 'rgba(255, 0, 0, 0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 15,
    },
    teammatesContainer: {
        marginTop: 15,
        alignItems: 'center',
    },
    teamInfo: {
        fontFamily: 'Gruesome',
        fontSize: 16,
        color: '#FF6B6B',
        textAlign: 'center',
    },
    teammateName: {
        fontFamily: 'Gruesome',
        fontSize: 18,
        color: '#FF4444',
        marginTop: 5,
    },
    roleDescription: {
        fontFamily: 'Gruesome',
        fontSize: 18,
        color: '#CCCCCC',
        textAlign: 'center',
        marginTop: 15,
    },
    roleHint: {
        fontFamily: 'Gruesome',
        fontSize: 14,
        color: '#888888',
        textAlign: 'left',
        marginTop: 20,
        lineHeight: 22,
    },
    continueButton: {
        backgroundColor: '#610000',
        paddingHorizontal: 50,
        paddingVertical: 15,
        borderRadius: 50,
        marginTop: 30,
        shadowColor: '#FF0000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 10,
    },
    disabledButton: {
        backgroundColor: '#444444',
        shadowOpacity: 0,
    },
    continueText: {
        fontFamily: 'Gruesome',
        fontSize: 24,
        color: 'white',
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
