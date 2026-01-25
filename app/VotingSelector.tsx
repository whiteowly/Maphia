import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// We'll use the Ionicons component for the dropdown arrow
import { Ionicons } from '@expo/vector-icons';

// --- TYPE DEFINITION ---
interface RedSelectorProps {
  currentValue: number | string;
  // Function to handle opening the list/modal
  onSelectPress: () => void;
}

// --- MAIN COMPONENT ---
const VotingSelector: React.FC<RedSelectorProps> = ({ currentValue, onSelectPress }) => {

  // Define the function that will run when the selector is pressed
  const handlePress = () => {
    onSelectPress();
    // Placeholder logic: In a real app, this would open a Modal or Bottom Sheet 
    // containing the list of selectable options (e.g., 1, 2, 3, 4, etc.)
    Alert.alert('Selector Pressed', 'A list of options would open here.');
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* 1. CURRENT VALUE DISPLAY */}
      <View style={styles.valueWrapper}>
        <Text style={styles.valueText}>{currentValue}</Text>
      </View>

      {/* 2. DROPDOWN ARROW ICON */}
      <View style={styles.arrowWrapper}>
        <Ionicons
          name="chevron-down-sharp"
          size={20}
          color="#FF0000" // Red color for the icon
        />
      </View>
    </TouchableOpacity>
  );
};

// --- STYLESHEET ---
const styles = StyleSheet.create({
  container: {
    // Layout: Value on the left, arrow on the right
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    // Size and Shape
    width: 180,
    height: 35,
    borderRadius: 8,
    paddingHorizontal: 15,
    // Background and Border (for the "Input" look)
    backgroundColor: 'rgba(50, 0, 0, 0.4)', // Dark red background, subtle
    borderWidth: 0.5,
    borderColor: 'rgba(255, 0, 0, 0.5)', // Red border

    // GLOW EFFECT (Subtle shadow on the whole box)
    shadowColor: '#FF0000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 1,
    elevation: 0, // Android shadow
  },

  valueWrapper: {
    flex: 1, // Takes up most of the space
    justifyContent: 'center',
  },
  valueText: {
    color: '#cabdb7', // Bright red color for the number
    fontSize: 20,
    fontFamily: 'Gruesome',
    // Text glow
    textShadowColor: 'rgba(255, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },

  arrowWrapper: {
    paddingLeft: 10,
    justifyContent: 'center',
  },
});

export default VotingSelector;