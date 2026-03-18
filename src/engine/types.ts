export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  id: string; // e.g. "As", "10h", "Kd"
  rank: Rank;
  suit: Suit;
}

export type MeldKind = 'set' | 'run';

export interface Meld {
  id: string;
  kind: MeldKind;
  cards: Card[];
  ownerId: PlayerId;
}

export type PlayerId = 'player' | 'opponent';

export interface PlayerState {
  id: PlayerId;
  hand: Card[];
  score: number;       // cumulative across rounds
  roundScore: number;  // points from melds in current round (before hand deduction)
}

export type GamePhase =
  | 'dealing'
  | 'draw'
  | 'play'
  | 'discard'
  | 'ai_turn'
  | 'round_over'
  | 'game_over';

export interface TurnState {
  activePlayer: PlayerId;
  phase: GamePhase;
  drawnFromDiscard: boolean; // if true, drawnCard must be used in a meld before discard
  drawnCard: Card | null;    // the specific card that must be melded
  selectedCards: Card[];     // staging area for meld building in UI
}

export interface GameState {
  gameId: string;
  round: number;
  deck: Card[];
  discardPile: Card[]; // index 0 = bottom, last index = top
  melds: Meld[];
  players: Record<PlayerId, PlayerState>;
  turn: TurnState;
  winner: PlayerId | null;
}

export type GameAction =
  | { type: 'DRAW_FROM_DECK' }
  | { type: 'DRAW_FROM_DISCARD'; cardId: string }
  | { type: 'PLAY_MELD'; cards: Card[] }
  | { type: 'EXTEND_MELD'; meldId: string; cards: Card[] }
  | { type: 'DISCARD'; cardId: string }
  | { type: 'START_ROUND' }
  | { type: 'ACKNOWLEDGE_ROUND_OVER' }
  | { type: 'SELECT_CARD'; card: Card }
  | { type: 'DESELECT_CARD'; cardId: string }
  | { type: 'CLEAR_SELECTION' };
