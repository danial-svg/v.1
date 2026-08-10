import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface ChatMessageData {
  id: string;
  room_id: string;
  player_name: string;
  player_seat: number;
  text: string;
  created_at: string;
}

const POLL_MS = 2000;

export function useChat(roomId: string, playerName: string, playerSeat: number) {
  const [messages, setMessages] = useState<ChatMessageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setError('Chat is not configured.');
      setLoading(false);
      return;
    }
    try {
      const { data, error: err } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true })
        .limit(200);
      if (err) throw err;
      if (data) setMessages(data as ChatMessageData[]);
      setError(null);
    } catch {
      setError('Could not load messages.');
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, POLL_MS);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending || !isSupabaseConfigured) return;
    setSending(true);
    try {
      const { error: err } = await supabase.from('chat_messages').insert({
        room_id: roomId,
        player_name: playerName,
        player_seat: playerSeat,
        text: trimmed,
      });
      if (err) throw err;
      setError(null);
      fetchMessages();
    } catch {
      setError('Failed to send message.');
    } finally {
      setSending(false);
    }
  }, [roomId, playerName, playerSeat, sending, fetchMessages]);

  return { messages, loading, sending, error, sendMessage };
}
