import { motion } from 'framer-motion';
import { useMultiplayerStore } from '../../store/multiplayerStore';
import { Card as CardType, PlayerId, GamePhase } from '../../engine/types';
import { isValidMeld } from '../../engine/meld';

type Step = 'draw' | 'play' | 'discard';

const STEPS: { id: Step; label: string; hint: string }[] = [
  { id: 'draw',    label: '① DRAW',    hint: 'Deck or discard' },
  { id: 'play',    label: '② PLAY',    hint: 'Meld or skip' },
  { id: 'discard', label: '③ DISCARD', hint: 'End your turn' },
];

function phaseToStep(phase: string): Step {
  if (phase === 'draw') return 'draw';
  if (phase === 'play') return 'play';
  return 'discard';
}

interface Props {
  isMyTurn: boolean;
  phase: GamePhase;
  selectedCards: CardType[];
  drawnFromDiscard: boolean;
  drawnCard: CardType | null;
  myPlayerId: PlayerId;
}

export function MultiplayerTurnControls({ isMyTurn, phase, selectedCards, drawnFromDiscard, drawnCard }: Props) {
  const dispatch = useMultiplayerStore(s => s.dispatch);

  if (!isMyTurn || phase === 'round_over' || phase === 'game_over') {
    return (
      <div className="flex items-center justify-center px-4 py-2 gap-2">
        {!isMyTurn && phase !== 'round_over' && phase !== 'game_over' && (
          <motion.span
            className="text-[8px] neon-pink"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            OPPONENT&apos;S TURN
          </motion.span>
        )}
      </div>
    );
  }

  const currentStep = phaseToStep(phase);
  const stepIndex = STEPS.findIndex(s => s.id === currentStep);

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
    <div className="flex flex-col gap-2 px-3 py-2 bg-gradient-to-r from-gameBg-dark/50 via-gameBg-card/30 to-gameBg-dark/50">
      {/* Phase step pipeline */}
      <div className="flex items-center justify-center gap-1">
        {STEPS.map((step, i) => {
          const isDone = i < stepIndex;
          const isActive = i === stepIndex;
          return (
            <div key={step.id} className="flex items-center gap-1">
              <div className="flex flex-col items-center gap-0.5">
                <motion.div
                  className={`text-[7px] font-bold px-2 py-0.5 rounded border transition-all ${
                    isActive
                      ? 'border-gameAccent-gold text-gameAccent-gold bg-gameAccent-gold/10'
                      : isDone
                      ? 'border-green-700 text-green-700'
                      : 'border-gray-800 text-gray-700'
                  }`}
                  animate={isActive ? { boxShadow: ['0 0 4px rgba(212,175,55,0.3)', '0 0 10px rgba(212,175,55,0.7)', '0 0 4px rgba(212,175,55,0.3)'] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {isDone ? '✓' : step.label}
                </motion.div>
                {isActive && (
                  <span className="text-[5px] text-gray-500 whitespace-nowrap">{step.hint}</span>
                )}
              </div>
              {i < STEPS.length - 1 && (
                <span className={`text-[8px] mx-0.5 ${isDone ? 'text-green-800' : 'text-gray-800'}`}>──</span>
              )}
            </div>
          );
        })}
      </div>

      {drawnFromDiscard && drawnCard && (
        <motion.div
          className="text-center text-[7px] neon-red font-bold"
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          ⚠ Meld {drawnCard.rank} before discarding
        </motion.div>
      )}

      {selectedCards.length >= 3 && (
        <div className={`text-center text-[7px] font-bold ${isValidMeld(selectedCards) ? 'text-gameAccent-green' : 'text-gameAccent-orange'}`}>
          {isValidMeld(selectedCards) ? '✓ VALID MELD' : '✗ Not a valid meld yet'}
        </div>
      )}

      <div className="flex justify-center gap-2 flex-wrap">
        {phase === 'play' && (
          <button
            className="btn-neon-blue text-[7px] px-3 py-1 uppercase font-bold"
            onClick={handlePlayMeld}
            disabled={!canPlayMeld}
          >
            ✓ MELD
          </button>
        )}

        {(phase === 'play' || phase === 'discard') && (
          <button
            className="btn-neon-green text-[7px] px-3 py-1 uppercase font-bold"
            onClick={handleDiscard}
            disabled={!canDiscard}
          >
            DISCARD
          </button>
        )}

        {selectedCards.length > 0 && (
          <button
            className="btn-neon text-[7px] px-3 py-1 uppercase font-bold"
            onClick={() => dispatch({ type: 'CLEAR_SELECTION' })}
          >
            ✕ CLEAR
          </button>
        )}
      </div>
    </div>
  );
}
