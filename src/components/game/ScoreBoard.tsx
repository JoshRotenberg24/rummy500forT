import { useGameStore } from '../../store/gameStore';

interface Props {
  reset?: () => void;
  onHome?: () => void;
}

export function ScoreBoard({ reset, onHome }: Props) {
  const state = useGameStore(s => s.state);
  const { players, round } = state;

  return (
    <div className="flex items-center justify-between px-3 py-1.5 border-b border-purple-900">
      <div className="flex flex-col gap-0.5">
        <span className="text-[6px] text-gray-500">YOU</span>
        <span className="text-[11px] neon-teal">{players.player.score}</span>
      </div>

      <div className="flex flex-col items-center gap-0.5">
        <span className="text-[7px] neon-purple">RUMMY 500</span>
        <span className="text-[6px] text-gray-500">ROUND {round}</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-[6px] text-gray-500">OPP</span>
          <span className="text-[11px] neon-red">{players.opponent.score}</span>
        </div>
        <div className="flex gap-2">
          {onHome && (
            <button
              className="text-[9px] text-gray-400 hover:text-white transition-colors border border-gray-700 hover:border-gray-400 px-2.5 py-1.5 rounded"
              onClick={onHome}
              title="Home"
            >
              ⌂
            </button>
          )}
          {reset && (
            <button
              className="text-[9px] text-gray-500 hover:text-gray-300 transition-colors border border-gray-800 hover:border-gray-500 px-2.5 py-1.5 rounded"
              onClick={reset}
              title="New Game"
            >
              ⟳
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
