import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onSolo: () => void;
  onMultiplayer: () => void;
}

const TITLE = 'RUMMY 500';
const SUIT_SYMBOLS = ['♠', '♥', '♦', '♣'];
const SUIT_COLORS = ['neon-teal', 'neon-red', 'neon-red', 'neon-teal'];

const RULES = [
  '① Draw a card from the deck or discard pile',
  '② Meld sets (same rank) or runs (same suit, sequential)',
  '③ Discard one card to end your turn',
  '✦ Aces = 15 pts · Face = 10 pts · Numbers = 5 pts',
  '✦ Unmelded cards subtract from your score',
  '✦ First to 500 points wins!',
];

export function HomeScreen({ onSolo, onMultiplayer }: Props) {
  const [showRules, setShowRules] = useState(false);

  return (
    <div className="app-root flex flex-col items-center justify-center gap-7 p-6 relative overflow-hidden">
      {/* Decorative background suit symbols */}
      {['♠', '♥', '♦', '♣'].map((s, i) => (
        <motion.span
          key={s}
          className="absolute text-[120px] select-none pointer-events-none"
          style={{
            color: i % 2 === 0 ? 'rgba(16,185,129,0.04)' : 'rgba(255,85,85,0.04)',
            top: ['5%', '60%', '15%', '55%'][i],
            left: ['-5%', '80%', '75%', '-3%'][i],
          }}
          animate={{ rotate: [0, 8, 0, -8, 0] }}
          transition={{ duration: 20 + i * 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          {s}
        </motion.span>
      ))}

      {/* Title section */}
      <motion.div
        className="flex flex-col items-center gap-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Suit row */}
        <div className="flex gap-5 text-[22px]">
          {SUIT_SYMBOLS.map((s, i) => (
            <motion.span
              key={s}
              className={SUIT_COLORS[i]}
              animate={{ y: [0, -7, 0] }}
              transition={{ duration: 2.2, delay: i * 0.28, repeat: Infinity, ease: 'easeInOut' }}
            >
              {s}
            </motion.span>
          ))}
        </div>

        {/* Letter-by-letter title */}
        <h1 className="flex gap-0 text-[20px] tracking-widest">
          {TITLE.split('').map((char, i) => (
            <motion.span
              key={i}
              className={char === ' ' ? 'w-4' : 'neon-purple'}
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.3 + i * 0.06 }}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </h1>

        <motion.p
          className="text-[7px] text-gray-500 tracking-widest"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
        >
          FIRST TO 500 WINS
        </motion.p>
      </motion.div>

      {/* Mode buttons */}
      <motion.div
        className="flex flex-col gap-3 w-full max-w-xs"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <button
          className="btn-neon btn-neon-green py-4 text-[10px] tracking-widest"
          onClick={onSolo}
        >
          ▶ SOLO vs CPU
        </button>

        <button
          className="btn-neon btn-neon-blue py-4 text-[10px] tracking-widest"
          onClick={onMultiplayer}
        >
          ⚡ MULTIPLAYER
        </button>
      </motion.div>

      {/* How to play toggle */}
      <motion.div
        className="w-full max-w-xs"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
      >
        <button
          className="w-full text-[7px] text-gray-600 hover:text-gray-400 transition-colors py-1 tracking-widest uppercase"
          onClick={() => setShowRules(r => !r)}
        >
          {showRules ? '▲ HIDE RULES' : '▼ HOW TO PLAY'}
        </button>

        <AnimatePresence>
          {showRules && (
            <motion.div
              className="mt-2 flex flex-col gap-1.5 px-3 py-3 rounded border border-purple-950 bg-gameBg-dark/60"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {RULES.map((rule, i) => (
                <motion.p
                  key={i}
                  className="text-[6.5px] text-gray-400 leading-relaxed"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                >
                  {rule}
                </motion.p>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
