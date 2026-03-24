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
      <div className="flex items-center justify-center py-3 px-3">
        <span className="text-[7px] text-gray-600">— no melds yet —</span>
      </div>
    );
  }

  return (
    <div className="py-2 px-3">
      <div className="flex flex-wrap gap-2 items-start">
        {melds.map(meld => {
          const isExtendable = canExtend && canExtendMeld(meld, turn.selectedCards);
          const isOpponent = meld.ownerId === 'opponent';
          const meldLabel = meld.kind === 'run' ? 'RUN' : 'SET';
          const ownerLabel = isOpponent ? 'OPP' : 'YOU';

          return (
            <div
              key={meld.id}
              className={`flex flex-col gap-1 shrink-0 items-start`}
              onClick={() => handleMeldClick(meld)}
            >
              {/* Label row */}
              <div className="flex items-center gap-1.5 px-1">
                <span className={`text-[7px] font-bold ${isOpponent ? 'neon-blue' : 'neon-purple'}`}>
                  {ownerLabel}
                </span>
                <span className="text-[6px] text-gray-500">{meldLabel}</span>
                {meld.cards.length > 0 && (
                  <span className="text-[6px] text-gray-600">{meld.cards.length}c</span>
                )}
              </div>

              {/* Cards row */}
              <div
                className={`flex gap-0.5 p-1.5 rounded-lg border transition-all
                  ${isExtendable
                    ? 'border-teal-400 shadow-[0_0_14px_rgba(52,211,153,0.5)] cursor-pointer animate-pulse-border'
                    : isOpponent
                    ? 'border-blue-900 opacity-85'
                    : 'border-purple-900'
                  }`}
              >
                {meld.cards.map(card => (
                  <Card key={card.id} card={card} size="md" disabled hologram={meld.cards.length >= 4} />
                ))}
                {isExtendable && (
                  <div className="flex flex-col items-center justify-center px-2 gap-0.5">
                    <span className="text-[10px] neon-teal font-bold">＋</span>
                    <span className="text-[6px] neon-teal">ADD</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
