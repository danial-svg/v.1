import { Card, HokmType, Play, Seat, Suit, trumpSuit, isPoochHokm } from './types';

/**
 * Determine which card wins the current trick.
 *
 * Standard Hokm (suit trump):
 *  - The lead suit is set by the first card.
 *  - A trump card beats any non-trump card.
 *  - Among trump cards, higher rank wins.
 *  - Among lead-suit cards (non-trump), higher rank wins.
 *  - Off-suit non-trump cards never win.
 *
 * Saras / Naras / Tek Naras (no trump, Pooch rule):
 *  - There is NO trump suit.
 *  - Only the lead suit can win. Higher rank of the lead suit wins.
 *  - Any off-suit card is "Pooch" (void/ineffective) and never wins.
 */
export function trickWinner(trick: Play[], hokm: HokmType | null): Seat {
  if (trick.length === 0) throw new Error('Empty trick');
  const leadSuit = trick[0].card.suit;
  const trump = trumpSuit(hokm);
  let winning = trick[0];

  for (let i = 1; i < trick.length; i++) {
    const play = trick[i];
    const w = winning.card;
    const c = play.card;

    if (trump) {
      const wIsTrump = w.suit === trump;
      const cIsTrump = c.suit === trump;
      if (cIsTrump && !wIsTrump) {
        winning = play;
      } else if (cIsTrump && wIsTrump) {
        if (c.rank > w.rank) winning = play;
      } else if (!cIsTrump && !wIsTrump) {
        if (c.suit === leadSuit && w.suit !== leadSuit) {
          winning = play;
        } else if (c.suit === leadSuit && w.suit === leadSuit) {
          if (c.rank > w.rank) winning = play;
        }
      }
    } else {
      // No trump (Saras/Naras/Tek Naras): only lead suit can win
      if (c.suit === leadSuit && w.suit !== leadSuit) {
        winning = play;
      } else if (c.suit === leadSuit && w.suit === leadSuit) {
        if (c.rank > w.rank) winning = play;
      }
      // off-suit = Pooch, never wins
    }
  }
  return winning.seat;
}

/**
 * Legal cards a player may play given their hand and the current trick.
 * - If leading: any card.
 * - If following: must follow lead suit if able.
 *   - Standard Hokm: if you can't follow, you may play any card (including trump).
 *   - Saras/Naras/Tek Naras: if you can't follow, you may play any card but it's Pooch.
 *   In both cases, the legal set is the same: follow suit if you can, else anything.
 */
export function legalPlays(hand: Card[], leadSuit: Suit | null): Card[] {
  if (leadSuit === null) return [...hand];
  const sameSuit = hand.filter((c) => c.suit === leadSuit);
  return sameSuit.length > 0 ? sameSuit : [...hand];
}

export function isLegal(card: Card, hand: Card[], leadSuit: Suit | null): boolean {
  if (leadSuit === null) return hand.some((c) => c.id === card.id);
  const sameSuit = hand.filter((c) => c.suit === leadSuit);
  if (sameSuit.length > 0) return sameSuit.some((c) => c.id === card.id);
  return hand.some((c) => c.id === card.id);
}

/**
 * Pick a random legal card (used for auto-play on timeout).
 */
export function randomLegalCard(hand: Card[], leadSuit: Suit | null): Card {
  const legal = legalPlays(hand, leadSuit);
  return legal[Math.floor(Math.random() * legal.length)];
}
