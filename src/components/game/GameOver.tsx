import { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useGameStore } from '../../store/gameStore';
import { useCountUp } from '../../hooks/useCountUp';

export function GameOver() {
  const state = useGameStore(s => s.state);
  const reset = useGameStore(s => s.reset);
  const { winner, players } = state;
  const youWon = winner === 'player';

  const playerScore = useCountUp(players.player.score, 1000);
  const opponentScore = useCountUp(players.opponent.score, 1000);

  // Fire confetti on win, screen flash on loss
  useEffect(() => {
    if (youWon) {
      confetti({
        particleCount: 140,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#D4AF37', '#7C3AED', '#10B981', '#F97316', '#ffffff'],
        ticks: 200,
      });
      // Second burst
      setTimeout(() => {
        confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0, y: 0.6 } });
        confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1, y: 0.6 } });
      }, 400);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const maxScore = Math.max(players.player.score, players.opponent.score, 1);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Loss: red flash backdrop */}
      <motion.div
        className="absolute inset-0"
        style={{ background: youWon ? 'rgba(0,0,0,0.88)' : 'rgba(40,0,0,0.92)' }}
        animate={youWon ? {} : { opacity: [1, 0.6, 1] }}
        transition={{ duration: 0.6, repeat: 3 }}
      />

      <motion.div
        className="relative z-10 p-8 rounded-2xl border-2 flex flex-col items-center gap-5 text-center shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(26,16,53,0.99) 0%, rgba(13,9,32,0.99) 100%)',
          borderColor: youWon ? '#D4AF37' : '#7f1d1d',
          maxWidth: 380,
          width: '90%',
          boxShadow: youWon
            ? '0 0 40px rgba(212,175,55,0.3), 0 0 80px rgba(212,175,55,0.1)'
            : '0 0 40px rgba(220,38,38,0.3)',
        }}
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
      >
        {/* Title */}
        <motion.div
          className={`text-[16px] font-bold ${youWon ? 'gold-text' : 'neon-red'}`}
          animate={youWon ? { textShadow: ['0 0 10px rgba(212,175,55,0.5)', '0 0 25px rgba(212,175,55,0.9)', '0 0 10px rgba(212,175,55,0.5)'] } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {youWon ? '🏆 YOU WIN!' : '💀 YOU LOSE'}
        </motion.div>

        <p className="text-[7px] text-gray-500">
          {youWon ? 'You reached 500 first!' : 'The AI reached 500 first.'}
        </p>

        {/* Score bars */}
        <div className="w-full flex flex-col gap-2">
          {/* Player bar */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[7px]">
              <span className="neon-teal">YOU</span>
              <span className="neon-teal font-bold">{playerScore}</span>
            </div>
            <div className="w-full bg-gray-900 rounded-sm h-3 overflow-hidden border border-gray-800">
              <motion.div
                className="h-full bg-gradient-to-r from-gameAccent-green via-gameAccent-gold to-gameAccent-green"
                initial={{ width: 0 }}
                animate={{ width: `${(players.player.score / maxScore) * 100}%` }}
                transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Opponent bar */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[7px]">
              <span className="neon-red">AI</span>
              <span className="neon-red font-bold">{opponentScore}</span>
            </div>
            <div className="w-full bg-gray-900 rounded-sm h-3 overflow-hidden border border-gray-800">
              <motion.div
                className="h-full bg-gradient-to-r from-gameAccent-orange via-red-700 to-gameAccent-orange"
                initial={{ width: 0 }}
                animate={{ width: `${(players.opponent.score / maxScore) * 100}%` }}
                transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>

        <motion.button
          className={`btn-neon text-[9px] px-6 py-2.5 uppercase font-bold tracking-wider ${youWon ? 'btn-neon-blue' : 'btn-neon-green'}`}
          onClick={reset}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          animate={{ boxShadow: ['0 0 8px rgba(212,175,55,0.3)', '0 0 20px rgba(212,175,55,0.6)', '0 0 8px rgba(212,175,55,0.3)'] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          PLAY AGAIN
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
