import { canExtendMeld, findValidMelds, isValidMeld, rankIndex } from '../engine/meld';
import { cardPoints } from '../engine/scoring';
import { Card, GameAction, GameState, Meld, PlayerId } from '../engine/types';

/**
 * Computes a full AI turn and returns an ordered list of actions to execute.
 * The AI plays as 'opponent'.
 */
export function computeAITurn(state: GameState): GameAction[] {
  const actions: GameAction[] = [];
  const hand = [...state.players.opponent.hand];
  const discardPile = state.discardPile;
  const topDiscard = discardPile[discardPile.length - 1];

  // ── Step 1: Draw decision ──────────────────────────────────────

  let drawnFromDiscard = false;
  let drawnCard: Card | null = null;

  if (topDiscard) {
    // Check if taking the top discard card completes a meld with 2 cards from hand
    const meldable = findValidMelds([topDiscard, ...hand]).some(
      subset => subset.some(c => c.id === topDiscard.id) && subset.length >= 3
    );
    if (meldable) {
      actions.push({ type: 'DRAW_FROM_DISCARD', cardId: topDiscard.id });
      drawnFromDiscard = true;
      drawnCard = topDiscard;
    }
  }

  if (!drawnFromDiscard) {
    actions.push({ type: 'DRAW_FROM_DECK' });
  }

  // After draw, compute the hand the AI will have
  // (We simulate it since we can't read new state here)
  const simulatedHand: Card[] = drawnFromDiscard && drawnCard
    ? [...hand, drawnCard]
    : [...hand]; // deck draw: we don't know the card, use current hand for meld planning

  // ── Step 2: Meld decisions ─────────────────────────────────────

  const usedCardIds = new Set<string>();
  const melds = [...state.melds];

  // If drawn from discard, must meld drawnCard — find a meld containing it
  if (drawnFromDiscard && drawnCard) {
    const validMelds = findValidMelds(simulatedHand);
    const meldWithDrawn = validMelds.find(m => m.some(c => c.id === drawnCard!.id));
    if (meldWithDrawn) {
      actions.push({ type: 'PLAY_MELD', cards: meldWithDrawn });
      meldWithDrawn.forEach(c => usedCardIds.add(c.id));
    }
    // If no meld found (shouldn't happen since we only draw from discard if meldable), fallback handled at discard step
  }

  // Greedily find more melds from remaining hand
  let remainingHand = simulatedHand.filter(c => !usedCardIds.has(c.id));
  let foundMeld = true;

  while (foundMeld) {
    foundMeld = false;
    const candidates = findValidMelds(remainingHand);
    if (candidates.length > 0) {
      const best = candidates[0]; // largest first
      actions.push({ type: 'PLAY_MELD', cards: best });
      best.forEach(c => usedCardIds.add(c.id));
      remainingHand = remainingHand.filter(c => !usedCardIds.has(c.id));
      foundMeld = true;
    }
  }

  // Try to extend existing melds
  for (const meld of melds) {
    const extendCards = remainingHand.filter(c => canExtendMeld(meld, [c]));
    if (extendCards.length > 0) {
      // Try to extend with as many as possible
      const validExtension = extendCards.filter(c => canExtendMeld(meld, [c]));
      if (validExtension.length > 0) {
        actions.push({ type: 'EXTEND_MELD', meldId: meld.id, cards: [validExtension[0]] });
        usedCardIds.add(validExtension[0].id);
        remainingHand = remainingHand.filter(c => !usedCardIds.has(c.id));
      }
    }
  }

  // ── Step 3: Discard decision ───────────────────────────────────

  const finalHand = remainingHand;

  if (finalHand.length === 0) {
    // Hand is empty — game over, no discard needed (round ends)
    return actions;
  }

  // Infer likely opponent (player) cards: deck is unknown, use visible info
  const allKnownIds = new Set([
    ...state.deck.map(c => c.id),
    ...state.discardPile.map(c => c.id),
    ...state.players.opponent.hand.map(c => c.id),
    ...state.melds.flatMap(m => m.cards.map(c => c.id)),
  ]);

  // "Hot" cards: completing a partial run we infer the player is building
  // Look for 2-card runs among visible cards not in our hand = likely player's
  const hotCardIds = new Set<string>();
  // (Simplified: flag cards that would extend the existing melds at either end)
  for (const meld of state.melds) {
    if (meld.kind === 'run') {
      const sorted = [...meld.cards].sort((a, b) => rankIndex(a.rank) - rankIndex(b.rank));
      // cards that extend high end
      const maxIdx = rankIndex(sorted[sorted.length - 1].rank);
      // cards that extend low end
      const minIdx = rankIndex(sorted[0].rank);
      finalHand.forEach(c => {
        if (c.suit === meld.cards[0].suit) {
          const ci = rankIndex(c.rank);
          if (ci === maxIdx + 1 || ci === minIdx - 1) {
            hotCardIds.add(c.id); // this extends the run — keep for ourselves, don't discard
          }
        }
      });
    }
  }

  // Score each card: prefer discarding high-value cards that aren't useful
  // Lower priority (discard later): cards that form partial melds or are "hot"
  const scored = finalHand.map(card => {
    const pts = cardPoints(card);
    const isHot = hotCardIds.has(card.id);
    // Check if card forms a partial set/run with another hand card
    const isPartial = finalHand.some(other => {
      if (other.id === card.id) return false;
      return other.rank === card.rank || (other.suit === card.suit && Math.abs(rankIndex(other.rank) - rankIndex(card.rank)) <= 2);
    });
    // Score: higher = more likely to discard
    const score = pts - (isHot ? 20 : 0) - (isPartial ? 8 : 0);
    return { card, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const discard = scored[0].card;

  actions.push({ type: 'DISCARD', cardId: discard.id });

  return actions;
}
