import { useState } from 'react';
import './styles/globals.css';
import { GameBoard } from './components/board/GameBoard';
import { HomeScreen } from './components/game/HomeScreen';
import { LobbyScreen } from './components/game/LobbyScreen';
import { MultiplayerGameBoard } from './components/board/MultiplayerGameBoard';
import { useAI } from './hooks/useAI';
import { useMultiplayerStore } from './store/multiplayerStore';

type Screen = 'home' | 'solo' | 'multiplayer';

function GameWrapper() {
  useAI();
  return <GameBoard />;
}

function MultiplayerWrapper({ onBack }: { onBack: () => void }) {
  const status = useMultiplayerStore(s => s.status);
  const disconnect = useMultiplayerStore(s => s.disconnect);

  function handleBack() {
    disconnect();
    onBack();
  }

  if (status === 'playing' || status === 'disconnected' || status === 'error') {
    return <MultiplayerGameBoard onBack={handleBack} />;
  }

  return <LobbyScreen onBack={handleBack} />;
}

function App() {
  const [screen, setScreen] = useState<Screen>('home');

  return (
    <div className="game-bg scanlines">
      {screen === 'home' && (
        <HomeScreen
          onSolo={() => setScreen('solo')}
          onMultiplayer={() => setScreen('multiplayer')}
        />
      )}
      {screen === 'solo' && <GameWrapper />}
      {screen === 'multiplayer' && (
        <MultiplayerWrapper onBack={() => setScreen('home')} />
      )}
    </div>
  );
}

export default App;
