import { useEffect } from 'react';
import { LayoutGroup, motion } from 'framer-motion';
import { useMultiplayerStore } from '../../store/multiplayerStore';
import { useCountUp } from '../../hooks/useCountUp';
import { calculateRoundScores, scoreMelds, scoreHand } from '../../engine/scoring';
import { MultiplayerDrawArea } from './MultiplayerDrawArea';
import { MultiplayerHand } from './MultiplayerHand';
import { MultiplayerMeldArea } from './MultiplayerMeldArea';
import { MultiplayerOpponentArea } from './MultiplayerOpponentArea';
import { MultiplayerTurnControls } from './MultiplayerTurnControls';
import { ToastStack } from '../ui/ToastStack';
import confetti from 'canvas-confetti';

interface Props {
  onBack: () => void;
}

export function MultiplayerGameBoard({ onBack }: Props) {
  const { gameState, myPlayerId, status, errorMessage, dispatch } = useMultiplayerStore();

  if (status === 'disconnected' || status === 'error') {
    return (
      <div className="app-root flex flex-col items-center justify-center gap-4">
        <p className="text-[10px] neon-red">{errorMessage ?? 'Connection lost'}</p>
        <button className="btn-neon" onClick={onBack}>← MENU</button>
      </div>
    );
  }

  if (!gameState || !myPlayerId) {
    return (
      <div className="app-root flex flex-col items-center justify-center gap-4">
        <motion.p
          className="text-[9px] neon-purple"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          CONNECTING...
        </motion.p>
      </div>
    );
  }

  const { turn, players, melds, deck, discardPile, round } = gameState;
  const oppId = myPlayerId === 'player' ? 'opponent' : 'player';
  const myHand = players[myPlayerId].hand;
  const oppHand = players[oppId].hand;
  const isMyTurn = turn.activePlayer === myPlayerId;
  const phase = turn.phase;

  return (
    <>
      <LayoutGroup>
        <div
          className="app-root select-none"
          style={{
            display: 'grid',
            gridTemplateColumns: '200px 1fr',
            gridTemplateRows: 'auto 1fr 1fr auto auto',
            height: '100%',
          }}
        >
          {/* Scoreboard — full width */}
          <div style={{ gridColumn: '1 / -1' }}>
            <MultiplayerScoreboard
              myScore={players[myPlayerId].score}
              oppScore={players[oppId].score}
              round={round}
              onBack={onBack}
            />
          </div>

          {/* Opponent area */}
          <div className="border-r border-b border-purple-950 overflow-hidden">
            <MultiplayerOpponentArea
              hand={oppHand}
              melds={melds.filter(m => m.ownerId === oppId)}
              isThinking={!isMyTurn && phase !== 'round_over' && phase !== 'game_over'}
            />
          </div>

          {/* Meld area — spans both middle rows */}
          <div className="border-b border-purple-950 overflow-hidden" style={{ gridRow: '2 / 4' }}>
            <MultiplayerMeldArea
              melds={melds}
              myPlayerId={myPlayerId}
              selectedCards={turn.selectedCards}
              isMyTurn={isMyTurn}
              phase={phase}
            />
          </div>

          {/* Draw area */}
          <div className="border-r border-b border-purple-950">
            <MultiplayerDrawArea
              deck={deck}
              discardPile={discardPile}
              isMyTurn={isMyTurn}
              myPlayerId={myPlayerId}
              phase={phase}
            />
          </div>

          {/* Turn controls — full width */}
          <div style={{ gridColumn: '1 / -1' }} className="border-b border-purple-950">
            <MultiplayerTurnControls
              isMyTurn={isMyTurn}
              phase={phase}
              selectedCards={turn.selectedCards}
              drawnFromDiscard={turn.drawnFromDiscard}
              drawnCard={turn.drawnCard}
              myPlayerId={myPlayerId}
            />
          </div>

          {/* Player hand — full width */}
          <div
            style={{ gridColumn: '1 / -1' }}
            className="flex items-end justify-center pb-2 pt-4 overflow-hidden"
          >
            <MultiplayerHand
              hand={myHand}
              isMyTurn={isMyTurn}
              phase={phase}
              selectedCards={turn.selectedCards}
              drawnCard={turn.drawnCard}
              myPlayerId={myPlayerId}
            />
          </div>

          {/* Overlays */}
          {phase === 'round_over' && (
            <MultiplayerRoundSummary
              gameState={gameState}
              myPlayerId={myPlayerId}
              onNext={() => dispatch({ type: 'ACKNOWLEDGE_ROUND_OVER' })}
              isMyTurn={turn.activePlayer === myPlayerId}
            />
          )}
          {phase === 'game_over' && (
            <MultiplayerGameOver
              gameState={gameState}
              myPlayerId={myPlayerId}
              onBack={onBack}
            />
          )}
        </div>
      </LayoutGroup>
      <ToastStack />
    </>
  );
}

function MultiplayerScoreboard({ myScore, oppScore, round, onBack }: {
  myScore: number; oppScore: number; round: number; onBack: () => void;
}) {
  const myAnimated = useCountUp(myScore);
  const oppAnimated = useCountUp(oppScore);
  const myPct = Math.min((myScore / 500) * 100, 100);
  const oppPct = Math.min((oppScore / 500) * 100, 100);

  return (
    <div className="flex items-center justify-between px-3 py-2 border-b-2 border-gameAccent-gold bg-gradient-to-r from-gameBg-dark via-gameBg-card to-gameBg-dark">
      <div className="flex flex-col gap-1 flex-1">
        <div className="flex items-baseline gap-1">
          <span className="text-[13px] neon-teal">{myAnimated}</span>
          <span className="text-[6px] text-gray-400">/500</span>
        </div>
        <div className="w-full bg-gray-800 rounded-sm h-1.5 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-gameAccent-gold via-gameAccent-green to-gameAccent-gold transition-all duration-500" style={{ width: `${myPct}%` }} />
        </div>
        <span className="text-[6px] text-gray-500 uppercase">YOU</span>
      </div>

      <div className="flex flex-col items-center gap-0.5 px-4">
        <span className="text-[7px] gold-text">RUMMY 500</span>
        <span className="text-[6px] text-gray-500">ROUND {round}</span>
      </div>

      <div className="flex flex-col gap-1 flex-1 items-end">
        <div className="flex items-baseline gap-1">
          <span className="text-[6px] text-gray-400">/500</span>
          <span className="text-[13px] neon-red">{oppAnimated}</span>
        </div>
        <div className="w-full bg-gray-800 rounded-sm h-1.5 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-gameAccent-orange via-red-700 to-gameAccent-orange transition-all duration-500" style={{ width: `${oppPct}%` }} />
        </div>
        <span className="text-[6px] text-gray-500 uppercase">OPP</span>
      </div>

      <button
        className="ml-3 text-[8px] text-gray-600 hover:text-gray-400 border border-gray-800 hover:border-gray-600 px-2 py-1 rounded transition-colors"
        onClick={onBack}
      >
        ✕
      </button>
    </div>
  );
}

function MultiplayerRoundSummary({ gameState, myPlayerId, onNext, isMyTurn }: {
  gameState: any; myPlayerId: any; onNext: () => void; isMyTurn: boolean;
}) {
  const oppId = myPlayerId === 'player' ? 'opponent' : 'player';
  const myScore = useCountUp(gameState.players[myPlayerId].score, 800);
  const oppScore = useCountUp(gameState.players[oppId].score, 800);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />
      <motion.div
        className="relative z-10 p-6 rounded-xl border-2 flex flex-col gap-4 shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(26,16,53,0.98) 0%, rgba(13,9,32,0.98) 100%)',
          borderColor: '#D4AF37',
          maxWidth: 'min(95vw, 380px)',
          boxShadow: '0 0 40px rgba(212,175,55,0.2)',
        }}
        initial={{ scale: 0.85, y: 24 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ duration: 0.35, type: 'spring', damping: 20 }}
      >
        <h2 className="text-[11px] gold-text text-center uppercase tracking-widest">
          ROUND {gameState.round} COMPLETE
        </h2>

        <div className="flex justify-around">
          <div className="flex flex-col items-center gap-1">
            <span className="text-[8px] neon-teal">YOU</span>
            <span className="text-[18px] neon-teal font-bold">{myScore}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-[8px] neon-red">OPP</span>
            <span className="text-[18px] neon-red font-bold">{oppScore}</span>
          </div>
        </div>

        <div className="text-center">
          {isMyTurn ? (
            <button
              className="btn-neon-blue text-[9px] px-5 py-2 uppercase font-bold"
              onClick={onNext}
            >
              NEXT ROUND →
            </button>
          ) : (
            <motion.p
              className="text-[8px] neon-pink"
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              WAITING FOR OPPONENT...
            </motion.p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function MultiplayerGameOver({ gameState, myPlayerId, onBack }: {
  gameState: any; myPlayerId: any; onBack: () => void;
}) {
  const youWon = gameState.winner === myPlayerId;
  const oppId = myPlayerId === 'player' ? 'opponent' : 'player';
  const myScore = useCountUp(gameState.players[myPlayerId].score, 1000);
  const oppScore = useCountUp(gameState.players[oppId].score, 1000);
  const maxScore = Math.max(gameState.players[myPlayerId].score, gameState.players[oppId].score, 1);

  useEffect(() => {
    if (youWon) {
      confetti({ particleCount: 140, spread: 80, origin: { y: 0.5 }, colors: ['#D4AF37', '#7C3AED', '#10B981', '#F97316'] });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div className="absolute inset-0" style={{ background: youWon ? 'rgba(0,0,0,0.88)' : 'rgba(40,0,0,0.92)' }} />
      <motion.div
        className="relative z-10 p-8 rounded-2xl border-2 flex flex-col items-center gap-5 text-center"
        style={{
          background: 'linear-gradient(135deg, rgba(26,16,53,0.99) 0%, rgba(13,9,32,0.99) 100%)',
          borderColor: youWon ? '#D4AF37' : '#7f1d1d',
          maxWidth: 360, width: '90%',
        }}
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
      >
        <div className={`text-[16px] font-bold ${youWon ? 'gold-text' : 'neon-red'}`}>
          {youWon ? '🏆 YOU WIN!' : '💀 YOU LOSE'}
        </div>

        <div className="w-full flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[7px]">
              <span className="neon-teal">YOU</span>
              <span className="neon-teal font-bold">{myScore}</span>
            </div>
            <div className="w-full bg-gray-900 rounded-sm h-3 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-gameAccent-green via-gameAccent-gold to-gameAccent-green"
                initial={{ width: 0 }}
                animate={{ width: `${(gameState.players[myPlayerId].score / maxScore) * 100}%` }}
                transition={{ duration: 1, delay: 0.4 }}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-[7px]">
              <span className="neon-red">OPP</span>
              <span className="neon-red font-bold">{oppScore}</span>
            </div>
            <div className="w-full bg-gray-900 rounded-sm h-3 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-gameAccent-orange via-red-700 to-gameAccent-orange"
                initial={{ width: 0 }}
                animate={{ width: `${(gameState.players[oppId].score / maxScore) * 100}%` }}
                transition={{ duration: 1, delay: 0.4 }}
              />
            </div>
          </div>
        </div>

        <button className="btn-neon btn-neon-blue text-[9px] px-5 py-2 uppercase font-bold" onClick={onBack}>
          ← MENU
        </button>
      </motion.div>
    </motion.div>
  );
}
