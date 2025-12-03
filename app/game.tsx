import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ImageBackground, Pressable, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
const backgroundImage = require("../assets/images/lobby.png");

export default function Join() {
    const router = useRouter();
    const handleShare = () => {
        router.push('/lobby');
    };

    const players = [
        { name: 'Jer (host)', icon: { type: 'ion', name: 'volume-high' }, dead: false },
        { name: 'Jeri (You)', icon: { type: 'mc', name: 'hat-fedora' }, dead: false },
        { name: 'Jerbear', icon: { type: 'ion', name: 'volume-high' }, dead: false },
        { name: 'Jerry', icon: undefined, dead: true },
        { name: 'Jerusalem', icon: { type: 'ion', name: 'volume-high' }, dead: false },
        { name: 'Eyerus', icon: { type: 'mc', name: 'hat-fedora' }, dead: false },
        { name: 'Eyerusalem', icon: { type: 'ion', name: 'volume-high' }, dead: false },
        { name: 'Eyu', icon: { type: 'mc', name: 'hat-fedora' }, dead: false },
        { name: 'Jerbear2', icon: undefined, dead: true },
        { name: 'J', icon: { type: 'ion', name: 'volume-high' }, dead: false },
        { name: 'imoutofnames', icon: undefined, dead: true },
        { name: 'welp', icon: undefined, dead: false },
    ];

    const leftPlayers = players.slice(0, 6);
    const rightPlayers = players.slice(6, 12);

    return (
        <ImageBackground source={backgroundImage} style={styles.background}>
            <StatusBar hidden={true} />

            <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityLabel="Go back">
                <MaterialIcons name="arrow-back" size={30} color="white" />
                <Text style={{ fontFamily: 'Gruesome', fontSize: 20, color: 'white', marginLeft: 10 }}>Leave game</Text>
            </Pressable>

            <View>
                <Text style={[styles.topCenterText, { fontSize: 26 }]}>Time Remaining - 01:16</Text>
                <Text style={[styles.Text, { marginBottom: 0, fontSize: 26, marginLeft: 30, marginTop: 30, alignSelf: 'flex-end', textAlign: 'right', marginRight: 30 }]}>Role - Maphia</Text>

                <View style={styles.cardContainer}>
                  

                    <View style={styles.playersColumnsRow}>
                        <View style={styles.playerColumn}>
                            {leftPlayers.map((p, i) => (
                                <View key={i} style={styles.playerRow}>
                                    {p.icon?.type === 'mc' ? <Icon name={p.icon.name as any} size={18} color="white" style={styles.iconBefore} /> : null}
                                    <Text style={[styles.playerText, p.dead ? styles.deadText : null]}>{p.name}</Text>
                                    {p.icon?.type === 'ion' ? <Ionicons name={p.icon.name as any} size={18} color="white" style={styles.iconAfter} /> : null}
                                </View>
                            ))}
                        </View>

                        <View style={styles.playerColumn}>
                            {rightPlayers.map((p, i) => (
                                <View key={i} style={styles.playerRow}>
                                    {p.icon?.type === 'mc' ? <Icon name={p.icon.name as any} size={18} color="white" style={styles.iconBefore} /> : null}
                                    <Text style={[styles.playerText, p.dead ? styles.deadText : null]}>{p.name}</Text>
                                    {p.icon?.type === 'ion' ? <Ionicons name={p.icon.name as any} size={18} color="white" style={styles.iconAfter} /> : null}
                                </View>
                            ))}
                        </View>
                    </View>
                </View>
            </View>

               <View style={styles.bottomRightContainer}>
                          
                              <Text style={[styles.Text, { fontSize: 17, marginRight: 10 }]}>
                                  3/3 Maphias remain
                              </Text>
                          <TouchableOpacity
                              style={styles.shareButton}
                              onPress={handleShare}
                              activeOpacity={1}
                          >
                              <Text style={[styles.Text, {  fontSize: 25 }]}>Mute</Text>
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
    Text: {
        color: "white",
        fontFamily: 'Gruesome',
    },
    cardContainer: {
        // Flexbox: defines the layout of its children (title and contentRow)
        flexDirection: 'column',
        alignItems: 'center',
        padding: 15,
        borderRadius: 3,
        margin: 10,
        marginLeft: 150,
        marginRight: 150,
        backgroundColor: 'transparent', // Grey background
        shadowColor: '#250101ff',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,

    },
    cardContainer1: {
        // Flexbox: defines the layout of its children (title and contentRow)
        flexDirection: 'column',
        padding: 15,

        margin: 10,
        marginLeft: 10,
        marginRight: 600,
        flex: 0.3,


        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    contentColumn: {
        // Flexbox: groups Item 1 and Item 2 to display them in a row
        flexDirection: 'column',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    shareButton: {
        width: 120, // Fixed width for the button area
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#610000ff', // Solid darker red for the button background
        borderRadius: 100,
        marginTop: 10,
        marginBottom: 16,
        marginRight: 20,
        // SHADOW/GLOW EFFECT (Crucial for the image's look)
        shadowColor: '#640303ff',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 10,
        elevation: 10, // Android shadow effect
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
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
        fontFamily: 'Gruesome',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        borderRadius: 8,
        fontSize: 20,
        alignItems: 'center',
    }
    ,
    bottomRightContainer: {

        position: 'absolute',
        bottom: 20,
        right: 16,
        alignItems: 'flex-end',
        justifyContent: 'flex-end',

    },
    roomPress: {
        marginBottom: 8,
        alignItems: 'flex-end',
    }
    ,
    playersList: {
        flexDirection: 'column',
        paddingHorizontal: 8,
        marginTop: 6,
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
    },
    iconBefore: {
        marginRight: 8,
    },
    iconAfter: {
        marginLeft: 8,
    },
    playersRowSingle: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 8,
        marginTop: 6,
    },
    playerChip: {
        color: 'white',
        fontFamily: 'Gruesome',
        fontSize: 16,
        paddingHorizontal: 8,
        paddingVertical: 6,
        marginRight: 6,
        backgroundColor: 'rgba(255,255,255,0.04)',
        borderRadius: 8,
    },
    playerText: {
        color: 'white',
        fontFamily: 'Gruesome',
        fontSize: 20,
        marginTop: 0,
        marginBottom: 4,
        textAlign: 'center',
    }
    ,
    deadText: {
        color: 'gray',
    }
    ,
    topCenterText: {
        position: 'absolute',
        top: 20,
        left: 0,
        right: 0,
        textAlign: 'center',
        color: 'white',
        fontFamily: 'Gruesome',
        zIndex: 20,
    }
    ,
 
});
