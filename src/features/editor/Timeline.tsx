import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Plus, Image as ImageIcon, Music, Grid } from 'lucide-react';
import type { Scene } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export const Timeline = () => {
    const { scenes, activeSceneId, setActiveScene, addScene, updateScene, activeStory } = useGameStore();

    const handleAddScene = () => {
        if (!activeStory) return;

        const newScene: Scene = {
            id: uuidv4(),
            storyId: activeStory.id,
            name: `Scene ${scenes.length + 1}`,
            order: scenes.length,
            tokens: [],
            gridEnabled: false,
            gridColor: '#334155', // Default slate-700
            gridSize: 48 // Bigger squares as requested
        };
        addScene(newScene);
    };

    return (
        <div className="h-40 bg-fantasy-dark/95 border-t border-white/5 flex flex-col backdrop-blur-md">
            <div className="flex-1 flex overflow-x-auto p-4 gap-4 items-center">
                {scenes.map((scene, index) => (
                    <div
                        key={scene.id}
                        onClick={() => setActiveScene(scene.id)}
                        className={cn(
                            "flex-shrink-0 w-48 h-28 rounded-xl border transition-all cursor-pointer relative group overflow-hidden bg-black/50",
                            activeSceneId === scene.id ? "border-fantasy-gold shadow-[0_0_15px_rgba(255,215,0,0.2)]" : "border-white/5 hover:border-white/20"
                        )}
                    >
                        {/* Scene Number */}
                        <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-fantasy-gold font-cinzel z-10">
                            {index + 1}. {scene.name}
                        </div>

                        {/* Controls Overlay (Visible on Hover/Active) */}
                        <div className={cn(
                            "absolute inset-0 bg-black/60 flex items-center justify-center gap-2 opacity-0 transition-opacity",
                            activeSceneId === scene.id ? "opacity-100 bg-black/20" : "group-hover:opacity-100"
                        )}>
                            <div className="flex flex-col gap-1 items-center">
                                <div className="flex gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => { e.stopPropagation(); updateScene(scene.id, { gridEnabled: !scene.gridEnabled }); }}
                                        title="Toggle Grid"
                                        active={scene.gridEnabled}
                                        className="h-6 w-6"
                                    >
                                        <Grid className="w-3 h-3" />
                                    </Button>
                                    {scene.gridEnabled && (
                                        <input
                                            type="color"
                                            value={scene.gridColor || '#334155'}
                                            onChange={(e) => updateScene(scene.id, { gridColor: e.target.value })}
                                            className="w-6 h-6 rounded cursor-pointer bg-transparent border-none p-0"
                                            title="Grid Color"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    )}
                                </div>
                            </div>

                            {/* Audio and BG buttons would open dialogs, for now just placeholder icons */}
                            <div className="flex gap-1 absolute bottom-2 right-2">
                                {scene.backgroundAssetId ? <ImageIcon className="w-3 h-3 text-fantasy-accent" /> : null}
                                {scene.musicUrl ? <Music className="w-3 h-3 text-fantasy-accent" /> : null}
                            </div>
                        </div>
                    </div>
                ))}

                <Button variant="secondary" className="h-28 w-28 shrink-0 flex flex-col gap-2" onClick={handleAddScene}>
                    <Plus className="w-6 h-6" />
                    <span className="text-xs">New Scene</span>
                </Button>
            </div>
        </div>
    );
};
