import type * as Party from 'partykit/server';
import { applyAction, createInitialGameState } from '../engine/actions';
import { GameAction, GameState, PlayerId } from '../engine/types';

// Messages sent FROM client TO server
type ClientMessage =
  | { type: 'JOIN'; playerName: string }
  | { type: 'ACTION'; action: GameAction };

// Messages sent FROM server TO client
type ServerMessage =
  | { type: 'WAITING' }
  | { type: 'GAME_STATE'; state: GameState; yourId: PlayerId }
  | { type: 'OPPONENT_DISCONNECTED' }
  | { type: 'ERROR'; message: string };

interface PlayerSlot {
  connectionId: string;
  playerId: PlayerId;
  name: string;
}

export default class RummyParty implements Party.Server {
  private gameState: GameState | null = null;
  private players: PlayerSlot[] = [];

  constructor(readonly room: Party.Room) {}

  onConnect(conn: Party.Connection) {
    // New connection — will wait for JOIN message to register
    // If game already has 2 players, reject
    if (this.players.length >= 2) {
      const msg: ServerMessage = { type: 'ERROR', message: 'Room is full' };
      conn.send(JSON.stringify(msg));
      conn.close();
      return;
    }
  }

  onMessage(rawMessage: string | ArrayBuffer | ArrayBufferView, sender: Party.Connection) {
    let msg: ClientMessage;
    try {
      msg = JSON.parse(rawMessage as string);
    } catch {
      return;
    }

    if (msg.type === 'JOIN') {
      this.handleJoin(sender, msg.playerName);
      return;
    }

    if (msg.type === 'ACTION') {
      this.handleAction(sender, msg.action);
      return;
    }
  }

  onClose(conn: Party.Connection) {
    const idx = this.players.findIndex(p => p.connectionId === conn.id);
    if (idx === -1) return;
    this.players.splice(idx, 1);

    // Notify remaining player
    const msg: ServerMessage = { type: 'OPPONENT_DISCONNECTED' };
    this.broadcast(JSON.stringify(msg));
  }

  private handleJoin(conn: Party.Connection, playerName: string) {
    if (this.players.some(p => p.connectionId === conn.id)) return; // already joined

    const playerId: PlayerId = this.players.length === 0 ? 'player' : 'opponent';
    this.players.push({ connectionId: conn.id, playerId, name: playerName });

    if (this.players.length === 1) {
      // Waiting for second player
      const msg: ServerMessage = { type: 'WAITING' };
      conn.send(JSON.stringify(msg));
    } else {
      // Both players connected — start the game
      this.gameState = createInitialGameState();
      this.broadcastGameState();
    }
  }

  private handleAction(conn: Party.Connection, action: GameAction) {
    if (!this.gameState) return;

    const slot = this.players.find(p => p.connectionId === conn.id);
    if (!slot) return;

    // Validate it's this player's turn
    const { activePlayer } = this.gameState.turn;
    if (activePlayer !== slot.playerId) {
      const err: ServerMessage = { type: 'ERROR', message: 'Not your turn' };
      conn.send(JSON.stringify(err));
      return;
    }

    // Apply action
    const newState = applyAction(this.gameState, action);
    if (newState === this.gameState) {
      // No-op — invalid action
      const err: ServerMessage = { type: 'ERROR', message: 'Invalid action' };
      conn.send(JSON.stringify(err));
      return;
    }

    this.gameState = newState;
    this.broadcastGameState();
  }

  private broadcastGameState() {
    if (!this.gameState) return;
    for (const slot of this.players) {
      const conn = this.room.getConnection(slot.connectionId);
      if (!conn) continue;
      const msg: ServerMessage = {
        type: 'GAME_STATE',
        state: this.gameState,
        yourId: slot.playerId,
      };
      conn.send(JSON.stringify(msg));
    }
  }

  private broadcast(message: string) {
    for (const slot of this.players) {
      const conn = this.room.getConnection(slot.connectionId);
      if (conn) conn.send(message);
    }
  }
}

RummyParty satisfies Party.Worker;
