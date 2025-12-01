import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
// Import the Slider component
import Slider from '@react-native-community/slider';

// Define the shape of our component's props (if we needed custom props)
interface SliderProps {
  initialValue?: number;
}

const SliderComponent: React.FC<SliderProps> = ({ initialValue = 50 }) => {
  // Use TypeScript to define the state type as 'number'
  const [sliderValue, setSliderValue] = useState<number>(initialValue);

  return (
    <View style={styles.container}>
      {/* Display the current slider value */}
      <Text style={styles.labelText}>
        Number of players: {sliderValue}
      </Text>

      {/*  */}

      <Slider
        style={styles.slider}
        
        // --- Required Props ---
        minimumValue={5}
        maximumValue={12}
        step={1} // Example: allow half-integer steps
        
        // The value prop is bound to the state
        value={sliderValue} 
        
        // The onValueChange prop is typed to receive a 'number'
        onValueChange={(value: number) => {
          setSliderValue(value);
        }}

        // --- Optional Styling Props ---
        minimumTrackTintColor="#753e3eff" 
        maximumTrackTintColor="#997676ff"
        thumbTintColor="#FF4500" // Orange thumb
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 5,
    alignItems: 'stretch', // Ensures the slider takes up the full width
    marginTop: 10,
  },
  labelText: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 5,
    textAlign: 'left',
    color: 'white',
    fontFamily: 'Gruesome',
  },
  slider: {
    width: '100%',
    height: 10,
  }
});

export default SliderComponent;