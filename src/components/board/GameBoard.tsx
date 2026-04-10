import { useEffect, useRef } from 'react';
import { LayoutGroup } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { GameOver } from '../game/GameOver';
import { RoundSummary } from '../game/RoundSummary';
import { ScoreBoard } from '../game/ScoreBoard';
import { DrawArea } from './DrawArea';
import { MeldArea } from './MeldArea';
import { OpponentArea } from './OpponentArea';
import { PlayerHand } from './PlayerHand';
import { TurnControls } from './TurnControls';
import { ToastStack, showToast } from '../ui/ToastStack';

export function GameBoard({ onHome }: { onHome?: () => void }) {
  const state = useGameStore(s => s.state);
  const phase = state.turn.phase;
  const reset = useGameStore(s => s.reset);

  // Track previous state to detect AI actions and fire toasts
  const prevMeldsLen = useRef(state.melds.length);
  const prevDiscardLen = useRef(state.discardPile.length);
  const prevDeckLen = useRef(state.deck.length);

  useEffect(() => {
    if (phase === 'draw' && state.turn.activePlayer === 'player') {
      // Just became player's draw turn — AI finished
      const newMelds = state.melds.length - prevMeldsLen.current;
      if (newMelds > 0) {
        showToast(`AI melded ${newMelds} group${newMelds > 1 ? 's' : ''}!`, 'ai');
      }
      // Check if AI drew from discard (discard pile shrank unexpectedly)
    }
    prevMeldsLen.current = state.melds.length;
    prevDiscardLen.current = state.discardPile.length;
    prevDeckLen.current = state.deck.length;
  }, [phase, state.melds.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard shortcuts
  const dispatch = useGameStore(s => s.dispatch);
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const { phase, activePlayer, selectedCards, drawnFromDiscard, drawnCard } = state.turn;
      if (activePlayer !== 'player') return;

      if ((e.key === 'd' || e.key === 'D' || e.key === ' ') && phase === 'draw') {
        e.preventDefault();
        dispatch({ type: 'DRAW_FROM_DECK' });
      } else if ((e.key === 'm' || e.key === 'M') && phase === 'play' && selectedCards.length >= 3) {
        dispatch({ type: 'PLAY_MELD', cards: selectedCards });
      } else if ((e.key === 'x' || e.key === 'X' || e.key === 'Delete') && selectedCards.length === 1 && !(drawnFromDiscard && drawnCard)) {
        dispatch({ type: 'DISCARD', cardId: selectedCards[0].id });
      } else if (e.key === 'Escape' && selectedCards.length > 0) {
        dispatch({ type: 'CLEAR_SELECTION' });
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state.turn, dispatch]);

  return (
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
      {/* ScoreBoard — full width */}
      <div style={{ gridColumn: '1 / -1' }}>
        <ScoreBoard reset={reset} onHome={onHome} />
      </div>

      {/* Left col top: Opponent area */}
      <div className="border-r border-b border-purple-950 overflow-hidden">
        <OpponentArea />
      </div>

      {/* Right col: Meld area — spans both middle rows */}
      <div
        className="border-b border-purple-950 overflow-hidden"
        style={{ gridRow: '2 / 4' }}
      >
        <MeldArea />
      </div>

      {/* Left col bottom: Draw area */}
      <div className="border-r border-b border-purple-950">
        <DrawArea />
      </div>

      {/* Turn controls — full width */}
      <div style={{ gridColumn: '1 / -1' }} className="border-b border-purple-950">
        <TurnControls />
      </div>

      {/* Player hand — full width */}
      <div
        style={{ gridColumn: '1 / -1' }}
        className="flex items-end justify-center pb-2 pt-4 overflow-hidden"
      >
        <PlayerHand />
      </div>

      {/* Overlays */}
      {phase === 'round_over' && <RoundSummary />}
      {phase === 'game_over' && <GameOver />}
    </div>
    </LayoutGroup>
  );
}

// Standalone wrapper that includes the toast stack
export function GameBoardWithToasts({ onHome }: { onHome?: () => void }) {
  return (
    <>
      <GameBoard onHome={onHome} />
      <ToastStack />
    </>
  );
}
