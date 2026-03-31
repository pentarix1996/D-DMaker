import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { AssetImage } from '@/components/AssetImage';
import { DraggableToken, TOKEN_SIZE_PCT } from '@/features/editor/DraggableToken';
import { v4 as uuidv4 } from 'uuid';
import type { SceneAsset } from '@/types';
import { applyFogBrush, applyFogLightingMask, mergeRevealedFogMask, normalizeFogState, toEffectiveLightRadius, type FogLightSource } from '@/lib/fogOfWar';
import { shouldDisableTokenInteractions } from '@/lib/tokenInteractions';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db';

interface EditorCanvasProps {
    fogEditMode?: boolean;
    fogTool?: 'paint' | 'erase';
}

export const EditorCanvas = ({ fogEditMode = false, fogTool = 'paint' }: EditorCanvasProps) => {
    const { getCurrentScene, updateScene, isEditMode, scenes } = useGameStore();
    const scene = getCurrentScene();
    const containerRef = useRef<HTMLDivElement>(null);
    const fogCanvasRef = useRef<HTMLCanvasElement>(null);
    const [topTokenId, setTopTokenId] = useState<string | null>(null);
    const [isPaintingFog, setIsPaintingFog] = useState(false);
    const fog = useMemo(() => normalizeFogState(scene?.fogOfWar), [scene?.fogOfWar]);
    const shouldRenderFog = isEditMode ? fog.enabled : true;
    const allAssets = useLiveQuery(() => db.assets.toArray(), []);
    const assetsById = useMemo(() => {
        return new Map((allAssets ?? []).map(asset => [asset.id, asset]));
    }, [allAssets]);
    const lightSources = useMemo<FogLightSource[]>(() => {
        if (!scene) return [];
        return scene.tokens.map(token => {
            const asset = assetsById.get(token.assetId);
            if (!asset) return null;
            const playerRadius = asset.tokenRole === 'player' ? (asset.playerConfig?.level ? 8 + asset.playerConfig.level : 12) : 0;
            const configuredRadius = asset.lightRadius ?? 0;
            const lightRadius = toEffectiveLightRadius(Math.max(playerRadius, configuredRadius));
            const isLightSource = asset.tokenRole === 'player' || asset.assetRole === 'light_source' || lightRadius > 0;
            if (!isLightSource || lightRadius <= 0) return null;
            return {
                xPercent: token.x,
                yPercent: token.y,
                radiusPercent: lightRadius
            };
        }).filter((source): source is FogLightSource => source !== null);
    }, [scene, assetsById]);

    useEffect(() => {
        if (!scene || !shouldRenderFog) return;
        const canvas = fogCanvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = fog.width;
        canvas.height = fog.height;
        ctx.clearRect(0, 0, fog.width, fog.height);

        if (isEditMode) {
            for (let y = 0; y < fog.height; y++) {
                for (let x = 0; x < fog.width; x++) {
                    const idx = (y * fog.width) + x;
                    if (fog.mask[idx] === 1) {
                        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
                        ctx.fillRect(x, y, 1, 1);
                    }
                }
            }
            return;
        }

        const litMask = applyFogLightingMask(fog, lightSources);
        if (!isEditMode && fog.enabled) {
            const merged = mergeRevealedFogMask(fog.mask, litMask);
            if (merged.changed) {
                updateScene(scene.id, { fogOfWar: { ...fog, enabled: true, mask: merged.mask } });
            }
        }
        ctx.fillStyle = 'rgba(0, 0, 0, 0.97)';
        ctx.fillRect(0, 0, fog.width, fog.height);
        for (let y = 0; y < fog.height; y++) {
            for (let x = 0; x < fog.width; x++) {
                const idx = (y * fog.width) + x;
                if (litMask[idx] === 0) {
                    ctx.clearRect(x, y, 1, 1);
                }
            }
        }
    }, [scene, isEditMode, shouldRenderFog, fog, lightSources]);

    if (!scene) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-fantasy-muted bg-fantasy-dark relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-5" />
                {isEditMode ? (
                    <p className="z-10 font-cinzel text-xl">Select or Create a Scene to begin</p>
                ) : (
                    <div className="z-10 text-center">
                        <p className="font-cinzel text-xl mb-2">No Scene Selected</p>
                        {scenes.length === 0 && <p className="text-sm opacity-60">Create a scene in the Editor first.</p>}
                    </div>
                )}
            </div>
        );
    }

    const handleDrop = (e: React.DragEvent) => {
        if (fogEditMode && isEditMode) return;
        e.preventDefault();
        const data = e.dataTransfer.getData('dungeon-asset');
        if (!data) return;

        try {
            const asset = JSON.parse(data);
            const rect = containerRef.current?.getBoundingClientRect();
            if (!rect) return;

            const halfToken = (TOKEN_SIZE_PCT / 100) * rect.width / 2;
            const pxX = e.clientX - rect.left - halfToken;
            const pxY = e.clientY - rect.top - halfToken;
            const x = (pxX / rect.width) * 100;
            const y = (pxY / rect.height) * 100;

            if (asset.type === 'map') {
                if (isEditMode) {
                    updateScene(scene.id, { backgroundAssetId: asset.id });
                }
            } else if (asset.type === 'audio') {
                if (isEditMode) {
                    updateScene(scene.id, { musicAssetId: asset.id, musicUrl: undefined, musicData: undefined });
                }
            } else {
                const newToken: SceneAsset = {
                    id: uuidv4(),
                    assetId: asset.id,
                    x,
                    y,
                    scale: 1,
                    shape: 'circle',
                    rotation: 0
                };

                updateScene(scene.id, { tokens: [...(scene.tokens || []), newToken] });
            }
        } catch (err) {
            console.error("Invalid drop data", err);
        }
    };

    const updateTokenPos = (tokenId: string, data: { x: number, y: number }) => {
        const rect = containerRef.current?.getBoundingClientRect();
        if (!scene.tokens || !rect) return;

        const xPct = (data.x / rect.width) * 100;
        const yPct = (data.y / rect.height) * 100;

        const newTokens = scene.tokens.map(t =>
            t.id === tokenId ? { ...t, x: xPct, y: yPct } : t
        );
        updateScene(scene.id, { tokens: newTokens });
    };

    const updateToken = (tokenId: string, data: Partial<SceneAsset>) => {
        if (!scene.tokens) return;
        const newTokens = scene.tokens.map(t =>
            t.id === tokenId ? { ...t, ...data } : t
        );
        updateScene(scene.id, { tokens: newTokens });
    };

    const deleteToken = (tokenId: string) => {
        if (!scene.tokens) return;
        const newTokens = scene.tokens.filter(t => t.id !== tokenId);
        updateScene(scene.id, { tokens: newTokens });
    };

    const bringToFront = (tokenId: string) => {
        setTopTokenId(tokenId);
    };

    const gridSize = scene.gridSize || 48;
    const gridColor = scene.gridColor || '#334155';

    const paintFogAtPoint = (clientX: number, clientY: number) => {
        if (!scene || !isEditMode || !fogEditMode) return;
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;
        const x = ((clientX - rect.left) / rect.width) * 100;
        const y = ((clientY - rect.top) / rect.height) * 100;
        const nextFog = applyFogBrush(fog, x, y, fog.brushSize, fogTool);
        updateScene(scene.id, { fogOfWar: { ...nextFog, enabled: true } });
    };

    return (
        <div
            className="flex-1 w-full relative overflow-hidden bg-fantasy-dark select-none"
            style={{ aspectRatio: '16 / 9' }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
        >
            <div ref={containerRef} className="absolute inset-0">
                {/* Background Layer */}
                {scene.backgroundAssetId && (
                    <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
                        <AssetImage
                            id={scene.backgroundAssetId}
                            className="w-full h-full object-contain"
                            draggable={false}
                        />
                    </div>
                )}

                {/* Grid Layer (Dynamic CSS) */}
                {scene.gridEnabled && (
                    <div
                        className="absolute inset-0 z-0 pointer-events-none transition-all duration-300"
                        style={{
                            opacity: 0.5,
                            backgroundImage: `linear-gradient(to right, ${gridColor} 2px, transparent 2px), linear-gradient(to bottom, ${gridColor} 2px, transparent 2px)`,
                            backgroundSize: `${gridSize}px ${gridSize}px`
                        }}
                    />
                )}

                {shouldRenderFog && (
                    <canvas
                        ref={fogCanvasRef}
                        className="absolute inset-0 z-[15]"
                        style={{ width: '100%', height: '100%', imageRendering: 'auto', pointerEvents: fogEditMode && isEditMode ? 'auto' : 'none' }}
                        onMouseDown={(e) => {
                            if (!fogEditMode || !isEditMode) return;
                            setIsPaintingFog(true);
                            paintFogAtPoint(e.clientX, e.clientY);
                        }}
                        onMouseMove={(e) => {
                            if (!isPaintingFog || !fogEditMode || !isEditMode) return;
                            paintFogAtPoint(e.clientX, e.clientY);
                        }}
                        onMouseUp={() => setIsPaintingFog(false)}
                        onMouseLeave={() => setIsPaintingFog(false)}
                    />
                )}

                {/* Token Layer */}
                <div className="absolute inset-0 z-10 w-full h-full">
                    {scene.tokens?.map(token => (
                        <DraggableToken
                            key={token.id}
                            token={token}
                            containerRef={containerRef}
                            updateTokenPos={updateTokenPos}
                            updateToken={updateToken}
                            onDelete={() => deleteToken(token.id)}
                            disabled={shouldDisableTokenInteractions(isEditMode, fogEditMode)}
                            isOnTop={topTokenId === token.id}
                            onBringToFront={() => bringToFront(token.id)}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}
