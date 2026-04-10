import { motion, AnimatePresence } from 'framer-motion';
import { Card as CardType, Meld } from '../../engine/types';
import { Card } from '../card/Card';
import { CardBack } from '../card/CardBack';

const MAX_FAN = 5;

interface Props {
  hand: CardType[];
  melds: Meld[];
  isThinking: boolean;
}

export function MultiplayerOpponentArea({ hand, melds, isThinking }: Props) {
  const fanCount = Math.min(hand.length, MAX_FAN);
  const fanOverlap = 22;
  const fanWidth = fanCount > 0 ? fanOverlap * (fanCount - 1) + 48 : 48;

  return (
    <div className="flex flex-col gap-2 px-3 py-2 h-full">
      <div className="flex items-center gap-2">
        <span className="text-[7px] neon-purple uppercase tracking-widest">Opponent</span>
        <AnimatePresence>
          {isThinking && <ThinkingDots />}
        </AnimatePresence>
      </div>

      {hand.length > 0 ? (
        <div className="flex flex-col items-center gap-1">
          <div className="relative flex-shrink-0" style={{ width: fanWidth, height: 68 }}>
            {Array.from({ length: fanCount }).map((_, i) => {
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
          <span className="text-[7px] neon-blue font-bold mt-1">
            {hand.length} card{hand.length !== 1 ? 's' : ''}
          </span>
        </div>
      ) : (
        <div className="text-[7px] text-gray-600 italic">empty hand</div>
      )}

      {melds.length > 0 && (
        <div className="flex flex-col gap-1 mt-1 overflow-y-auto">
          <span className="text-[6px] text-gray-600 uppercase tracking-wider">their melds</span>
          <div className="flex flex-wrap gap-2">
            {melds.map(meld => (
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
