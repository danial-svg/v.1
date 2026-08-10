import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface ShuffleBarProps {
  onComplete: (quality: number) => void;
  shufflerName: string;
}

export function ShuffleBar({ onComplete, shufflerName }: ShuffleBarProps) {
  const [glowAnim] = useState(new Animated.Value(0));
  const [showGlow, setShowGlow] = useState(false);
  const [lastScore, setLastScore] = useState<number | null>(null);

  const handlePress = useCallback((event: any) => {
    const x = event.nativeEvent.locationX;
    const barWidth = Dimensions.get('window').width - 48;
    const ratio = Math.max(0, Math.min(1, x / barWidth));
    const distance = Math.abs(ratio - 0.5) * 2;
    const quality = Math.round((1 - distance) * 100);

    setLastScore(quality);

    if (quality >= 80) {
      setShowGlow(true);
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0, duration: 800, easing: Easing.inOut(Easing.ease), useNativeDriver: true,
        }),
      ]).start(() => setShowGlow(false));
    }

    setTimeout(() => onComplete(quality), 700);
  }, [onComplete, glowAnim]);

  return (
    <View style={styles.container}>
      {showGlow && (
        <Animated.View
          style={[
            styles.glowOverlay,
            { opacity: glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.5] }) },
          ]}
        />
      )}

      <Text style={styles.title}>Shuffle the Cards</Text>
      <Text style={styles.subtitle}>
        {shufflerName}, tap the bar. Hit the green center for a fair deal!
      </Text>

      <TouchableOpacity style={styles.bar} onPress={handlePress} activeOpacity={0.9}>
        <LinearGradient
          colors={['#E63946', '#F4D03F', '#2D6A4F', '#F4D03F', '#E63946']}
          locations={[0, 0.25, 0.5, 0.75, 1]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.barGradient}
        />
        <View style={styles.centerMarker} />
      </TouchableOpacity>

      <View style={styles.scaleRow}>
        <Text style={styles.scaleText}>0 (Skewed)</Text>
        <Text style={styles.scaleText}>100 (Fair)</Text>
      </View>

      {lastScore !== null && (
        <Text style={[styles.result, lastScore >= 80 ? styles.resultGood : styles.resultBad]}>
          Quality: {lastScore} {lastScore >= 80 ? '— Great shuffle!' : '— Skewed deal'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'rgba(10, 26, 46, 0.95)',
  },
  title: { fontFamily: 'Inter-Bold', fontSize: 24, fontWeight: '700', color: '#FFFFFF', marginBottom: 8 },
  subtitle: { fontFamily: 'Inter-Regular', fontSize: 14, color: '#AABBCC', textAlign: 'center', marginBottom: 32, lineHeight: 20 },
  bar: {
    width: '100%',
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    elevation: 5,
  },
  barGradient: { flex: 1 },
  centerMarker: {
    position: 'absolute',
    left: '50%',
    top: -4,
    bottom: -4,
    width: 3,
    backgroundColor: '#FFFFFF',
    marginLeft: -1.5,
  },
  scaleRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 8 },
  scaleText: { fontFamily: 'Inter-Regular', fontSize: 11, color: '#AABBCC' },
  result: { fontFamily: 'Inter-Bold', fontSize: 16, fontWeight: '700', marginTop: 20 },
  resultGood: { color: '#2D6A4F' },
  resultBad: { color: '#E63946' },
  glowOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#FFD700',
    zIndex: 100,
  },
});
