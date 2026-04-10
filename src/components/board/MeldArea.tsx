import { motion, AnimatePresence } from 'framer-motion';
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
      <div className="flex items-center justify-center h-full">
        <span className="text-[7px] text-gray-600 italic">— no melds yet —</span>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto overflow-x-hidden h-full py-2 px-3">
      <div className="flex flex-wrap gap-3 content-start">
        <AnimatePresence>
          {melds.map(meld => {
            const isExtendable = canExtend && canExtendMeld(meld, turn.selectedCards);
            const isOpponent = meld.ownerId === 'opponent';
            return (
              <motion.div
                key={meld.id}
                layout
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                {/* Extend hint above the meld */}
                <AnimatePresence>
                  {isExtendable && (
                    <motion.div
                      className="absolute -top-5 left-0 right-0 flex items-center justify-center gap-1"
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                    >
                      <motion.span
                        className="text-[7px] neon-teal font-bold"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      >
                        + TAP
                      </motion.span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div
                  className={`flex gap-0.5 shrink-0 p-1.5 rounded-lg border transition-all
                    ${isExtendable
                      ? 'border-teal-400 shadow-[0_0_14px_rgba(52,211,153,0.5)] cursor-pointer'
                      : isOpponent
                      ? 'border-blue-900 opacity-70'
                      : 'border-purple-900'
                    }`}
                  onClick={() => handleMeldClick(meld)}
                >
                  {meld.cards.map(card => (
                    <Card
                      key={card.id}
                      card={card}
                      size="sm"
                      disabled
                      hologram={meld.cards.length >= 4}
                      layoutId={card.id}
                    />
                  ))}
                </div>

                {/* Owner label */}
                <div className="text-center mt-0.5">
                  <span className={`text-[5px] uppercase tracking-wider ${isOpponent ? 'text-blue-600' : 'text-purple-700'}`}>
                    {isOpponent ? 'OPP' : 'YOU'}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
