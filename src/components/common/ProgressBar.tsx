import React from 'react';
import { View, Text, StyleSheet, Animated, ViewStyle } from 'react-native';
import { theme } from '../../constants/theme';

interface ProgressBarProps {
  progress: number; // 0 to 1
  height?: number;
  backgroundColor?: string;
  progressColor?: string;
  borderRadius?: number;
  showPercentage?: boolean;
  style?: ViewStyle;
  animated?: boolean;
  duration?: number;
  label?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 10,
  backgroundColor = theme.colors.lightGray,
  progressColor = theme.colors.primary,
  borderRadius = 5,
  showPercentage = false,
  style,
  animated = true,
  duration = 500,
  label,
}) => {
  // Validate progress value
  const validProgress = Math.min(Math.max(progress, 0), 1);

  // Animation value
  const [animatedProgress] = React.useState(new Animated.Value(0));

  // Update animation when progress changes
  React.useEffect(() => {
    if (animated) {
      Animated.timing(animatedProgress, {
        toValue: validProgress,
        duration,
        useNativeDriver: false,
      }).start();
    } else {
      animatedProgress.setValue(validProgress);
    }
  }, [validProgress, duration, animated, animatedProgress]);

  // Interpolate width for animation
  const width = animatedProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  // Style for the progress bar container
  const progressBarStyle = {
    backgroundColor,
    height,
    borderRadius,
  };

  // Style for the progress indicator
  const progressStyle = {
    backgroundColor: progressColor,
    height,
    borderRadius,
    width: animated ? width : `${validProgress * 100}%`,
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.progressBar, progressBarStyle]}>
        <Animated.View style={[styles.progress, progressStyle]} />
      </View>
      {showPercentage && (
        <Text style={styles.percentage}>{Math.round(validProgress * 100)}%</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
    color: theme.colors.textSecondary,
  },
  progressBar: {
    overflow: 'hidden',
  },
  progress: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
  percentage: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
    color: theme.colors.textSecondary,
  },
});

export default ProgressBar;
