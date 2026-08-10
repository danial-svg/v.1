import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Send, X } from 'lucide-react-native';
import { useChat } from '@/hooks/useChat';
import { ChatMessage } from './ChatMessage';

interface ChatPanelProps {
  roomId: string;
  playerName: string;
  playerSeat: number;
  onClose?: () => void;
}

export function ChatPanel({ roomId, playerName, playerSeat, onClose }: ChatPanelProps) {
  const { messages, loading, sending, error, sendMessage } = useChat(roomId, playerName, playerSeat);
  const [input, setInput] = useState('');
  const listRef = useRef<FlatList>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    }
  }, [messages.length]);

  const handleSend = useCallback(() => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  }, [input, sendMessage]);

  const renderItem = ({ item }: { item: import('@/hooks/useChat').ChatMessageData }) => (
    <ChatMessage message={item} isMe={item.player_seat === playerSeat} />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Game Chat</Text>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X color="#FFF" size={20} />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator color="#264470" />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator
        />
      )}

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.inputWrap}
      >
        <TextInput
          style={styles.input}
          placeholder="Type a message…"
          placeholderTextColor="#999"
          value={input}
          onChangeText={setInput}
          maxLength={300}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!input.trim() || sending}
        >
          {sending ? <ActivityIndicator color="#FFF" size="small" /> : <Send color="#FFF" size={20} />}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#0F1F3D',
    borderBottomWidth: 1,
    borderBottomColor: '#1A2F4D',
  },
  title: { fontFamily: 'Inter-Bold', fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  closeBtn: { padding: 4 },
  listContent: { padding: 12, flexGrow: 1, justifyContent: 'flex-end' },
  centerState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#E63946',
    paddingHorizontal: 12,
    paddingVertical: 4,
    textAlign: 'center',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderColor: '#D0D0D0',
  },
  input: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: 'Inter-Regular',
    color: '#1D3557',
    borderWidth: 1,
    borderColor: '#D0D0D0',
    maxHeight: 80,
  },
  sendBtn: {
    backgroundColor: '#264470',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  sendBtnDisabled: { backgroundColor: '#A0A0A0' },
});
