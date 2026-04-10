import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { Card as CardType } from '../../engine/types';
import { Card } from '../card/Card';

function useCardLayout(handCount: number) {
  const getLayout = () => {
    const wide = window.innerWidth >= 768;
    const tall = window.innerHeight >= 650;
    const base = wide && tall
      ? { cardSize: 'xl' as const, defaultOverlap: 52, cardWidth: 100, cardHeight: 140 }
      : { cardSize: 'lg' as const, defaultOverlap: 34, cardWidth: 78, cardHeight: 110 };

    const availableWidth = window.innerWidth - 32; // 16px padding each side
    const maxOverlap = handCount > 1
      ? Math.floor((availableWidth - base.cardWidth) / (handCount - 1))
      : base.defaultOverlap;
    const overlap = Math.max(15, Math.min(base.defaultOverlap, maxOverlap));

    return { cardSize: base.cardSize, overlap, cardWidth: base.cardWidth, cardHeight: base.cardHeight };
  };
  const [layout, setLayout] = useState(getLayout);
  useEffect(() => {
    const onResize = () => setLayout(getLayout());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [handCount]); // eslint-disable-line react-hooks/exhaustive-deps

  // Recompute whenever handCount changes (picking up many cards)
  useEffect(() => {
    setLayout(getLayout());
  }, [handCount]); // eslint-disable-line react-hooks/exhaustive-deps

  return layout;
}

export function PlayerHand() {
  const state = useGameStore(s => s.state);
  const dispatch = useGameStore(s => s.dispatch);
  const { hand } = state.players.player;
  const { phase, selectedCards, drawnCard, activePlayer } = state.turn;

  const isMyTurn = activePlayer === 'player';
  const canSelect = isMyTurn && (phase === 'play' || phase === 'discard');

  const [orderedIds, setOrderedIds] = useState<string[]>(() => hand.map(c => c.id));
  const containerRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ srcIdx: number; startX: number; moved: boolean } | null>(null);

  const { cardSize, overlap, cardWidth, cardHeight } = useCardLayout(hand.length);

  useEffect(() => {
    setOrderedIds(prev => {
      const currentIds = new Set(hand.map(c => c.id));
      const kept = prev.filter(id => currentIds.has(id));
      const added = hand.filter(c => !kept.includes(c.id)).map(c => c.id);
      return [...kept, ...added];
    });
  }, [hand]);

  const orderedHand = orderedIds.map(id => hand.find(c => c.id === id)).filter(Boolean) as CardType[];
  const isSelected = (id: string) => selectedCards.some(c => c.id === id);

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>, i: number) {
    dragState.current = { srcIdx: i, startX: e.clientX, moved: false };
    containerRef.current?.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!dragState.current || !containerRef.current) return;
    if (Math.abs(e.clientX - dragState.current.startX) > 8) dragState.current.moved = true;
    if (!dragState.current.moved) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const target = Math.max(0, Math.min(orderedHand.length - 1, Math.floor(x / overlap)));
    if (target !== dragState.current.srcIdx) {
      const newOrder = [...orderedIds];
      const [moved] = newOrder.splice(dragState.current.srcIdx, 1);
      newOrder.splice(target, 0, moved);
      dragState.current.srcIdx = target;
      setOrderedIds(newOrder);
    }
  }

  function handlePointerUp(e: React.PointerEvent<HTMLDivElement>, card: CardType) {
    if (!dragState.current?.moved && canSelect) {
      // Short tap = select/deselect
      if (isSelected(card.id)) {
        dispatch({ type: 'DESELECT_CARD', cardId: card.id });
      } else {
        dispatch({ type: 'SELECT_CARD', card });
      }
    }
    dragState.current = null;
  }

  const totalWidth = orderedHand.length > 0 ? overlap * (orderedHand.length - 1) + cardWidth : 0;

  return (
    <div className="relative flex flex-col items-center" style={{ minHeight: cardHeight + 34 }}>
      <div
        ref={containerRef}
        className="relative"
        style={{ width: totalWidth, height: cardHeight, touchAction: 'none' }}
        onPointerMove={handlePointerMove}
      >
        {orderedHand.map((card, i) => {
          const selected = isSelected(card.id);
          const isDrawn = drawnCard?.id === card.id;
          return (
            <div
              key={card.id}
              style={{
                position: 'absolute',
                left: i * overlap,
                top: 0,
                zIndex: selected ? 20 : i + 1,
                transition: 'transform 0.15s ease',
                transform: selected ? 'translateY(-14px)' : 'translateY(0)',
                cursor: 'grab',
              }}
              onPointerDown={e => handlePointerDown(e, i)}
              onPointerUp={e => handlePointerUp(e, card)}
            >
              <Card
                card={card}
                selected={selected}
                isDrawnCard={isDrawn}
                size={cardSize}
                disabled={!canSelect}
                layoutId={card.id}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
