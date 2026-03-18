import { describe, expect, it } from 'vitest';
import { applyAction, createInitialGameState } from '../actions';
import { cardPoints } from '../scoring';
import { Card, GameState } from '../types';

const c = (id: string): Card => {
  const rank = id.slice(0, -1) as Card['rank'];
  const suitChar = id.slice(-1);
  const suitMap: Record<string, Card['suit']> = { s: 'spades', h: 'hearts', d: 'diamonds', c: 'clubs' };
  return { id, rank, suit: suitMap[suitChar] };
};

/** Build a test state with a known discard pile and player hand */
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

describe('DRAW_FROM_DISCARD — discard pile multi-card pickup', () => {
  it('takes only top card when selecting top', () => {
    const pile = [c('2s'), c('5h'), c('9d')]; // 9d is top
    const state = makeState({
      discardPile: pile,
      players: {
        player: { id: 'player', hand: [c('As'), c('3c')], score: 0, roundScore: 0 },
        opponent: { id: 'opponent', hand: [], score: 0, roundScore: 0 },
      },
    });

    const next = applyAction(state, { type: 'DRAW_FROM_DISCARD', cardId: '9d' });

    expect(next.discardPile).toHaveLength(2);
    expect(next.discardPile.map(c => c.id)).toEqual(['2s', '5h']);
    expect(next.players.player.hand).toHaveLength(3);
    expect(next.players.player.hand.map(c => c.id)).toContain('9d');
    expect(next.turn.drawnCard?.id).toBe('9d');
    expect(next.turn.drawnFromDiscard).toBe(true);
  });

  it('takes card from middle and everything above it', () => {
    const pile = [c('2s'), c('5h'), c('9d'), c('Ks')]; // Ks is top
    const state = makeState({
      discardPile: pile,
      players: {
        player: { id: 'player', hand: [c('As')], score: 0, roundScore: 0 },
        opponent: { id: 'opponent', hand: [], score: 0, roundScore: 0 },
      },
    });

    // Select 9d (index 2) — takes 9d, Ks
    const next = applyAction(state, { type: 'DRAW_FROM_DISCARD', cardId: '9d' });

    expect(next.discardPile).toHaveLength(2);
    expect(next.discardPile.map(c => c.id)).toEqual(['2s', '5h']);
    expect(next.players.player.hand).toHaveLength(3); // As + 9d + Ks
    expect(next.players.player.hand.map(c => c.id)).toContain('9d');
    expect(next.players.player.hand.map(c => c.id)).toContain('Ks');
    // drawnCard is the SELECTED card, not the one above it
    expect(next.turn.drawnCard?.id).toBe('9d');
  });

  it('takes all cards when selecting bottom of pile', () => {
    const pile = [c('2s'), c('5h'), c('9d')];
    const state = makeState({
      discardPile: pile,
      players: {
        player: { id: 'player', hand: [], score: 0, roundScore: 0 },
        opponent: { id: 'opponent', hand: [], score: 0, roundScore: 0 },
      },
    });

    const next = applyAction(state, { type: 'DRAW_FROM_DISCARD', cardId: '2s' });

    expect(next.discardPile).toHaveLength(0);
    expect(next.players.player.hand).toHaveLength(3);
    expect(next.turn.drawnCard?.id).toBe('2s');
  });

  it('drawnCard is the selected card, not a card above it', () => {
    const pile = [c('3h'), c('7c'), c('Jd'), c('Qs')];
    const state = makeState({
      discardPile: pile,
      players: {
        player: { id: 'player', hand: [], score: 0, roundScore: 0 },
        opponent: { id: 'opponent', hand: [], score: 0, roundScore: 0 },
      },
    });

    const next = applyAction(state, { type: 'DRAW_FROM_DISCARD', cardId: '7c' });
    expect(next.turn.drawnCard?.id).toBe('7c');
    expect(next.players.player.hand.map(c => c.id)).toEqual(['7c', 'Jd', 'Qs']);
    expect(next.discardPile.map(c => c.id)).toEqual(['3h']);
  });

  it('is a no-op if card is not in the pile', () => {
    const pile = [c('2s'), c('5h')];
    const state = makeState({ discardPile: pile });
    const next = applyAction(state, { type: 'DRAW_FROM_DISCARD', cardId: 'Kc' });
    expect(next).toBe(state); // same reference = no change
  });

  it('is a no-op if phase is not draw', () => {
    const pile = [c('2s'), c('5h')];
    const state = makeState({
      discardPile: pile,
      turn: { activePlayer: 'player', phase: 'play', drawnFromDiscard: false, drawnCard: null, selectedCards: [] },
    });
    const next = applyAction(state, { type: 'DRAW_FROM_DISCARD', cardId: '5h' });
    expect(next).toBe(state);
  });

  it('handles 1-card pile (taking only card)', () => {
    const pile = [c('Ah')];
    const state = makeState({
      discardPile: pile,
      players: {
        player: { id: 'player', hand: [c('As'), c('Ad')], score: 0, roundScore: 0 },
        opponent: { id: 'opponent', hand: [], score: 0, roundScore: 0 },
      },
    });

    const next = applyAction(state, { type: 'DRAW_FROM_DISCARD', cardId: 'Ah' });
    expect(next.discardPile).toHaveLength(0);
    expect(next.players.player.hand).toHaveLength(3);
    expect(next.turn.drawnCard?.id).toBe('Ah');
    expect(next.turn.drawnFromDiscard).toBe(true);
  });
});

describe('DISCARD — drawnCard constraint enforcement', () => {
  it('blocks DISCARD if drawnCard has not been melded', () => {
    const drawnCard = c('9d');
    const state = makeState({
      discardPile: [],
      players: {
        player: { id: 'player', hand: [c('As'), drawnCard, c('3c')], score: 0, roundScore: 0 },
        opponent: { id: 'opponent', hand: [], score: 0, roundScore: 0 },
      },
      turn: {
        activePlayer: 'player',
        phase: 'play',
        drawnFromDiscard: true,
        drawnCard,
        selectedCards: [],
      },
    });

    const next = applyAction(state, { type: 'DISCARD', cardId: 'As' });
    expect(next).toBe(state); // blocked
  });

  it('allows DISCARD after drawnCard has been melded via PLAY_MELD', () => {
    const drawnCard = c('9d');
    const hand = [c('As'), drawnCard, c('9h'), c('9s'), c('Kc')];
    const state = makeState({
      discardPile: [],
      melds: [],
      players: {
        player: { id: 'player', hand, score: 0, roundScore: 0 },
        opponent: { id: 'opponent', hand: [c('2c'), c('3c'), c('4c'), c('5c'), c('6c'), c('7c'), c('8c')], score: 0, roundScore: 0 },
      },
      turn: {
        activePlayer: 'player',
        phase: 'play',
        drawnFromDiscard: true,
        drawnCard,
        selectedCards: [],
      },
    });

    // Meld the drawnCard (9d 9h 9s)
    const afterMeld = applyAction(state, { type: 'PLAY_MELD', cards: [drawnCard, c('9h'), c('9s')] });
    expect(afterMeld.turn.drawnFromDiscard).toBe(false);
    expect(afterMeld.turn.drawnCard).toBeNull();

    // Now discard should succeed
    const afterDiscard = applyAction(afterMeld, { type: 'DISCARD', cardId: 'Kc' });
    expect(afterDiscard).not.toBe(afterMeld);
    expect(afterDiscard.discardPile.map(c => c.id)).toContain('Kc');
  });

  it('drawnCard flag clears when card is extended into existing meld', () => {
    const drawnCard = c('8c');
    const existingMeld = {
      id: 'run1', kind: 'run' as const, ownerId: 'player' as const,
      cards: [c('5c'), c('6c'), c('7c')],
    };
    const state = makeState({
      discardPile: [],
      melds: [existingMeld],
      players: {
        player: { id: 'player', hand: [drawnCard, c('Ks')], score: 0, roundScore: 0 },
        opponent: { id: 'opponent', hand: [c('2h'), c('3h'), c('4h'), c('5h'), c('6h'), c('7h'), c('8h')], score: 0, roundScore: 0 },
      },
      turn: {
        activePlayer: 'player',
        phase: 'play',
        drawnFromDiscard: true,
        drawnCard,
        selectedCards: [],
      },
    });

    const afterExtend = applyAction(state, { type: 'EXTEND_MELD', meldId: 'run1', cards: [drawnCard] });
    expect(afterExtend.turn.drawnFromDiscard).toBe(false);
    expect(afterExtend.turn.drawnCard).toBeNull();
  });
});

describe('Scoring', () => {
  it('cardPoints: Ace=15, face=10, number=5', () => {
    expect(cardPoints(c('As'))).toBe(15);
    expect(cardPoints(c('Kh'))).toBe(10);
    expect(cardPoints(c('Qd'))).toBe(10);
    expect(cardPoints(c('Jc'))).toBe(10);
    expect(cardPoints(c('10s'))).toBe(5);
    expect(cardPoints(c('2h'))).toBe(5);
  });
});
