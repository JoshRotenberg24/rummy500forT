import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useMultiplayerStore } from '../../store/multiplayerStore';
import { generateRoomCode, isValidRoomCode } from '../../utils/roomCode';

// PartyKit host — local dev uses localhost, production uses the deployed host
const PARTYKIT_HOST = import.meta.env.VITE_PARTYKIT_HOST ?? 'localhost:1999';

interface Props {
  onBack: () => void;
}

type Tab = 'create' | 'join';

export function LobbyScreen({ onBack }: Props) {
  const [tab, setTab] = useState<Tab>('create');
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [createdCode, setCreatedCode] = useState<string | null>(null);
  const { connect, status, errorMessage } = useMultiplayerStore();

  function handleCreate() {
    if (!name.trim()) return;
    const code = generateRoomCode();
    setCreatedCode(code);
    connect(code, name.trim(), PARTYKIT_HOST);
  }

  function handleJoin() {
    if (!name.trim() || !isValidRoomCode(roomCode)) return;
    connect(roomCode.toUpperCase(), name.trim(), PARTYKIT_HOST);
  }

  const isConnecting = status === 'connecting';
  const isWaiting = status === 'waiting';
  const isError = status === 'error' || status === 'disconnected';

  return (
    <div className="app-root flex flex-col items-center justify-center gap-6 p-6">
      <motion.div
        className="w-full max-w-sm flex flex-col gap-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Header */}
        <div className="flex items-center gap-3">
          <button className="text-[8px] text-gray-500 hover:text-gray-300" onClick={onBack}>← BACK</button>
          <h2 className="text-[11px] neon-blue">MULTIPLAYER</h2>
        </div>

        {/* Name input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[7px] text-gray-500">YOUR NAME</label>
          <input
            className="bg-transparent border border-purple-800 rounded px-3 py-2 text-[9px] text-purple-200 focus:outline-none focus:border-purple-500 font-pixel"
            placeholder="Enter name..."
            value={name}
            onChange={e => setName(e.target.value)}
            maxLength={16}
            disabled={isConnecting || isWaiting}
          />
        </div>

        {/* Tabs */}
        <div className="flex border border-purple-900 rounded overflow-hidden">
          {(['create', 'join'] as Tab[]).map(t => (
            <button
              key={t}
              className={`flex-1 py-2 text-[8px] transition-all ${
                tab === t
                  ? 'bg-purple-900 text-purple-200'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
              onClick={() => setTab(t)}
              disabled={isConnecting || isWaiting}
            >
              {t === 'create' ? 'CREATE ROOM' : 'JOIN ROOM'}
            </button>
          ))}
        </div>

        {/* Create tab */}
        <AnimatePresence mode="wait">
          {tab === 'create' && (
            <motion.div
              key="create"
              className="flex flex-col gap-4"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              {!isWaiting && !isConnecting && (
                <button
                  className="btn-neon btn-neon-green py-3"
                  onClick={handleCreate}
                  disabled={!name.trim()}
                >
                  CREATE ROOM
                </button>
              )}

              {/* Waiting state — show room code */}
              {(isWaiting || isConnecting) && createdCode && (
                <div className="flex flex-col items-center gap-4 py-4">
                  <p className="text-[8px] text-gray-400">SHARE THIS CODE WITH YOUR OPPONENT</p>
                  <div className="flex gap-2">
                    {createdCode.split('').map((ch, i) => (
                      <motion.div
                        key={i}
                        className="w-12 h-14 flex items-center justify-center border border-purple-600 rounded text-[20px] neon-purple"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.1, type: 'spring' }}
                      >
                        {ch}
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-[8px] neon-pink animate-pulse">WAITING FOR OPPONENT...</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Join tab */}
          {tab === 'join' && (
            <motion.div
              key="join"
              className="flex flex-col gap-3"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
            >
              <div className="flex flex-col gap-1.5">
                <label className="text-[7px] text-gray-500">ROOM CODE</label>
                <input
                  className="bg-transparent border border-blue-900 rounded px-3 py-2 text-[14px] text-blue-200 focus:outline-none focus:border-blue-500 font-pixel tracking-widest uppercase text-center"
                  placeholder="XXXX"
                  value={roomCode}
                  onChange={e => setRoomCode(e.target.value.toUpperCase().slice(0, 4))}
                  maxLength={4}
                  disabled={isConnecting}
                />
              </div>
              <button
                className="btn-neon btn-neon-blue py-3"
                onClick={handleJoin}
                disabled={!name.trim() || !isValidRoomCode(roomCode) || isConnecting}
              >
                {isConnecting ? 'JOINING...' : 'JOIN ROOM'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        {isError && errorMessage && (
          <p className="text-[8px] neon-red text-center">{errorMessage}</p>
        )}
      </motion.div>
    </div>
  );
}
