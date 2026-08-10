export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14;

// 7 Hokm types: 4 standard suits + 3 special modes
export type HokmType =
  | 'spades'
  | 'hearts'
  | 'diamonds'
  | 'clubs'
  | 'saras'
  | 'naras'
  | 'tek_naras';

export interface Card {
  suit: Suit;
  rank: Rank;
  id: string;
}

// Seat 0 = south (you), 1 = west, 2 = north, 3 = east.
// Counter-clockwise turn order: 0 -> 3 -> 2 -> 1 -> 0
export type Seat = 0 | 1 | 2 | 3;

export interface Play {
  seat: Seat;
  card: Card;
}

export interface SeatInfo {
  name: string | null;
  connected: boolean;
}

export type GamePhase =
  | 'waiting'        // lobby, waiting for players
  | 'shuffle'        // shuffler must do the shuffle mini-game
  | 'hokm'           // hakim declares hokm from 5-card hand
  | 'partner_deal'   // shuffler transfers 5 cards to partner
  | 'playing'        // trick in progress
  | 'trickEnd'       // trick resolved, brief pause
  | 'gameOver';      // a team reached 7 tricks

export interface RoomState {
  room_number: string;
  phase: GamePhase;
  seats: SeatInfo[];
  host_seat: Seat;
  hakim_seat: Seat;
  shuffler_seat: Seat;
  hokm_type: HokmType | null;
  hands: Card[][];
  current_trick: Play[];
  lead_suit: Suit | null;
  leader_seat: Seat;
  current_seat: Seat;
  team1_tricks: number;
  team2_tricks: number;
  team1_games: number;
  team2_games: number;
  trick_count: number;
  last_trick_winner: Seat | null;
  partner_hands: Card[][] | null; // [partner's 5 cards, shuffler's transferred selection]
  staged_hands: Card[][] | null;   // full 13-card deal held during shuffle->playing
  updated_at: string;
}

// Is the Hokm type a standard suit (has trump)?
export function isSuitHokm(h: HokmType | null): h is Suit {
  return h === 'spades' || h === 'hearts' || h === 'diamonds' || h === 'clubs';
}

// Is the Hokm type a special mode where off-suit = Pooch (void)?
export function isPoochHokm(h: HokmType | null): boolean {
  return h === 'saras' || h === 'naras' || h === 'tek_naras';
}

export function trumpSuit(h: HokmType | null): Suit | null {
  return isSuitHokm(h) ? h : null;
}
