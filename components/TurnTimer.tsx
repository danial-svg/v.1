import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  cancelAnimation,
  Easing,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

interface TurnTimerProps {
  active: boolean;
  durationMs: number;
  onTimeout: () => void;
  style?: ViewStyle;
}

export function TurnTimer({ active, durationMs, onTimeout, style }: TurnTimerProps) {
  const progress = useSharedValue(1);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (active) {
      progress.value = 1;
      progress.value = withTiming(0, { duration: durationMs, easing: Easing.linear });
      timeoutRef.current = setTimeout(() => {
        onTimeout();
      }, durationMs);
    } else {
      progress.value = 1;
      cancelAnimation(progress);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    }
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [active, durationMs, onTimeout, progress]);

  const animatedStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const colorIndex = interpolate(
      p,
      [0, 0.4, 0.7, 1],
      [0, 1, 2, 3],
      Extrapolate.CLAMP
    );
    const colors = ['#E63946', '#F4A261', '#F4D03F', '#2D6A4F'];
    const colorIdx = Math.round(colorIndex);
    const color = colors[Math.max(0, Math.min(3, colorIdx))];
    return {
      width: `${p * 100}%`,
      backgroundColor: color,
    };
  });

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={[styles.bar, animatedStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 2,
  },
});
