import { Card, HokmType, Rank, Seat, Suit } from './types';

export const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
export const SUIT_SYMBOLS: Record<Suit, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};
export const SUIT_COLORS: Record<Suit, string> = {
  hearts: '#E63946',
  diamonds: '#E63946',
  clubs: '#1D3557',
  spades: '#1D3557',
};
export const RANK_LABELS: Record<Rank, string> = {
  2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: '10',
  11: 'J', 12: 'Q', 13: 'K', 14: 'A',
};
export const SUIT_NAMES: Record<Suit, string> = {
  hearts: 'Hearts',
  diamonds: 'Diamonds',
  clubs: 'Clubs',
  spades: 'Spades',
};

export const HOKM_TYPES: { value: HokmType; label: string; symbol: string; color: string }[] = [
  { value: 'spades', label: 'Spades', symbol: '♠', color: '#1D3557' },
  { value: 'hearts', label: 'Hearts', symbol: '♥', color: '#E63946' },
  { value: 'diamonds', label: 'Diamonds', symbol: '♦', color: '#E63946' },
  { value: 'clubs', label: 'Clubs', symbol: '♣', color: '#1D3557' },
  { value: 'saras', label: 'Saras', symbol: '★', color: '#F4A261' },
  { value: 'naras', label: 'Naras', symbol: '☆', color: '#2D6A4F' },
  { value: 'tek_naras', label: 'Tek Naras', symbol: '✦', color: '#9D4EDD' },
];

export const HOKM_LABELS: Record<HokmType, string> = {
  spades: 'Spades ♠',
  hearts: 'Hearts ♥',
  diamonds: 'Diamonds ♦',
  clubs: 'Clubs ♣',
  saras: 'Saras ★',
  naras: 'Naras ☆',
  tek_naras: 'Tek Naras ✦',
};

export const SEAT_NAMES: Record<Seat, string> = {
  0: 'South',
  1: 'West',
  2: 'North',
  3: 'East',
};

export const TARGET_TRICKS = 7;

// Counter-clockwise turn order: 0 -> 3 -> 2 -> 1 -> 0
export function nextSeatCCW(seat: Seat): Seat {
  return ((seat + 3) % 4) as Seat;
}

// Player to the right of a seat in CCW order (the one who shuffles before the Hakim)
export function shufflerForHakim(hakim: Seat): Seat {
  // The person right before the Hakim in CCW order shuffles.
  // CCW: 0 -> 3 -> 2 -> 1 -> 0. "Before" the Hakim = the seat whose next CCW is the Hakim.
  // nextSeatCCW(x) = hakim  =>  x = (hakim + 1) % 4
  return ((hakim + 1) % 4) as Seat;
}

export function teammate(seat: Seat): Seat {
  return ((seat + 2) % 4) as Seat;
}

export function teamOf(seat: Seat): 1 | 2 {
  return seat % 2 === 0 ? 1 : 2;
}

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (let rank = 2 as Rank; rank <= 14; rank = (rank + 1) as Rank) {
      deck.push({ suit, rank, id: `${suit}-${rank}` });
    }
  }
  return deck;
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Sort hand by suit then rank descending
export function sortHand(hand: Card[]): Card[] {
  const suitOrder: Record<Suit, number> = { spades: 0, hearts: 1, clubs: 2, diamonds: 3 };
  return [...hand].sort((a, b) => {
    if (suitOrder[a.suit] !== suitOrder[b.suit]) return suitOrder[a.suit] - suitOrder[b.suit];
    return b.rank - a.rank;
  });
}

/**
 * Deal 13 cards to each of 4 players.
 * The `quality` parameter (0-100) controls balance:
 *  - 100 (green/center): perfectly balanced — each player gets an even mix of suits.
 *  - 0 (red/edges): skewed — one player gets many of one suit, others get few.
 */
export function dealHands(quality: number): Card[][] {
  const deck = shuffle(createDeck());
  const hands: Card[][] = [[], [], [], []];

  if (quality >= 85) {
    // Balanced: round-robin deal, one card per player at a time
    for (let i = 0; i < deck.length; i++) {
      hands[i % 4].push(deck[i]);
    }
  } else {
    // Skewed: deal in chunks. Lower quality = bigger chunks to one player.
    // quality 0 -> chunks of 5-6, quality 50 -> chunks of 2-3, quality 84 -> chunks of 1-2
    const chunkSize = Math.max(1, Math.round((100 - quality) / 18));
    let idx = 0;
    let seat = 0;
    while (idx < deck.length) {
      const take = Math.min(chunkSize, deck.length - idx);
      for (let j = 0; j < take; j++) {
        hands[seat].push(deck[idx++]);
      }
      seat = ((seat + 1) % 4) as Seat;
    }
  }

  return hands.map(sortHand);
}

export function cardLabel(card: Card): string {
  return `${RANK_LABELS[card.rank]}${SUIT_SYMBOLS[card.suit]}`;
}
