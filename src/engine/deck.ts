import { Card, GameState, Rank, Suit } from './types';

const SUITS: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

const SUIT_ABBR: Record<Suit, string> = {
  spades: 's',
  hearts: 'h',
  diamonds: 'd',
  clubs: 'c',
};

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ id: `${rank}${SUIT_ABBR[suit]}`, rank, suit });
    }
  }
  return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
  const arr = [...deck];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function dealInitialState(state: GameState): GameState {
  const shuffled = shuffleDeck(createDeck());
  const playerHand = shuffled.slice(0, 7);
  const opponentHand = shuffled.slice(7, 14);
  const firstDiscard = shuffled[14];
  const remainingDeck = shuffled.slice(15);

  return {
    ...state,
    deck: remainingDeck,
    discardPile: [firstDiscard],
    melds: [],
    players: {
      player: {
        ...state.players.player,
        hand: playerHand,
        roundScore: 0,
      },
      opponent: {
        ...state.players.opponent,
        hand: opponentHand,
        roundScore: 0,
      },
    },
    turn: {
      activePlayer: 'player',
      phase: 'draw',
      drawnFromDiscard: false,
      drawnCard: null,
      selectedCards: [],
    },
    winner: null,
  };
}
