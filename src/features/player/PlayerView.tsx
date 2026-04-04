import { useState, useEffect, lazy, Suspense, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { db } from '@/db';
import { EditorCanvas } from '@/features/editor/EditorCanvas';
const Vault = lazy(() => import('@/features/vault/Vault').then(m => ({ default: m.Vault })));
const DiceRoller = lazy(() => import('@/features/player/DiceRoller').then(m => ({ default: m.DiceRoller })));
import { Button } from '@/components/ui/Button';
import { ChevronLeft, ChevronRight, Backpack, Menu, Maximize, Grid, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAssets } from '@/hooks/useAssets';
import { useShopTemplates } from '@/hooks/useShopTemplates';
import type { ShopCatalogItem, ShopItemType } from '@/types';

interface PlayerViewProps {
    onNavigate: (view: 'HOME') => void;
}

export const PlayerView = ({ onNavigate }: PlayerViewProps) => {
    const { scenes, activeSceneId, setActiveScene, getCurrentScene, updateScene } = useGameStore();
    const { assets: mapAssets } = useAssets('map');
    const { assets: visualAssets } = useAssets(['map', 'token', 'asset']);
    const { templates } = useShopTemplates();
    const [showVault, setShowVault] = useState(false);
    const [showSceneMenu, setShowSceneMenu] = useState(false);
    const [isIdle, setIsIdle] = useState(false);
    const [volume, setVolume] = useState(0.5); // Default 50% volume
    const [selectedShopType, setSelectedShopType] = useState<ShopItemType>('weapon');
    const [showShopDisclaimers, setShowShopDisclaimers] = useState(false);
    const [sessionShopStock, setSessionShopStock] = useState<Record<string, number>>({});
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
    const currentMapAsset = mapAssets.find((asset) => asset.id === currentScene?.backgroundAssetId);
    const selectedTemplate = currentMapAsset?.shopTemplateId ? templates.find((template) => template.id === currentMapAsset.shopTemplateId) : undefined;
    const currentShopCatalog = currentMapAsset?.mapKind === 'shop'
        ? (selectedTemplate?.items ?? currentMapAsset.shopCatalog ?? [])
        : [];
    const filteredShopCatalog = currentShopCatalog.filter((item) => item.type === selectedShopType);
    const getItemTypeLabel = (type: string): string => {
        if (type === 'weapon') return 'Arma';
        if (type === 'armor') return 'Armadura';
        return 'Objeto';
    };
    const damageTypeLabel: Record<string, string> = {
        bludgeoning: 'Contundente',
        slashing: 'Cortante',
        piercing: 'Perforante'
    };
    const armorTypeLabel: Record<string, string> = {
        light: 'Ligera',
        medium: 'Media',
        heavy: 'Pesada',
        shield: 'Escudo'
    };
    const abilityLabel: Record<string, string> = {
        str: 'Fue',
        dex: 'Des',
        int: 'Int',
        wis: 'Sab',
        cha: 'Car',
        con: 'Con'
    };
    const ammoTypeLabel: Record<string, string> = {
        arrow: 'Flecha',
        bolt: 'Virote',
        projectile: 'Proyectil',
        bullet: 'Bala'
    };
    const formatPrice = (item: ShopCatalogItem): string => {
        const parts: string[] = [];
        if (item.price.cp > 0) parts.push(`CP ${item.price.cp}`);
        if (item.price.sp > 0) parts.push(`SP ${item.price.sp}`);
        if (item.price.gp > 0) parts.push(`GP ${item.price.gp}`);
        if (item.price.pp > 0) parts.push(`PP ${item.price.pp}`);
        return parts.length > 0 ? parts.join(' ') : 'Sin costo';
    };
    const getWeaponProperties = (item: ShopCatalogItem): string[] => {
        if (item.type !== 'weapon') return [];
        const props: string[] = [];
        if (item.properties.versatile?.enabled) props.push(`Versatil (${item.damageDiceCount}${item.properties.versatile.twoHandedDamageDie})`);
        if (item.properties.thrown?.enabled) props.push(`Arrojadiza (${item.properties.thrown.minRange}/${item.properties.thrown.maxRange})`);
        if (item.properties.light) props.push('Ligera');
        if (item.properties.finesse) props.push('Sutil');
        if (item.properties.twoHanded) props.push('A dos manos');
        if (item.properties.ammunition?.enabled) props.push(`Municion (${item.properties.ammunition.minRange}/${item.properties.ammunition.maxRange}, ${ammoTypeLabel[item.properties.ammunition.ammoType]})`);
        if (item.properties.reload) props.push('Recarga');
        if (item.properties.longRange) props.push('Gran alcance');
        if (item.properties.heavy) props.push('Pesada');
        return props;
    };
    const getItemStock = (item: ShopCatalogItem): number => {
        const key = `${currentMapAsset?.id}:${item.id}`;
        const current = sessionShopStock[key];
        if (typeof current === 'number') return current;
        return item.quantityAvailable;
    };

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

    const handleBuyShopItem = async (itemId: string) => {
        if (!currentMapAsset || currentMapAsset.mapKind !== 'shop') return;
        setSessionShopStock((prev) => {
            const next = { ...prev };
            const target = currentShopCatalog.find((item) => item.id === itemId);
            if (!target) return next;
            const key = `${currentMapAsset.id}:${itemId}`;
            const currentStock = typeof next[key] === 'number' ? next[key] : target.quantityAvailable;
            if (currentStock <= 0) return next;
            next[key] = currentStock - 1;
            return next;
        });
    };

    useEffect(() => {
        if (!currentMapAsset || currentMapAsset.mapKind !== 'shop') return;
        setSessionShopStock((prev) => {
            const next = { ...prev };
            for (const item of currentShopCatalog) {
                const key = `${currentMapAsset.id}:${item.id}`;
                if (typeof next[key] !== 'number') {
                    next[key] = item.quantityAvailable;
                }
            }
            return next;
        });
    }, [currentMapAsset?.id, currentMapAsset?.mapKind, currentShopCatalog]);

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
                        allowedTypes={['token', 'asset']}
                        className="w-full h-full flex flex-col backdrop-blur-xl bg-fantasy-dark/95 border-r border-white/10 shadow-2xl"
                        onClose={() => setShowVault(false)}
                    />
                </Suspense>
            </div>

            {/* Scene Selector - Below Vault button as requested */}
            <div className={cn("fixed left-0 top-16 z-30 transition-transform duration-300", showSceneMenu ? "translate-x-0" : "-translate-x-full")}>
                <div className="bg-fantasy-panel/95 backdrop-blur-md border-r border-b border-t border-white/10 p-2 rounded-r-lg mt-2 ml-2">
                    <h3 className="text-fantasy-gold font-cinzel mb-2 text-sm uppercase tracking-wider border-b border-white/10 pb-1">Scenes</h3>
                    <div className="overflow-y-auto overflow-x-hidden max-h-[65vh] max-w-[70vw] pr-1">
                        <div className="grid grid-cols-2 gap-1.5">
                        {scenes.map((s, idx) => (
                            <div
                                key={s.id}
                                onClick={() => { setActiveScene(s.id); }}
                                className={cn("flex-shrink-0 px-3 py-1.5 text-sm rounded cursor-pointer hover:bg-white/10 transition-colors flex items-center gap-1.5 whitespace-nowrap", activeSceneId === s.id ? "bg-fantasy-accent/20 text-fantasy-gold" : "text-fantasy-text")}
                            >
                                <span className="text-fantasy-muted font-mono text-xs opacity-50">{idx + 1}.</span> {s.name}
                            </div>
                        ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Stage */}
            <div className="w-full h-full relative z-0">
                <EditorCanvas fogEditMode={false} />
            </div>

            {/* Float Widgets (Interactive even when idle if desired, or let them fade) */}
            <div className={cn("transition-opacity duration-700 ease-in-out", isIdle ? "opacity-0 pointer-events-none" : "opacity-100")}>
                <Suspense fallback={null}>
                    <DiceRoller />
                </Suspense>
            </div>

            {currentMapAsset?.mapKind === 'shop' && (
                <div className="fixed right-6 top-24 z-40 w-80 max-h-[70vh] overflow-hidden bg-fantasy-dark/95 border border-white/10 backdrop-blur-md rounded-lg">
                    <div className="p-3 border-b border-white/10">
                        <h3 className="text-fantasy-gold font-cinzel text-sm uppercase tracking-wider">Tienda</h3>
                    </div>
                    <div className="p-3 max-h-[60vh] overflow-y-auto space-y-2">
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setShowShopDisclaimers(prev => !prev)}
                        >
                            {showShopDisclaimers ? 'Ocultar avisos' : 'Mostrar avisos'}
                        </Button>
                        {showShopDisclaimers && (
                            <div className="space-y-2">
                                <p className="text-xs text-fantasy-muted bg-black/30 border border-white/10 rounded-lg p-2">
                                    Si una armadura Ligera, Media o Pesada se lleva sin maestria, se tiene desventaja en tiradas de Fuerza o Destreza con D20 y no se pueden lanzar conjuros.
                                </p>
                                <p className="text-xs text-fantasy-muted bg-black/30 border border-white/10 rounded-lg p-2">
                                    El bonificador de escudo solo se aplica si existe entrenamiento con escudos.
                                </p>
                            </div>
                        )}
                        <div className="grid grid-cols-3 gap-1">
                            <Button
                                size="sm"
                                variant={selectedShopType === 'weapon' ? 'primary' : 'secondary'}
                                onClick={() => setSelectedShopType('weapon')}
                            >
                                Armas
                            </Button>
                            <Button
                                size="sm"
                                variant={selectedShopType === 'armor' ? 'primary' : 'secondary'}
                                onClick={() => setSelectedShopType('armor')}
                            >
                                Armaduras
                            </Button>
                            <Button
                                size="sm"
                                variant={selectedShopType === 'object' ? 'primary' : 'secondary'}
                                onClick={() => setSelectedShopType('object')}
                            >
                                Objetos
                            </Button>
                        </div>
                        {filteredShopCatalog.length === 0 && (
                            <div className="text-xs text-fantasy-muted">No hay objetos disponibles.</div>
                        )}
                        {filteredShopCatalog.map((item) => {
                            const imageAsset = item.imageAssetId ? visualAssets.find((asset) => asset.id === item.imageAssetId) : undefined;
                            return (
                            <div key={item.id} className={cn("border border-white/10 rounded-lg p-2 bg-black/20", getItemStock(item) <= 0 && "opacity-50 grayscale")}>
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2">
                                        {imageAsset && (
                                            <img src={imageAsset.imageUrl} alt={item.name} className="w-10 h-10 rounded object-cover border border-white/10" />
                                        )}
                                        <div>
                                        <p className="text-sm text-fantasy-text">{item.name}</p>
                                        <p className="text-xs text-fantasy-muted uppercase">{getItemTypeLabel(item.type)}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs text-fantasy-muted">Cantidad: {getItemStock(item)}</span>
                                </div>
                                <div className="text-xs text-fantasy-muted mt-1">
                                    Precio: {formatPrice(item)}
                                </div>
                                {item.type === 'weapon' && (
                                    <div className="text-xs text-fantasy-muted mt-1 space-y-1">
                                        <p>Dano: {item.damageDiceCount}{item.damageDie} ({damageTypeLabel[item.damageType]})</p>
                                        {getWeaponProperties(item).length > 0 && (
                                            <p>Propiedades: {getWeaponProperties(item).join(', ')}</p>
                                        )}
                                        {typeof item.weightKg === 'number' && (
                                            <p>Peso: {item.weightKg} Kg</p>
                                        )}
                                    </div>
                                )}
                                {item.type === 'armor' && (
                                    <div className="text-xs text-fantasy-muted mt-1 space-y-1">
                                        <p>Tipo: {armorTypeLabel[item.armorType]}</p>
                                        <p>
                                            CA: {item.armorClass}
                                            {item.armorClassModifier?.ability ? ` + Mod ${abilityLabel[item.armorClassModifier.ability]}` : ''}
                                            {typeof item.armorClassModifier?.maxBonus === 'number' ? ` (Max ${item.armorClassModifier.maxBonus})` : ''}
                                        </p>
                                        {typeof item.requiredStrength === 'number' && (
                                            <p>Fuerza requerida: {item.requiredStrength}</p>
                                        )}
                                        <p>Sigilo: {item.stealth === 'disadvantage' ? 'Desventaja' : 'Nada'}</p>
                                        {typeof item.weightKg === 'number' && (
                                            <p>Peso: {item.weightKg} Kg</p>
                                        )}
                                    </div>
                                )}
                                {item.type === 'object' && (
                                    <div className="text-xs text-fantasy-muted mt-1 space-y-1">
                                        {item.description && (
                                            <p>Descripcion: {item.description}</p>
                                        )}
                                        {typeof item.weightKg === 'number' && (
                                            <p>Peso: {item.weightKg} Kg</p>
                                        )}
                                    </div>
                                )}
                                <div className="mt-2">
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        disabled={getItemStock(item) <= 0}
                                        onClick={() => { void handleBuyShopItem(item.id); }}
                                    >
                                        Comprar
                                    </Button>
                                </div>
                            </div>
                        )})}
                    </div>
                </div>
            )}

            {/* UI Overlay */}
            <div className={cn("fixed inset-0 z-30 pointer-events-none flex flex-col justify-between p-6 transition-opacity duration-700 ease-in-out", isIdle ? "opacity-0" : "opacity-100")}>

                {/* Top Controls */}
                <div className={cn("flex justify-between items-start", isIdle ? "pointer-events-none" : "pointer-events-auto")}>
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
                <div className={cn("absolute top-1/2 left-4 -translate-y-1/2", isIdle ? "pointer-events-none" : "pointer-events-auto")}>
                    <Button variant="ghost" size="icon" onClick={goPrev} disabled={currentIndex <= 0} className="h-16 w-16 rounded-full bg-black/20 hover:bg-black/50 hover:text-fantasy-gold transition-all">
                        <ChevronLeft className="w-8 h-8" />
                    </Button>
                </div>

                <div className={cn("absolute top-1/2 right-4 -translate-y-1/2", isIdle ? "pointer-events-none" : "pointer-events-auto")}>
                    <Button variant="ghost" size="icon" onClick={goNext} disabled={currentIndex >= scenes.length - 1} className="h-16 w-16 rounded-full bg-black/20 hover:bg-black/50 hover:text-fantasy-gold transition-all">
                        <ChevronRight className="w-8 h-8" />
                    </Button>
                </div>

                {/* Bottom Info */}
                <div className={cn("text-center pb-4 transition-opacity hover:opacity-100 opacity-0 duration-500", isIdle ? "pointer-events-none" : "pointer-events-auto")}>
                    <h2 className="text-2xl font-cinzel text-fantasy-gold drop-shadow-md">{currentScene?.name}</h2>
                </div>
            </div>
        </div>
    );
}
