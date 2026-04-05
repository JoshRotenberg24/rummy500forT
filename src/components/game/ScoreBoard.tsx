import { useGameStore } from '../../store/gameStore';

interface Props {
  reset?: () => void;
  onHome?: () => void;
}

export function ScoreBoard({ reset, onHome }: Props) {
  const state = useGameStore(s => s.state);
  const { players, round } = state;

  // Calculate progress percentage (0-100)
  const playerProgress = Math.min((players.player.score / 500) * 100, 100);
  const opponentProgress = Math.min((players.opponent.score / 500) * 100, 100);

  return (
    <div className="flex items-center justify-between px-3 py-2 border-b-2 border-gameAccent-gold bg-gradient-to-r from-gameBg-dark via-gameBg-card to-gameBg-dark">
      {/* Player Score */}
      <div className="flex flex-col gap-1 flex-1">
        <div className="flex justify-between items-center">
          <span className="text-[6px] uppercase tracking-widest text-gray-400">Your Hand</span>
          <span className="text-[7px] uppercase text-gameAccent-gold font-bold">{players.player.hand.length} cards</span>
        </div>
        <div>
          <span className="text-[6px] text-gray-500 block mb-0.5">SCORE</span>
          <div className="flex items-baseline gap-1">
            <span className="text-[13px] neon-teal drop-shadow-lg">{players.player.score}</span>
            <span className="text-[6px] text-gray-400">/500</span>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="w-full bg-gray-800 rounded-sm h-2 border border-gameAccent-gold/30 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gameAccent-gold via-gameAccent-purple to-gameAccent-gold transition-all duration-500"
            style={{ width: `${playerProgress}%` }}
          />
        </div>
      </div>

      {/* Center Info */}
      <div className="flex flex-col items-center gap-1 px-4">
        <span className="text-[7px] uppercase tracking-widest text-gameAccent-gold drop-shadow-lg">💰 RUMMY 500 💰</span>
        <span className="text-[6px] text-gray-500">ROUND {round}</span>
      </div>

      {/* Opponent Score */}
      <div className="flex flex-col gap-1 flex-1 items-end">
        <div className="flex justify-between items-center w-full">
          <span className="text-[7px] uppercase text-gameAccent-orange font-bold">AI Hand</span>
          <span className="text-[6px] uppercase tracking-widest text-gray-400">{players.opponent.hand.length}</span>
        </div>
        <div className="text-right">
          <span className="text-[6px] text-gray-500 block mb-0.5">OPP SCORE</span>
          <div className="flex items-baseline justify-end gap-1">
            <span className="text-[6px] text-gray-400">/500</span>
            <span className="text-[13px] neon-red drop-shadow-lg">{players.opponent.score}</span>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="w-full bg-gray-800 rounded-sm h-2 border border-gameAccent-orange/30 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gameAccent-orange via-gameAccent-gold to-gameAccent-orange transition-all duration-500"
            style={{ width: `${opponentProgress}%` }}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 ml-3">
        {onHome && (
          <button
            className="text-[8px] uppercase px-2 py-1 rounded border border-gameAccent-gold/50 text-gameAccent-gold hover:bg-gameAccent-gold/10 hover:border-gameAccent-gold transition-all duration-200 hover:shadow-glow-gold"
            onClick={onHome}
            title="Home"
          >
            ⌂
          </button>
        )}
        {reset && (
          <button
            className="text-[8px] uppercase px-2 py-1 rounded border border-gameAccent-gold/50 text-gameAccent-gold hover:bg-gameAccent-gold/10 hover:border-gameAccent-gold transition-all duration-200 hover:shadow-glow-gold"
            onClick={reset}
            title="New Game"
          >
            ⟳
          </button>
        )}
      </div>
    </div>
  );
}
