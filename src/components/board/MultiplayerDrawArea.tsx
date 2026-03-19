import { useEffect, useState } from 'react';
import { useMultiplayerStore } from '../../store/multiplayerStore';
import { Card as CardType, PlayerId, GamePhase } from '../../engine/types';
import { Card } from '../card/Card';
import { CardBack } from '../card/CardBack';

function useDiscardLayout() {
  const isTablet = () => window.innerWidth >= 768;
  const [tablet, setTablet] = useState(isTablet);
  useEffect(() => {
    const onResize = () => setTablet(isTablet());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return tablet
    ? { overlap: 26, cardW: 62, cardH: 88, size: 'md' as const }
    : { overlap: 18, cardW: 48, cardH: 68, size: 'sm' as const };
}

interface Props {
  deck: CardType[];
  discardPile: CardType[];
  isMyTurn: boolean;
  myPlayerId: PlayerId;
  phase: GamePhase;
}

export function MultiplayerDrawArea({ deck, discardPile, isMyTurn, phase }: Props) {
  const dispatch = useMultiplayerStore(s => s.dispatch);
  const { overlap, cardW, cardH, size } = useDiscardLayout();

  const canDraw = isMyTurn && phase === 'draw';

  const fanWidth = discardPile.length > 0
    ? overlap * (discardPile.length - 1) + cardW
    : cardW;

  return (
    <div className="flex items-center gap-4 px-3 py-2">
      {/* Deck */}
      <div className="flex flex-col items-center gap-1 flex-shrink-0">
        <div
          className={`relative ${canDraw ? 'cursor-pointer' : 'cursor-default'}`}
          onClick={() => canDraw && dispatch({ type: 'DRAW_FROM_DECK' })}
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

      {/* Discard pile — fanned inline */}
      <div className="flex flex-col gap-1">
        <div className="overflow-x-auto" style={{ maxWidth: 'min(55vw, 320px)' }}>
          {discardPile.length === 0 ? (
            <div
              className="rounded-lg border-2 border-dashed border-gray-700 flex items-center justify-center flex-shrink-0"
              style={{ width: cardW, height: cardH }}
            >
              <span className="text-gray-600">∅</span>
            </div>
          ) : (
            <div className="relative flex-shrink-0" style={{ width: fanWidth, height: cardH }}>
              {discardPile.map((card, i) => {
                const isTop = i === discardPile.length - 1;
                const clickable = canDraw;
                return (
                  <div
                    key={card.id}
                    style={{ position: 'absolute', left: i * overlap, top: 0, zIndex: i + 1 }}
                    className={clickable ? 'cursor-pointer' : 'cursor-default'}
                    onClick={() => clickable && dispatch({ type: 'DRAW_FROM_DISCARD', cardId: card.id })}
                  >
                    <Card card={card} size={size} disabled={!clickable} />
                    {clickable && isTop && (
                      <div className="absolute inset-0 rounded-lg ring-2 ring-blue-400 ring-opacity-60 animate-pulse" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <span className="text-[6px] text-gray-500">
          DISCARD {discardPile.length > 0 && `(${discardPile.length})`}
        </span>
      </div>
    </div>
  );
}
