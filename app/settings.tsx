import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ImageBackground, Linking, Pressable, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useGame } from './context/GameContext';
import { useMusic } from './context/MusicContext';

const backgroundImage = require("../assets/images/background.png");

// Settings storage keys
const SETTINGS_KEYS = {
    playerName: 'playerName',
    musicVolume: 'musicVolume',
    sfxVolume: 'sfxVolume',
    brightness: 'brightness',
};

export default function Settings() {
    const router = useRouter();
    const { playerName, setPlayerName } = useGame();
    const { setVolume } = useMusic();

    // State for all settings
    const [inputName, setInputName] = useState(playerName || '');
    const [musicVolume, setMusicVolume] = useState(50);
    const [sfxVolume, setSfxVolume] = useState(50);
    const [brightness, setBrightness] = useState(100);
    const [hasChanges, setHasChanges] = useState(false);

    // Load saved settings on mount
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const savedName = await AsyncStorage.getItem(SETTINGS_KEYS.playerName);
                const savedMusicVol = await AsyncStorage.getItem(SETTINGS_KEYS.musicVolume);
                const savedSfxVol = await AsyncStorage.getItem(SETTINGS_KEYS.sfxVolume);
                const savedBrightness = await AsyncStorage.getItem(SETTINGS_KEYS.brightness);

                if (savedName) {
                    setInputName(savedName);
                    setPlayerName(savedName);
                }
                if (savedMusicVol) setMusicVolume(parseFloat(savedMusicVol));
                if (savedSfxVol) setSfxVolume(parseFloat(savedSfxVol));
                if (savedBrightness) setBrightness(parseFloat(savedBrightness));
            } catch (e) {
                console.error('Failed to load settings:', e);
            }
        };
        loadSettings();
    }, []);

    // Handle music volume change
    const handleMusicVolumeChange = (value: number) => {
        setMusicVolume(value);
        setVolume(value / 100); // Convert to 0-1 range
        setHasChanges(true);
    };

    // Handle SFX volume change
    const handleSfxVolumeChange = (value: number) => {
        setSfxVolume(value);
        setHasChanges(true);
        // SFX volume will be used when we add sound effects
    };

    // Handle brightness change
    const handleBrightnessChange = (value: number) => {
        setBrightness(value);
        setHasChanges(true);
        // Note: True screen brightness requires expo-brightness (system permission)
        // This is a UI overlay brightness for now
    };

    const handleSave = async () => {
        const trimmedName = inputName.trim();
        if (!trimmedName) {
            Alert.alert('Error', 'Please enter a name');
            return;
        }
        if (trimmedName.length < 2) {
            Alert.alert('Error', 'Name must be at least 2 characters');
            return;
        }
        if (trimmedName.length > 15) {
            Alert.alert('Error', 'Name must be 15 characters or less');
            return;
        }

        try {
            // Save all settings
            await AsyncStorage.setItem(SETTINGS_KEYS.playerName, trimmedName);
            await AsyncStorage.setItem(SETTINGS_KEYS.musicVolume, musicVolume.toString());
            await AsyncStorage.setItem(SETTINGS_KEYS.sfxVolume, sfxVolume.toString());
            await AsyncStorage.setItem(SETTINGS_KEYS.brightness, brightness.toString());

            setPlayerName(trimmedName);
            setHasChanges(false);

            Alert.alert('Saved!', 'Your settings have been saved', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (e) {
            console.error('Failed to save settings:', e);
            Alert.alert('Error', 'Failed to save settings');
        }
    };

    const openLink = (url: string) => {
        Linking.openURL(url).catch(err => {
            console.error('Failed to open URL:', err);
            Alert.alert('Error', 'Could not open link');
        });
    };

    return (
        <ImageBackground blurRadius={10} source={backgroundImage} style={styles.background}>
            <StatusBar hidden={true} />

            {/* Brightness overlay */}
            <View
                style={[
                    styles.brightnessOverlay,
                    { opacity: 1 - (brightness / 100) }
                ]}
                pointerEvents="none"
            />

            <Pressable onPress={() => router.back()} style={styles.backButton}>
                <MaterialIcons name="arrow-back" size={30} color="white" />
            </Pressable>

            <Text style={styles.title}>Maphia</Text>

            <View style={styles.container}>
                <View style={styles.rowContainer}>
                    {/* Profile Section */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Profile</Text>

                        <View style={styles.inputContainer}>
                            <Text style={styles.label}>Display Name</Text>
                            <TextInput
                                style={styles.input}
                                value={inputName}
                                onChangeText={(text) => {
                                    setInputName(text);
                                    setHasChanges(true);
                                }}
                                placeholder="Enter your name..."
                                placeholderTextColor="#666"
                                maxLength={15}
                                autoCapitalize="none"
                            />
                            <Text style={styles.hint}>
                                This name will be shown to other players
                            </Text>
                        </View>
                    </View>

                    {/* Audio Section */}
                    <View style={styles.card}>


                        <View style={styles.sliderContainer}>
                            <View style={styles.sliderHeader}>
                                <Text style={styles.label}>Music Volume</Text>
                                <Text style={styles.sliderValue}>{Math.round(musicVolume)}%</Text>
                            </View>
                            <Slider
                                style={styles.slider}
                                minimumValue={0}
                                maximumValue={100}
                                value={musicVolume}
                                onValueChange={handleMusicVolumeChange}
                                minimumTrackTintColor="#FF4444"
                                maximumTrackTintColor="#444"
                                thumbTintColor="#FF4444"
                            />
                        </View>

                        <View style={styles.sliderContainer}>
                            <View style={styles.sliderHeader}>
                                <Text style={styles.label}>Brightness</Text>
                                <Text style={styles.sliderValue}>{Math.round(brightness)}%</Text>
                            </View>
                            <Slider
                                style={styles.slider}
                                minimumValue={20}
                                maximumValue={100}
                                value={brightness}
                                onValueChange={handleBrightnessChange}
                                minimumTrackTintColor="#FF4444"
                                maximumTrackTintColor="#444"
                                thumbTintColor="#FF4444"
                            />
                        </View>
                    </View>

                </View>

                {/* Save Button */}
                <TouchableOpacity
                    style={[styles.saveButton, !hasChanges && styles.saveButtonDisabled]}
                    onPress={handleSave}
                    activeOpacity={0.8}
                    disabled={!hasChanges}
                >
                    <Text style={styles.saveButtonText}>
                        {hasChanges ? 'Save Changes' : 'No Changes'}
                    </Text>
                </TouchableOpacity>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        resizeMode: "cover",
    },
    brightnessOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'black',
        zIndex: 100,
    },
    container: {
        flex: 1,
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    rowContainer: {
        flex: 1,
        flexDirection: 'row',
        gap: 15,
        alignItems: 'center', // Center vertically
        justifyContent: 'space-between',
    },
    title: {
        fontFamily: 'Gruesome',
        fontSize: 40,
        color: 'white',
        marginBottom: 10,
        marginTop: 30,
        alignSelf: 'flex-end',
        textAlign: 'right',
        marginRight: 30,
    },
    card: {
        flex: 1,
        backgroundColor: '#22010180',
        borderRadius: 15,
        padding: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 0, 0, 0.3)',
        maxHeight: '80%', // Limit height to ensure it fits
        justifyContent: 'center',
    },
    cardTitle: {
        fontFamily: 'Gruesome',
        fontSize: 20, // Slightly smaller
        color: '#cabdb7',
        marginBottom: 10,
        textAlign: 'flex-start',
    },
    inputContainer: {
        marginBottom: 10,
    },
    label: {
        fontFamily: 'Gruesome',
        fontSize: 14, // Slightly smaller
        color: '#cabdb7',
        marginBottom: 5,
    },
    input: {
        backgroundColor: 'rgba(30, 0, 0, 0.8)',
        borderWidth: 2,
        borderColor: '#FF4444',
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
        fontFamily: 'Gruesome',
        fontSize: 16,
        color: 'white',
    },
    hint: {
        fontFamily: 'Gruesome',
        fontSize: 10, // Slightly smaller
        color: '#666',
        marginTop: 4,
    },
    sliderContainer: {
        marginBottom: 15,
    },
    sliderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    slider: {
        width: '100%',
        height: 30, // Compress height
    },
    sliderValue: {
        fontFamily: 'Gruesome',
        fontSize: 14,
        color: '#cabdb7',
    },
    saveButton: {
        backgroundColor: '#610000',
        borderRadius: 50,
        paddingVertical: 12, // reduce padding
        paddingHorizontal: 30,
        alignItems: 'center',
        shadowColor: '#FF0000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 10,
        marginTop: 10,
        alignSelf: 'center', // Center button
        width: '30%', // Controlled width
    },
    saveButtonDisabled: {
        backgroundColor: '#333',
        shadowOpacity: 0,
    },
    saveButtonText: {
        fontFamily: 'Gruesome',
        fontSize: 20,
        color: '#cabdb7',
    },
    backButton: {
        position: 'absolute',
        top: 20,
        left: 15,
        padding: 6,
        zIndex: 20,
    },
});
