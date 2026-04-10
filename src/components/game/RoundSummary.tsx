import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { calculateRoundScores, scoreMelds, scoreHand } from '../../engine/scoring';
import { useCountUp } from '../../hooks/useCountUp';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

function ScoreRow({ label, value, positive }: { label: string; value: number; positive: boolean }) {
  const animated = useCountUp(value, 600);
  return (
    <motion.div variants={item} className="flex justify-between text-[8px]">
      <span className="text-gray-300">{label}</span>
      <span className={positive ? 'neon-teal font-bold' : 'neon-red font-bold'}>
        {positive ? '+' : '-'}{animated}
      </span>
    </motion.div>
  );
}

function TotalRow({ label, value }: { label: string; value: number }) {
  const animated = useCountUp(value, 800);
  return (
    <motion.div variants={item} className="flex justify-between text-[9px] border-t border-gray-700 pt-2">
      <span className="text-gray-300 font-bold">{label}</span>
      <span className="gold-text font-bold text-[10px]">{animated}</span>
    </motion.div>
  );
}

export function RoundSummary() {
  const state = useGameStore(s => s.state);
  const dispatch = useGameStore(s => s.dispatch);
  const roundScores = calculateRoundScores(state);

  const playerMelds = scoreMelds(state.melds, 'player');
  const oppMelds = scoreMelds(state.melds, 'opponent');
  const playerHand = scoreHand(state.players.player.hand);
  const oppHand = scoreHand(state.players.opponent.hand);

  const playerHandEmpty = state.players.player.hand.length === 0;
  const oppHandEmpty = state.players.opponent.hand.length === 0;
  const roundWinner = playerHandEmpty && !oppHandEmpty ? 'player'
    : oppHandEmpty && !playerHandEmpty ? 'opponent'
    : null;

  const [revealed, setRevealed] = React.useState(false);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
      <motion.div
        className="relative z-10 p-6 rounded-xl border-2 flex flex-col gap-4 shadow-2xl w-full"
        style={{
          background: 'linear-gradient(135deg, rgba(26,16,53,0.98) 0%, rgba(13,9,32,0.98) 100%)',
          borderColor: '#D4AF37',
          maxWidth: 'min(95vw, 440px)',
          boxShadow: '0 0 40px rgba(212,175,55,0.2)',
        }}
        initial={{ scale: 0.85, y: 24 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.35, type: 'spring', damping: 20 }}
        onAnimationComplete={() => setRevealed(true)}
      >
        {/* Header */}
        <motion.div className="text-center space-y-1" variants={item} initial="hidden" animate="show">
          <h2 className="text-[12px] font-bold uppercase tracking-widest gold-text">
            ROUND {state.round} COMPLETE
          </h2>
          {roundWinner && (
            <p className={`text-[8px] uppercase font-bold ${roundWinner === 'player' ? 'neon-teal' : 'neon-red'}`}>
              {roundWinner === 'player' ? '🏆 YOU EMPTIED YOUR HAND!' : '⚠ AI EMPTIED THEIR HAND'}
            </p>
          )}
        </motion.div>

        {/* Score columns */}
        <div className="grid grid-cols-2 gap-3">
          {/* Player */}
          <motion.div
            className="flex flex-col gap-2 p-3 rounded border border-gameAccent-green/30 bg-gameAccent-green/5"
            variants={container}
            initial="hidden"
            animate={revealed ? 'show' : 'hidden'}
          >
            <p className="text-[9px] neon-teal text-center font-bold uppercase">YOU</p>
            <ScoreRow label="Melds:" value={playerMelds} positive={true} />
            <ScoreRow label="Unmelded:" value={playerHand} positive={false} />
            <motion.div variants={item} className="flex justify-between text-[8px] border-t border-gameAccent-green/30 pt-1 mt-1">
              <span className="text-gray-400">Round:</span>
              <span className={`font-bold ${roundScores.player >= 0 ? 'text-gameAccent-green' : 'neon-red'}`}>
                {roundScores.player >= 0 ? '+' : ''}{roundScores.player}
              </span>
            </motion.div>
            <TotalRow label="Total:" value={state.players.player.score} />
          </motion.div>

          {/* Opponent */}
          <motion.div
            className="flex flex-col gap-2 p-3 rounded border border-gameAccent-orange/30 bg-gameAccent-orange/5"
            variants={container}
            initial="hidden"
            animate={revealed ? 'show' : 'hidden'}
          >
            <p className="text-[9px] neon-red text-center font-bold uppercase">AI</p>
            <ScoreRow label="Melds:" value={oppMelds} positive={true} />
            <ScoreRow label="Unmelded:" value={oppHand} positive={false} />
            <motion.div variants={item} className="flex justify-between text-[8px] border-t border-gameAccent-orange/30 pt-1 mt-1">
              <span className="text-gray-400">Round:</span>
              <span className={`font-bold ${roundScores.opponent >= 0 ? 'text-gameAccent-green' : 'neon-red'}`}>
                {roundScores.opponent >= 0 ? '+' : ''}{roundScores.opponent}
              </span>
            </motion.div>
            <TotalRow label="Total:" value={state.players.opponent.score} />
          </motion.div>
        </div>

        {/* Next button — appears last */}
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          <button
            className="btn-neon-blue text-[9px] px-5 py-2 uppercase font-bold tracking-wider"
            onClick={() => dispatch({ type: 'ACKNOWLEDGE_ROUND_OVER' })}
          >
            NEXT ROUND →
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

