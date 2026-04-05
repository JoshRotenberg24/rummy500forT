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
    <div className="flex flex-col gap-2.5 px-4 py-2.5 bg-gradient-to-r from-gameBg-dark/50 via-gameBg-card/30 to-gameBg-dark/50 border-t border-gameAccent-gold/30 rounded-t-lg">
      {/* Phase indicator - Main Message */}
      <div className="text-center space-y-1">
        {phase === 'draw' && (
          <div>
            <span className="text-[8px] neon-blue animate-pulse font-bold uppercase tracking-wide">🎴 DRAW A CARD</span>
            <p className="text-[6px] text-gray-400 mt-0.5">Tap deck or discard pile</p>
          </div>
        )}

        {phase === 'play' && !drawnFromDiscard && selectedCards.length === 0 && (
          <div>
            <span className="text-[8px] neon-purple font-bold uppercase tracking-wide">SELECT 3+ CARDS FOR MELD</span>
            <p className="text-[6px] text-gray-400 mt-0.5">Set (same rank) or Run (sequential, same suit)</p>
          </div>
        )}

        {phase === 'play' && !drawnFromDiscard && selectedCards.length > 0 && (
          <div>
            <span className="text-[8px] gold-text font-bold uppercase tracking-wide">MELD • DISCARD • OR SELECT MORE</span>
            <p className="text-[6px] text-gray-400 mt-0.5">{selectedCards.length} cards selected</p>
          </div>
        )}

        {phase === 'play' && drawnFromDiscard && (
          <div>
            <span className="text-[8px] neon-red animate-pulse font-bold uppercase tracking-wide drop-shadow-lg">
              ⚠️ MELD {drawnCard?.rank}{drawnCard?.suit === 'hearts' ? '♥' : drawnCard?.suit === 'diamonds' ? '♦' : drawnCard?.suit === 'clubs' ? '♣' : '♠'} FIRST
            </span>
            <p className="text-[6px] text-gray-300 mt-0.5">This card MUST be melded before any discard</p>
          </div>
        )}
      </div>

      {/* Selection validation feedback */}
      {selectedCards.length > 0 && (
        <div className="text-center space-y-1">
          <div className="text-[7px] text-gray-300">
            {selectedCards.length} card{selectedCards.length !== 1 ? 's' : ''} selected
          </div>
          {selectedCards.length >= 3 && (
            <div className={`text-[7px] font-bold uppercase ${isValidMeld(selectedCards) ? 'text-gameAccent-green' : 'text-gameAccent-orange'}`}>
              {isValidMeld(selectedCards) ? '✓ VALID MELD' : '✗ INVALID - Need 3+ same rank OR 3+ sequential same suit'}
            </div>
          )}
          {selectedCards.length === 1 && (
            <div className="text-[6px] text-gameAccent-orange">
              👆 Ready to discard this card
            </div>
          )}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex justify-center gap-2.5 flex-wrap">
        {phase === 'play' && (
          <button
            className="btn-neon-blue text-[8px] px-3 py-1.5 uppercase font-bold"
            onClick={handlePlayMeld}
            disabled={!canPlayMeld}
            title={!canPlayMeld ? 'Select 3+ cards that form a valid meld' : 'Play selected cards as a meld'}
          >
            ✓ MELD
          </button>
        )}

        {(phase === 'play' || phase === 'discard') && (
          <button
            className="btn-neon-green text-[8px] px-3 py-1.5 uppercase font-bold"
            onClick={handleDiscard}
            disabled={!canDiscard}
            title={drawnFromDiscard && drawnCard ? `Must meld ${drawnCard.rank} first` : !canDiscard ? 'Select 1 card to discard' : 'Discard selected card'}
          >
            💨 DISCARD
          </button>
        )}

        {selectedCards.length > 0 && (
          <button
            className="btn-neon text-[8px] px-3 py-1.5 uppercase font-bold border-gameAccent-purple"
            onClick={() => dispatch({ type: 'CLEAR_SELECTION' })}
            title="Clear card selection"
          >
            ✕ CLEAR
          </button>
        )}
      </div>
    </div>
  );
}
