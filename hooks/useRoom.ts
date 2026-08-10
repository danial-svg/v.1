import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { RoomState, Seat } from '@/lib/hokm/types';
import {
  createRoom,
  joinRoom,
  swapSeats,
  startGame,
  completeShuffle,
  declareHokm,
  completePartnerDeal,
  playCard,
  advanceFromTrickEnd,
  autoPlay,
  nextDeal,
} from '@/lib/hokm/engine';

const POLL_MS = 1500;

interface UseRoomResult {
  room: RoomState | null;
  mySeat: Seat | null;
  loading: boolean;
  error: string | null;
  isHost: boolean;
  refresh: () => Promise<void>;
  doSwapSeats: (a: Seat, b: Seat) => Promise<void>;
  doStartGame: () => Promise<void>;
  doCompleteShuffle: (quality: number) => Promise<void>;
  doDeclareHokm: (hokm: import('@/lib/hokm/types').HokmType) => Promise<void>;
  doCompletePartnerDeal: (partnerHand: import('@/lib/hokm/types').Card[]) => Promise<void>;
  doPlayCard: (card: import('@/lib/hokm/types').Card) => Promise<void>;
  doAdvanceTrick: () => Promise<void>;
  doAutoPlay: () => Promise<void>;
  doNextDeal: () => Promise<void>;
}

export function useRoom(roomNumber: string, playerName: string): UseRoomResult {
  const [room, setRoom] = useState<RoomState | null>(null);
  const [mySeat, setMySeat] = useState<Seat | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mySeatRef = useRef<Seat | null>(null);

  const fetchRoom = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setError('Database is not configured. Check Supabase settings.');
      setLoading(false);
      return;
    }
    try {
      const { data, error: err } = await supabase
        .from('rooms')
        .select('*')
        .eq('room_number', roomNumber)
        .maybeSingle();
      if (err) throw err;
      if (data) {
        setRoom(data as RoomState);
      }
      setError(null);
    } catch (e: any) {
      setError('Could not connect to room.');
    } finally {
      setLoading(false);
    }
  }, [roomNumber]);

  // Join or create room on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isSupabaseConfigured) {
        setError('Database is not configured.');
        setLoading(false);
        return;
      }
      try {
        // Try to fetch existing room
        const { data: existing, error: fetchErr } = await supabase
          .from('rooms')
          .select('*')
          .eq('room_number', roomNumber)
          .maybeSingle();
        if (fetchErr) throw fetchErr;

        if (existing) {
          // Join existing room
          const roomState = existing as RoomState;
          // Check if already in a seat (reconnect)
          let foundSeat: Seat | null = null;
          for (let i = 0; i < 4; i++) {
            if (roomState.seats[i]?.name === playerName) {
              foundSeat = i as Seat;
              break;
            }
          }
          if (foundSeat === null) {
            // Join first open seat
            let joined = false;
            for (let i = 0; i < 4; i++) {
              if (!roomState.seats[i]?.name) {
                roomState.seats[i] = { name: playerName, connected: true };
                foundSeat = i as Seat;
                joined = true;
                break;
              }
            }
            if (!joined) {
              setError('Room is full (4/4 players).');
              setLoading(false);
              return;
            }
            // Update room with new seat
            const { error: updateErr } = await supabase
              .from('rooms')
              .update({ seats: roomState.seats, updated_at: new Date().toISOString() })
              .eq('room_number', roomNumber);
            if (updateErr) throw updateErr;
          } else {
            // Reconnect: mark connected
            roomState.seats[foundSeat] = { ...roomState.seats[foundSeat], connected: true };
            const { error: updateErr } = await supabase
              .from('rooms')
              .update({ seats: roomState.seats, updated_at: new Date().toISOString() })
              .eq('room_number', roomNumber);
            if (updateErr) throw updateErr;
          }
          if (!cancelled) {
            setRoom(roomState);
            setMySeat(foundSeat);
            mySeatRef.current = foundSeat;
          }
        } else {
          // Create new room as host
          const newRoom = createRoom(roomNumber, playerName);
          const { error: insertErr } = await supabase
            .from('rooms')
            .insert(newRoom);
          if (insertErr) throw insertErr;
          if (!cancelled) {
            setRoom(newRoom);
            setMySeat(0);
            mySeatRef.current = 0;
          }
        }
        setError(null);
      } catch (e: any) {
        if (!cancelled) setError('Could not join room.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [roomNumber, playerName]);

  // Poll for room state
  useEffect(() => {
    const interval = setInterval(fetchRoom, POLL_MS);
    return () => clearInterval(interval);
  }, [fetchRoom]);

  const updateRoom = useCallback(async (mutator: (state: RoomState) => void) => {
    if (!isSupabaseConfigured) return;
    try {
      const { data, error: err } = await supabase
        .from('rooms')
        .select('*')
        .eq('room_number', roomNumber)
        .maybeSingle();
      if (err || !data) return;
      const state = data as RoomState;
      mutator(state);
      state.updated_at = new Date().toISOString();
      const { error: updateErr } = await supabase
        .from('rooms')
        .update(state)
        .eq('room_number', roomNumber);
      if (updateErr) throw updateErr;
      setRoom(state);
    } catch (e: any) {
      setError('Failed to update room.');
    }
  }, [roomNumber]);

  const doSwapSeats = useCallback((a: Seat, b: Seat) =>
    updateRoom((s) => swapSeats(s, a, b)), [updateRoom]);

  const doStartGame = useCallback(() =>
    updateRoom((s) => startGame(s)), [updateRoom]);

  const doCompleteShuffle = useCallback((quality: number) =>
    updateRoom((s) => completeShuffle(s, quality)), [updateRoom]);

  const doDeclareHokm = useCallback((hokm: import('@/lib/hokm/types').HokmType) =>
    updateRoom((s) => declareHokm(s, hokm)), [updateRoom]);

  const doCompletePartnerDeal = useCallback((partnerHand: import('@/lib/hokm/types').Card[]) =>
    updateRoom((s) => completePartnerDeal(s, partnerHand)), [updateRoom]);

  const doPlayCard = useCallback((card: import('@/lib/hokm/types').Card) =>
    updateRoom((s) => {
      const seat = mySeatRef.current;
      if (seat === null) return;
      try { playCard(s, seat, card); } catch {}
    }), [updateRoom]);

  const doAdvanceTrick = useCallback(() =>
    updateRoom((s) => advanceFromTrickEnd(s)), [updateRoom]);

  const doAutoPlay = useCallback(() =>
    updateRoom((s) => autoPlay(s)), [updateRoom]);

  const doNextDeal = useCallback(() =>
    updateRoom((s) => nextDeal(s)), [updateRoom]);

  return {
    room,
    mySeat,
    loading,
    error,
    isHost: mySeat !== null && room !== null && room.host_seat === mySeat,
    refresh: fetchRoom,
    doSwapSeats,
    doStartGame,
    doCompleteShuffle,
    doDeclareHokm,
    doCompletePartnerDeal,
    doPlayCard,
    doAdvanceTrick,
    doAutoPlay,
    doNextDeal,
  };
}
