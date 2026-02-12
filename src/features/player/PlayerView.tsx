import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { EditorCanvas } from '@/features/editor/EditorCanvas';
import { Vault } from '@/features/vault/Vault';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, ChevronRight, Backpack, Menu, Maximize, Grid } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlayerViewProps {
    onNavigate: (view: 'HOME') => void;
}

export const PlayerView = ({ onNavigate }: PlayerViewProps) => {
    const { scenes, activeSceneId, setActiveScene, getCurrentScene, updateScene } = useGameStore();
    const [showVault, setShowVault] = useState(false);
    const [showSceneMenu, setShowSceneMenu] = useState(false);

    // Derived state
    const currentScene = getCurrentScene();
    const currentIndex = scenes.findIndex(s => s.id === activeSceneId);

    // Ensure a scene is always selected
    useEffect(() => {
        if (!activeSceneId && scenes.length > 0) {
            setActiveScene(scenes[0].id);
        }
    }, [activeSceneId, scenes, setActiveScene]);

    const goNext = () => {
        if (currentIndex < scenes.length - 1) setActiveScene(scenes[currentIndex + 1].id);
    };

    const goPrev = () => {
        if (currentIndex > 0) setActiveScene(scenes[currentIndex - 1].id);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    // Audio Logic
    useEffect(() => {
        if (currentScene?.musicUrl) {
            const audio = new Audio(currentScene.musicUrl);
            audio.loop = true;
            audio.play().catch(e => console.log("Audio play failed (interaction needed)", e));
            return () => {
                audio.pause();
                audio.src = "";
            };
        }
    }, [currentScene?.musicUrl]);

    return (
        <div className="h-screen w-screen overflow-hidden bg-fantasy-black relative">
            {/* Vault Overlay - Fixed visibility bug by passing clean className to remove fixed positioning from Vault component */}
            <div className={cn("fixed left-0 top-0 bottom-0 z-40 transition-transform duration-300 w-80", showVault ? "translate-x-0" : "-translate-x-full")}>
                <Vault
                    allowedTypes={['token']}
                    className="w-full h-full flex flex-col backdrop-blur-xl bg-fantasy-dark/95 border-r border-white/10 shadow-2xl"
                    onClose={() => setShowVault(false)}
                />
            </div>

            {/* Scene Selector - Below Vault button as requested */}
            <div className={cn("fixed left-0 top-16 z-30 transition-transform duration-300 w-64", showSceneMenu ? "translate-x-0" : "-translate-x-full")}>
                <div className="bg-fantasy-panel/95 backdrop-blur-md border-r border-b border-t border-white/10 p-2 rounded-r-lg mt-2 ml-2">
                    <h3 className="text-fantasy-gold font-cinzel mb-2 text-sm uppercase tracking-wider border-b border-white/10 pb-1">Scenes</h3>
                    <div className="max-h-[60vh] overflow-y-auto space-y-1">
                        {scenes.map((s, idx) => (
                            <div
                                key={s.id}
                                onClick={() => { setActiveScene(s.id); }}
                                className={cn("p-2 text-sm rounded cursor-pointer hover:bg-white/10 transition-colors flex items-center gap-2", activeSceneId === s.id ? "bg-fantasy-accent/20 text-fantasy-gold" : "text-fantasy-text")}
                            >
                                <span className="text-fantasy-muted font-mono text-xs opacity-50">{idx + 1}.</span> {s.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Stage */}
            <div className="w-full h-full relative z-0">
                <EditorCanvas />
            </div>

            {/* UI Overlay */}
            <div className="absolute inset-0 z-30 pointer-events-none flex flex-col justify-between p-6">

                {/* Top Controls */}
                <div className="flex justify-between items-start pointer-events-auto">
                    <div className="flex gap-2 items-center">
                        {/* Back Button */}
                        <Button variant="secondary" onClick={() => onNavigate('HOME')}>
                            <ChevronLeft className="w-4 h-4 mr-1" /> Back
                        </Button>

                        {/* Vault Toggle */}
                        <Button
                            variant={showVault ? "primary" : "secondary"}
                            onClick={() => setShowVault(!showVault)}
                        >
                            <Backpack className="w-4 h-4 mr-2" /> Vault
                        </Button>

                        {/* Scene Selector Toggle */}
                        <Button
                            variant={showSceneMenu ? "primary" : "secondary"}
                            onClick={() => setShowSceneMenu(!showSceneMenu)}
                        >
                            <Menu className="w-4 h-4 mr-2" /> Scenes
                        </Button>

                        {/* Grid Toggle */}
                        <Button
                            variant={currentScene?.gridEnabled ? "primary" : "secondary"}
                            onClick={() => {
                                if (currentScene) {
                                    updateScene(currentScene.id, { gridEnabled: !currentScene.gridEnabled });
                                }
                            }}
                            title="Toggle Grid"
                        >
                            <Grid className="w-4 h-4" />
                        </Button>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={toggleFullscreen} title="Fullscreen">
                            <Maximize className="w-6 h-6 text-fantasy-gold" />
                        </Button>
                    </div>
                </div>

                {/* Navigation Sides */}
                <div className="absolute top-1/2 left-4 -translate-y-1/2 pointer-events-auto">
                    <Button variant="ghost" size="icon" onClick={goPrev} disabled={currentIndex <= 0} className="h-16 w-16 rounded-full bg-black/20 hover:bg-black/50 hover:text-fantasy-gold transition-all">
                        <ChevronLeft className="w-8 h-8" />
                    </Button>
                </div>

                <div className="absolute top-1/2 right-4 -translate-y-1/2 pointer-events-auto">
                    <Button variant="ghost" size="icon" onClick={goNext} disabled={currentIndex >= scenes.length - 1} className="h-16 w-16 rounded-full bg-black/20 hover:bg-black/50 hover:text-fantasy-gold transition-all">
                        <ChevronRight className="w-8 h-8" />
                    </Button>
                </div>

                {/* Bottom Info */}
                <div className="text-center pb-4 pointer-events-auto transition-opacity hover:opacity-100 opacity-0 duration-500">
                    <h2 className="text-2xl font-cinzel text-fantasy-gold drop-shadow-md">{currentScene?.name}</h2>
                </div>
            </div>
        </div>
    );
}
