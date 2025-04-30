import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';

export const Button = ({
  title,
  onPress,
  type = 'primary', // primary, secondary, outline, text, danger
  size = 'medium', // small, medium, large
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const getButtonStyle = () => {
    const buttonStyles = [styles.button];
    
    switch (type) {
      case 'primary':
        buttonStyles.push(styles.primaryButton);
        break;
      case 'secondary':
        buttonStyles.push(styles.secondaryButton);
        break;
      case 'outline':
        buttonStyles.push(styles.outlineButton);
        break;
      case 'text':
        buttonStyles.push(styles.textButton);
        break;
      case 'danger':
        buttonStyles.push(styles.dangerButton);
        break;
    }
    
    switch (size) {
      case 'small':
        buttonStyles.push(styles.smallButton);
        break;
      case 'medium':
        buttonStyles.push(styles.mediumButton);
        break;
      case 'large':
        buttonStyles.push(styles.largeButton);
        break;
    }
    
    if (disabled) {
      buttonStyles.push(styles.disabledButton);
    }
    
    if (fullWidth) {
      buttonStyles.push(styles.fullWidthButton);
    }
    
    return buttonStyles;
  };
  
  const getTextStyle = () => {
    const textStyles = [styles.buttonText];
    
    switch (type) {
      case 'primary':
        textStyles.push(styles.primaryButtonText);
        break;
      case 'secondary':
        textStyles.push(styles.secondaryButtonText);
        break;
      case 'outline':
        textStyles.push(styles.outlineButtonText);
        break;
      case 'text':
        textStyles.push(styles.textButtonText);
        break;
      case 'danger':
        textStyles.push(styles.dangerButtonText);
        break;
    }
    
    switch (size) {
      case 'small':
        textStyles.push(styles.smallButtonText);
        break;
      case 'medium':
        textStyles.push(styles.mediumButtonText);
        break;
      case 'large':
        textStyles.push(styles.largeButtonText);
        break;
    }
    
    if (disabled) {
      textStyles.push(styles.disabledButtonText);
    }
    
    return textStyles;
  };
  
  return (
    <TouchableOpacity
      style={[...getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator
          color={type === 'outline' || type === 'text' ? '#4E67F0' : '#FFFFFF'}
          size="small"
        />
      ) : (
        <View style={styles.buttonContent}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[...getTextStyle(), textStyle]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: '#4E67F0',
  },
  secondaryButton: {
    backgroundColor: '#F86F6F',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4E67F0',
  },
  textButton: {
    backgroundColor: 'transparent',
  },
  dangerButton: {
    backgroundColor: '#F44336',
  },
  smallButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  mediumButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  largeButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  fullWidthButton: {
    width: '100%',
  },
  buttonText: {
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    color: '#FFFFFF',
  },
  outlineButtonText: {
    color: '#4E67F0',
  },
  textButtonText: {
    color: '#4E67F0',
  },
  dangerButtonText: {
    color: '#FFFFFF',
  },
  smallButtonText: {
    fontSize: 13,
  },
  mediumButtonText: {
    fontSize: 15,
  },
  largeButtonText: {
    fontSize: 17,
  },
  disabledButtonText: {
    opacity: 0.8,
  },
});

export default Button;