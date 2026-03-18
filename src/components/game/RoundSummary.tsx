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

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-80" />
      <motion.div
        className="relative z-10 p-8 rounded-2xl border border-purple-700 flex flex-col gap-6"
        style={{ background: 'rgba(10, 10, 26, 0.97)', maxWidth: 380, width: '92%' }}
        initial={{ scale: 0.85 }}
        animate={{ scale: 1 }}
      >
        <h2 className="text-center text-[11px] neon-purple">ROUND {state.round} OVER</h2>

        <div className="grid grid-cols-2 gap-4">
          {/* Player column */}
          <div className="flex flex-col gap-2">
            <p className="text-[8px] neon-teal text-center">YOU</p>
            <div className="text-[7px] text-gray-400 flex justify-between">
              <span>Melds:</span><span className="neon-teal">+{playerMelds}</span>
            </div>
            <div className="text-[7px] text-gray-400 flex justify-between">
              <span>Hand:</span><span className="neon-red">-{playerHand}</span>
            </div>
            <div className="text-[7px] border-t border-gray-700 pt-1 flex justify-between">
              <span>Round:</span>
              <span className={roundScores.player >= 0 ? 'neon-teal' : 'neon-red'}>
                {roundScores.player >= 0 ? '+' : ''}{roundScores.player}
              </span>
            </div>
            <div className="text-[8px] flex justify-between">
              <span className="text-gray-500">Total:</span>
              <span className="neon-purple">{state.players.player.score}</span>
            </div>
          </div>

          {/* Opponent column */}
          <div className="flex flex-col gap-2">
            <p className="text-[8px] neon-red text-center">OPP</p>
            <div className="text-[7px] text-gray-400 flex justify-between">
              <span>Melds:</span><span className="neon-teal">+{oppMelds}</span>
            </div>
            <div className="text-[7px] text-gray-400 flex justify-between">
              <span>Hand:</span><span className="neon-red">-{oppHand}</span>
            </div>
            <div className="text-[7px] border-t border-gray-700 pt-1 flex justify-between">
              <span>Round:</span>
              <span className={roundScores.opponent >= 0 ? 'neon-teal' : 'neon-red'}>
                {roundScores.opponent >= 0 ? '+' : ''}{roundScores.opponent}
              </span>
            </div>
            <div className="text-[8px] flex justify-between">
              <span className="text-gray-500">Total:</span>
              <span className="neon-purple">{state.players.opponent.score}</span>
            </div>
          </div>
        </div>

        <button
          className="btn-neon btn-neon-green mx-auto"
          onClick={() => dispatch({ type: 'ACKNOWLEDGE_ROUND_OVER' })}
        >
          NEXT ROUND →
        </button>
      </motion.div>
    </motion.div>
  );
}
