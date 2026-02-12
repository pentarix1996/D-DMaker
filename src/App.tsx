import { useState } from 'react';
import { Home } from '@/features/home/Home';
import { EditorView } from '@/features/editor/EditorView';
import { PlayerView } from '@/features/player/PlayerView';
import { useGameStore } from '@/store/gameStore';

function App() {
  const [view, setView] = useState<'HOME' | 'EDITOR' | 'PLAYER'>('HOME');
  const { setEditMode } = useGameStore();

  const handleNavigate = (target: 'EDITOR' | 'PLAYER') => {
    setEditMode(target === 'EDITOR');
    setView(target);
  };

  return (
    <div className="text-fantasy-text bg-fantasy-bg min-h-screen font-sans selection:bg-fantasy-accent/30">
      {view === 'HOME' && <Home onNavigate={handleNavigate} />}
      {view === 'EDITOR' && <EditorView onNavigate={() => setView('HOME')} />}
      {view === 'PLAYER' && <PlayerView onNavigate={() => setView('HOME')} />}
    </div>
  );
}

export default App;
