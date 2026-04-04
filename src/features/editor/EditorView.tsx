import { Vault } from '@/features/vault/Vault';
import { EditorCanvas } from '@/features/editor/EditorCanvas';
import { Timeline } from '@/features/editor/Timeline';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useGameStore } from '@/store/gameStore';
import { db } from '@/db';
import { useState } from 'react';
import { normalizeFogState } from '@/lib/fogOfWar';

interface EditorViewProps {
    onNavigate: (view: 'HOME') => void;
}

export const EditorView = ({ onNavigate }: EditorViewProps) => {
    const { scenes, activeStory, getCurrentScene, updateScene } = useGameStore();
    const [fogEditMode, setFogEditMode] = useState(false);
    const [fogTool, setFogTool] = useState<'paint' | 'erase'>('paint');
    const currentScene = getCurrentScene();
    const fogBrush = normalizeFogState(currentScene?.fogOfWar).brushSize;

    const handleSave = async () => {
        if (!activeStory) return;
        const currentIds = new Set(scenes.map(s => s.id));
        const storedScenes = await db.scenes.where('storyId').equals(activeStory.id).toArray();
        const deletedIds = storedScenes.map(s => s.id).filter(id => !currentIds.has(id));
        if (deletedIds.length > 0) await db.scenes.bulkDelete(deletedIds);
        await db.scenes.bulkPut(scenes);
        await db.stories.update(activeStory.id, { lastPlayed: new Date().toISOString() });
        alert('Progress Saved!');
    };

    return (
        <div className="h-screen w-screen overflow-hidden bg-fantasy-bg flex">
            {/* Vault (Fixed internally) */}
            <Vault allowedTypes={['map', 'token', 'asset', 'audio']} />

            {/* Main Content */}
            <div className="flex-1 flex flex-col ml-80 h-full min-h-0 overflow-hidden relative z-10">
                <div className="absolute top-4 right-4 z-50 flex gap-2">
                    <Button
                        variant={fogEditMode ? 'primary' : 'secondary'}
                        onClick={() => setFogEditMode(prev => !prev)}
                    >
                        {fogEditMode ? 'Fog: ON' : 'Fog: OFF'}
                    </Button>
                    {fogEditMode && (
                        <>
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    if (!currentScene) return;
                                    const fog = normalizeFogState(currentScene.fogOfWar);
                                    updateScene(currentScene.id, { fogOfWar: { ...fog, enabled: true, brushSize: Math.max(2, fog.brushSize - 2) } });
                                }}
                            >
                                -
                            </Button>
                            <Button variant="secondary">
                                Brush {fogBrush}
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    if (!currentScene) return;
                                    const fog = normalizeFogState(currentScene.fogOfWar);
                                    updateScene(currentScene.id, { fogOfWar: { ...fog, enabled: true, brushSize: Math.min(40, fog.brushSize + 2) } });
                                }}
                            >
                                +
                            </Button>
                            <Button
                                variant={fogTool === 'paint' ? 'primary' : 'secondary'}
                                onClick={() => setFogTool('paint')}
                            >
                                Paint
                            </Button>
                            <Button
                                variant={fogTool === 'erase' ? 'primary' : 'secondary'}
                                onClick={() => setFogTool('erase')}
                            >
                                Erase
                            </Button>
                        </>
                    )}
                    <Button variant="secondary" onClick={() => onNavigate('HOME')}>
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button variant="primary" onClick={handleSave}>
                        <Save className="w-4 h-4 mr-2" /> Save Progress
                    </Button>
                </div>

                <div className="flex-1 min-h-0 overflow-hidden">
                    <EditorCanvas
                        fogEditMode={fogEditMode}
                        fogTool={fogTool}
                    />
                </div>
                <Timeline />
            </div>
        </div>
    );
};
