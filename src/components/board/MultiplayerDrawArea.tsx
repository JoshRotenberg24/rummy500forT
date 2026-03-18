import { useState } from 'react';
import { useMultiplayerStore } from '../../store/multiplayerStore';
import { Card as CardType, PlayerId, GamePhase } from '../../engine/types';
import { Card } from '../card/Card';
import { CardBack } from '../card/CardBack';
import { MultiplayerDiscardPickerOverlay } from '../overlays/MultiplayerDiscardPickerOverlay';

interface Props {
  deck: CardType[];
  discardPile: CardType[];
  isMyTurn: boolean;
  myPlayerId: PlayerId;
  phase: GamePhase;
}

export function MultiplayerDrawArea({ deck, discardPile, isMyTurn, myPlayerId, phase }: Props) {
  const dispatch = useMultiplayerStore(s => s.dispatch);
  const [showPicker, setShowPicker] = useState(false);

  const canDraw = isMyTurn && phase === 'draw';
  const topDiscard = discardPile[discardPile.length - 1];

  function handleDrawDeck() {
    if (!canDraw) return;
    dispatch({ type: 'DRAW_FROM_DECK' });
  }

  function handleDiscardClick() {
    if (!canDraw || discardPile.length === 0) return;
    if (discardPile.length === 1) {
      dispatch({ type: 'DRAW_FROM_DISCARD', cardId: topDiscard.id });
    } else {
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
            className={`relative ${canDraw && discardPile.length > 0 ? 'cursor-pointer' : 'cursor-default'}`}
            onClick={handleDiscardClick}
          >
            {topDiscard ? (
              <>
                <Card card={topDiscard} size="md" disabled={!canDraw} />
                {canDraw && (
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
        <MultiplayerDiscardPickerOverlay
          discardPile={discardPile}
          onClose={() => setShowPicker(false)}
        />
      )}
    </>
  );
}
