import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, Image, ImageBackground, Pressable, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useGame } from './context/GameContext';
import socketService from './services/socketService';

const backgroundImage = require("../assets/images/lobby.png");

const RoleRevealGuardian = () => {
    const router = useRouter();
    const { setPhase } = useGame();

    const [fadeAnim] = useState(new Animated.Value(0));
    const [scaleAnim] = useState(new Animated.Value(0.5));
    const [canContinue, setCanContinue] = useState(false);

    useEffect(() => {
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

        const timer = setTimeout(() => setCanContinue(true), 2000);

        const unsubPhase = socketService.on('phase_changed', (data: { phase: string }) => {
            if (data.phase === 'night') {
                setPhase('night');
                router.replace('/night');
            }
        });

        return () => {
            clearTimeout(timer);
            unsubPhase();
        };
    }, []);

    const handleContinue = () => {
        socketService.continueFromReveal();
    };

    const handleQuit = () => {
        socketService.disconnect();
        router.replace('/');
    };

    return (
        <ImageBackground source={backgroundImage} style={styles.background}>
            <StatusBar hidden={true} />

            <Pressable onPress={handleQuit} style={styles.backButton}>
                <MaterialIcons name="arrow-back" size={30} color="#cabdb7" />
                <Text style={{ fontFamily: 'Gruesome', fontSize: 20, color: '#cabdb7', marginLeft: 10 }}>Quit</Text>
            </Pressable>

            <Text style={[styles.Text, { marginBottom: 0, fontSize: 40, marginLeft: 30, marginTop: 30, alignSelf: 'flex-end', textAlign: 'right', marginRight: 30 }]}>Maphia</Text>

            <View style={styles.centerContainer}>
                <Animated.View style={[styles.cardReveal, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
                    <Image
                        style={styles.roleImage}
                        source={require('../assets/images/roles/guardian.jpg')}
                    />
                </Animated.View>

                <Animated.Text style={[styles.roleText, { opacity: fadeAnim, color: '#3B82F6' }]}>
                    You are the Guardian Angel!
                </Animated.Text>



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

export default RoleRevealGuardian;

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
        fontSize: 32,
        marginTop: 0,
        textShadowColor: 'rgba(59, 130, 246, 0.5)',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 15,
        textAlign: 'center',
    },
    roleDescription: {
        fontFamily: 'Gruesome',
        fontSize: 16,
        color: '#CCCCCC',
        textAlign: 'center',
        marginTop: 15,
        paddingHorizontal: 20,
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
        backgroundColor: '#1E40AF',
        paddingHorizontal: 50,
        paddingVertical: 15,
        borderRadius: 50,
        marginTop: 30,
        shadowColor: '#3B82F6',
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
        color: '#cabdb7',
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
