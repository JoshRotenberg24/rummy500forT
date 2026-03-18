import { useMultiplayerStore } from '../../store/multiplayerStore';
import { Card as CardType, PlayerId, GamePhase } from '../../engine/types';
import { isValidMeld } from '../../engine/meld';

interface Props {
  isMyTurn: boolean;
  phase: GamePhase;
  selectedCards: CardType[];
  drawnFromDiscard: boolean;
  drawnCard: CardType | null;
  myPlayerId: PlayerId;
}

export function MultiplayerTurnControls({ isMyTurn, phase, selectedCards, drawnFromDiscard, drawnCard, myPlayerId }: Props) {
  const dispatch = useMultiplayerStore(s => s.dispatch);

  if (!isMyTurn || phase === 'round_over' || phase === 'game_over') {
    return (
      <div className="flex items-center justify-center py-2 px-4">
        {!isMyTurn && phase !== 'round_over' && phase !== 'game_over' && (
          <span className="text-[8px] neon-pink animate-pulse">OPPONENT'S TURN...</span>
        )}
      </div>
    );
  }

  const canPlayMeld = phase === 'play' && selectedCards.length >= 3 && isValidMeld(selectedCards);
  const canDiscard = (phase === 'play' || phase === 'discard') && selectedCards.length === 1 && !(drawnFromDiscard && !!drawnCard);

  function handlePlayMeld() {
    if (!canPlayMeld) return;
    dispatch({ type: 'PLAY_MELD', cards: selectedCards });
  }

  function handleDiscard() {
    if (selectedCards.length !== 1) return;
    if (drawnFromDiscard && drawnCard) return;
    dispatch({ type: 'DISCARD', cardId: selectedCards[0].id });
  }

  return (
    <div className="flex flex-col gap-2 px-4 py-2">
      <div className="text-center">
        {phase === 'draw' && <span className="text-[8px] neon-blue animate-pulse">DRAW A CARD</span>}
        {phase === 'play' && !drawnFromDiscard && <span className="text-[8px] neon-purple">SELECT CARDS TO MELD OR DISCARD</span>}
        {phase === 'play' && drawnFromDiscard && (
          <span className="text-[8px] neon-pink animate-pulse">
            MUST MELD {drawnCard?.rank} FIRST!
          </span>
        )}
      </div>

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
