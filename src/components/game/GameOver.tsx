import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';

export function GameOver() {
  const state = useGameStore(s => s.state);
  const reset = useGameStore(s => s.reset);
  const { winner, players } = state;
  const youWon = winner === 'player';

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-90" />
      <motion.div
        className="relative z-10 p-10 rounded-2xl border border-purple-500 flex flex-col items-center gap-6 text-center"
        style={{ background: 'rgba(10, 10, 26, 0.98)', maxWidth: 360, width: '90%' }}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        <div className={`text-[13px] ${youWon ? 'neon-teal' : 'neon-red'}`}>
          {youWon ? '🏆 YOU WIN!' : '💀 YOU LOSE'}
        </div>

        <div className="flex gap-8">
          <div className="flex flex-col gap-1">
            <span className="text-[6px] text-gray-500">YOU</span>
            <span className="text-[14px] neon-teal">{players.player.score}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[6px] text-gray-500">OPP</span>
            <span className="text-[14px] neon-red">{players.opponent.score}</span>
          </div>
        </div>

        <button className="btn-neon btn-neon-green" onClick={reset}>
          PLAY AGAIN
        </button>
      </motion.div>
    </motion.div>
  );
}
