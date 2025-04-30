import React from 'react';
import { View, Image, StyleSheet, ViewStyle, TouchableOpacity, Text } from 'react-native';
import { theme } from '../../constants/theme';

interface AvatarProps {
  source?: string;
  size?: number;
  borderColor?: string;
  borderWidth?: number;
  style?: ViewStyle;
  onPress?: () => void;
  initials?: string;
  backgroundColor?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  source,
  size = 50,
  borderColor = theme.colors.primary,
  borderWidth = 0,
  style,
  onPress,
  initials,
  backgroundColor = theme.colors.primaryLight,
}) => {
  const avatarContainerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth,
    borderColor,
    backgroundColor: source ? 'transparent' : backgroundColor,
  };

  const initialsStyle = {
    fontSize: size * 0.4,
    color: theme.colors.primary,
    fontWeight: 'bold' as const,
  };

  const content = source ? (
    <Image
      source={{ uri: source }}
      style={{ width: size, height: size, borderRadius: size / 2 }}
      resizeMode="cover"
    />
  ) : (
    <Text style={initialsStyle}>{initials}</Text>
  );

  const containerStyle = [styles.container, avatarContainerStyle, style];

  if (onPress) {
    return (
      <TouchableOpacity style={containerStyle} onPress={onPress} activeOpacity={0.8}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={containerStyle}>{content}</View>;
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
});

export default Avatar;
