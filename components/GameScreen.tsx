import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Dimensions,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MessageSquare, Crown, Users, Play, LogOut, RotateCcw } from 'lucide-react-native';
import { useRoom } from '@/hooks/useRoom';
import { RoomState, Seat, Card as CardType, HokmType } from '@/lib/hokm/types';
import { SEAT_NAMES, HOKM_LABELS, teammate, nextSeatCCW } from '@/lib/hokm/deck';
import { isSuitHokm } from '@/lib/hokm/types';
import { TURN_DURATION_MS } from '@/lib/hokm/engine';
import { CardView } from '@/components/CardView';
import { DraggableCard } from '@/components/DraggableCard';
import { Scoreboard } from '@/components/Scoreboard';
import { HokmSelector } from '@/components/HokmSelector';
import { ShuffleBar } from '@/components/ShuffleBar';
import { PartnerDeal } from '@/components/PartnerDeal';
import { TurnTimer } from '@/components/TurnTimer';
import { ChatPanel } from '@/components/ChatPanel';

interface GameScreenProps {
  roomNumber: string;
  playerName: string;
  onExit: () => void;
}

export function GameScreen({ roomNumber, playerName, onExit }: GameScreenProps) {
  const {
    room, mySeat, loading, error, isHost,
    doSwapSeats, doStartGame, doCompleteShuffle, doDeclareHokm,
    doCompletePartnerDeal, doPlayCard, doAdvanceTrick, doAutoPlay, doNextDeal,
  } = useRoom(roomNumber, playerName);

  const [chatVisible, setChatVisible] = useState(false);

  if (loading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#F4A261" />
        <Text style={styles.loadingText}>Joining room…</Text>
      </View>
    );
  }

  if (error && !room) {
    return (
      <View style={styles.loadingScreen}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.exitBtn} onPress={onExit}>
          <Text style={styles.exitBtnText}>Back to Menu</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!room || mySeat === null) {
    return (
      <View style={styles.loadingScreen}>
        <Text style={styles.loadingText}>Connecting…</Text>
        <TouchableOpacity style={styles.exitBtn} onPress={onExit}>
          <Text style={styles.exitBtnText}>Back to Menu</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const playerCount = room.seats.filter((s) => s.name).length;

  // Waiting room
  if (room.phase === 'waiting') {
    return (
      <WaitingRoom
        room={room}
        mySeat={mySeat}
        isHost={isHost}
        playerCount={playerCount}
        onSwap={doSwapSeats}
        onStart={doStartGame}
        onExit={onExit}
      />
    );
  }

  // Shuffle phase
  if (room.phase === 'shuffle') {
    return (
      <View style={styles.phaseScreen}>
        <Scoreboard room={room} />
        {mySeat === room.shuffler_seat ? (
          <ShuffleBar
            shufflerName={room.seats[room.shuffler_seat].name || 'Shuffler'}
            onComplete={doCompleteShuffle}
          />
        ) : (
          <View style={styles.waitingPhase}>
            <Text style={styles.phaseTitle}>Shuffling…</Text>
            <Text style={styles.phaseSubtitle}>
              Waiting for {room.seats[room.shuffler_seat].name} to shuffle the cards.
            </Text>
            <ActivityIndicator color="#F4A261" size="large" style={{ marginTop: 20 }} />
          </View>
        )}
      </View>
    );
  }

  // Hokm declaration phase
  if (room.phase === 'hokm') {
    return (
      <View style={styles.phaseScreen}>
        <Scoreboard room={room} />
        <View style={styles.hokmPhaseContent}>
          {mySeat === room.hakim_seat ? (
            <>
              <Text style={styles.phaseTitle}>You are the Hakim!</Text>
              <Text style={styles.phaseSubtitle}>Your 5-card hand:</Text>
              <View style={styles.hakimHandRow}>
                {room.hands[room.hakim_seat].map((card) => (
                  <CardView key={card.id} card={card} size="large" />
                ))}
              </View>
              <HokmSelector
                visible={true}
                hakimName={room.seats[room.hakim_seat].name || 'Hakim'}
                onChoose={doDeclareHokm}
              />
            </>
          ) : (
            <View style={styles.waitingPhase}>
              <Text style={styles.phaseTitle}>Declaring Hokm…</Text>
              <Text style={styles.phaseSubtitle}>
                Waiting for {room.seats[room.hakim_seat].name} to declare the Hokm.
              </Text>
              <ActivityIndicator color="#F4A261" size="large" style={{ marginTop: 20 }} />
            </View>
          )}
        </View>
      </View>
    );
  }

  // Partner deal phase
  if (room.phase === 'partner_deal') {
    const partner = teammate(room.shuffler_seat);
    const partnerHand = room.partner_hands?.[0] || [];
    return (
      <View style={styles.phaseScreen}>
        <Scoreboard room={room} />
        {mySeat === room.shuffler_seat ? (
          <PartnerDeal
            partnerName={room.seats[partner].name || 'Partner'}
            partnerHand={partnerHand}
            onConfirm={doCompletePartnerDeal}
          />
        ) : (
          <View style={styles.waitingPhase}>
            <Text style={styles.phaseTitle}>Partner Hand Exchange</Text>
            <Text style={styles.phaseSubtitle}>
              {room.seats[room.shuffler_seat].name} is arranging {room.seats[partner].name}'s hand.
            </Text>
            <ActivityIndicator color="#F4A261" size="large" style={{ marginTop: 20 }} />
          </View>
        )}
      </View>
    );
  }

  // Playing / trickEnd / gameOver — the main table view
  return (
    <GameTable
      room={room}
      mySeat={mySeat}
      onPlayCard={doPlayCard}
      onAdvanceTrick={doAdvanceTrick}
      onAutoPlay={doAutoPlay}
      onNextDeal={doNextDeal}
      onOpenChat={() => setChatVisible(true)}
      onExit={onExit}
      roomNumber={roomNumber}
      playerName={playerName}
    >
      <Modal visible={chatVisible} animationType="slide" presentationStyle="pageSheet">
        <ChatPanel
          roomId={roomNumber}
          playerName={playerName}
          playerSeat={mySeat}
          onClose={() => setChatVisible(false)}
        />
      </Modal>
    </GameTable>
  );
}

// ===== Waiting Room =====

interface WaitingRoomProps {
  room: RoomState;
  mySeat: Seat;
  isHost: boolean;
  playerCount: number;
  onSwap: (a: Seat, b: Seat) => void;
  onStart: () => void;
  onExit: () => void;
}

function WaitingRoom({ room, mySeat, isHost, playerCount, onSwap, onStart, onExit }: WaitingRoomProps) {
  return (
    <LinearGradient colors={['#3D0F0F', '#5C1A1A', '#3D0F0F']} style={styles.waitingScreen}>
      <View style={styles.waitingHeader}>
        <View>
          <Text style={styles.waitingTitle}>Room {room.room_number}</Text>
          <Text style={styles.waitingSubtitle}>{playerCount}/4 players joined</Text>
        </View>
        <TouchableOpacity onPress={onExit} style={styles.exitIconBtn}>
          <LogOut color="#FFF" size={20} />
        </TouchableOpacity>
      </View>

      <View style={styles.seatsGrid}>
        {room.seats.map((seat, i) => {
          const isHostSeat = i === room.host_seat;
          return (
            <View key={i} style={[styles.seatCard, i === mySeat && styles.seatCardMe]}>
              <View style={styles.seatCardHeader}>
                <Text style={styles.seatCardLabel}>Seat {i + 1}</Text>
                {isHostSeat && <Crown color="#F4D03F" size={16} />}
              </View>
              <Text style={styles.seatCardName}>{seat.name || 'Empty'}</Text>
              {isHost && i !== mySeat && seat.name && (
                <TouchableOpacity
                  style={styles.swapBtn}
                  onPress={() => onSwap(mySeat as Seat, i as Seat)}
                >
                  <Text style={styles.swapBtnText}>Swap with me</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </View>

      <View style={styles.waitingInfo}>
        <Users color="#AABBCC" size={20} />
        <Text style={styles.waitingInfoText}>
          {playerCount < 4
            ? 'Waiting for more players to join…'
            : 'All seats filled! Host can start the game.'}
        </Text>
      </View>

      {isHost && playerCount >= 2 && (
        <TouchableOpacity style={styles.startBtn} onPress={onStart}>
          <Play color="#1D3557" size={22} />
          <Text style={styles.startBtnText}>Start Game</Text>
        </TouchableOpacity>
      )}
      {isHost && playerCount < 2 && (
        <Text style={styles.waitingHint}>Need at least 2 players to start.</Text>
      )}
      {!isHost && (
        <Text style={styles.waitingHint}>Waiting for the host to start the game.</Text>
      )}
    </LinearGradient>
  );
}

// ===== Game Table =====

interface GameTableProps {
  room: RoomState;
  mySeat: Seat;
  onPlayCard: (card: CardType) => void;
  onAdvanceTrick: () => void;
  onAutoPlay: () => void;
  onNextDeal: () => void;
  onOpenChat: () => void;
  onExit: () => void;
  roomNumber: string;
  playerName: string;
  children?: React.ReactNode;
}

function GameTable({
  room, mySeat, onPlayCard, onAdvanceTrick, onAutoPlay, onNextDeal, onOpenChat, onExit, children,
}: GameTableProps) {
  // Auto-advance from trickEnd
  useEffect(() => {
    if (room.phase === 'trickEnd') {
      const t = setTimeout(() => onAdvanceTrick(), 1500);
      return () => clearTimeout(t);
    }
  }, [room.phase, room.trick_count, onAdvanceTrick]);

  // Turn timer auto-play
  const isMyTurn = room.phase === 'playing' && room.current_seat === mySeat;
  const handleTimeout = useCallback(() => {
    onAutoPlay();
  }, [onAutoPlay]);

  const isGameOver = room.phase === 'gameOver';

  return (
    <View style={styles.tableScreen}>
      {/* Red-brown outer border environment */}
      <LinearGradient colors={['#5C1A1A', '#3D0F0F', '#5C1A1A']} style={styles.outerBorder} />

      {/* Scoreboard at top */}
      <View style={styles.scoreboardWrap}>
        <Scoreboard room={room} />
      </View>

      {/* Oval table */}
      <View style={styles.tableArea}>
        <View style={styles.ovalTable} />

        {/* North seat (partner) */}
        <SeatView
          seat={2}
          name={room.seats[2].name}
          cardCount={room.hands[2]?.length || 0}
          isTurn={room.current_seat === 2 && room.phase === 'playing'}
          position="top"
          isMe={mySeat === 2}
        />

        {/* West seat */}
        <SeatView
          seat={1}
          name={room.seats[1].name}
          cardCount={room.hands[1]?.length || 0}
          isTurn={room.current_seat === 1 && room.phase === 'playing'}
          position="left"
          isMe={mySeat === 1}
        />

        {/* East seat */}
        <SeatView
          seat={3}
          name={room.seats[3].name}
          cardCount={room.hands[3]?.length || 0}
          isTurn={room.current_seat === 3 && room.phase === 'playing'}
          position="right"
          isMe={mySeat === 3}
        />

        {/* Center trick area */}
        <TrickArea room={room} />

        {/* Status text */}
        <StatusText room={room} mySeat={mySeat} />
      </View>

      {/* Player's hand (bottom) */}
      <View style={styles.handArea}>
        {room.phase === 'playing' && room.hands[mySeat]?.map((card, i) => (
          <DraggableCard
            key={card.id}
            card={card}
            index={i}
            totalCards={room.hands[mySeat].length}
            isMyTurn={isMyTurn}
            leadSuit={room.lead_suit}
            hand={room.hands[mySeat]}
            onPlay={onPlayCard}
          />
        ))}
      </View>

      {/* Turn timer for current player */}
      {room.phase === 'playing' && (
        <View style={styles.timerWrap}>
          <TurnTimer
            active={isMyTurn}
            durationMs={TURN_DURATION_MS}
            onTimeout={handleTimeout}
          />
        </View>
      )}

      {/* Bottom-left chat icon */}
      <TouchableOpacity style={styles.chatIcon} onPress={onOpenChat}>
        <LinearGradient colors={['#F4D03F', '#FFFFFF']} style={styles.chatIconGradient}>
          <MessageSquare color="#1D3557" size={24} />
        </LinearGradient>
      </TouchableOpacity>

      {/* Exit button */}
      <TouchableOpacity style={styles.exitBtnSmall} onPress={onExit}>
        <LogOut color="#FFF" size={18} />
      </TouchableOpacity>

      {/* Game over overlay */}
      {isGameOver && (
        <View style={styles.gameOverOverlay}>
          <View style={styles.gameOverCard}>
            <Text style={styles.gameOverTitle}>
              {room.team1_tricks >= 7 ? 'Team 1 Wins!' : 'Team 2 Wins!'}
            </Text>
            <Text style={styles.gameOverScore}>
              {room.team1_tricks} - {room.team2_tricks} tricks
            </Text>
            <Text style={styles.gameOverGames}>
              Match: {room.team1_games} - {room.team2_games}
            </Text>
            <TouchableOpacity style={styles.nextDealBtn} onPress={onNextDeal}>
              <RotateCcw color="#1D3557" size={20} />
              <Text style={styles.nextDealBtnText}>Next Deal</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {children}
    </View>
  );
}

// ===== Seat View =====

interface SeatViewProps {
  seat: Seat;
  name: string | null;
  cardCount: number;
  isTurn: boolean;
  position: 'top' | 'left' | 'right';
  isMe: boolean;
}

function SeatView({ name, cardCount, isTurn, position, isMe }: SeatViewProps) {
  const cards = Array.from({ length: Math.min(cardCount, 5) });

  return (
    <View style={[styles.seatWrap, getSeatPosition(position)]}>
      <View style={[styles.seatInfo, isTurn && styles.seatInfoActive]}>
        <Text style={[styles.seatName, isTurn && styles.seatNameActive]}>{name || 'Empty'}</Text>
        {isMe && <Text style={styles.seatMeTag}>You</Text>}
      </View>
      <View style={styles.seatCards}>
        {cards.map((_, i) => (
          <CardView key={i} faceDown size="xs" style={styles.tableSeatCard} />
        ))}
        {cardCount > 5 && <Text style={styles.cardCount}>+{cardCount - 5}</Text>}
      </View>
    </View>
  );
}

function getSeatPosition(pos: string): any {
  if (pos === 'top') return styles.seat_top;
  if (pos === 'left') return styles.seat_left;
  return styles.seat_right;
}

// ===== Trick Area =====

function TrickArea({ room }: { room: RoomState }) {
  const positions: Record<Seat, any> = {
    0: { bottom: 6 },
    1: { left: 6 },
    2: { top: 6 },
    3: { right: 6 },
  };

  return (
    <View style={styles.trickArea}>
      {room.current_trick.length === 0 && room.phase === 'playing' && (
        <Text style={styles.trickHint}>
          {room.current_seat === 0 ? 'Your turn — drag a card up' : 'Waiting…'}
        </Text>
      )}
      {room.current_trick.map((play) => (
        <View key={play.card.id} style={[styles.trickCard, positions[play.seat]]}>
          <CardView
            card={play.card}
            size="medium"
            highlight={room.phase === 'trickEnd' && room.last_trick_winner === play.seat}
          />
        </View>
      ))}
    </View>
  );
}

// ===== Status Text =====

function StatusText({ room, mySeat }: { room: RoomState; mySeat: Seat }) {
  let text = '';
  if (room.phase === 'playing') {
    if (room.current_seat === mySeat) {
      text = room.lead_suit ? 'Follow suit or play' : 'Lead the trick';
    } else {
      text = `${room.seats[room.current_seat]?.name || 'Player'}'s turn`;
    }
  } else if (room.phase === 'trickEnd' && room.last_trick_winner !== null) {
    text = `${room.seats[room.last_trick_winner]?.name} wins!`;
  }
  if (!text) return null;
  return (
    <View style={styles.statusWrap}>
      <Text style={styles.statusText}>{text}</Text>
    </View>
  );
}

// ===== Styles =====

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A1A2E',
    gap: 16,
  },
  loadingText: { fontFamily: 'Inter-Regular', fontSize: 16, color: '#AABBCC' },
  errorText: { fontFamily: 'Inter-Regular', fontSize: 16, color: '#E63946', textAlign: 'center', paddingHorizontal: 24 },
  exitBtn: {
    backgroundColor: '#264470',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  exitBtnText: { fontFamily: 'Inter-Bold', fontSize: 14, fontWeight: '700', color: '#FFF' },

  // Phase screens
  phaseScreen: { flex: 1, backgroundColor: '#0A1A2E' },
  waitingPhase: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  phaseTitle: { fontFamily: 'Inter-Bold', fontSize: 24, fontWeight: '700', color: '#FFF', marginBottom: 8 },
  phaseSubtitle: { fontFamily: 'Inter-Regular', fontSize: 14, color: '#AABBCC', textAlign: 'center', lineHeight: 20 },
  hokmPhaseContent: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 },
  hakimHandRow: { flexDirection: 'row', gap: 8, marginVertical: 24, flexWrap: 'wrap', justifyContent: 'center' },

  // Waiting room
  waitingScreen: { flex: 1, paddingTop: 60, paddingHorizontal: 20 },
  waitingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  waitingTitle: { fontFamily: 'Inter-Bold', fontSize: 28, fontWeight: '700', color: '#FFF' },
  waitingSubtitle: { fontFamily: 'Inter-Regular', fontSize: 14, color: '#D0C0C0', marginTop: 4 },
  exitIconBtn: { padding: 8 },
  seatsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  seatCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    padding: 16,
    width: 150,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  seatCardMe: { borderColor: '#F4D03F', backgroundColor: 'rgba(244,208,63,0.15)' },
  seatCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  seatCardLabel: { fontFamily: 'Inter-Bold', fontSize: 11, fontWeight: '700', color: '#D0C0C0', textTransform: 'uppercase' },
  seatCardName: { fontFamily: 'Inter-Bold', fontSize: 18, fontWeight: '700', color: '#FFF' },
  lobbySeatCard: { marginHorizontal: 0 },
  swapBtn: { marginTop: 8, backgroundColor: 'rgba(244,162,97,0.3)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 6 },
  swapBtnText: { fontFamily: 'Inter-Bold', fontSize: 11, fontWeight: '700', color: '#F4A261' },
  waitingInfo: { flexDirection: 'row', alignItems: 'center', gap: 10, justifyContent: 'center', marginTop: 32, marginBottom: 24 },
  waitingInfoText: { fontFamily: 'Inter-Regular', fontSize: 14, color: '#D0C0C0' },
  startBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#F4A261', borderRadius: 28, paddingHorizontal: 32, paddingVertical: 14,
    alignSelf: 'center', elevation: 5,
  },
  startBtnText: { fontFamily: 'Inter-Bold', fontSize: 18, fontWeight: '700', color: '#1D3557' },
  waitingHint: { fontFamily: 'Inter-Regular', fontSize: 14, color: '#D0C0C0', textAlign: 'center', marginTop: 16 },

  // Game table
  tableScreen: { flex: 1, backgroundColor: '#3D0F0F', overflow: 'hidden' },
  outerBorder: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
  },
  scoreboardWrap: { position: 'absolute', top: 8, left: 0, right: 0, zIndex: 20 },
  tableArea: { flex: 1, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  ovalTable: {
    position: 'absolute',
    width: '88%',
    height: '62%',
    backgroundColor: '#0F5132',
    borderRadius: 200,
    borderWidth: 4,
    borderColor: '#5C1A1A',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },

  // Seats
  seatWrap: { position: 'absolute', alignItems: 'center', zIndex: 5 },
  seat_top: { top: '14%', left: 0, right: 0, alignItems: 'center' },
  seat_left: { left: '4%', top: '42%', alignItems: 'center' },
  seat_right: { right: '4%', top: '42%', alignItems: 'center' },
  seatInfo: {
    backgroundColor: 'rgba(15,31,61,0.9)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 5,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
    marginBottom: 4,
  },
  seatInfoActive: { borderColor: '#F4A261', backgroundColor: 'rgba(244,162,97,0.25)' },
  seatName: { fontFamily: 'Inter-Bold', fontSize: 12, fontWeight: '700', color: '#FFF' },
  seatNameActive: { color: '#F4A261' },
  seatMeTag: { fontFamily: 'Inter-Bold', fontSize: 9, color: '#F4D03F', marginTop: 1 },
  seatCards: { flexDirection: 'row', alignItems: 'center', gap: 1 },
  tableSeatCard: { marginHorizontal: -6 },
  cardCount: { fontFamily: 'Inter-Bold', fontSize: 10, fontWeight: '700', color: '#FFF', marginLeft: 3 },

  // Trick area
  trickArea: {
    position: 'absolute',
    width: 180, height: 140,
    alignItems: 'center', justifyContent: 'center',
    zIndex: 3,
  },
  trickCard: { position: 'absolute' },
  trickHint: { fontFamily: 'Inter-Regular', fontSize: 13, color: 'rgba(255,255,255,0.6)', textAlign: 'center' },

  // Status
  statusWrap: {
    position: 'absolute', bottom: '34%', left: '50%', marginLeft: -130, width: 260,
    alignItems: 'center', zIndex: 4,
  },
  statusText: { fontFamily: 'Inter-Bold', fontSize: 13, fontWeight: '700', color: '#FFF', textAlign: 'center' },

  // Hand
  handArea: { position: 'absolute', bottom: 60, left: 0, right: 0, height: 90, zIndex: 10 },

  // Timer
  timerWrap: { position: 'absolute', bottom: 52, left: '15%', right: '15%', zIndex: 15 },

  // Chat icon (bottom-left, yellow-white)
  chatIcon: { position: 'absolute', bottom: 16, left: 16, zIndex: 30 },
  chatIconGradient: {
    width: 52, height: 52, borderRadius: 26,
    justifyContent: 'center', alignItems: 'center',
    elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4,
  },

  // Exit
  exitBtnSmall: {
    position: 'absolute', top: 50, right: 16, zIndex: 30,
    padding: 8,
  },

  // Game over
  gameOverOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', zIndex: 100,
  },
  gameOverCard: {
    backgroundColor: '#FAFAFA', borderRadius: 24, padding: 32, width: '85%', maxWidth: 340, alignItems: 'center', elevation: 10,
  },
  gameOverTitle: { fontFamily: 'Inter-Bold', fontSize: 26, fontWeight: '700', color: '#1D3557', marginBottom: 12, textAlign: 'center' },
  gameOverScore: { fontFamily: 'Inter-Bold', fontSize: 32, fontWeight: '700', color: '#2D6A4F', marginBottom: 4 },
  gameOverGames: { fontFamily: 'Inter-Regular', fontSize: 14, color: '#666', marginBottom: 24 },
  nextDealBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#F4A261', borderRadius: 24, paddingHorizontal: 28, paddingVertical: 12, elevation: 4,
  },
  nextDealBtnText: { fontFamily: 'Inter-Bold', fontSize: 16, fontWeight: '700', color: '#1D3557' },
});
