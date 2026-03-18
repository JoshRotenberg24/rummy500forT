import { v4 as uuidv4 } from 'uuid';
import { dealInitialState } from './deck';
import { canExtendMeld, detectMeldKind, getExtendedMeld, isValidMeld } from './meld';
import { calculateRoundScores } from './scoring';
import { Card, GameAction, GameState, PlayerId } from './types';

const WINNING_SCORE = 500;

function otherPlayer(id: PlayerId): PlayerId {
  return id === 'player' ? 'opponent' : 'player';
}

/** Remove cards by id from an array, returns [remaining, removed] */
function removeCards(hand: Card[], cardIds: Set<string>): [Card[], Card[]] {
  const remaining: Card[] = [];
  const removed: Card[] = [];
  for (const card of hand) {
    if (cardIds.has(card.id)) {
      removed.push(card);
    } else {
      remaining.push(card);
    }
  }
  return [remaining, removed];
}

export function applyAction(state: GameState, action: GameAction): GameState {
  const { turn, players, discardPile, deck, melds } = state;
  const active = turn.activePlayer;

  switch (action.type) {

    case 'DRAW_FROM_DECK': {
      if (turn.phase !== 'draw' && turn.phase !== 'ai_turn') return state;
      if (deck.length === 0) return state;

      const drawnCard = state.deck[state.deck.length - 1];
      const newDeck = state.deck.slice(0, -1);

      return {
        ...state,
        deck: newDeck,
        players: {
          ...players,
          [active]: {
            ...players[active],
            hand: [...players[active].hand, drawnCard],
          },
        },
        turn: {
          ...turn,
          phase: 'play',
          drawnFromDiscard: false,
          drawnCard: null,
        },
      };
    }

    case 'DRAW_FROM_DISCARD': {
      if (turn.phase !== 'draw' && turn.phase !== 'ai_turn') return state;

      const idx = discardPile.findIndex(c => c.id === action.cardId);
      if (idx === -1) return state; // card not found — guard

      const takenCards = discardPile.slice(idx);       // target + all above it
      const remainingPile = discardPile.slice(0, idx); // everything below
      const drawnCard = takenCards[0];                  // the card they selected

      return {
        ...state,
        discardPile: remainingPile,
        players: {
          ...players,
          [active]: {
            ...players[active],
            hand: [...players[active].hand, ...takenCards],
          },
        },
        turn: {
          ...turn,
          phase: 'play',
          drawnFromDiscard: true,
          drawnCard, // only this card must be melded before discarding
        },
      };
    }

    case 'PLAY_MELD': {
      if (turn.phase !== 'play') return state;
      if (!isValidMeld(action.cards)) return state;

      const cardIds = new Set(action.cards.map(c => c.id));

      // If drawn from discard, drawnCard must be in this meld
      if (turn.drawnFromDiscard && turn.drawnCard && !cardIds.has(turn.drawnCard.id)) {
        return state;
      }

      const [newHand] = removeCards(players[active].hand, cardIds);
      const kind = detectMeldKind(action.cards)!;

      const newMeld = {
        id: uuidv4(),
        kind,
        cards: action.cards,
        ownerId: active,
      };

      const drawnCardMelded =
        turn.drawnFromDiscard &&
        turn.drawnCard &&
        cardIds.has(turn.drawnCard.id);

      return {
        ...state,
        melds: [...melds, newMeld],
        players: {
          ...players,
          [active]: {
            ...players[active],
            hand: newHand,
            roundScore: players[active].roundScore + newMeld.cards.reduce((s, c) => s + (c.rank === 'A' ? 15 : ['J','Q','K'].includes(c.rank) ? 10 : 5), 0),
          },
        },
        turn: {
          ...turn,
          drawnFromDiscard: drawnCardMelded ? false : turn.drawnFromDiscard,
          drawnCard: drawnCardMelded ? null : turn.drawnCard,
          selectedCards: [],
        },
      };
    }

    case 'EXTEND_MELD': {
      if (turn.phase !== 'play') return state;

      const targetMeld = melds.find(m => m.id === action.meldId);
      if (!targetMeld) return state;
      if (!canExtendMeld(targetMeld, action.cards)) return state;

      const cardIds = new Set(action.cards.map(c => c.id));

      // If drawn from discard, drawnCard must be among the extending cards
      if (turn.drawnFromDiscard && turn.drawnCard && !cardIds.has(turn.drawnCard.id)) {
        return state;
      }

      const [newHand] = removeCards(players[active].hand, cardIds);
      const updatedMeld = getExtendedMeld(targetMeld, action.cards);

      const drawnCardMelded =
        turn.drawnFromDiscard &&
        turn.drawnCard &&
        cardIds.has(turn.drawnCard.id);

      return {
        ...state,
        melds: melds.map(m => m.id === action.meldId ? updatedMeld : m),
        players: {
          ...players,
          [active]: {
            ...players[active],
            hand: newHand,
          },
        },
        turn: {
          ...turn,
          drawnFromDiscard: drawnCardMelded ? false : turn.drawnFromDiscard,
          drawnCard: drawnCardMelded ? null : turn.drawnCard,
          selectedCards: [],
        },
      };
    }

    case 'DISCARD': {
      if (turn.phase !== 'play' && turn.phase !== 'discard') return state;

      // Block discard if drawnCard has not been melded yet
      if (turn.drawnFromDiscard && turn.drawnCard) {
        return state;
      }

      const cardIdx = players[active].hand.findIndex(c => c.id === action.cardId);
      if (cardIdx === -1) return state;

      const discardedCard = players[active].hand[cardIdx];
      const newHand = players[active].hand.filter(c => c.id !== action.cardId);
      const newDiscardPile = [...discardPile, discardedCard];

      // Check round over: active player emptied hand
      if (newHand.length === 0) {
        const roundScores = calculateRoundScores({
          ...state,
          discardPile: newDiscardPile,
          players: {
            ...players,
            [active]: { ...players[active], hand: newHand },
          },
        });

        const newPlayerScore = players.player.score + roundScores.player;
        const newOpponentScore = players.opponent.score + roundScores.opponent;
        const hasWinner = newPlayerScore >= WINNING_SCORE || newOpponentScore >= WINNING_SCORE;
        const winnerCandidate: PlayerId | null = hasWinner
          ? newPlayerScore > newOpponentScore ? 'player' : 'opponent'
          : null;

        return {
          ...state,
          discardPile: newDiscardPile,
          players: {
            player: {
              ...players.player,
              hand: active === 'player' ? newHand : players.player.hand,
              score: newPlayerScore,
            },
            opponent: {
              ...players.opponent,
              hand: active === 'opponent' ? newHand : players.opponent.hand,
              score: newOpponentScore,
            },
          },
          turn: {
            ...turn,
            activePlayer: active,
            phase: hasWinner ? 'game_over' : 'round_over',
            drawnFromDiscard: false,
            drawnCard: null,
            selectedCards: [],
          },
          winner: winnerCandidate,
        };
      }

      // Switch to next player
      const nextPlayer = otherPlayer(active);
      const nextPhase: 'ai_turn' | 'draw' = nextPlayer === 'opponent' ? 'ai_turn' : 'draw';

      return {
        ...state,
        discardPile: newDiscardPile,
        players: {
          ...players,
          [active]: { ...players[active], hand: newHand },
        },
        turn: {
          activePlayer: nextPlayer,
          phase: nextPhase,
          drawnFromDiscard: false,
          drawnCard: null,
          selectedCards: [],
        },
      };
    }

    case 'START_ROUND': {
      const baseState: GameState = {
        ...state,
        round: state.round + 1,
        players: {
          player: { ...state.players.player, roundScore: 0 },
          opponent: { ...state.players.opponent, roundScore: 0 },
        },
      };
      return dealInitialState(baseState);
    }

    case 'ACKNOWLEDGE_ROUND_OVER': {
      if (turn.phase !== 'round_over') return state;
      return applyAction(state, { type: 'START_ROUND' });
    }

    case 'SELECT_CARD': {
      const alreadySelected = turn.selectedCards.some(c => c.id === action.card.id);
      if (alreadySelected) return state;
      return {
        ...state,
        turn: {
          ...turn,
          selectedCards: [...turn.selectedCards, action.card],
        },
      };
    }

    case 'DESELECT_CARD': {
      return {
        ...state,
        turn: {
          ...turn,
          selectedCards: turn.selectedCards.filter(c => c.id !== action.cardId),
        },
      };
    }

    case 'CLEAR_SELECTION': {
      return {
        ...state,
        turn: { ...turn, selectedCards: [] },
      };
    }

    default:
      return state;
  }
}

export function createInitialGameState(): GameState {
  const base: GameState = {
    gameId: uuidv4(),
    round: 0,
    deck: [],
    discardPile: [],
    melds: [],
    players: {
      player: { id: 'player', hand: [], score: 0, roundScore: 0 },
      opponent: { id: 'opponent', hand: [], score: 0, roundScore: 0 },
    },
    turn: {
      activePlayer: 'player',
      phase: 'dealing',
      drawnFromDiscard: false,
      drawnCard: null,
      selectedCards: [],
    },
    winner: null,
  };
  return applyAction(base, { type: 'START_ROUND' });
}
