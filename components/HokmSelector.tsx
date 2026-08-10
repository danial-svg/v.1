import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { HOKM_TYPES } from '@/lib/hokm/deck';
import { HokmType } from '@/lib/hokm/types';

interface HokmSelectorProps {
  visible: boolean;
  hakimName: string;
  onChoose: (hokm: HokmType) => void;
}

export function HokmSelector({ visible, hakimName, onChoose }: HokmSelectorProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Declare the Hokm</Text>
          <Text style={styles.subtitle}>
            {hakimName}, choose the trump type for this hand.
          </Text>
          <ScrollView style={styles.scroll} contentContainerStyle={styles.suitRow}>
            {HOKM_TYPES.map((h) => (
              <TouchableOpacity
                key={h.value}
                style={styles.suitBtn}
                onPress={() => onChoose(h.value)}
                activeOpacity={0.7}
              >
                <Text style={[styles.suitSymbol, { color: h.color }]}>{h.symbol}</Text>
                <Text style={styles.suitName}>{h.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={styles.hint}>
            Suits set a trump. Saras, Naras & Tek Naras have no trump — off-suit cards are Pooch.
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FAFAFA',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  title: { fontFamily: 'Inter-Bold', fontSize: 22, fontWeight: '700', color: '#1D3557', marginBottom: 6 },
  subtitle: { fontFamily: 'Inter-Regular', fontSize: 13, color: '#555', textAlign: 'center', marginBottom: 18, lineHeight: 19 },
  scroll: { maxHeight: 280 },
  suitRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  suitBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    width: 92,
    height: 84,
    borderWidth: 2,
    borderColor: '#D0D0D0',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
  },
  suitSymbol: { fontSize: 32, marginBottom: 4 },
  suitName: { fontFamily: 'Inter-Bold', fontSize: 12, fontWeight: '700', color: '#1D3557' },
  hint: { fontFamily: 'Inter-Regular', fontSize: 11, color: '#888', textAlign: 'center', marginTop: 16, lineHeight: 16 },
});
