import PartySocket from 'partysocket';
import { create } from 'zustand';
import { GameAction, GameState, PlayerId } from '../engine/types';

type ConnectionStatus = 'idle' | 'connecting' | 'waiting' | 'playing' | 'disconnected' | 'error';

interface MultiplayerStore {
  socket: PartySocket | null;
  gameState: GameState | null;
  myPlayerId: PlayerId | null;
  status: ConnectionStatus;
  errorMessage: string | null;
  roomCode: string | null;

  connect: (roomCode: string, playerName: string, host: string) => void;
  dispatch: (action: GameAction) => void;
  disconnect: () => void;
}

export const useMultiplayerStore = create<MultiplayerStore>((set, get) => ({
  socket: null,
  gameState: null,
  myPlayerId: null,
  status: 'idle',
  errorMessage: null,
  roomCode: null,

  connect(roomCode, playerName, host) {
    get().disconnect(); // clean up existing connection

    set({ status: 'connecting', roomCode, errorMessage: null });

    const socket = new PartySocket({
      host,
      room: roomCode.toUpperCase(),
    });

    socket.addEventListener('open', () => {
      socket.send(JSON.stringify({ type: 'JOIN', playerName }));
    });

    socket.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);

      switch (msg.type) {
        case 'WAITING':
          set({ status: 'waiting' });
          break;
        case 'GAME_STATE':
          set({
            gameState: msg.state,
            myPlayerId: msg.yourId,
            status: 'playing',
          });
          break;
        case 'OPPONENT_DISCONNECTED':
          set({ status: 'disconnected', errorMessage: 'Opponent disconnected' });
          break;
        case 'ERROR':
          set({ status: 'error', errorMessage: msg.message });
          break;
      }
    });

    socket.addEventListener('close', () => {
      const current = get().status;
      if (current === 'playing' || current === 'waiting') {
        set({ status: 'disconnected', errorMessage: 'Connection lost' });
      }
    });

    set({ socket });
  },

  dispatch(action) {
    const { socket, myPlayerId, gameState } = get();
    if (!socket || !myPlayerId || !gameState) return;
    if (gameState.turn.activePlayer !== myPlayerId) return;
    socket.send(JSON.stringify({ type: 'ACTION', action }));
  },

  disconnect() {
    const { socket } = get();
    if (socket) {
      socket.close();
    }
    set({ socket: null, gameState: null, myPlayerId: null, status: 'idle', roomCode: null, errorMessage: null });
  },
}));
