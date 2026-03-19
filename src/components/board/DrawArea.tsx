import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { findValidMelds, canExtendMeld } from '../../engine/meld';
import { Card } from '../card/Card';
import { CardBack } from '../card/CardBack';
import { DiscardPickerOverlay } from '../overlays/DiscardPickerOverlay';

export function DrawArea() {
  const state = useGameStore(s => s.state);
  const dispatch = useGameStore(s => s.dispatch);
  const [showPicker, setShowPicker] = useState(false);

  const { deck, discardPile, turn, melds } = state;
  const hand = state.players.player.hand;
  const canDraw = turn.phase === 'draw' && turn.activePlayer === 'player';
  const topDiscard = discardPile[discardPile.length - 1];

  // Only allow discard pickup if the top card can be melded
  const canPickTopDiscard = canDraw && !!topDiscard && (() => {
    const combined = [...hand, topDiscard];
    const newMelds = findValidMelds(combined);
    if (newMelds.some(m => m.some(c => c.id === topDiscard.id))) return true;
    return melds.some(m => canExtendMeld(m, [topDiscard]));
  })();

  // For multi-card pile: at least one card in pile is meldable
  const anyDiscardMeldable = canDraw && discardPile.length > 0 && discardPile.some((_, i) => {
    const takenCards = discardPile.slice(i);
    const targetCard = takenCards[0];
    const combined = [...hand, ...takenCards];
    const newMelds = findValidMelds(combined);
    if (newMelds.some(m => m.some(c => c.id === targetCard.id))) return true;
    return melds.some(m => canExtendMeld(m, [targetCard]));
  });

  function handleDrawDeck() {
    if (!canDraw) return;
    dispatch({ type: 'DRAW_FROM_DECK' });
  }

  function handleDiscardClick() {
    if (!canDraw || discardPile.length === 0) return;
    if (discardPile.length === 1) {
      if (!canPickTopDiscard) return;
      dispatch({ type: 'DRAW_FROM_DISCARD', cardId: topDiscard.id });
    } else {
      if (!anyDiscardMeldable) return;
      setShowPicker(true);
    }
  }

  return (
    <>
      <div className="flex items-center justify-center gap-6 py-2">
        {/* Draw pile */}
        <div className="flex flex-col items-center gap-1">
          <div
            className={`relative ${canDraw ? 'cursor-pointer' : 'cursor-default'}`}
            onClick={handleDrawDeck}
          >
            <CardBack size="md" />
            {/* Count badge */}
            <div
              className="absolute -top-2 -right-2 bg-purple-900 border border-purple-500 rounded-full text-[7px] neon-purple px-1.5 py-0.5"
              style={{ minWidth: 20, textAlign: 'center' }}
            >
              {deck.length}
            </div>
            {canDraw && (
              <div className="absolute inset-0 rounded-lg ring-2 ring-purple-500 ring-opacity-60 animate-pulse" />
            )}
          </div>
          <span className="text-[6px] text-gray-500">DECK</span>
        </div>

        {/* Discard pile */}
        <div className="flex flex-col items-center gap-1">
          <div
            className={`relative ${anyDiscardMeldable ? 'cursor-pointer' : 'cursor-default'} ${canDraw && !anyDiscardMeldable && discardPile.length > 0 ? 'opacity-50' : ''}`}
            onClick={handleDiscardClick}
            title={canDraw && !anyDiscardMeldable && discardPile.length > 0 ? "Can't meld any discard card" : undefined}
          >
            {topDiscard ? (
              <>
                <Card card={topDiscard} size="md" disabled={!anyDiscardMeldable} />
                {anyDiscardMeldable && (
                  <div className="absolute inset-0 rounded-lg ring-2 ring-blue-400 ring-opacity-60 animate-pulse" />
                )}
              </>
            ) : (
              <div
                className="rounded-lg border-2 border-dashed border-gray-700 flex items-center justify-center"
                style={{ width: 62, height: 88 }}
              >
                <span className="text-gray-600 text-lg">∅</span>
              </div>
            )}
            {discardPile.length > 1 && (
              <div
                className="absolute -top-2 -right-2 bg-blue-900 border border-blue-500 rounded-full text-[7px] neon-blue px-1.5 py-0.5"
                style={{ minWidth: 20, textAlign: 'center' }}
              >
                {discardPile.length}
              </div>
            )}
          </div>
          <span className="text-[6px] text-gray-500">DISCARD</span>
        </div>
      </div>

      {showPicker && (
        <DiscardPickerOverlay onClose={() => setShowPicker(false)} />
      )}
    </>
  );
}
