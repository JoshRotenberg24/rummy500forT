import { useMultiplayerStore } from '../../store/multiplayerStore';
import { Card as CardType, Meld, PlayerId, GamePhase } from '../../engine/types';
import { canExtendMeld } from '../../engine/meld';
import { Card } from '../card/Card';

interface Props {
  melds: Meld[];
  myPlayerId: PlayerId;
  selectedCards: CardType[];
  isMyTurn: boolean;
  phase: GamePhase;
}

export function MultiplayerMeldArea({ melds, myPlayerId, selectedCards, isMyTurn, phase }: Props) {
  const dispatch = useMultiplayerStore(s => s.dispatch);

  const canExtend = isMyTurn && phase === 'play' && selectedCards.length > 0;

  function handleMeldClick(meld: Meld) {
    if (!canExtend) return;
    if (canExtendMeld(meld, selectedCards)) {
      dispatch({ type: 'EXTEND_MELD', meldId: meld.id, cards: selectedCards });
    }
  }

  if (melds.length === 0) {
    return (
      <div className="flex items-center justify-center py-2 px-3">
        <span className="text-[7px] text-gray-600">— no melds yet —</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto py-2 px-3">
      <div className="flex gap-4 items-start">
        {melds.map(meld => {
          const isExtendable = canExtend && canExtendMeld(meld, selectedCards);
          const isOpponent = meld.ownerId !== myPlayerId;
          return (
            <div
              key={meld.id}
              className={`flex gap-0.5 shrink-0 p-1.5 rounded-lg border transition-all
                ${isExtendable
                  ? 'border-teal-400 shadow-[0_0_12px_rgba(52,211,153,0.4)] cursor-pointer'
                  : isOpponent
                  ? 'border-blue-900 opacity-80'
                  : 'border-purple-900'
                }`}
              onClick={() => handleMeldClick(meld)}
            >
              {meld.cards.map(card => (
                <Card key={card.id} card={card} size="sm" disabled />
              ))}
              {isExtendable && (
                <div className="flex items-center px-1">
                  <span className="text-[8px] neon-teal">+</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
