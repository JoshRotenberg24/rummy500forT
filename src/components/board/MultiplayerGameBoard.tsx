import { useMultiplayerStore } from '../../store/multiplayerStore';
import { GameOver } from '../game/GameOver';
import { RoundSummary } from '../game/RoundSummary';
import { MultiplayerDrawArea } from './MultiplayerDrawArea';
import { MultiplayerHand } from './MultiplayerHand';
import { MultiplayerMeldArea } from './MultiplayerMeldArea';
import { MultiplayerOpponentArea } from './MultiplayerOpponentArea';
import { MultiplayerTurnControls } from './MultiplayerTurnControls';

interface Props {
  onBack: () => void;
}

export function MultiplayerGameBoard({ onBack }: Props) {
  const { gameState, myPlayerId, status, errorMessage } = useMultiplayerStore();

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
        <p className="text-[9px] neon-purple animate-pulse">CONNECTING...</p>
      </div>
    );
  }

  const { turn, players, melds, deck, discardPile, round } = gameState;
  const myHand = players[myPlayerId].hand;
  const oppId = myPlayerId === 'player' ? 'opponent' : 'player';
  const oppHand = players[oppId].hand;
  const isMyTurn = turn.activePlayer === myPlayerId;
  const phase = turn.phase;

  return (
    <div className="app-root select-none">
      {/* Scoreboard */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-purple-900">
        <div className="flex flex-col gap-0.5">
          <span className="text-[6px] text-gray-500">YOU</span>
          <span className="text-[11px] neon-teal">{players[myPlayerId].score}</span>
        </div>
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[7px] neon-purple">RUMMY 500</span>
          <span className="text-[6px] text-gray-500">ROUND {round}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end gap-0.5">
            <span className="text-[6px] text-gray-500">OPP</span>
            <span className="text-[11px] neon-red">{players[oppId].score}</span>
          </div>
          <button
            className="text-[6px] text-gray-600 hover:text-gray-400 border border-gray-800 hover:border-gray-600 px-1.5 py-1 rounded"
            onClick={onBack}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Opponent area */}
      <div className="border-b border-purple-950">
        <MultiplayerOpponentArea hand={oppHand} melds={melds.filter(m => m.ownerId === oppId)} isThinking={!isMyTurn && phase !== 'round_over' && phase !== 'game_over'} />
      </div>

      {/* Draw + Meld area */}
      <div className="border-b border-purple-950 flex">
        <div className="border-r border-purple-950 flex-shrink-0">
          <MultiplayerDrawArea deck={deck} discardPile={discardPile} isMyTurn={isMyTurn} myPlayerId={myPlayerId} phase={turn.phase} />
        </div>
        <div className="flex-1 overflow-hidden">
          <MultiplayerMeldArea melds={melds} myPlayerId={myPlayerId} selectedCards={turn.selectedCards} isMyTurn={isMyTurn} phase={turn.phase} />
        </div>
      </div>

      {/* Turn controls */}
      <div className="border-b border-purple-950">
        <MultiplayerTurnControls isMyTurn={isMyTurn} phase={turn.phase} selectedCards={turn.selectedCards} drawnFromDiscard={turn.drawnFromDiscard} drawnCard={turn.drawnCard} myPlayerId={myPlayerId} />
      </div>

      {/* My hand */}
      <div className="flex-1 flex items-center justify-center overflow-hidden pb-2 pt-3">
        <MultiplayerHand hand={myHand} isMyTurn={isMyTurn} phase={turn.phase} selectedCards={turn.selectedCards} drawnCard={turn.drawnCard} myPlayerId={myPlayerId} />
      </div>

      {/* Overlays */}
      {phase === 'round_over' && <MultiplayerRoundSummary gameState={gameState} myPlayerId={myPlayerId} />}
      {phase === 'game_over' && <MultiplayerGameOver gameState={gameState} myPlayerId={myPlayerId} onBack={onBack} />}
    </div>
  );
}

function MultiplayerRoundSummary({ gameState, myPlayerId }: { gameState: any; myPlayerId: any }) {
  const dispatch = useMultiplayerStore(s => s.dispatch);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div className="p-8 rounded-2xl border border-purple-700 flex flex-col gap-4 items-center" style={{ background: 'rgba(10,10,26,0.97)', maxWidth: 340 }}>
        <p className="text-[11px] neon-purple">ROUND {gameState.round} OVER</p>
        <p className="text-[8px] text-gray-400">YOU: {gameState.players[myPlayerId].score} pts</p>
        <p className="text-[8px] text-gray-400">OPP: {gameState.players[myPlayerId === 'player' ? 'opponent' : 'player'].score} pts</p>
        {gameState.turn.activePlayer === myPlayerId && (
          <button className="btn-neon btn-neon-green" onClick={() => dispatch({ type: 'ACKNOWLEDGE_ROUND_OVER' })}>
            NEXT ROUND →
          </button>
        )}
        {gameState.turn.activePlayer !== myPlayerId && (
          <p className="text-[8px] neon-pink animate-pulse">WAITING FOR OPPONENT...</p>
        )}
      </div>
    </div>
  );
}

function MultiplayerGameOver({ gameState, myPlayerId, onBack }: { gameState: any; myPlayerId: any; onBack: () => void }) {
  const youWon = gameState.winner === myPlayerId;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
      <div className="p-10 rounded-2xl border border-purple-500 flex flex-col items-center gap-6" style={{ background: 'rgba(10,10,26,0.98)', maxWidth: 340 }}>
        <p className={`text-[13px] ${youWon ? 'neon-teal' : 'neon-red'}`}>{youWon ? '🏆 YOU WIN!' : '💀 YOU LOSE'}</p>
        <div className="flex gap-8">
          <div className="flex flex-col gap-1 items-center">
            <span className="text-[6px] text-gray-500">YOU</span>
            <span className="text-[14px] neon-teal">{gameState.players[myPlayerId].score}</span>
          </div>
          <div className="flex flex-col gap-1 items-center">
            <span className="text-[6px] text-gray-500">OPP</span>
            <span className="text-[14px] neon-red">{gameState.players[myPlayerId === 'player' ? 'opponent' : 'player'].score}</span>
          </div>
        </div>
        <button className="btn-neon" onClick={onBack}>← MENU</button>
      </div>
    </div>
  );
}
