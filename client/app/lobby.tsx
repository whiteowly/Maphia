import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, ImageBackground, Pressable, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSocket } from '../context/SocketContext';

const backgroundImage = require("../assets/images/background.jpeg");

export default function Lobby() {
  const router = useRouter();
  const { socket } = useSocket();
  const { roomCode, userId } = useLocalSearchParams();
  const [players, setPlayers] = useState<any[]>([]);

  useEffect(() => {
    if (!socket) return;

    // Listen for lobby updates (players joining/leaving)
    socket.on('LOBBY_UPDATE', (updatedPlayers) => {
      setPlayers(updatedPlayers);
    });

    // Listen for game start
    socket.on('GAME_STARTED', () => {
      router.push({
        pathname: '/game',
        params: { roomCode, userId }
      });
    });

    return () => {
      socket.off('LOBBY_UPDATE');
      socket.off('GAME_STARTED');
    };
  }, [socket, roomCode, userId, router]);

  const handleStartGame = () => {
    socket?.emit('START_GAME', { roomCode });
  };

  const handleLeave = () => {
      // Optional: Emit leave event if your backend supports it
      // socket?.emit('LEAVE_LOBBY', { roomCode, userId });
      router.back();
  };

  return (
    <ImageBackground blurRadius={10} source={backgroundImage} style={styles.background}>
      <StatusBar hidden={true} />
      <Pressable onPress={handleLeave} style={styles.backButton}>
        <MaterialIcons name="arrow-back" size={30} color="white" />
      </Pressable>

      <View style={styles.container}>
        <Text style={styles.title}>Lobby</Text>
        <Text style={styles.roomCode}>Code: {roomCode}</Text>

        <View style={styles.cardContainer}>
          <Text style={styles.sectionTitle}>Players Joined</Text>
          <FlatList
            data={players}
            keyExtractor={(item, index) => item.id || index.toString()}
            renderItem={({ item }) => (
              <Text style={styles.playerText}>{item.username || item.name || "Player"}</Text>
            )}
            ListEmptyComponent={<Text style={styles.waitingText}>Waiting for players...</Text>}
          />
        </View>

        <TouchableOpacity style={styles.startButton} onPress={handleStartGame}>
          <Text style={styles.startButtonText}>Start Game</Text>
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
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 15,
    padding: 6,
    zIndex: 20,
  },
  title: {
    fontFamily: 'Gruesome',
    fontSize: 50,
    color: 'white',
    marginBottom: 10,
  },
  roomCode: {
    fontFamily: 'Gruesome',
    fontSize: 30,
    color: '#ff9999',
    marginBottom: 30,
  },
  cardContainer: {
    width: '80%',
    backgroundColor: '#22010180',
    padding: 20,
    borderRadius: 10,
    minHeight: 200,
    maxHeight: '50%',
  },
  sectionTitle: {
    fontFamily: 'Gruesome',
    fontSize: 24,
    color: 'white',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#610000',
    paddingBottom: 5,
  },
  playerText: {
    fontFamily: 'Gruesome',
    fontSize: 20,
    color: 'white',
    marginVertical: 5,
  },
  waitingText: {
    fontFamily: 'Gruesome',
    fontSize: 18,
    color: '#ccc',
    fontStyle: 'italic',
  },
  startButton: {
    marginTop: 40,
    backgroundColor: '#610000ff',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 50,
    shadowColor: '#640303ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },
  startButtonText: {
    fontFamily: 'Gruesome',
    fontSize: 30,
    color: 'white',
  },
});
