import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Card } from '@/lib/hokm/types';
import { CardView } from './CardView';

interface PartnerDealProps {
  partnerName: string;
  partnerHand: Card[];
  onConfirm: (hand: Card[]) => void;
}

/**
 * The shuffler views their partner's 5-card hand and can reorder
 * which cards the partner keeps. They tap to select the order,
 * then confirm to transfer the hand.
 */
export function PartnerDealProps_({ partnerName, partnerHand, onConfirm }: PartnerDealProps) {
  const [hand, setHand] = useState<Card[]>(partnerHand);
  const [selected, setSelected] = useState<number[]>([]);

  const toggleSelect = (index: number) => {
    if (selected.includes(index)) {
      setSelected(selected.filter((i) => i !== index));
    } else {
      setSelected([...selected, index]);
    }
  };

  const handleConfirm = () => {
    onConfirm(hand);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Partner's Hand</Text>
      <Text style={styles.subtitle}>
        {partnerName}'s first 5 cards. Tap to arrange, then confirm to hand them over.
      </Text>

      <View style={styles.cardsRow}>
        {hand.map((card, i) => (
          <TouchableOpacity key={card.id} onPress={() => toggleSelect(i)} activeOpacity={0.7}>
            <CardView card={card} size="large" selected={selected.includes(i)} />
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.hint}>
        The remaining cards will be dealt to everyone after you confirm.
      </Text>

      <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
        <Text style={styles.confirmBtnText}>Confirm & Deal Remaining</Text>
      </TouchableOpacity>
    </View>
  );
}

export const PartnerDeal = PartnerDealProps_;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(10, 26, 46, 0.95)',
  },
  title: { fontFamily: 'Inter-Bold', fontSize: 22, fontWeight: '700', color: '#FFFFFF', marginBottom: 6 },
  subtitle: { fontFamily: 'Inter-Regular', fontSize: 13, color: '#AABBCC', textAlign: 'center', marginBottom: 24, lineHeight: 19 },
  cardsRow: { flexDirection: 'row', gap: 8, justifyContent: 'center', flexWrap: 'wrap' },
  hint: { fontFamily: 'Inter-Regular', fontSize: 12, color: '#888', textAlign: 'center', marginTop: 20, marginBottom: 20, lineHeight: 17 },
  confirmBtn: {
    backgroundColor: '#F4A261',
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingVertical: 12,
    elevation: 4,
  },
  confirmBtnText: { fontFamily: 'Inter-Bold', fontSize: 16, fontWeight: '700', color: '#1D3557' },
});
