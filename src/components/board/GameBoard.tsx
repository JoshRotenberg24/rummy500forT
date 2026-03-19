import { useGameStore } from '../../store/gameStore';
import { GameOver } from '../game/GameOver';
import { RoundSummary } from '../game/RoundSummary';
import { ScoreBoard } from '../game/ScoreBoard';
import { DrawArea } from './DrawArea';
import { MeldArea } from './MeldArea';
import { OpponentArea } from './OpponentArea';
import { PlayerHand } from './PlayerHand';
import { TurnControls } from './TurnControls';

export function GameBoard() {
  const phase = useGameStore(s => s.state.turn.phase);
  const reset = useGameStore(s => s.reset);

  return (
    <div className="app-root select-none">
      {/* Scoreboard */}
      <ScoreBoard reset={reset} />

      {/* Opponent area */}
      <div className="border-b border-purple-950">
        <OpponentArea />
      </div>

      {/* Draw area (deck + discard) + Meld area side by side */}
      <div className="border-b border-purple-950 flex">
        <div className="border-r border-purple-950 flex-shrink-0">
          <DrawArea />
        </div>
        <div className="flex-1 overflow-hidden">
          <MeldArea />
        </div>
      </div>

      {/* Turn controls */}
      <div className="border-b border-purple-950">
        <TurnControls />
      </div>

      {/* Player hand — flex-1 so it takes remaining space */}
      <div className="flex-1 flex items-end justify-center pb-2 pt-6">
        <PlayerHand />
      </div>

      {/* Overlays */}
      {phase === 'round_over' && <RoundSummary />}
      {phase === 'game_over' && <GameOver />}
    </div>
  );
}
