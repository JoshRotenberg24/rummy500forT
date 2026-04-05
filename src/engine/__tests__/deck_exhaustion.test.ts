import { describe, expect, it } from 'vitest';
import { applyAction, createInitialGameState } from '../actions';
import { Card, GameState } from '../types';

const c = (id: string): Card => {
  const rank = id.slice(0, -1) as Card['rank'];
  const suitChar = id.slice(-1);
  const suitMap: Record<string, Card['suit']> = { s: 'spades', h: 'hearts', d: 'diamonds', c: 'clubs' };
  return { id, rank, suit: suitMap[suitChar] };
};

function makeState(overrides: Partial<GameState> = {}): GameState {
  const base = createInitialGameState();
  return {
    ...base,
    ...overrides,
    turn: {
      ...base.turn,
      activePlayer: 'player',
      phase: 'draw',
      drawnFromDiscard: false,
      drawnCard: null,
      selectedCards: [],
      ...(overrides.turn ?? {}),
    },
  };
}

describe('Deck Exhaustion and Reshuffle', () => {
  it('returns state unchanged if both deck and discard are empty', () => {
    const state = makeState({
      deck: [],
      discardPile: [],
      players: {
        player: { id: 'player', hand: [c('As')], score: 0, roundScore: 0 },
        opponent: { id: 'opponent', hand: [], score: 0, roundScore: 0 },
      },
    });

    const next = applyAction(state, { type: 'DRAW_FROM_DECK' });
    expect(next).toBe(state); // no change
  });

  it('reshuffles discard pile into deck when deck is empty', () => {
    const discardPile = [c('2c'), c('3c'), c('4c'), c('5c')];
    const state = makeState({
      deck: [],
      discardPile,
      players: {
        player: { id: 'player', hand: [c('As')], score: 0, roundScore: 0 },
        opponent: { id: 'opponent', hand: [], score: 0, roundScore: 0 },
      },
    });

    const next = applyAction(state, { type: 'DRAW_FROM_DECK' });

    // Should have drawn one card from reshuffled discard
    expect(next.players.player.hand).toHaveLength(2); // As + drawn card
    expect(next.deck.length).toBeLessThan(discardPile.length); // some cards removed for draw
    expect(next.turn.phase).toBe('play');
  });

  it('draws from reshuffled deck and can continue playing', () => {
    const discardPile = [c('Kh'), c('Qd')];
    const state = makeState({
      deck: [],
      discardPile,
      players: {
        player: { id: 'player', hand: [c('As'), c('Ks'), c('Qs')], score: 0, roundScore: 0 },
        opponent: { id: 'opponent', hand: [], score: 0, roundScore: 0 },
      },
    });

    const next = applyAction(state, { type: 'DRAW_FROM_DECK' });

    expect(next.turn.phase).toBe('play');
    expect(next.players.player.hand.length).toBe(4); // 3 + 1 drawn
    // Verify the drawn card is from the discard pile
    const drawnIds = new Set(next.players.player.hand.map(c => c.id));
    expect(drawnIds.has('Kh') || drawnIds.has('Qd')).toBe(true);
  });

  it('maintains game state validity after reshuffle', () => {
    const discardPile = [c('2s'), c('3h'), c('4d'), c('5c')];
    const playerHand = [c('As'), c('Kh'), c('Qd')];
    const state = makeState({
      deck: [],
      discardPile,
      melds: [],
      players: {
        player: { id: 'player', hand: playerHand, score: 100, roundScore: 0 },
        opponent: { id: 'opponent', hand: [c('7c'), c('8c')], score: 150, roundScore: 0 },
      },
    });

    const next = applyAction(state, { type: 'DRAW_FROM_DECK' });

    // Check that all original cards are still in play
    const allCardIds = new Set([
      ...next.players.player.hand.map(c => c.id),
      ...next.players.opponent.hand.map(c => c.id),
      ...next.deck.map(c => c.id),
      ...next.discardPile.map(c => c.id),
      ...next.melds.flatMap(m => m.cards.map(c => c.id)),
    ]);

    const expectedCardIds = [
      ...playerHand.map(c => c.id),
      ...discardPile.map(c => c.id),
      ...next.players.opponent.hand.map(c => c.id),
    ];

    expectedCardIds.forEach(id => {
      expect(allCardIds.has(id)).toBe(true);
    });
  });

  it('can draw multiple times after reshuffle without issues', () => {
    const discardPile = [c('2c'), c('3c'), c('4c')];
    let state = makeState({
      deck: [],
      discardPile,
      players: {
        player: { id: 'player', hand: [c('As')], score: 0, roundScore: 0 },
        opponent: { id: 'opponent', hand: [], score: 0, roundScore: 0 },
      },
    });

    // First draw - should reshuffle
    state = applyAction(state, { type: 'DRAW_FROM_DECK' });
    expect(state.players.player.hand.length).toBe(2);
    expect(state.turn.phase).toBe('play');

    // Discard and continue
    const firstCard = state.players.player.hand[0];
    state = applyAction(state, { type: 'DISCARD', cardId: firstCard.id });
    expect(state.turn.phase).toBe('ai_turn');

    // Switch back to player (simulate opponent turn)
    // Create a state where player draws again
    state = {
      ...state,
      turn: {
        ...state.turn,
        activePlayer: 'player',
        phase: 'draw',
      },
    };

    state = applyAction(state, { type: 'DRAW_FROM_DECK' });
    // Should still work even though we've drawn multiple times
    expect(state.players.player.hand.length).toBeGreaterThan(0);
  });
});
