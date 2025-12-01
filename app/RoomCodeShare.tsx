import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// --- TYPE DEFINITION ---
interface RoomCodeShareProps {
  code: string;
}

// --- MAIN COMPONENT ---
const RoomCodeShare: React.FC<RoomCodeShareProps> = ({ code }) => {
  const handleShare = () => {
    // Replace this with actual sharing logic (e.g., using Expo's Sharing API)
    Alert.alert('Sharing Code', `You are about to share the room code: ${code}`);
  };

  return (
    <View style={styles.container}>
      
      {/* 1. CODE DISPLAY AREA */}
      <View style={styles.codeDisplay}>
        <Text style={styles.codeText}>{code}</Text>
      </View>

      {/* 2. SHARE BUTTON */}
      <TouchableOpacity
        style={styles.shareButton}
        onPress={handleShare}
        activeOpacity={0.6}
      >
        <Text style={styles.shareText}>Copy</Text>
      </TouchableOpacity>
    </View>
  );
};

// --- STYLESHEET ---
const styles = StyleSheet.create({
  container: {
    // Lays items horizontally and stretches to fill its parent
    flexDirection: 'row', 
    alignItems: 'center',
    width: 180, // Fixed width for simplicity
    height: 35,
    borderRadius: 8,
    // Base dark color for the container
    backgroundColor: 'rgba(50, 0, 0, 0.4)', 
    overflow: 'hidden',
    borderColor: 'rgba(255, 0, 0, 0.2)', // Light red border around the whole element
    borderWidth: 1,
  },

  // Code Area (J27FX)
  codeDisplay: {
    flex: 1, // Takes up the remaining space
    height: '100%',
    justifyContent: 'center',
    paddingLeft: 15,
  },
  codeText: {
    color: '#ffffffff', // A vibrant red/pink for the room code text
    fontSize: 20,

    // Subtle glow on the text itself
    textShadowColor: 'rgba(255, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
    fontFamily: 'Gruesome',
  },

  // Share Button Area
  shareButton: {
    width: '40%', // Fixed width for the button area
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#CC0000', // Solid darker red for the button background
    borderRadius: 8,

    // SHADOW/GLOW EFFECT (Crucial for the image's look)
    shadowColor: '#FF0000', 
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1, 
    shadowRadius: 10, 
    elevation: 10, // Android shadow effect
  },
  shareText: {
    color: 'white', 
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Gruesome',
  },
});

export default RoomCodeShare;