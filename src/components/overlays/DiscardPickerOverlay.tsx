import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { Card } from '../card/Card';
import { Card as CardType } from '../../engine/types';
import { useState } from 'react';

interface Props {
  onClose: () => void;
}

export function DiscardPickerOverlay({ onClose }: Props) {
  const state = useGameStore(s => s.state);
  const dispatch = useGameStore(s => s.dispatch);
  const { discardPile } = state;
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // discardPile[last] = top. Show top-to-bottom for user (reversed visually).
  const reversed = [...discardPile].reverse(); // reversed[0] = top of pile

  function handleSelect(card: CardType, originalIdx: number) {
    // originalIdx is index in discardPile (0=bottom)
    dispatch({ type: 'DRAW_FROM_DISCARD', cardId: card.id });
    onClose();
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black bg-opacity-75" />

        <motion.div
          className="relative z-10 flex flex-col gap-4 p-6 rounded-xl border border-purple-700"
          style={{ background: 'rgba(10, 10, 26, 0.95)', maxWidth: 360, width: '90%' }}
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="text-center">
            <p className="text-[9px] neon-purple mb-1">PICK FROM DISCARD PILE</p>
            <p className="text-[7px] text-gray-400">You get selected card + all above it. Selected card must be melded immediately.</p>
          </div>

          {/* Cards displayed top-to-bottom */}
          <div className="flex flex-col gap-1 max-h-[60vh] overflow-y-auto">
            {reversed.map((card, revIdx) => {
              const originalIdx = discardPile.length - 1 - revIdx;
              const isTop = revIdx === 0;
              const isHighlighted = hoveredIdx !== null && originalIdx >= hoveredIdx;
              return (
                <motion.div
                  key={card.id}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer border transition-all
                    ${isHighlighted
                      ? 'border-teal-400 bg-teal-900 bg-opacity-20'
                      : 'border-transparent hover:border-purple-600'
                    }`}
                  onMouseEnter={() => setHoveredIdx(originalIdx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  onClick={() => handleSelect(card, originalIdx)}
                  whileHover={{ x: 4 }}
                >
                  <Card card={card} size="sm" disabled />
                  <div className="flex flex-col gap-0.5">
                    {isTop && <span className="text-[7px] neon-blue">TOP</span>}
                    {isHighlighted && (
                      <span className="text-[7px] neon-teal">← takes {discardPile.length - originalIdx} card{discardPile.length - originalIdx !== 1 ? 's' : ''}</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          <button className="btn-neon text-center" onClick={onClose}>CANCEL</button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
