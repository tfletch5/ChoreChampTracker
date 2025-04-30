import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  ViewStyle, 
  TextStyle, 
  TextInputProps, 
  TouchableOpacity 
} from 'react-native';
import { theme } from '../../constants/theme';
import { Feather } from '@expo/vector-icons';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
  labelStyle?: TextStyle;
  inputStyle?: TextStyle;
  errorStyle?: TextStyle;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  secureTextEntry?: boolean;
  touched?: boolean;
  optional?: boolean;
  helperText?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  containerStyle,
  labelStyle,
  inputStyle,
  errorStyle,
  leftIcon,
  rightIcon,
  secureTextEntry,
  touched,
  optional,
  helperText,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecureTextVisible, setIsSecureTextVisible] = useState(!secureTextEntry);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = (e: any) => {
    setIsFocused(false);
    if (props.onBlur) {
      props.onBlur(e);
    }
  };

  const toggleSecureTextVisibility = () => setIsSecureTextVisible(!isSecureTextVisible);

  const containerStyles = [
    styles.container,
    containerStyle,
  ];

  const inputContainerStyles = [
    styles.inputContainer,
    isFocused && styles.inputContainerFocused,
    error && touched && styles.inputContainerError,
  ];

  const inputStyles = [
    styles.input,
    leftIcon && styles.inputWithLeftIcon,
    (rightIcon || secureTextEntry) && styles.inputWithRightIcon,
    inputStyle,
  ];

  const renderSecureTextIcon = () => {
    return (
      <TouchableOpacity onPress={toggleSecureTextVisibility} style={styles.secureTextIconContainer}>
        <Feather 
          name={isSecureTextVisible ? 'eye-off' : 'eye'} 
          size={20} 
          color={theme.colors.textSecondary} 
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={containerStyles}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, labelStyle]}>
            {label}
            {optional && <Text style={styles.optional}> (Optional)</Text>}
          </Text>
        </View>
      )}
      <View style={inputContainerStyles}>
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}
        <TextInput
          style={inputStyles}
          placeholderTextColor={theme.colors.textPlaceholder}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry && !isSecureTextVisible}
          {...props}
        />
        {secureTextEntry && renderSecureTextIcon()}
        {rightIcon && <View style={styles.rightIconContainer}>{rightIcon}</View>}
      </View>
      {helperText && !error && (
        <Text style={styles.helperText}>{helperText}</Text>
      )}
      {error && touched && (
        <Text style={[styles.errorText, errorStyle]}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelContainer: {
    marginBottom: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  optional: {
    fontSize: 14,
    fontWeight: 'normal',
    color: theme.colors.textSecondary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
  },
  inputContainerFocused: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: theme.colors.error,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.text,
  },
  inputWithLeftIcon: {
    paddingLeft: 10,
  },
  inputWithRightIcon: {
    paddingRight: 10,
  },
  leftIconContainer: {
    marginRight: 10,
  },
  rightIconContainer: {
    marginLeft: 10,
  },
  secureTextIconContainer: {
    padding: 8,
  },
  errorText: {
    marginTop: 4,
    fontSize: 12,
    color: theme.colors.error,
  },
  helperText: {
    marginTop: 4,
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
});

export default Input;
