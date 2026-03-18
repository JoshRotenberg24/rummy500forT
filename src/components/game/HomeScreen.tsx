import { motion } from 'framer-motion';

interface Props {
  onSolo: () => void;
  onMultiplayer: () => void;
}

const SUIT_SYMBOLS = ['♠', '♥', '♦', '♣'];

export function HomeScreen({ onSolo, onMultiplayer }: Props) {
  return (
    <div className="app-root flex flex-col items-center justify-center gap-8 p-6">
      {/* Title */}
      <motion.div
        className="flex flex-col items-center gap-3"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Suit row */}
        <div className="flex gap-4 text-2xl">
          {SUIT_SYMBOLS.map((s, i) => (
            <motion.span
              key={s}
              className={i % 2 === 0 ? 'neon-teal' : 'neon-red'}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
            >
              {s}
            </motion.span>
          ))}
        </div>

        <h1 className="text-[22px] neon-purple tracking-widest">RUMMY 500</h1>
        <p className="text-[8px] text-gray-500 tracking-widest">FIRST TO 500 WINS</p>
      </motion.div>

      {/* Mode selection */}
      <motion.div
        className="flex flex-col gap-4 w-full max-w-xs"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <button
          className="btn-neon btn-neon-green py-4 text-[10px] tracking-widest"
          onClick={onSolo}
        >
          ▶ SOLO vs AI
        </button>

        <button
          className="btn-neon btn-neon-blue py-4 text-[10px] tracking-widest"
          onClick={onMultiplayer}
        >
          ⚡ MULTIPLAYER
        </button>
      </motion.div>

      {/* Rules summary */}
      <motion.div
        className="text-[7px] text-gray-600 text-center max-w-xs leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <p>Draw · Meld sets & runs · Discard</p>
        <p className="mt-1">Aces = 15 pts · Face = 10 pts · Numbers = 5 pts</p>
        <p className="mt-1">Unmelded cards subtract from your score</p>
      </motion.div>
    </div>
  );
}
