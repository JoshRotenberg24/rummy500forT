import { create } from 'zustand';
import { applyAction, createInitialGameState } from '../engine/actions';
import { GameAction, GameState } from '../engine/types';

interface GameStore {
  state: GameState;
  dispatch: (action: GameAction) => void;
  reset: () => void;
}

export const useGameStore = create<GameStore>((set) => ({
  state: createInitialGameState(),
  dispatch: (action: GameAction) =>
    set((store) => ({ state: applyAction(store.state, action) })),
  reset: () => set({ state: createInitialGameState() }),
}));
