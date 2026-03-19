import { useGameStore } from '../../store/gameStore';
import { isValidMeld } from '../../engine/meld';

export function TurnControls() {
  const state = useGameStore(s => s.state);
  const dispatch = useGameStore(s => s.dispatch);
  const { turn, players } = state;
  const { phase, selectedCards, drawnFromDiscard, drawnCard, activePlayer } = turn;

  const isMyTurn = activePlayer === 'player';

  if (!isMyTurn || phase === 'ai_turn' || phase === 'round_over' || phase === 'game_over') {
    return null;
  }

  const canPlayMeld = phase === 'play' && selectedCards.length >= 3 && isValidMeld(selectedCards);
  const canDiscard = (phase === 'play' || phase === 'discard') && selectedCards.length === 1 && !(drawnFromDiscard && !!drawnCard);
  const canEndTurn = phase === 'play' && selectedCards.length === 1 && !drawnFromDiscard;

  function handlePlayMeld() {
    if (!canPlayMeld) return;
    dispatch({ type: 'PLAY_MELD', cards: selectedCards });
  }

  function handleDiscard() {
    if (selectedCards.length !== 1) return;
    if (drawnFromDiscard && drawnCard) return; // blocked
    dispatch({ type: 'DISCARD', cardId: selectedCards[0].id });
  }

  return (
    <div className="flex flex-col gap-2 px-4 py-2">
      {/* Phase indicator */}
      <div className="text-center">
        {phase === 'draw' && <span className="text-[8px] neon-blue animate-pulse">DRAW A CARD</span>}
        {phase === 'play' && !drawnFromDiscard && <span className="text-[8px] neon-purple">SELECT CARDS TO MELD OR DISCARD</span>}
        {phase === 'play' && drawnFromDiscard && (
          <span className="text-[8px] neon-pink animate-pulse">
            MUST MELD {drawnCard?.rank}{drawnCard ? '♦' : ''} FIRST!
          </span>
        )}
      </div>

      {/* Selection info */}
      {selectedCards.length > 0 && (
        <div className="text-center text-[7px] text-gray-400">
          {selectedCards.length} card{selectedCards.length !== 1 ? 's' : ''} selected
          {selectedCards.length >= 3 && (
            <span className={`ml-2 ${isValidMeld(selectedCards) ? 'neon-teal' : 'neon-red'}`}>
              {isValidMeld(selectedCards) ? '✓ VALID MELD' : '✗ INVALID'}
            </span>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex justify-center gap-3 flex-wrap">
        {phase === 'play' && (
          <button
            className="btn-neon btn-neon-green"
            onClick={handlePlayMeld}
            disabled={!canPlayMeld}
          >
            MELD ({selectedCards.length})
          </button>
        )}

        {(phase === 'play' || phase === 'discard') && (
          <button
            className="btn-neon btn-neon-blue"
            onClick={handleDiscard}
            disabled={!canDiscard}
          >
            DISCARD
          </button>
        )}

        {selectedCards.length > 0 && (
          <button
            className="btn-neon"
            onClick={() => dispatch({ type: 'CLEAR_SELECTION' })}
          >
            CLEAR
          </button>
        )}
      </div>
    </div>
  );
}
