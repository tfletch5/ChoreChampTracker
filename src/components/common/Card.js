import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

export const Card = ({ 
  children, 
  style, 
  onPress, 
  elevation = 2,
  borderRadius = 12,
  backgroundColor = '#FFFFFF',
  padding = 16,
  margin = 0
}) => {
  const cardStyle = {
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
      <TouchableOpacity 
        style={cardStyle} 
        onPress={onPress}
        activeOpacity={0.8}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle}>
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
});

export default Card;