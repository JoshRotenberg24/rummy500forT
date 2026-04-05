import { motion } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { calculateRoundScores, scoreMelds, scoreHand } from '../../engine/scoring';

export function RoundSummary() {
  const state = useGameStore(s => s.state);
  const dispatch = useGameStore(s => s.dispatch);
  const roundScores = calculateRoundScores(state);

  const playerMelds = scoreMelds(state.melds, 'player');
  const oppMelds = scoreMelds(state.melds, 'opponent');
  const playerHand = scoreHand(state.players.player.hand);
  const oppHand = scoreHand(state.players.opponent.hand);

  // Determine who won the round (emptied hand first)
  const playerHandEmpty = state.players.player.hand.length === 0;
  const oppHandEmpty = state.players.opponent.hand.length === 0;
  const roundWinner = playerHandEmpty && !oppHandEmpty ? 'player' : oppHandEmpty && !playerHandEmpty ? 'opponent' : null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <motion.div
        className="relative z-10 p-8 rounded-xl border-2 flex flex-col gap-6 shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(31, 41, 55, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%)',
          borderColor: '#D4AF37',
          maxWidth: 'min(95vw, 420px)',
        }}
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="text-center space-y-1">
          <h2 className="text-[13px] font-bold uppercase tracking-widest gold-text drop-shadow-lg">
            🎊 ROUND {state.round} COMPLETE 🎊
          </h2>
          {roundWinner && (
            <p className="text-[8px] uppercase text-gameAccent-green font-bold">
              {roundWinner === 'player' ? '🏆 YOU EMPTIED YOUR HAND!' : '⚠️ AI EMPTIED THEIR HAND'}
            </p>
          )}
        </div>

        {/* Score breakdown */}
        <div className="grid grid-cols-2 gap-4">
          {/* Player column */}
          <div className="flex flex-col gap-3 p-3 rounded border border-gameAccent-green/30 bg-gameAccent-green/5">
            <p className="text-[9px] neon-teal text-center font-bold uppercase">YOU</p>

            <div className="space-y-1.5 text-[8px]">
              <div className="flex justify-between text-gray-300">
                <span>Melds:</span>
                <span className="neon-teal font-bold">+{playerMelds}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Unmelded:</span>
                <span className="neon-red font-bold">-{playerHand}</span>
              </div>
            </div>

            <div className="border-t border-gameAccent-green/30 pt-2 space-y-1">
              <div className="flex justify-between text-[8px] font-bold">
                <span className="text-gray-400">Round Score:</span>
                <span className={roundScores.player >= 0 ? 'text-gameAccent-green' : 'neon-red'}>
                  {roundScores.player >= 0 ? '+' : ''}{roundScores.player}
                </span>
              </div>
              <div className="flex justify-between text-[9px] border-t border-gameAccent-green/30 pt-1">
                <span className="text-gray-300 font-bold">Total:</span>
                <span className="gold-text text-[10px]">{state.players.player.score}</span>
              </div>
            </div>
          </div>

          {/* Opponent column */}
          <div className="flex flex-col gap-3 p-3 rounded border border-gameAccent-orange/30 bg-gameAccent-orange/5">
            <p className="text-[9px] neon-red text-center font-bold uppercase">AI</p>

            <div className="space-y-1.5 text-[8px]">
              <div className="flex justify-between text-gray-300">
                <span>Melds:</span>
                <span className="neon-teal font-bold">+{oppMelds}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Unmelded:</span>
                <span className="neon-red font-bold">-{oppHand}</span>
              </div>
            </div>

            <div className="border-t border-gameAccent-orange/30 pt-2 space-y-1">
              <div className="flex justify-between text-[8px] font-bold">
                <span className="text-gray-400">Round Score:</span>
                <span className={roundScores.opponent >= 0 ? 'text-gameAccent-green' : 'neon-red'}>
                  {roundScores.opponent >= 0 ? '+' : ''}{roundScores.opponent}
                </span>
              </div>
              <div className="flex justify-between text-[9px] border-t border-gameAccent-orange/30 pt-1">
                <span className="text-gray-300 font-bold">Total:</span>
                <span className="gold-text text-[10px]">{state.players.opponent.score}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Next button */}
        <button
          className="btn-neon-blue text-[9px] px-4 py-2.5 uppercase font-bold mx-auto tracking-wider hover:scale-105 active:scale-95"
          onClick={() => dispatch({ type: 'ACKNOWLEDGE_ROUND_OVER' })}
        >
          NEXT ROUND →
        </button>
      </motion.div>
    </motion.div>
  );
}
