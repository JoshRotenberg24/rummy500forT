import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { Card } from '../card/Card';
import { CardBack } from '../card/CardBack';

const DISCARD_SHOW = 5; // max cards to show in the fan

function useDiscardSize() {
  const isTablet = () => window.innerWidth >= 768;
  const [tablet, setTablet] = useState(isTablet);
  useEffect(() => {
    const onResize = () => setTablet(isTablet());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return tablet
    ? { cardW: 62, cardH: 88, size: 'md' as const, vOverlap: 28 }
    : { cardW: 48, cardH: 68, size: 'sm' as const, vOverlap: 20 };
}

export function DrawArea() {
  const state = useGameStore(s => s.state);
  const dispatch = useGameStore(s => s.dispatch);
  const { cardW, cardH, size, vOverlap } = useDiscardSize();

  const { deck, discardPile, turn } = state;
  const canDraw = turn.phase === 'draw' && turn.activePlayer === 'player';

  // Show last DISCARD_SHOW cards — visually stack them so newest is on top
  const visibleDiscard = discardPile.slice(-DISCARD_SHOW);
  const fanHeight = visibleDiscard.length > 0
    ? vOverlap * (visibleDiscard.length - 1) + cardH
    : cardH;

  return (
    <div className="flex flex-col items-center gap-3 px-2 py-2 h-full justify-center">
      {/* Deck */}
      <div className="flex flex-col items-center gap-1 flex-shrink-0">
        <div
          className={`relative ${canDraw ? 'cursor-pointer' : 'cursor-default'}`}
          onClick={() => canDraw && dispatch({ type: 'DRAW_FROM_DECK' })}
        >
          <CardBack size={size} />
          <div
            className="absolute -top-2 -right-2 bg-purple-900 border border-purple-500 rounded-full text-[7px] neon-purple px-1.5 py-0.5 leading-none"
            style={{ minWidth: 20, textAlign: 'center' }}
          >
            {deck.length}
          </div>
          {canDraw && (
            <div className="absolute inset-0 rounded-lg ring-4 ring-purple-400 ring-opacity-80 animate-pulse pointer-events-none" />
          )}
          {canDraw && (
            <div className="absolute -bottom-5 left-0 right-0 text-center text-[6px] neon-purple animate-pulse">TAP</div>
          )}
        </div>
        <span className="text-[6px] text-gray-500 mt-1">DECK</span>
      </div>

      {/* Discard pile — vertical fan, newest card on top */}
      <div className="flex flex-col items-center gap-1 flex-shrink-0">
        {discardPile.length === 0 ? (
          <div
            className="rounded-lg border-2 border-dashed border-gray-700 flex items-center justify-center"
            style={{ width: cardW, height: cardH }}
          >
            <span className="text-gray-600 text-sm">∅</span>
          </div>
        ) : (
          <div className="relative" style={{ width: cardW, height: fanHeight }}>
            {visibleDiscard.map((card, i) => {
              // i=0 is oldest visible, i=last is newest (on top)
              const globalIdx = discardPile.length - visibleDiscard.length + i;
              const isTop = i === visibleDiscard.length - 1;
              const clickable = canDraw;
              return (
                <div
                  key={card.id}
                  style={{
                    position: 'absolute',
                    top: i * vOverlap,
                    left: 0,
                    zIndex: i + 1,
                  }}
                  className={clickable ? 'cursor-pointer' : 'cursor-default'}
                  onClick={() => clickable && dispatch({ type: 'DRAW_FROM_DISCARD', cardId: discardPile[globalIdx].id })}
                >
                  {isTop ? (
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={card.id}
                        initial={{ rotateY: 90, scale: 0.85 }}
                        animate={{ rotateY: 0, scale: 1 }}
                        transition={{ duration: 0.25 }}
                        style={{ perspective: 600 }}
                      >
                        <Card card={card} size={size} disabled={!clickable} layoutId={card.id} />
                      </motion.div>
                    </AnimatePresence>
                  ) : (
                    <Card card={card} size={size} disabled={!clickable} layoutId={card.id} />
                  )}
                  {clickable && isTop && (
                    <div className="absolute inset-0 rounded-lg ring-2 ring-blue-400 ring-opacity-60 animate-pulse pointer-events-none" />
                  )}
                </div>
              );
            })}
            {discardPile.length > DISCARD_SHOW && (
              <div className="absolute -top-4 right-0 text-[6px] text-gray-500">
                +{discardPile.length - DISCARD_SHOW} more
              </div>
            )}
          </div>
        )}
        <span className="text-[6px] text-gray-500 mt-1">DISCARD</span>
      </div>
    </div>
  );
}
