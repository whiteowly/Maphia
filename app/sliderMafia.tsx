import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
// Import the Slider component
import Slider from '@react-native-community/slider';

// Define the shape of our component's props
interface SliderProps {
  initialValue?: number;
  onValueChange?: (value: number) => void;
}

const SliderMafia: React.FC<SliderProps> = ({ initialValue = 2, onValueChange }) => {
  // Use TypeScript to define the state type as 'number'
  const [sliderValue, setSliderValue] = useState<number>(initialValue);

  // Notify parent when value changes
  useEffect(() => {
    if (onValueChange) {
      onValueChange(sliderValue);
    }
  }, [sliderValue, onValueChange]);

  return (
    <View style={styles.container}>
      {/* Display the current slider value */}
      <Text style={styles.labelText}>
        Number of Maphias: {sliderValue}
      </Text>

      <Slider
        style={styles.slider}

        // --- Required Props ---
        minimumValue={1}
        maximumValue={3}
        step={1}

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
    marginTop: 4,
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

export default SliderMafia;