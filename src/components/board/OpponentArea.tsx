import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { Card } from '../card/Card';
import { CardBack } from '../card/CardBack';

const MAX_FAN = 5; // max card backs shown in hand fan

export function OpponentArea() {
  const state = useGameStore(s => s.state);
  const { hand } = state.players.opponent;
  const opponentMelds = state.melds.filter(m => m.ownerId === 'opponent');
  const { activePlayer, phase } = state.turn;
  const isThinking = activePlayer === 'opponent' && phase === 'ai_turn';

  // Build the fanned hand — show up to MAX_FAN card backs with slight rotation
  const fanCount = Math.min(hand.length, MAX_FAN);
  const fanOverlap = 22; // px
  const fanWidth = fanCount > 0 ? fanOverlap * (fanCount - 1) + 48 : 48;

  return (
    <div className="flex flex-col gap-2 px-3 py-2 h-full">
      {/* Label row */}
      <div className="flex items-center gap-2">
        <span className="text-[7px] neon-purple font-pixel uppercase tracking-widest">Opponent</span>
        <AnimatePresence>
          {isThinking && (
            <ThinkingDots />
          )}
        </AnimatePresence>
      </div>

      {/* Face-down card fan */}
      {hand.length > 0 ? (
        <div className="flex flex-col items-center gap-1">
          <div className="relative flex-shrink-0" style={{ width: fanWidth, height: 68 }}>
            {Array.from({ length: fanCount }).map((_, i) => {
              // Rotate cards to fan effect: spread around center
              const mid = (fanCount - 1) / 2;
              const rot = (i - mid) * 2.5;
              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: i * fanOverlap,
                    top: 0,
                    zIndex: i + 1,
                    transform: `rotate(${rot}deg)`,
                    transformOrigin: 'bottom center',
                  }}
                >
                  <CardBack size="sm" />
                </div>
              );
            })}
          </div>
          {/* Card count badge */}
          <div className="flex items-center gap-1 mt-1">
            <span className="text-[7px] neon-blue font-bold">
              {hand.length} card{hand.length !== 1 ? 's' : ''}
            </span>
            {hand.length > MAX_FAN && (
              <span className="text-[6px] text-gray-600">(showing {MAX_FAN})</span>
            )}
          </div>
        </div>
      ) : (
        <div className="text-[7px] text-gray-600 italic">empty hand</div>
      )}

      {/* Opponent melds */}
      {opponentMelds.length > 0 && (
        <div className="flex flex-col gap-1.5 overflow-y-auto mt-1">
          <span className="text-[6px] text-gray-600 uppercase tracking-wider">their melds</span>
          <div className="flex flex-wrap gap-2">
            {opponentMelds.map(meld => (
              <div key={meld.id} className="flex gap-0.5 shrink-0 opacity-80">
                {meld.cards.map(card => (
                  <Card key={card.id} card={card} size="sm" disabled />
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ThinkingDots() {
  return (
    <motion.div
      className="flex items-center gap-0.5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {[0, 1, 2].map(i => (
        <motion.span
          key={i}
          className="text-[8px] neon-pink"
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 1.2, delay: i * 0.4, repeat: Infinity }}
        >
          ●
        </motion.span>
      ))}
    </motion.div>
  );
}
