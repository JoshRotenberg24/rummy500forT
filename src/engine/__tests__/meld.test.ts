import { describe, expect, it } from 'vitest';
import { canExtendMeld, isValidMeld, isValidRun, isValidSet } from '../meld';
import { Card, Meld } from '../types';

const c = (id: string): Card => {
  const rank = id.slice(0, -1) as Card['rank'];
  const suitChar = id.slice(-1);
  const suitMap: Record<string, Card['suit']> = { s: 'spades', h: 'hearts', d: 'diamonds', c: 'clubs' };
  return { id, rank, suit: suitMap[suitChar] };
};

describe('isValidSet', () => {
  it('accepts 3 cards of same rank different suits', () => {
    expect(isValidSet([c('7s'), c('7h'), c('7d')])).toBe(true);
  });
  it('accepts 4 cards of same rank', () => {
    expect(isValidSet([c('Ks'), c('Kh'), c('Kd'), c('Kc')])).toBe(true);
  });
  it('rejects 2 cards', () => {
    expect(isValidSet([c('7s'), c('7h')])).toBe(false);
  });
  it('rejects duplicate suits', () => {
    expect(isValidSet([c('7s'), c('7h'), c('7s')])).toBe(false);
  });
  it('rejects mixed ranks', () => {
    expect(isValidSet([c('7s'), c('8h'), c('7d')])).toBe(false);
  });
});

describe('isValidRun', () => {
  it('accepts 3 consecutive same-suit cards', () => {
    expect(isValidRun([c('4c'), c('5c'), c('6c')])).toBe(true);
  });
  it('accepts 5 consecutive same-suit cards', () => {
    expect(isValidRun([c('9h'), c('10h'), c('Jh'), c('Qh'), c('Kh')])).toBe(true);
  });
  it('accepts run with Ace as low', () => {
    expect(isValidRun([c('Ah'), c('2h'), c('3h')])).toBe(true);
  });
  it('rejects mixed suits', () => {
    expect(isValidRun([c('4c'), c('5h'), c('6c')])).toBe(false);
  });
  it('rejects non-consecutive', () => {
    expect(isValidRun([c('4c'), c('6c'), c('8c')])).toBe(false);
  });
  it('rejects wrap-around (K-A-2)', () => {
    expect(isValidRun([c('Kh'), c('Ah'), c('2h')])).toBe(false);
  });
  it('rejects 2 cards', () => {
    expect(isValidRun([c('4c'), c('5c')])).toBe(false);
  });
});

describe('isValidMeld', () => {
  it('accepts valid set', () => {
    expect(isValidMeld([c('As'), c('Ah'), c('Ad')])).toBe(true);
  });
  it('accepts valid run', () => {
    expect(isValidMeld([c('Jd'), c('Qd'), c('Kd')])).toBe(true);
  });
  it('rejects invalid', () => {
    expect(isValidMeld([c('As'), c('2h'), c('3d')])).toBe(false);
  });
});

describe('canExtendMeld', () => {
  const setMeld: Meld = {
    id: 'set1', kind: 'set', ownerId: 'player',
    cards: [c('7s'), c('7h'), c('7d')],
  };
  const runMeld: Meld = {
    id: 'run1', kind: 'run', ownerId: 'player',
    cards: [c('5c'), c('6c'), c('7c')],
  };

  it('can extend set with missing suit', () => {
    expect(canExtendMeld(setMeld, [c('7c')])).toBe(true);
  });
  it('cannot extend set with existing suit', () => {
    expect(canExtendMeld(setMeld, [c('7s')])).toBe(false);
  });
  it('can extend run on high end', () => {
    expect(canExtendMeld(runMeld, [c('8c')])).toBe(true);
  });
  it('can extend run on low end', () => {
    expect(canExtendMeld(runMeld, [c('4c')])).toBe(true);
  });
  it('cannot extend run with wrong suit', () => {
    expect(canExtendMeld(runMeld, [c('8h')])).toBe(false);
  });
  it('cannot extend run with gap', () => {
    expect(canExtendMeld(runMeld, [c('9c')])).toBe(false);
  });
  it('rejects empty cards', () => {
    expect(canExtendMeld(setMeld, [])).toBe(false);
  });
});
