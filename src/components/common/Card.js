import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

const Card = ({ children, style, onPress, elevation = 2, borderRadius = 12, backgroundColor = 'white', padding = 15, margin = 0 }) => {
  const cardStyles = {
    ...styles.card,
    elevation,
    borderRadius,
    backgroundColor,
    padding,
    margin,
    ...style,
  };

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyles} onPress={onPress} activeOpacity={0.7}>
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyles}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
});

export default Card;