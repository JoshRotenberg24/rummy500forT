import { Card, Meld, Rank } from './types';

const RANK_ORDER: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export function rankIndex(rank: Rank): number {
  return RANK_ORDER.indexOf(rank);
}

export function isValidSet(cards: Card[]): boolean {
  if (cards.length < 3) return false;
  const rank = cards[0].rank;
  const suits = new Set(cards.map(c => c.suit));
  return cards.every(c => c.rank === rank) && suits.size === cards.length;
}

export function isValidRun(cards: Card[]): boolean {
  if (cards.length < 3) return false;
  const suit = cards[0].suit;
  if (!cards.every(c => c.suit === suit)) return false;

  const indices = cards.map(c => rankIndex(c.rank)).sort((a, b) => a - b);
  for (let i = 1; i < indices.length; i++) {
    if (indices[i] !== indices[i - 1] + 1) return false;
  }
  return true;
}

export function isValidMeld(cards: Card[]): boolean {
  return isValidSet(cards) || isValidRun(cards);
}

export function canExtendMeld(meld: Meld, cards: Card[]): boolean {
  if (cards.length === 0) return false;

  if (meld.kind === 'set') {
    const rank = meld.cards[0].rank;
    const existingSuits = new Set(meld.cards.map(c => c.suit));
    return cards.every(c => {
      if (c.rank !== rank) return false;
      if (existingSuits.has(c.suit)) return false;
      existingSuits.add(c.suit);
      return true;
    });
  }

  // run: cards must extend either end of the sequence
  const suit = meld.cards[0].suit;
  if (!cards.every(c => c.suit === suit)) return false;

  const meldIndices = meld.cards.map(c => rankIndex(c.rank)).sort((a, b) => a - b);
  const minIdx = meldIndices[0];
  const maxIdx = meldIndices[meldIndices.length - 1];

  const newIndices = cards.map(c => rankIndex(c.rank)).sort((a, b) => a - b);

  // Must extend low end
  const extendsLow =
    newIndices[newIndices.length - 1] === minIdx - 1 &&
    newIndices.every((idx, i) => i === 0 || idx === newIndices[i - 1] + 1);

  // Must extend high end
  const extendsHigh =
    newIndices[0] === maxIdx + 1 &&
    newIndices.every((idx, i) => i === 0 || idx === newIndices[i - 1] + 1);

  return extendsLow || extendsHigh;
}

export function getExtendedMeld(meld: Meld, cards: Card[]): Meld {
  if (meld.kind === 'set') {
    return { ...meld, cards: [...meld.cards, ...cards] };
  }

  const meldIndices = meld.cards.map(c => rankIndex(c.rank)).sort((a, b) => a - b);
  const minIdx = meldIndices[0];
  const newIndices = cards.map(c => rankIndex(c.rank));
  const extendsLow = newIndices.some(i => i < minIdx);

  const allCards = [...meld.cards, ...cards];
  allCards.sort((a, b) => rankIndex(a.rank) - rankIndex(b.rank));

  return extendsLow
    ? { ...meld, cards: allCards }
    : { ...meld, cards: allCards };
}

export function detectMeldKind(cards: Card[]): 'set' | 'run' | null {
  if (isValidSet(cards)) return 'set';
  if (isValidRun(cards)) return 'run';
  return null;
}

/** Find all valid meld subsets (size 3+) in a hand */
export function findValidMelds(hand: Card[]): Card[][] {
  const results: Card[][] = [];
  const n = hand.length;

  for (let mask = 0; mask < (1 << n); mask++) {
    if (mask === 0) continue;
    const subset: Card[] = [];
    for (let i = 0; i < n; i++) {
      if (mask & (1 << i)) subset.push(hand[i]);
    }
    if (subset.length >= 3 && isValidMeld(subset)) {
      results.push(subset);
    }
  }

  // Sort by size descending
  results.sort((a, b) => b.length - a.length);
  return results;
}
