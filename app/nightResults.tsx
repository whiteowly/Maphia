import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ImageBackground, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useGame } from './context/GameContext';
import socketService, { NightResults } from './services/socketService';

const backgroundImage = require("../assets/images/lobby.png");

const NightResultsScreen = () => {
    const router = useRouter();
    const { setPhase } = useGame();
    const [results, setResults] = useState<NightResults | null>(null);

    useEffect(() => {
        // First, try to get results from sessionStorage (set by guardian.tsx before navigating)
        if (typeof window !== 'undefined') {
            const storedResults = sessionStorage.getItem('nightResults');
            if (storedResults) {
                try {
                    setResults(JSON.parse(storedResults));
                    sessionStorage.removeItem('nightResults'); // Clean up
                } catch (e) {
                    console.error('Failed to parse night results:', e);
                }
            }
        }

        // Also listen for the event directly (in case we're already on this screen)
        const unsubResults = socketService.on('night_results', (data: NightResults) => {
            setResults(data);
        });

        // Also listen for phase changes to navigate to discussion
        const unsubPhase = socketService.on('phase_changed', (data: { phase: string }) => {
            if (data.phase === 'discussion') {
                setPhase('discussion');
                router.replace('/game');
            }
        });

        return () => {
            unsubResults();
            unsubPhase();
        };
    }, []);

    const handleQuit = () => {
        socketService.disconnect();
        router.replace('/');
    };

    const getMessage = () => {
        if (!results) return { icon: '🌙', title: 'Night is ending...', subtitle: '' };

        if (results.guardianMistake) {
            return {
                icon: '💔',
                title: 'The Guardian Angel made a mistake!',
                subtitle: 'They tried to protect the wrong person and died.',
                color: '#EF4444'
            };
        }

        if (results.saved) {
            return {
                icon: '✨',
                title: `${results.targetedName} was saved!`,
                subtitle: 'The Maphia targeted them, but they survived!',
                color: '#3B82F6'
            };
        }

        if (results.killed) {
            return {
                icon: '☠️',
                title: `${results.killedName} was killed!`,
                subtitle: 'The Maphia struck...',
                color: '#EF4444'
            };
        }

        return {
            icon: '😮',
            title: 'No one died tonight',
            subtitle: 'Everyone is safe... for now.',
            color: '#9CA3AF'
        };
    };

    const message = getMessage();

    return (
        <ImageBackground source={backgroundImage} style={styles.background}>
            <StatusBar hidden={true} />

            <Pressable onPress={handleQuit} style={styles.backButton}>
                <MaterialIcons name="arrow-back" size={30} color="white" />
                <Text style={styles.backText}>Quit</Text>
            </Pressable>

            <View style={styles.container}>
                <Text style={styles.phase}>Night Results</Text>

                <View style={styles.resultsCard}>
                    <Text style={styles.icon}>{message.icon}</Text>
                    <Text style={[styles.title, { color: message.color || '#D1D5DB' }]}>
                        {message.title}
                    </Text>
                    {message.subtitle && (
                        <Text style={styles.subtitle}>{message.subtitle}</Text>
                    )}

                    {/* Bug 3: Show who the mafia targeted */}
                    {results?.targetedName && !results?.guardianMistake && (
                        <Text style={styles.targetInfo}>
                            🎯 Maphia targeted: {results.targetedName}
                        </Text>
                    )}

                    {/* Bug 3: Show who the guardian tried to save */}
                    {results?.guardianSavedName && (
                        <Text style={styles.guardianInfo}>
                            👼 Guardian tried to save: {results.guardianSavedName}
                        </Text>
                    )}
                </View>

                <Text style={styles.countdown}>Starting discussion phase...</Text>
            </View>
        </ImageBackground>
    );
};

export default NightResultsScreen;

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
    phase: {
        fontFamily: 'Gruesome',
        fontSize: 28,
        color: '#9CA3AF',
        marginBottom: 40,
    },
    resultsCard: {
        backgroundColor: 'rgba(31, 41, 55, 0.9)',
        padding: 40,
        borderRadius: 20,
        alignItems: 'center',
        minWidth: 300,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    icon: {
        fontSize: 80,
        marginBottom: 20,
    },
    title: {
        fontFamily: 'Gruesome',
        fontSize: 26,
        textAlign: 'center',
        marginBottom: 15,
    },
    subtitle: {
        fontFamily: 'Gruesome',
        fontSize: 18,
        color: '#9CA3AF',
        textAlign: 'center',
        marginTop: 10,
    },
    countdown: {
        fontFamily: 'Gruesome',
        fontSize: 16,
        color: '#6B7280',
        marginTop: 40,
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
    targetInfo: {
        fontFamily: 'Gruesome',
        fontSize: 16,
        color: '#F87171',
        marginTop: 15,
        textAlign: 'center',
    },
    guardianInfo: {
        fontFamily: 'Gruesome',
        fontSize: 16,
        color: '#60A5FA',
        marginTop: 8,
        textAlign: 'center',
    },
});
