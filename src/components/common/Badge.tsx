import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { theme } from '../../constants/theme';

type BadgeType = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';

interface BadgeProps {
  label: string;
  type?: BadgeType;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({
  label,
  type = 'default',
  size = 'medium',
  style,
  textStyle,
  icon,
}) => {
  const containerStyles = [
    styles.container,
    styles[type],
    styles[`${size}Container`],
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${type}Text`],
    styles[`${size}Text`],
    textStyle,
  ];

  return (
    <View style={containerStyles}>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <Text style={textStyles}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  // Type styles
  default: {
    backgroundColor: theme.colors.lightGray,
  },
  primary: {
    backgroundColor: theme.colors.primaryLight,
  },
  success: {
    backgroundColor: theme.colors.successLight,
  },
  warning: {
    backgroundColor: theme.colors.warningLight,
  },
  error: {
    backgroundColor: theme.colors.errorLight,
  },
  info: {
    backgroundColor: theme.colors.infoLight,
  },
  // Text colors by type
  defaultText: {
    color: theme.colors.textSecondary,
  },
  primaryText: {
    color: theme.colors.primary,
  },
  successText: {
    color: theme.colors.success,
  },
  warningText: {
    color: theme.colors.warning,
  },
  errorText: {
    color: theme.colors.error,
  },
  infoText: {
    color: theme.colors.info,
  },
  // Size styles for container
  smallContainer: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  mediumContainer: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  largeContainer: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  // Size styles for text
  smallText: {
    fontSize: 10,
  },
  mediumText: {
    fontSize: 12,
  },
  largeText: {
    fontSize: 14,
  },
  // Icon styles
  iconContainer: {
    marginRight: 4,
  },
  text: {
    fontWeight: '600',
  },
});

export default Badge;
