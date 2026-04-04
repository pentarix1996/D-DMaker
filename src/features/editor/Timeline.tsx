import React from 'react';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Plus, Image as ImageIcon, Music, Grid, Edit2, Trash2 } from 'lucide-react';
import type { Scene } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export const Timeline = () => {
    const { scenes, activeSceneId, setActiveScene, addScene, updateScene, deleteScene, reorderScenes, activeStory } = useGameStore();
    const [draggedSceneId, setDraggedSceneId] = React.useState<string | null>(null);
    const [dragOverSceneId, setDragOverSceneId] = React.useState<string | null>(null);

    const handleAddScene = () => {
        if (!activeStory) return;

        const newScene: Scene = {
            id: uuidv4(),
            storyId: activeStory.id,
            name: `Scene ${scenes.length + 1}`,
            order: scenes.length,
            tokens: [],
            gridEnabled: false,
            gridColor: '#334155',
            gridSize: 48
        };
        addScene(newScene);
    };

    const handleRenameScene = (e: React.MouseEvent, scene: Scene) => {
        e.stopPropagation();
        const newName = window.prompt("Rename scene:", scene.name);
        if (newName && newName.trim()) {
            updateScene(scene.id, { name: newName.trim() });
        }
    };

    const handleSceneDrop = (targetSceneId: string) => {
        if (!draggedSceneId || draggedSceneId === targetSceneId) {
            setDraggedSceneId(null);
            setDragOverSceneId(null);
            return;
        }

        const orderedIds = scenes.map((scene) => scene.id);
        const from = orderedIds.indexOf(draggedSceneId);
        const to = orderedIds.indexOf(targetSceneId);

        if (from === -1 || to === -1) {
            setDraggedSceneId(null);
            setDragOverSceneId(null);
            return;
        }

        orderedIds.splice(from, 1);
        orderedIds.splice(to, 0, draggedSceneId);
        reorderScenes(orderedIds);
        setDraggedSceneId(null);
        setDragOverSceneId(null);
    };

    return (
        <div className="h-40 bg-fantasy-dark/95 border-t border-white/5 flex flex-col backdrop-blur-md">
            <div className="flex-1 flex overflow-x-auto p-4 gap-4 items-center">
                {scenes.map((scene, index) => (
                    <div
                        key={scene.id}
                        draggable
                        onDragStart={() => setDraggedSceneId(scene.id)}
                        onDragEnd={() => {
                            setDraggedSceneId(null);
                            setDragOverSceneId(null);
                        }}
                        onDragOver={(e) => {
                            e.preventDefault();
                            if (dragOverSceneId !== scene.id) {
                                setDragOverSceneId(scene.id);
                            }
                        }}
                        onDrop={(e) => {
                            e.preventDefault();
                            handleSceneDrop(scene.id);
                        }}
                        onClick={() => setActiveScene(scene.id)}
                        className={cn(
                            "flex-shrink-0 w-48 h-28 rounded-xl border transition-all cursor-pointer relative group overflow-hidden bg-black/50",
                            activeSceneId === scene.id ? "border-fantasy-gold shadow-[0_0_15px_rgba(255,215,0,0.2)]" : "border-white/5 hover:border-white/20",
                            dragOverSceneId === scene.id && draggedSceneId !== scene.id && "border-fantasy-accent"
                        )}
                    >
                        {/* Scene Number */}
                        <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-fantasy-gold font-cinzel z-10">
                            {index + 1}. {scene.name}
                        </div>

                        {/* Rename Button */}
                        <div className="absolute top-2 right-2 z-10 flex gap-1 opacity-0 group-hover:opacity-100">
                            <button
                                onClick={(e) => handleRenameScene(e, scene)}
                                className="p-1 bg-black/60 rounded text-fantasy-muted hover:text-fantasy-gold transition-colors"
                                title="Rename Scene"
                            >
                                <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm(`Delete scene "${scene.name}"?`)) deleteScene(scene.id);
                                }}
                                className="p-1 bg-black/60 rounded text-fantasy-muted hover:text-red-500 transition-colors"
                                title="Delete Scene"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
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
                                {scene.gridEnabled && (
                                    <div className="flex items-center gap-1 mt-1" onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type="range"
                                            min="24"
                                            max="128"
                                            step="4"
                                            value={scene.gridSize || 48}
                                            onChange={(e) => updateScene(scene.id, { gridSize: Number(e.target.value) })}
                                            className="w-20 h-1 accent-fantasy-gold cursor-pointer"
                                            title={`Grid Size: ${scene.gridSize || 48}px`}
                                        />
                                        <input
                                            type="number"
                                            min="24"
                                            max="128"
                                            step="4"
                                            value={scene.gridSize || 48}
                                            onChange={(e) => {
                                                updateScene(scene.id, { gridSize: Number(e.target.value) || 0 });
                                            }}
                                            onBlur={(e) => {
                                                const val = Math.max(24, Math.min(128, Number(e.target.value) || 48));
                                                updateScene(scene.id, { gridSize: val });
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            className="w-10 text-[10px] text-fantasy-muted bg-black/40 border border-white/10 rounded px-1 py-0 text-center focus:outline-none focus:border-fantasy-gold"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Audio and BG icons */}
                            <div className="flex gap-1 absolute bottom-2 right-2">
                                {scene.backgroundAssetId && (
                                    <div title="Has Background Map" className="p-1 bg-black/40 rounded">
                                        <ImageIcon className="w-3 h-3 text-fantasy-accent" />
                                    </div>
                                )}
                                {(scene.musicAssetId || scene.musicUrl) ? (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm('Quitar música de esta escena?')) {
                                                updateScene(scene.id, { musicUrl: undefined, musicData: undefined, musicAssetId: undefined });
                                            }
                                        }}
                                        className="p-1 bg-black/40 hover:bg-red-500/80 rounded transition-colors group/music"
                                        title="Quitar Música"
                                    >
                                        <Music className="w-3 h-3 text-fantasy-accent group-hover/music:text-white" />
                                    </button>
                                ) : null}
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
