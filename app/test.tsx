import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const MyGroupedContent = () => {
  return (
    // This <View> acts as the main container (like a <div>)
    <View style={styles.cardContainer}>
      <Text style={styles.title}>Card Title</Text>
      
      {/* This nested <View> acts as a second grouping container */}
      <View style={styles.contentRow}>
        <Text>Item 1</Text>
        <Text>Item 2</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    // Flexbox: defines the layout of its children (title and contentRow)
    flexDirection: 'column', 
    backgroundColor: '#f0f0f0', // Grey background
    padding: 15,
    borderRadius: 8,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3, // Android shadow
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  contentRow: {
    // Flexbox: groups Item 1 and Item 2 to display them in a row
    flexDirection: 'row', 
    justifyContent: 'space-between',
    paddingHorizontal: 5,
  },
});

export default MyGroupedContent;