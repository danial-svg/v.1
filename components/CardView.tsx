import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Card } from '@/lib/hokm/types';
import { RANK_LABELS, SUIT_SYMBOLS, SUIT_COLORS } from '@/lib/hokm/deck';

interface CardViewProps {
  card?: Card;
  faceDown?: boolean;
  size?: 'xs' | 'small' | 'medium' | 'large';
  style?: ViewStyle;
  dimmed?: boolean;
  highlight?: boolean;
  selected?: boolean;
}

const SIZES = {
  xs: { width: 32, height: 46, radius: 5, font: 14, corner: 9 },
  small: { width: 42, height: 60, radius: 6, font: 16, corner: 11 },
  medium: { width: 54, height: 78, radius: 7, font: 20, corner: 12 },
  large: { width: 64, height: 92, radius: 8, font: 24, corner: 14 },
};

export function CardView({
  card,
  faceDown = false,
  size = 'medium',
  style,
  dimmed = false,
  highlight = false,
  selected = false,
}: CardViewProps) {
  const s = SIZES[size];

  if (faceDown || !card) {
    return (
      <View
        style={[
          styles.card,
          { width: s.width, height: s.height, borderRadius: s.radius },
          styles.back,
          style,
        ]}
      >
        <View style={[styles.backPattern, { borderRadius: Math.max(s.radius - 2, 2) }]} />
      </View>
    );
  }

  const color = SUIT_COLORS[card.suit];
  const symbol = SUIT_SYMBOLS[card.suit];
  const label = RANK_LABELS[card.rank];

  return (
    <View
      style={[
        styles.card,
        { width: s.width, height: s.height, borderRadius: s.radius },
        styles.face,
        dimmed && styles.dimmed,
        highlight && styles.highlight,
        selected && styles.selected,
        style,
      ]}
    >
      <View style={styles.cornerTopLeft}>
        <Text style={{ fontSize: s.corner, color, fontFamily: 'Inter-Bold' }}>{label}</Text>
        <Text style={{ fontSize: s.corner - 2, color, fontFamily: 'Inter-Regular' }}>{symbol}</Text>
      </View>
      <Text style={{ fontSize: s.font, color, fontFamily: 'Inter-Regular' }}>{symbol}</Text>
      <View style={styles.cornerBottomRight}>
        <Text style={{ fontSize: s.corner, color, fontFamily: 'Inter-Bold' }}>{label}</Text>
        <Text style={{ fontSize: s.corner - 2, color, fontFamily: 'Inter-Regular' }}>{symbol}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  face: {
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#C0C0C0',
  },
  back: {
    backgroundColor: '#5C1A1A',
    borderWidth: 1.5,
    borderColor: '#3D0F0F',
  },
  backPattern: {
    width: '78%',
    height: '82%',
    backgroundColor: '#7A2424',
    borderWidth: 1.5,
    borderColor: '#9A3030',
  },
  dimmed: { opacity: 0.45 },
  highlight: {
    borderColor: '#F4A261',
    borderWidth: 2.5,
    elevation: 5,
    shadowOpacity: 0.35,
  },
  selected: {
    borderColor: '#F4D03F',
    borderWidth: 3,
    elevation: 6,
    shadowColor: '#F4D03F',
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 3,
    left: 3,
    alignItems: 'center',
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    alignItems: 'center',
    transform: [{ rotate: '180deg' }],
  },
});
