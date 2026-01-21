import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

interface MusicContextType {
    isPlaying: boolean;
    volume: number;
    startMusic: () => Promise<void>;
    stopMusic: () => Promise<void>;
    pauseMusic: () => Promise<void>;
    resumeMusic: () => Promise<void>;
    setVolume: (volume: number) => Promise<void>;
}

const MusicContext = createContext<MusicContextType | null>(null);

export const useMusic = () => {
    const context = useContext(MusicContext);
    if (!context) {
        throw new Error('useMusic must be used within a MusicProvider');
    }
    return context;
};

interface MusicProviderProps {
    children: React.ReactNode;
}

export const MusicProvider: React.FC<MusicProviderProps> = ({ children }) => {
    const soundRef = useRef<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [volume, setVolumeState] = useState(0.5);

    // Load the audio file on mount
    useEffect(() => {
        const loadSound = async () => {
            try {
                // Configure audio mode
                await Audio.setAudioModeAsync({
                    playsInSilentModeIOS: true,
                    staysActiveInBackground: false,
                    shouldDuckAndroid: true,
                });

                // Load saved volume
                const savedVolume = await AsyncStorage.getItem('musicVolume');
                const initialVolume = savedVolume ? parseFloat(savedVolume) / 100 : 0.5;
                setVolumeState(initialVolume);

                const { sound } = await Audio.Sound.createAsync(
                    require('../../assets/audio/maphia theme.mp3'),
                    {
                        isLooping: true,
                        volume: initialVolume,
                    }
                );
                soundRef.current = sound;
                setIsLoaded(true);
                console.log('[Music] Sound loaded');
            } catch (error) {
                console.error('[Music] Failed to load sound:', error);
            }
        };

        loadSound();

        // Cleanup on unmount
        return () => {
            if (soundRef.current) {
                soundRef.current.unloadAsync();
            }
        };
    }, []);

    const startMusic = async () => {
        if (soundRef.current && isLoaded) {
            try {
                await soundRef.current.setPositionAsync(0);
                await soundRef.current.playAsync();
                setIsPlaying(true);
                console.log('[Music] Started playing');
            } catch (error) {
                console.error('[Music] Failed to start:', error);
                throw error; // Re-throw so UI can handle it
            }
        }
    };

    const stopMusic = async () => {
        if (soundRef.current) {
            try {
                await soundRef.current.stopAsync();
                await soundRef.current.setPositionAsync(0);
                setIsPlaying(false);
                console.log('[Music] Stopped');
            } catch (error) {
                console.error('[Music] Failed to stop:', error);
            }
        }
    };

    const pauseMusic = async () => {
        if (soundRef.current && isPlaying) {
            try {
                await soundRef.current.pauseAsync();
                setIsPlaying(false);
                console.log('[Music] Paused');
            } catch (error) {
                console.error('[Music] Failed to pause:', error);
            }
        }
    };

    const resumeMusic = async () => {
        if (soundRef.current && !isPlaying) {
            try {
                await soundRef.current.playAsync();
                setIsPlaying(true);
                console.log('[Music] Resumed');
            } catch (error) {
                console.error('[Music] Failed to resume:', error);
            }
        }
    };

    const setVolume = async (newVolume: number) => {
        setVolumeState(newVolume);
        if (soundRef.current) {
            try {
                await soundRef.current.setVolumeAsync(newVolume);
                console.log('[Music] Volume set to:', newVolume);
            } catch (error) {
                console.error('[Music] Failed to set volume:', error);
            }
        }
    };

    return (
        <MusicContext.Provider value={{ isPlaying, volume, startMusic, stopMusic, pauseMusic, resumeMusic, setVolume }}>
            {children}
        </MusicContext.Provider>
    );
};
