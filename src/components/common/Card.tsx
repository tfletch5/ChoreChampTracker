import React from 'react';
import { StyleSheet, View, ViewStyle, TouchableOpacity } from 'react-native';
import { theme } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  elevation?: number;
  borderRadius?: number;
  backgroundColor?: string;
  padding?: number;
  margin?: number;
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  elevation = 2,
  borderRadius = 10,
  backgroundColor = '#ffffff',
  padding = 16,
  margin = 8,
}) => {
  const cardStyles = [
    styles.card,
    {
      elevation,
      borderRadius,
      backgroundColor,
      padding,
      margin,
      shadowOpacity: elevation / 10,
      shadowRadius: elevation,
    },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyles} onPress={onPress} activeOpacity={0.8}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyles}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    backgroundColor: '#fff',
    padding: 16,
    margin: 8,
    borderRadius: 10,
    overflow: 'hidden',
  },
});

export default Card;
