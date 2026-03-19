import { useEffect, useRef, useState } from 'react';
import { useMultiplayerStore } from '../../store/multiplayerStore';
import { Card as CardType, PlayerId, GamePhase } from '../../engine/types';
import { Card } from '../card/Card';

const OVERLAP = 34;
const CARD_WIDTH = 78;
const CARD_HEIGHT = 110;

interface Props {
  hand: CardType[];
  isMyTurn: boolean;
  phase: GamePhase;
  selectedCards: CardType[];
  drawnCard: CardType | null;
  myPlayerId: PlayerId;
}

export function MultiplayerHand({ hand, isMyTurn, phase, selectedCards, drawnCard, myPlayerId }: Props) {
  const dispatch = useMultiplayerStore(s => s.dispatch);

  const canSelect = isMyTurn && (phase === 'play' || phase === 'discard');
  const isSelected = (id: string) => selectedCards.some(c => c.id === id);

  const [orderedIds, setOrderedIds] = useState<string[]>(() => hand.map(c => c.id));
  const dragSrcIdx = useRef<number | null>(null);

  useEffect(() => {
    setOrderedIds(prev => {
      const currentIds = new Set(hand.map(c => c.id));
      const kept = prev.filter(id => currentIds.has(id));
      const added = hand.filter(c => !kept.includes(c.id)).map(c => c.id);
      return [...kept, ...added];
    });
  }, [hand]);

  const orderedHand = orderedIds.map(id => hand.find(c => c.id === id)).filter(Boolean) as CardType[];

  function handleCardClick(card: CardType) {
    if (!canSelect) return;
    if (isSelected(card.id)) {
      dispatch({ type: 'DESELECT_CARD', cardId: card.id });
    } else {
      dispatch({ type: 'SELECT_CARD', card });
    }
  }

  const containerRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ srcIdx: number; startX: number; moved: boolean } | null>(null);

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
    const target = Math.max(0, Math.min(orderedHand.length - 1, Math.floor(x / OVERLAP)));
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
      if (isSelected(card.id)) {
        dispatch({ type: 'DESELECT_CARD', cardId: card.id });
      } else {
        dispatch({ type: 'SELECT_CARD', card });
      }
    }
    dragState.current = null;
  }

  const totalWidth = orderedHand.length > 0 ? OVERLAP * (orderedHand.length - 1) + CARD_WIDTH : 0;

  return (
    <div className="relative flex flex-col items-center" style={{ minHeight: CARD_HEIGHT + 34 }}>
      <div
        ref={containerRef}
        className="relative"
        style={{ width: totalWidth, height: CARD_HEIGHT, touchAction: 'none' }}
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
                left: i * OVERLAP,
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
                size="lg"
                disabled={!canSelect}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
