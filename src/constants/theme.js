/**
 * Application theme constants
 * This file defines colors, typography, spacing, and other theme-related constants
 * used throughout the application for consistent styling.
 */

// Color palette
export const COLORS = {
  // Primary colors
  primary: '#4E67F0',      // Main brand color - bright blue
  primaryDark: '#3049DB',  // Darker shade of primary
  primaryLight: '#7D8EFF', // Lighter shade of primary
  
  // Secondary colors
  secondary: '#F86F6F',    // Secondary brand color - coral red
  secondaryDark: '#E84A4A',
  secondaryLight: '#FF9E9E',
  
  // Accent colors
  accent1: '#50D2C2',      // Teal accent
  accent2: '#FFCC4D',      // Gold accent
  accent3: '#947AFF',      // Purple accent
  
  // Feedback colors
  success: '#4CAF50',      // Green for success states
  warning: '#FFC107',      // Amber for warnings
  error: '#F44336',        // Red for errors
  info: '#2196F3',         // Blue for information
  
  // Neutral colors
  black: '#000000',
  white: '#FFFFFF',
  grey1: '#333333',        // Very dark grey - for text
  grey2: '#666666',        // Dark grey - for secondary text
  grey3: '#999999',        // Medium grey - for disabled text
  grey4: '#CCCCCC',        // Light grey - for borders
  grey5: '#EEEEEE',        // Very light grey - for backgrounds
  
  // Background colors
  background: '#FFFFFF',   // Default background
  backgroundDark: '#F5F5F5', // Darker background for sections
  backgroundLight: '#FAFAFA', // Lighter background for contrast
  
  // Transparent colors
  transparent: 'transparent',
  blackTransparent: 'rgba(0, 0, 0, 0.5)',
  whiteTransparent: 'rgba(255, 255, 255, 0.8)',
  
  // Child/Parent theme colors
  parentTheme: '#4E67F0', // Blue for parent interface
  childTheme: '#F86F6F',  // Red for child interface
};

// Font family
export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System-Bold',
};

// Typography sizes
export const FONT_SIZES = {
  xs: 10,
  small: 12,
  medium: 14,
  regular: 16,
  large: 18,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  title: 32,
};

// Layout spacing
export const SPACING = {
  xs: 4,
  small: 8,
  medium: 12,
  regular: 16,
  large: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
};

// Border radius
export const BORDER_RADIUS = {
  xs: 2,
  small: 4,
  medium: 8,
  regular: 12,
  large: 16,
  xl: 24,
  round: 50,
};

// Shadows
export const SHADOWS = {
  small: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  large: {
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
};

// Status colors for chores, rewards, etc.
export const STATUS_COLORS = {
  pending: COLORS.info,
  completed: COLORS.success,
  overdue: COLORS.error,
  approved: COLORS.success,
  denied: COLORS.error,
  skipped: COLORS.grey3,
};

// Child avatar colors
export const AVATAR_COLORS = [
  '#FF5252', // Red
  '#FF9800', // Orange
  '#FFEB3B', // Yellow
  '#66BB6A', // Green
  '#42A5F5', // Blue
  '#7C4DFF', // Purple
  '#F48FB1', // Pink
  '#00BCD4', // Cyan
];

// Export default theme object
export default {
  COLORS,
  FONTS,
  FONT_SIZES,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  STATUS_COLORS,
  AVATAR_COLORS,
};