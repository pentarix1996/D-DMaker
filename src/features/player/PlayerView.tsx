import { useState, useEffect, lazy, Suspense, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { db } from '@/db';
import { EditorCanvas } from '@/features/editor/EditorCanvas';
const Vault = lazy(() => import('@/features/vault/Vault').then(m => ({ default: m.Vault })));
const DiceRoller = lazy(() => import('@/features/player/DiceRoller').then(m => ({ default: m.DiceRoller })));
const InitiativeTracker = lazy(() => import('@/features/player/InitiativeTracker').then(m => ({ default: m.InitiativeTracker })));
import { Button } from '@/components/ui/Button';
import { ChevronLeft, ChevronRight, Backpack, Menu, Maximize, Grid, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PlayerViewProps {
    onNavigate: (view: 'HOME') => void;
}

export const PlayerView = ({ onNavigate }: PlayerViewProps) => {
    const { scenes, activeSceneId, setActiveScene, getCurrentScene, updateScene } = useGameStore();
    const [showVault, setShowVault] = useState(false);
    const [showSceneMenu, setShowSceneMenu] = useState(false);
    const [isIdle, setIsIdle] = useState(false);
    const [volume, setVolume] = useState(0.5); // Default 50% volume
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Audio cleanup on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = "";
            }
            if (fadeIntervalRef.current) {
                clearInterval(fadeIntervalRef.current);
            }
        };
    }, []);

    // Derived state
    const currentScene = getCurrentScene();
    const currentIndex = scenes.findIndex(s => s.id === activeSceneId);

    // Idle Timer Logic (Cinematic Mode)
    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout>;
        const handleActivity = () => {
            setIsIdle(false);
            clearTimeout(timeout);
            if (!showVault && !showSceneMenu) {
                timeout = setTimeout(() => setIsIdle(true), 3000);
            }
        };

        window.addEventListener('mousemove', handleActivity);
        window.addEventListener('keydown', handleActivity);
        window.addEventListener('click', handleActivity);

        handleActivity(); // Init

        return () => {
            window.removeEventListener('mousemove', handleActivity);
            window.removeEventListener('keydown', handleActivity);
            window.removeEventListener('click', handleActivity);
            clearTimeout(timeout);
        };
    }, [showVault, showSceneMenu]);

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

    // Audio Logic with Fade In/Out and Dynamic Blob Loading
    useEffect(() => {
        let objectUrl: string | null = null;
        let isCancelled = false;

        // Clear any existing fade
        if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current);
            fadeIntervalRef.current = null;
        }

        const playNewAudio = async () => {
            // Backward compatibility with musicUrl, but primarily load from musicAssetId
            let effectiveUrl = currentScene?.musicUrl;

            if (currentScene?.musicAssetId) {
                try {
                    const asset = await db.assets.get(currentScene.musicAssetId);
                    if (asset && asset.fileData && !isCancelled) {
                        objectUrl = URL.createObjectURL(asset.fileData);
                        effectiveUrl = objectUrl;
                    }
                } catch (e) {
                    console.error("Failed to load audio from DB", e);
                }
            }

            if (!effectiveUrl || isCancelled) return;

            const newAudio = new Audio(effectiveUrl);
            newAudio.loop = true;
            newAudio.volume = 0; // Start at 0 for fade in

            newAudio.play().then(() => {
                if (isCancelled) {
                    newAudio.pause();
                    return;
                }

                audioRef.current = newAudio;

                // Fade In
                let currentVol = 0;
                const targetVol = volume;
                fadeIntervalRef.current = setInterval(() => {
                    currentVol += 0.05;
                    if (currentVol >= targetVol) {
                        newAudio.volume = targetVol;
                        if (fadeIntervalRef.current) {
                            clearInterval(fadeIntervalRef.current);
                            fadeIntervalRef.current = null;
                        }
                    } else {
                        newAudio.volume = currentVol;
                    }
                }, 100);
            }).catch(e => console.log("Audio play failed (interaction needed)", e));
        };

        // Let's assume a change in scene triggers this effect.
        if (audioRef.current) {
            // We have a playing track. Fade it out.
            const oldAudio = audioRef.current;
            oldAudio.dataset.beingFadedOut = "true"; // mark to avoid re-using
            let currentVol = oldAudio.volume;

            fadeIntervalRef.current = setInterval(() => {
                currentVol -= 0.05;
                if (currentVol <= 0 || isCancelled) {
                    oldAudio.pause();
                    oldAudio.src = "";
                    if (fadeIntervalRef.current) {
                        clearInterval(fadeIntervalRef.current);
                        fadeIntervalRef.current = null;
                    }

                    if (!isCancelled) {
                        playNewAudio(); // After fade out completes, play the new one
                    }
                } else {
                    oldAudio.volume = currentVol;
                }
            }, 50);

        } else {
            // No track playing currently
            playNewAudio();
        }

        // Cleanup
        return () => {
            isCancelled = true;
            if (fadeIntervalRef.current) {
                clearInterval(fadeIntervalRef.current);
            }
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [currentScene?.musicAssetId, currentScene?.musicUrl, currentScene?.id]);

    // Handle global volume changes instantly for the currently playing track
    useEffect(() => {
        if (audioRef.current && !fadeIntervalRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume]);

    return (
        <div className="h-screen w-screen overflow-auto bg-fantasy-black relative">
            {/* Vault Overlay - Fixed visibility bug by passing clean className to remove fixed positioning from Vault component */}
            <div className={cn("fixed left-0 top-0 bottom-0 z-40 transition-transform duration-300 w-80", showVault ? "translate-x-0" : "-translate-x-full")}>
                <Suspense fallback={<div className="w-full h-full bg-fantasy-dark/95 backdrop-blur-xl border-r border-white/10 flex items-center justify-center p-4 text-fantasy-muted animate-pulse">Cargando Bóveda...</div>}>
                    <Vault
                        allowedTypes={['token']}
                        className="w-full h-full flex flex-col backdrop-blur-xl bg-fantasy-dark/95 border-r border-white/10 shadow-2xl"
                        onClose={() => setShowVault(false)}
                    />
                </Suspense>
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

            {/* Float Widgets (Interactive even when idle if desired, or let them fade) */}
            <div className={cn("transition-opacity duration-700 ease-in-out", isIdle ? "opacity-0 pointer-events-none" : "opacity-100")}>
                <Suspense fallback={null}>
                    <DiceRoller />
                    <InitiativeTracker />
                </Suspense>
            </div>

            {/* UI Overlay */}
            <div className={cn("fixed inset-0 z-30 pointer-events-none flex flex-col justify-between p-6 transition-opacity duration-700 ease-in-out", isIdle ? "opacity-0" : "opacity-100")}>

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

                    <div className="flex gap-4 items-center bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm pointer-events-auto">
                        <div className="flex items-center gap-2">
                            {volume === 0 ? <VolumeX className="w-4 h-4 text-fantasy-muted" /> : <Volume2 className="w-4 h-4 text-fantasy-gold" />}
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={volume}
                                onChange={(e) => setVolume(parseFloat(e.target.value))}
                                className="w-24 accent-fantasy-gold cursor-pointer"
                                title="Music Volume"
                            />
                        </div>
                        <div className="w-px h-6 bg-white/20" />
                        <Button variant="ghost" size="icon" onClick={toggleFullscreen} title="Fullscreen" className="hover:bg-white/10 rounded-full h-8 w-8">
                            <Maximize className="w-4 h-4 text-fantasy-gold" />
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
