import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, ImageBackground, Modal, Pressable, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useGame } from './context/GameContext';
import socketService, { SERVER_URL } from './services/socketService';
import SliderComponent from './sliderComponent';
import SliderMafia from "./sliderMafia";

const backgroundImage = require("../assets/images/background.jpeg");

// Time options in seconds (15s to 120s)
const TIME_OPTIONS = [15, 30, 45, 60, 90, 120];

export default function Create() {
  const router = useRouter();
  const { settings, updateSettings, setIsHost, setMyPlayerId, myPlayerName, setMyPlayerName } = useGame();

  // Local state for UI
  const [playerCount, setPlayerCount] = useState(settings.maxPlayers || 7);
  const [maphiaCount, setMaphiaCount] = useState(settings.maphiaCount || 2);
  const [discussionTime, setDiscussionTime] = useState(60);
  const [votingTime, setVotingTime] = useState(30);
  const [playerName, setPlayerName] = useState(myPlayerName || 'Host');
  const [isConnecting, setIsConnecting] = useState(false);

  // Modal state for time pickers
  const [showDiscussionPicker, setShowDiscussionPicker] = useState(false);
  const [showVotingPicker, setShowVotingPicker] = useState(false);

  // Calculate civilians
  const civilianCount = playerCount - maphiaCount;

  // Ensure mafia count is valid
  useEffect(() => {
    const maxAllowedMaphias = Math.min(3, playerCount - 2);
    if (maphiaCount > maxAllowedMaphias) {
      setMaphiaCount(Math.max(1, maxAllowedMaphias));
    }
  }, [playerCount, maphiaCount]);

  const handleCreateGame = async () => {
    setIsConnecting(true);

    try {
      // Connect to server
      await socketService.connect();

      // Create room
      const gameSettings = {
        maxPlayers: playerCount,
        maphiaCount: maphiaCount,
        discussionTimeSeconds: discussionTime,
        votingTimeSeconds: votingTime,
      };

      socketService.createRoom(playerName, gameSettings, (response) => {
        setIsConnecting(false);

        if (response.success) {
          // Update game context
          updateSettings({
            ...gameSettings,
            roomCode: response.roomCode!,
          });
          setIsHost(true);
          setMyPlayerId(response.playerId!);

          // Persist host name into context so other screens use the saved name
          if (playerName && playerName.trim()) {
            setMyPlayerName(playerName.trim());
          }

          // Navigate to lobby
          router.push('/lobby');
        } else {
          Alert.alert('Error', response.error || 'Failed to create room');
        }
      });
    } catch (error) {
      setIsConnecting(false);
      const errorMessage = error instanceof Error ? error.message : String(error);
      Alert.alert('Connection Error', `Failed to connect to server: ${errorMessage}. Make sure the server is running and accessible.`);
      console.error('Connection error:', error);
    }
  };

  // Format time display
  const formatTime = (seconds: number) => {
    if (seconds >= 60) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
    }
    return `${seconds}s`;
  };

  // Time Picker Modal Component
  const TimePickerModal = ({
    visible,
    onClose,
    currentValue,
    onSelect,
    title
  }: {
    visible: boolean;
    onClose: () => void;
    currentValue: number;
    onSelect: (value: number) => void;
    title: string;
  }) => (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          <FlatList
            data={TIME_OPTIONS}
            keyExtractor={(item) => item.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.timeOption,
                  currentValue === item && styles.selectedTimeOption,
                ]}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <Text style={[
                  styles.timeOptionText,
                  currentValue === item && styles.selectedTimeOptionText,
                ]}>
                  {formatTime(item)}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Pressable>
    </Modal>
  );

  return (
    <ImageBackground blurRadius={10} source={backgroundImage} style={styles.background}>
      <StatusBar hidden={true} />
      <Pressable onPress={() => router.back()} style={styles.backButton} accessibilityLabel="Go back">
        <MaterialIcons name="arrow-back" size={30} color="white" />
      </Pressable>

      <Text style={{ fontFamily: 'Gruesome', fontSize: 40, color: 'white', marginBottom: 0, marginLeft: 30, marginTop: 30, alignSelf: 'flex-end', textAlign: 'right', marginRight: 30 }}>Maphia</Text>

      <View style={styles.container}>
        {/* Game Rules Card */}
        <View style={styles.cardContainer}>
          <Text style={{ fontFamily: 'Gruesome', fontSize: 30, color: 'white', marginTop: 4, alignSelf: 'flex-start' }}>Game rules</Text>

          <View style={styles.contentRow}>
            <SliderComponent
              initialValue={playerCount}
              onValueChange={(value) => setPlayerCount(value)}
            />
            <SliderMafia
              initialValue={maphiaCount}
              onValueChange={(value) => setMaphiaCount(value)}
            />
          </View>

          {/* Time Settings Row */}
          <View style={styles.timeSettingsRow}>
            <View style={styles.timeSetting}>
              <Text style={styles.timeLabel}>Discussion Time</Text>
              <TouchableOpacity
                style={styles.timeSelector}
                onPress={() => setShowDiscussionPicker(true)}
              >
                <Text style={styles.timeSelectorText}>{formatTime(discussionTime)}</Text>
                <MaterialIcons name="arrow-drop-down" size={24} color="#FF4444" />
              </TouchableOpacity>
            </View>

            <View style={styles.timeSetting}>
              <Text style={styles.timeLabel}>Voting Time</Text>
              <TouchableOpacity
                style={styles.timeSelector}
                onPress={() => setShowVotingPicker(true)}
              >
                <Text style={styles.timeSelectorText}>{formatTime(votingTime)}</Text>
                <MaterialIcons name="arrow-drop-down" size={24} color="#FF4444" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Server Status */}
          <View style={styles.serverStatus}>
            <Text style={{ fontFamily: 'Gruesome', fontSize: 12, color: '#888' }}>
              Server: {SERVER_URL.replace('http://', '')}
            </Text>
          </View>
        </View>

        {/* Roles Card - Dynamic! */}
        <View style={styles.cardContainer1}>
          <Text style={{ fontFamily: 'Gruesome', fontSize: 30, color: 'white', marginTop: 5, alignSelf: 'flex-start' }}>Roles</Text>
          <View style={styles.contentColumn}>
            <Text style={{ fontFamily: 'Gruesome', fontSize: 20, color: 'white', marginLeft: 10, marginTop: 20 }}>
              {playerCount} Players
            </Text>
            <Text style={{ fontFamily: 'Gruesome', fontSize: 20, color: '#FF6B6B', marginLeft: 10, marginTop: 20 }}>
              {maphiaCount} Maphia{maphiaCount > 1 ? 's' : ''}
            </Text>
            <Text style={{ fontFamily: 'Gruesome', fontSize: 20, color: '#7BFF7B', marginLeft: 10, marginTop: 20 }}>
              {civilianCount} Civilian{civilianCount > 1 ? 's' : ''}
            </Text>
          </View>

          {/* Game Settings Summary */}
          <View style={styles.settingsSummary}>
            <Text style={{ fontFamily: 'Gruesome', fontSize: 14, color: '#AAAAAA', marginTop: 10 }}>
              Discussion: {formatTime(discussionTime)}
            </Text>
            <Text style={{ fontFamily: 'Gruesome', fontSize: 14, color: '#AAAAAA', marginTop: 5 }}>
              Voting: {formatTime(votingTime)}
            </Text>
          </View>
        </View>
      </View>

      <View style={{ alignItems: 'center', justifyContent: 'flex-end', flex: 1 }}>
        <TouchableOpacity
          style={[styles.shareButton, isConnecting && styles.disabledButton]}
          onPress={handleCreateGame}
          activeOpacity={0.8}
          disabled={isConnecting}
        >
          {isConnecting ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color="white" size="small" />
              <Text style={{ fontFamily: 'Gruesome', fontSize: 24, color: 'white', marginLeft: 10 }}>Connecting...</Text>
            </View>
          ) : (
            <Text style={{ fontFamily: 'Gruesome', fontSize: 30, color: 'white' }}>Create Game</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Time Picker Modals */}
      <TimePickerModal
        visible={showDiscussionPicker}
        onClose={() => setShowDiscussionPicker(false)}
        currentValue={discussionTime}
        onSelect={setDiscussionTime}
        title="Discussion Time"
      />
      <TimePickerModal
        visible={showVotingPicker}
        onClose={() => setShowVotingPicker(false)}
        currentValue={votingTime}
        onSelect={setVotingTime}
        title="Voting Time"
      />
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
    flexDirection: 'row',
    marginTop: 5,
    marginBottom: 50,
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginLeft: 10,
    marginRight: 10,
  },
  cardContainer: {
    flexDirection: 'column',
    padding: 15,
    borderRadius: 8,
    margin: 10,
    marginLeft: 70,
    marginRight: 10,
    flex: 0.7,
    backgroundColor: '#22010180',
    shadowColor: '#250101ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  shareButton: {
    width: '10%',
    height: '40%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#610000ff',
    borderRadius: 100,
    marginTop: 10,
    marginBottom: 10,
    shadowColor: '#640303ff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10,
  },
  disabledButton: {
    backgroundColor: '#444444',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardContainer1: {
    flexDirection: 'column',
    padding: 15,
    borderRadius: 8,
    margin: 10,
    marginLeft: 10,
    marginRight: 20,
    flex: 0.3,
    backgroundColor: '#22010180',
    shadowColor: '#250101ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  contentColumn: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  settingsSummary: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 15,
    padding: 6,
    zIndex: 20,
  },
  timeSettingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 10,
  },
  timeSetting: {
    flex: 1,
    marginHorizontal: 5,
  },
  timeLabel: {
    fontFamily: 'Gruesome',
    fontSize: 16,
    color: 'white',
    marginBottom: 8,
  },
  timeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(50, 0, 0, 0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.5)',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    shadowColor: '#FF0000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  timeSelectorText: {
    fontFamily: 'Gruesome',
    fontSize: 18,
    color: '#FF4444',
  },
  serverStatus: {
    marginTop: 15,
    alignItems: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a0000',
    borderRadius: 15,
    padding: 20,
    width: 200,
    borderWidth: 1,
    borderColor: '#FF0000',
    shadowColor: '#FF0000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
  },
  modalTitle: {
    fontFamily: 'Gruesome',
    fontSize: 22,
    color: 'white',
    textAlign: 'center',
    marginBottom: 15,
  },
  timeOption: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  selectedTimeOption: {
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  timeOptionText: {
    fontFamily: 'Gruesome',
    fontSize: 18,
    color: '#AAAAAA',
    textAlign: 'center',
  },
  selectedTimeOptionText: {
    color: '#FF4444',
  },
});
