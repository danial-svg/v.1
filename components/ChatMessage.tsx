import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ChatMessageData } from '@/hooks/useChat';

interface ChatMessageProps {
  message: ChatMessageData;
  isMe?: boolean;
}

const SEAT_COLORS = ['#264470', '#6A040F', '#2D6A4F', '#7D4F1A'];

export function ChatMessage({ message, isMe = false }: ChatMessageProps) {
  const seatColor = SEAT_COLORS[message.player_seat] ?? '#264470';
  return (
    <View style={[styles.row, isMe && styles.rowMe]}>
      <View style={[styles.bubble, isMe && styles.bubbleMe]}>
        <View style={styles.header}>
          <Text style={[styles.name, { color: isMe ? '#FFD700' : seatColor }]}>
            {message.player_name}
          </Text>
          <Text style={styles.seat}>Seat {message.player_seat + 1}</Text>
        </View>
        <Text style={[styles.text, isMe && styles.textMe]}>{message.text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', marginBottom: 8, paddingHorizontal: 4 },
  rowMe: { justifyContent: 'flex-end' },
  bubble: {
    maxWidth: '82%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  bubbleMe: { backgroundColor: '#264470', borderColor: '#1D3557' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  name: { fontFamily: 'Inter-Bold', fontSize: 12, fontWeight: '700' },
  seat: { fontFamily: 'Inter-Regular', fontSize: 10, color: '#999' },
  text: { fontFamily: 'Inter-Regular', fontSize: 15, color: '#1D3557', lineHeight: 20 },
  textMe: { color: '#FFFFFF' },
});
