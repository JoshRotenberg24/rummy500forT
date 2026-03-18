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

  function handleCardClick(card: CardType) {
    if (!canSelect) return;
    if (isSelected(card.id)) {
      dispatch({ type: 'DESELECT_CARD', cardId: card.id });
    } else {
      dispatch({ type: 'SELECT_CARD', card });
    }
  }

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
                onClick={() => handleCardClick(card)}
                disabled={!canSelect}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
