import { useGameStore } from '../../store/gameStore';
import { Card } from '../card/Card';

const OVERLAP = 34; // px exposed per card (rest overlaps)
const CARD_WIDTH = 78;
const CARD_HEIGHT = 110;

export function PlayerHand() {
  const state = useGameStore(s => s.state);
  const dispatch = useGameStore(s => s.dispatch);
  const { hand } = state.players.player;
  const { phase, selectedCards, drawnCard, activePlayer } = state.turn;

  const isMyTurn = activePlayer === 'player';
  const canSelect = isMyTurn && (phase === 'play' || phase === 'discard');

  const isSelected = (id: string) => selectedCards.some(c => c.id === id);

  function handleCardClick(cardIdx: number) {
    if (!canSelect) return;
    const card = hand[cardIdx];
    if (isSelected(card.id)) {
      dispatch({ type: 'DESELECT_CARD', cardId: card.id });
    } else {
      dispatch({ type: 'SELECT_CARD', card });
    }
  }

  // Fan layout: total width = overlap * (n-1) + CARD_WIDTH
  const totalWidth = hand.length > 0 ? OVERLAP * (hand.length - 1) + CARD_WIDTH : 0;

  return (
    <div className="relative flex flex-col items-center" style={{ minHeight: CARD_HEIGHT + 20 }}>
      <div className="relative" style={{ width: totalWidth, height: CARD_HEIGHT }}>
        {hand.map((card, i) => {
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
                transition: 'transform 0.2s ease',
                transform: selected ? 'translateY(-14px)' : 'translateY(0)',
              }}
            >
              <Card
                card={card}
                selected={selected}
                isDrawnCard={isDrawn}
                size="lg"
                onClick={() => handleCardClick(i)}
                disabled={!canSelect}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
