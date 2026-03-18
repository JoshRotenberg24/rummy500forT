import { useEffect, useRef } from 'react';
import { computeAITurn } from '../ai/medium';
import { useGameStore } from '../store/gameStore';

const ACTION_DELAY_MS = 400;

// Module-level flag so cleanup from phase transitions doesn't cancel mid-turn actions.
// Reset whenever a new AI turn starts.
let aiTurnId = 0;

export function useAI() {
  const state = useGameStore(s => s.state);
  const dispatch = useGameStore(s => s.dispatch);
  // Stable reference to dispatch (never changes in Zustand)
  const dispatchRef = useRef(dispatch);
  dispatchRef.current = dispatch;

  useEffect(() => {
    const { phase, activePlayer } = state.turn;
    if (phase !== 'ai_turn' || activePlayer !== 'opponent') return;

    // Capture turn id — if this increments before our callbacks fire, cancel them
    const myTurnId = ++aiTurnId;
    const actions = computeAITurn(state);

    let i = 0;
    function executeNext() {
      if (myTurnId !== aiTurnId) return; // a new turn started, stop
      if (i >= actions.length) return;
      dispatchRef.current(actions[i]);
      i++;
      if (i < actions.length) {
        setTimeout(executeNext, ACTION_DELAY_MS);
      }
    }

    const timer = setTimeout(executeNext, ACTION_DELAY_MS);
    // Only cancel on unmount, NOT on every re-render from state changes
    return () => clearTimeout(timer);
  // Only re-run when a new ai_turn begins (identified by round + gameId)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.turn.phase === 'ai_turn', state.gameId, state.round]);
}
