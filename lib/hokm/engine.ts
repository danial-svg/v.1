import { Card, HokmType, Play, RoomState, Seat, SeatInfo, Suit } from './types';
import { dealHands, nextSeatCCW, shufflerForHakim, teammate, teamOf, TARGET_TRICKS } from './deck';
import { isLegal, randomLegalCard, trickWinner } from './rules';

export const TURN_DURATION_MS = 20000;

export function emptySeats(): SeatInfo[] {
  return [
    { name: null, connected: false },
    { name: null, connected: false },
    { name: null, connected: false },
    { name: null, connected: false },
  ];
}

export function createRoom(roomNumber: string, hostName: string): RoomState {
  return {
    room_number: roomNumber,
    phase: 'waiting',
    seats: [
      { name: hostName, connected: true },
      { name: null, connected: false },
      { name: null, connected: false },
      { name: null, connected: false },
    ],
    host_seat: 0,
    hakim_seat: 0,
    shuffler_seat: 0,
    hokm_type: null,
    hands: [[], [], [], []],
    current_trick: [],
    lead_suit: null,
    leader_seat: 0,
    current_seat: 0,
    team1_tricks: 0,
    team2_tricks: 0,
    team1_games: 0,
    team2_games: 0,
    trick_count: 0,
    last_trick_winner: null,
    partner_hands: null,
    staged_hands: null,
    updated_at: new Date().toISOString(),
  };
}

export function joinRoom(state: RoomState, name: string): Seat | null {
  for (let i = 0; i < 4; i++) {
    if (!state.seats[i].name) {
      state.seats[i] = { name, connected: true };
      return i as Seat;
    }
  }
  return null;
}

export function swapSeats(state: RoomState, a: Seat, b: Seat): void {
  const tmp = state.seats[a];
  state.seats[a] = state.seats[b];
  state.seats[b] = tmp;
}

export function startGame(state: RoomState): void {
  const hakim = Math.floor(Math.random() * 4) as Seat;
  state.hakim_seat = hakim;
  state.shuffler_seat = shufflerForHakim(hakim);
  state.phase = 'shuffle';
  state.hokm_type = null;
  state.hands = [[], [], [], []];
  state.current_trick = [];
  state.lead_suit = null;
  state.team1_tricks = 0;
  state.team2_tricks = 0;
  state.trick_count = 0;
  state.last_trick_winner = null;
  state.partner_hands = null;
  state.staged_hands = null;
  state.updated_at = new Date().toISOString();
}

/**
 * Shuffler completes the shuffle mini-game (quality 0-100).
 * Deal full 13-card hands, but only reveal 5 to the Hakim.
 * Hold the full deal in staged_hands.
 */
export function completeShuffle(state: RoomState, quality: number): void {
  const fullDeal = dealHands(quality);
  state.staged_hands = fullDeal;
  state.hands = [[], [], [], []];
  state.hands[state.hakim_seat] = fullDeal[state.hakim_seat].slice(0, 5);
  state.phase = 'hokm';
  state.current_seat = state.hakim_seat;
  state.updated_at = new Date().toISOString();
}

/**
 * Hakim declares Hokm. Transition to partner_deal.
 * The shuffler sees their partner's 5-card hand and transfers/arranges cards.
 */
export function declareHokm(state: RoomState, hokm: HokmType): void {
  state.hokm_type = hokm;
  const partner = teammate(state.shuffler_seat);
  const staged = state.staged_hands!;
  state.partner_hands = [
    staged[partner].slice(0, 5),
    [],
  ];
  state.phase = 'partner_deal';
  state.current_seat = state.shuffler_seat;
  state.updated_at = new Date().toISOString();
}

/**
 * Shuffler confirms the partner's 5-card hand (optionally reordered).
 * Then deal remaining 8 cards to each player and start playing.
 * The leader of the first trick is the Hakim.
 */
export function completePartnerDeal(state: RoomState, partnerHand: Card[]): void {
  const staged = state.staged_hands!;
  const partner = teammate(state.shuffler_seat);

  // Set the partner's hand to the confirmed 5 cards
  state.hands[partner] = partnerHand;
  // Deal remaining 8 cards to each player from the staged deal (skip first 5)
  for (let s = 0; s < 4; s++) {
    if (s === partner) {
      // Partner already has 5 confirmed; add remaining 8
      state.hands[s] = [...state.hands[s], ...staged[s].slice(5)];
    } else {
      // Hakim already has 5; add remaining 8. Others get all 13.
      state.hands[s] = staged[s];
    }
  }
  // Sort all hands
  state.hands = state.hands.map((h) =>
    [...h].sort((a, b) => {
      const order: Record<string, number> = { spades: 0, hearts: 1, clubs: 2, diamonds: 3 };
      if (order[a.suit] !== order[b.suit]) return order[a.suit] - order[b.suit];
      return b.rank - a.rank;
    })
  );

  state.partner_hands = null;
  state.staged_hands = null;
  state.phase = 'playing';
  state.current_seat = state.hakim_seat;
  state.leader_seat = state.hakim_seat;
  state.current_trick = [];
  state.lead_suit = null;
  state.updated_at = new Date().toISOString();
}

export function playCard(state: RoomState, seat: Seat, card: Card): void {
  if (state.phase !== 'playing') throw new Error('Not in playing phase');
  if (state.current_seat !== seat) throw new Error(`Not ${seat}'s turn`);
  const playerHand = state.hands[seat];
  if (!isLegal(card, playerHand, state.lead_suit)) {
    throw new Error('Illegal play: must follow suit');
  }

  state.hands[seat] = playerHand.filter((c) => c.id !== card.id);
  const play: Play = { seat, card };
  state.current_trick = [...state.current_trick, play];
  if (state.lead_suit === null) state.lead_suit = card.suit;

  if (state.current_trick.length === 4) {
    const winnerSeat = trickWinner(state.current_trick, state.hokm_type);
    const team = teamOf(winnerSeat);
    if (team === 1) state.team1_tricks++;
    else state.team2_tricks++;
    state.trick_count++;
    state.last_trick_winner = winnerSeat;

    if (state.team1_tricks >= TARGET_TRICKS || state.team2_tricks >= TARGET_TRICKS) {
      if (state.team1_tricks >= TARGET_TRICKS) state.team1_games++;
      if (state.team2_tricks >= TARGET_TRICKS) state.team2_games++;
      state.phase = 'gameOver';
    } else {
      state.phase = 'trickEnd';
      state.leader_seat = winnerSeat;
      state.current_seat = winnerSeat;
    }
  } else {
    state.current_seat = nextSeatCCW(seat);
  }
  state.updated_at = new Date().toISOString();
}

export function advanceFromTrickEnd(state: RoomState): void {
  if (state.phase !== 'trickEnd') return;
  state.phase = 'playing';
  state.current_trick = [];
  state.lead_suit = null;
  state.current_seat = state.leader_seat;
  state.updated_at = new Date().toISOString();
}

export function autoPlay(state: RoomState): void {
  if (state.phase !== 'playing') return;
  const seat = state.current_seat;
  const hand = state.hands[seat];
  if (hand.length === 0) return;
  const card = randomLegalCard(hand, state.lead_suit);
  playCard(state, seat, card);
}

export function nextDeal(state: RoomState): void {
  const nextHakim = nextSeatCCW(state.hakim_seat);
  state.hakim_seat = nextHakim;
  state.shuffler_seat = shufflerForHakim(nextHakim);
  state.phase = 'shuffle';
  state.hokm_type = null;
  state.hands = [[], [], [], []];
  state.current_trick = [];
  state.lead_suit = null;
  state.team1_tricks = 0;
  state.team2_tricks = 0;
  state.trick_count = 0;
  state.last_trick_winner = null;
  state.partner_hands = null;
  state.staged_hands = null;
  state.updated_at = new Date().toISOString();
}
