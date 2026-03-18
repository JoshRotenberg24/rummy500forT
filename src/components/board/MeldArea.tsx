import { useGameStore } from '../../store/gameStore';
import { Card as CardType, Meld } from '../../engine/types';
import { canExtendMeld } from '../../engine/meld';
import { Card } from '../card/Card';

export function MeldArea() {
  const state = useGameStore(s => s.state);
  const dispatch = useGameStore(s => s.dispatch);
  const { melds, turn, players } = state;

  const canExtend = turn.phase === 'play' && turn.activePlayer === 'player' && turn.selectedCards.length > 0;

  function handleMeldClick(meld: Meld) {
    if (!canExtend) return;
    const selected = turn.selectedCards;
    if (canExtendMeld(meld, selected)) {
      dispatch({ type: 'EXTEND_MELD', meldId: meld.id, cards: selected });
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
          const isExtendable = canExtend && canExtendMeld(meld, turn.selectedCards);
          const isOpponent = meld.ownerId === 'opponent';
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
