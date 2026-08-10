import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RoomState } from '@/lib/hokm/types';
import { SUIT_SYMBOLS, SUIT_COLORS, HOKM_LABELS, TARGET_TRICKS } from '@/lib/hokm/deck';
import { isSuitHokm } from '@/lib/hokm/types';

interface ScoreboardProps {
  room: RoomState;
}

export function Scoreboard({ room }: ScoreboardProps) {
  const hokmLabel = room.hokm_type ? HOKM_LABELS[room.hokm_type] : '—';
  const hokmColor = isSuitHokm(room.hokm_type) ? SUIT_COLORS[room.hokm_type] : '#F4A261';

  return (
    <View style={styles.container}>
      <View style={styles.teamBox}>
        <Text style={styles.teamLabel}>Team 1</Text>
        <Text style={styles.trickScore}>
          {room.team1_tricks}<Text style={styles.divider}>/</Text>{TARGET_TRICKS}
        </Text>
        <View style={styles.pipsRow}>
          {Array.from({ length: TARGET_TRICKS }).map((_, i) => (
            <View key={i} style={[styles.pip, i < room.team1_tricks && styles.pip1]} />
          ))}
        </View>
      </View>

      <View style={styles.centerInfo}>
        <Text style={styles.hokmLabel}>Hokm</Text>
        <Text style={[styles.hokmValue, { color: hokmColor }]}>{hokmLabel}</Text>
        <Text style={styles.gameScore}>Games {room.team1_games} - {room.team2_games}</Text>
        <Text style={styles.handCount}>Trick {Math.min(room.trick_count + 1, 13)}</Text>
      </View>

      <View style={styles.teamBox}>
        <Text style={styles.teamLabel}>Team 2</Text>
        <Text style={styles.trickScore}>
          {room.team2_tricks}<Text style={styles.divider}>/</Text>{TARGET_TRICKS}
        </Text>
        <View style={styles.pipsRow}>
          {Array.from({ length: TARGET_TRICKS }).map((_, i) => (
            <View key={i} style={[styles.pip, i < room.team2_tricks && styles.pip2]} />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(15, 31, 61, 0.92)',
    borderRadius: 14,
    marginHorizontal: 8,
    marginTop: 6,
  },
  teamBox: { alignItems: 'center', flex: 1 },
  teamLabel: {
    fontFamily: 'Inter-Bold',
    fontSize: 10,
    fontWeight: '700',
    color: '#AABBCC',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  trickScore: {
    fontFamily: 'Inter-Bold',
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginVertical: 1,
  },
  divider: { color: '#6A7A8A', fontSize: 16 },
  pipsRow: { flexDirection: 'row', gap: 3, marginTop: 1, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 84 },
  pip: { width: 7, height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.2)', margin: 1 },
  pip1: { backgroundColor: '#2D6A4F' },
  pip2: { backgroundColor: '#E63946' },
  centerInfo: { alignItems: 'center', flex: 1.2 },
  hokmLabel: {
    fontFamily: 'Inter-Bold',
    fontSize: 9,
    fontWeight: '700',
    color: '#AABBCC',
    textTransform: 'uppercase',
  },
  hokmValue: { fontSize: 16, fontFamily: 'Inter-Bold', fontWeight: '700', marginVertical: 1 },
  gameScore: { fontFamily: 'Inter-Regular', fontSize: 10, color: '#AABBCC' },
  handCount: { fontFamily: 'Inter-Regular', fontSize: 10, color: '#8A9BB0' },
});
