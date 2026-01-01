import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ImageBackground, Pressable, ScrollView, StatusBar, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { useSettings } from '../context/SettingsContext';

const backgroundImage = require("../assets/images/background.jpeg");

export default function Settings() {
    const router = useRouter();
    const { musicEnabled, setMusicEnabled, soundEnabled, setSoundEnabled } = useSettings();

    // State for settings
    const [vsync, setVsync] = useState(false); // Default off
    const [screenShake, setScreenShake] = useState(false); // Default off
    const [language, setLanguage] = useState('English');

    const handleTerms = () => {
        Alert.alert("Terms of Use", "This is a placeholder for Terms of Use.");
    };

    const handlePrivacy = () => {
        Alert.alert("Privacy Policy", "This is a placeholder for Privacy Policy.");
    };

    const handleControls = () => {
        Alert.alert("Controls", "Control mapping settings would go here.");
    };

    return (
        <ImageBackground blurRadius={10} source={backgroundImage} style={styles.background}>
            <StatusBar hidden={true} />
            <Pressable onPress={() => router.back()} style={styles.backButton}>
                <MaterialIcons name="arrow-back" size={30} color="white" />
            </Pressable>

            <View style={styles.container}>
                <Text style={styles.title}>Settings</Text>

                <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
                    
                    {/* Graphics Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Graphics</Text>
                        
                        <View style={styles.row}>
                            <Text style={styles.label}>V-Sync</Text>
                            <Switch 
                                value={vsync} 
                                onValueChange={setVsync}
                                trackColor={{ false: "#767577", true: "#610000" }}
                                thumbColor={vsync ? "#ff9999" : "#f4f3f4"}
                            />
                        </View>

                        <View style={styles.row}>
                            <Text style={styles.label}>Screen Shake</Text>
                            <Switch 
                                value={screenShake} 
                                onValueChange={setScreenShake}
                                trackColor={{ false: "#767577", true: "#610000" }}
                                thumbColor={screenShake ? "#ff9999" : "#f4f3f4"}
                            />
                        </View>
                    </View>

                    {/* Sound Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Sound</Text>
                        <View style={styles.row}>
                            <Text style={styles.label}>Music</Text>
                            <Switch 
                                value={musicEnabled} 
                                onValueChange={setMusicEnabled}
                                trackColor={{ false: "#767577", true: "#610000" }}
                                thumbColor={musicEnabled ? "#ff9999" : "#f4f3f4"}
                            />
                        </View>
                        <View style={styles.row}>
                            <Text style={styles.label}>Sound Effects</Text>
                            <Switch 
                                value={soundEnabled} 
                                onValueChange={setSoundEnabled}
                                trackColor={{ false: "#767577", true: "#610000" }}
                                thumbColor={soundEnabled ? "#ff9999" : "#f4f3f4"}
                            />
                        </View>
                    </View>

                    {/* Controls Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Controls</Text>
                        <TouchableOpacity style={styles.button} onPress={handleControls}>
                            <Text style={styles.buttonText}>Configure Controls</Text>
                        </TouchableOpacity>
                    </View>

                    {/* General Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>General</Text>
                        <View style={styles.row}>
                            <Text style={styles.label}>Language</Text>
                            <Text style={styles.valueText}>{language}</Text>
                        </View>
                    </View>

                    {/* Legal Section */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Legal</Text>
                        <TouchableOpacity style={styles.linkButton} onPress={handleTerms}>
                            <Text style={styles.linkText}>Terms of Use</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.linkButton} onPress={handlePrivacy}>
                            <Text style={styles.linkText}>Privacy Policy</Text>
                        </TouchableOpacity>
                    </View>

                </ScrollView>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: { flex: 1, resizeMode: "cover" },
    backButton: { position: 'absolute', top: 20, left: 15, padding: 6, zIndex: 20 },
    container: { flex: 1, alignItems: 'center', paddingTop: 60 },
    title: { fontFamily: 'Gruesome', fontSize: 50, color: 'white', marginBottom: 20 },
    scrollContainer: { width: '90%' },
    scrollContent: { paddingBottom: 50 },
    section: { backgroundColor: '#22010180', borderRadius: 10, padding: 20, marginBottom: 20 },
    sectionTitle: { fontFamily: 'Gruesome', fontSize: 30, color: '#ff9999', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#610000' },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
    label: { fontFamily: 'Gruesome', fontSize: 24, color: 'white' },
    valueText: { fontFamily: 'Gruesome', fontSize: 24, color: '#ccc' },
    button: { backgroundColor: '#610000', padding: 10, borderRadius: 5, alignItems: 'center' },
    buttonText: { fontFamily: 'Gruesome', fontSize: 20, color: 'white' },
    linkButton: { paddingVertical: 10 },
    linkText: { fontFamily: 'Gruesome', fontSize: 20, color: 'white', textDecorationLine: 'underline' },
});
