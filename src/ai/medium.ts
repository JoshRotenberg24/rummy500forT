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
    // Draw from discard if it forms a new meld with hand cards
    const meldable = findValidMelds([topDiscard, ...hand]).some(
      subset => subset.some(c => c.id === topDiscard.id) && subset.length >= 3
    );
    // Also draw if it extends an existing meld on the table
    const extendsExisting = state.melds.some(meld => canExtendMeld(meld, [topDiscard]));

    if (meldable || extendsExisting) {
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
  // Simulate melds on table (track what's extendable after AI plays new melds)
  const simulatedMelds: Meld[] = [...state.melds];

  // If drawn from discard, must meld drawnCard — find a meld containing it
  if (drawnFromDiscard && drawnCard) {
    const validMelds = findValidMelds(simulatedHand);
    const meldWithDrawn = validMelds.find(m => m.some(c => c.id === drawnCard!.id));
    if (meldWithDrawn) {
      actions.push({ type: 'PLAY_MELD', cards: meldWithDrawn });
      meldWithDrawn.forEach(c => usedCardIds.add(c.id));
    } else {
      // Can't form a new meld — try extending an existing meld with the drawn card
      const extendTarget = simulatedMelds.find(meld => canExtendMeld(meld, [drawnCard!]));
      if (extendTarget) {
        actions.push({ type: 'EXTEND_MELD', meldId: extendTarget.id, cards: [drawnCard] });
        usedCardIds.add(drawnCard.id);
        // Update simulatedMelds to reflect extension
        const idx = simulatedMelds.findIndex(m => m.id === extendTarget.id);
        if (idx >= 0) {
          simulatedMelds[idx] = { ...extendTarget, cards: [...extendTarget.cards, drawnCard] };
        }
      }
    }
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

  // Try to extend existing melds — iteratively, with ALL valid cards per meld
  for (const meld of simulatedMelds) {
    // Keep trying to add cards to this meld until no more fit
    let currentMeld = meld;
    let addedAny = true;
    while (addedAny) {
      addedAny = false;
      // Find first card in remaining hand that can extend current meld
      const extendCard = remainingHand.find(c => canExtendMeld(currentMeld, [c]));
      if (extendCard) {
        actions.push({ type: 'EXTEND_MELD', meldId: meld.id, cards: [extendCard] });
        usedCardIds.add(extendCard.id);
        remainingHand = remainingHand.filter(c => c.id !== extendCard.id);
        // Update currentMeld so next iteration checks the extended version
        currentMeld = { ...currentMeld, cards: [...currentMeld.cards, extendCard] };
        addedAny = true;
      }
    }
  }

  // ── Step 3: Discard decision ───────────────────────────────────

  const finalHand = remainingHand;

  if (finalHand.length === 0) {
    // Hand is empty — game over, no discard needed (round ends)
    return actions;
  }

  // "Hot" cards: extending existing melds — high value to keep
  const hotCardIds = new Set<string>();
  for (const meld of state.melds) {
    if (meld.kind === 'run') {
      const sorted = [...meld.cards].sort((a, b) => rankIndex(a.rank) - rankIndex(b.rank));
      const maxIdx = rankIndex(sorted[sorted.length - 1].rank);
      const minIdx = rankIndex(sorted[0].rank);
      finalHand.forEach(c => {
        if (c.suit === meld.cards[0].suit) {
          const ci = rankIndex(c.rank);
          if (ci === maxIdx + 1 || ci === minIdx - 1) {
            hotCardIds.add(c.id);
          }
        }
      });
    } else {
      // Set: flag cards with matching rank that could extend
      finalHand.forEach(c => {
        if (c.rank === meld.cards[0].rank && canExtendMeld(meld, [c])) {
          hotCardIds.add(c.id);
        }
      });
    }
  }

  // Count partial-meld partners: more partners = more useful card
  function partnerCount(card: Card): number {
    let count = 0;
    for (const other of finalHand) {
      if (other.id === card.id) continue;
      // Same rank = set partner
      if (other.rank === card.rank) count++;
      // Close rank same suit = run partner (within 2)
      if (other.suit === card.suit && Math.abs(rankIndex(other.rank) - rankIndex(card.rank)) <= 2) {
        count++;
      }
    }
    return count;
  }

  // Score each card: higher score = more likely to discard
  const scored = finalHand.map(card => {
    const pts = cardPoints(card);
    const isHot = hotCardIds.has(card.id);
    const partners = partnerCount(card);
    // Penalty per partner (more partners = keep it), and extra penalty if it's hot
    const score = pts - (isHot ? 25 : 0) - partners * 5;
    return { card, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const discard = scored[0].card;

  actions.push({ type: 'DISCARD', cardId: discard.id });

  return actions;
}
