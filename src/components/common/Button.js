import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';

const Button = ({
  title,
  onPress,
  type = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const getButtonStyle = () => {
    const buttonStyles = [styles.button];
    
    // Button type
    if (type === 'primary') buttonStyles.push(styles.primaryButton);
    else if (type === 'secondary') buttonStyles.push(styles.secondaryButton);
    else if (type === 'outline') buttonStyles.push(styles.outlineButton);
    else if (type === 'text') buttonStyles.push(styles.textButton);
    else if (type === 'danger') buttonStyles.push(styles.dangerButton);
    
    // Button size
    if (size === 'small') buttonStyles.push(styles.smallButton);
    else if (size === 'large') buttonStyles.push(styles.largeButton);
    
    // Full width
    if (fullWidth) buttonStyles.push(styles.fullWidth);
    
    // Disabled state
    if (disabled || loading) buttonStyles.push(styles.disabledButton);
    
    return buttonStyles;
  };
  
  const getTextStyle = () => {
    const buttonTextStyles = [styles.buttonText];
    
    // Text color based on button type
    if (type === 'primary') buttonTextStyles.push(styles.primaryButtonText);
    else if (type === 'secondary') buttonTextStyles.push(styles.secondaryButtonText);
    else if (type === 'outline') buttonTextStyles.push(styles.outlineButtonText);
    else if (type === 'text') buttonTextStyles.push(styles.textButtonText);
    else if (type === 'danger') buttonTextStyles.push(styles.dangerButtonText);
    
    // Text size
    if (size === 'small') buttonTextStyles.push(styles.smallButtonText);
    else if (size === 'large') buttonTextStyles.push(styles.largeButtonText);
    
    // Disabled state
    if (disabled || loading) buttonTextStyles.push(styles.disabledButtonText);
    
    return buttonTextStyles;
  };

  return (
    <TouchableOpacity
      style={[...getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      <View style={styles.buttonContent}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        {loading ? (
          <ActivityIndicator
            color={type === 'outline' || type === 'text' ? '#4285F4' : 'white'}
            size={size === 'small' ? 'small' : 'small'}
          />
        ) : (
          <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  primaryButton: {
    backgroundColor: '#4285F4',
  },
  secondaryButton: {
    backgroundColor: '#f2f2f2',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4285F4',
  },
  textButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: 5,
  },
  dangerButton: {
    backgroundColor: '#F44336',
  },
  smallButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  largeButton: {
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  fullWidth: {
    width: '100%',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  primaryButtonText: {
    color: 'white',
  },
  secondaryButtonText: {
    color: '#333',
  },
  outlineButtonText: {
    color: '#4285F4',
  },
  textButtonText: {
    color: '#4285F4',
  },
  dangerButtonText: {
    color: 'white',
  },
  smallButtonText: {
    fontSize: 14,
  },
  largeButtonText: {
    fontSize: 18,
  },
  disabledButtonText: {
    opacity: 1,
  },
});

export default Button;