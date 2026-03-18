import { useGameStore } from '../../store/gameStore';
import { Card } from '../card/Card';
import { CardBack } from '../card/CardBack';

export function OpponentArea() {
  const state = useGameStore(s => s.state);
  const { hand } = state.players.opponent;
  const opponentMelds = state.melds.filter(m => m.ownerId === 'opponent');
  const { activePlayer, phase } = state.turn;
  const isThinking = activePlayer === 'opponent' && phase === 'ai_turn';

  return (
    <div className="flex flex-col gap-2 px-3 py-2">
      {/* Label row */}
      <div className="flex items-center gap-3">
        <span className="text-[8px] neon-purple font-pixel">OPPONENT</span>
        {isThinking && (
          <span className="text-[7px] neon-pink animate-pulse">THINKING...</span>
        )}
        {/* Hand count badge */}
        <div className="flex items-center gap-1.5 ml-auto">
          <CardBack size="sm" />
          <span className="text-[8px] neon-blue">× {hand.length}</span>
        </div>
      </div>

      {/* Opponent melds (small) */}
      {opponentMelds.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {opponentMelds.map(meld => (
            <div key={meld.id} className="flex gap-0.5 shrink-0">
              {meld.cards.map(card => (
                <Card key={card.id} card={card} size="sm" disabled />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
