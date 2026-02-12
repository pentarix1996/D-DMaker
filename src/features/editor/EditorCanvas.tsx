import React, { useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { AssetImage } from '@/components/AssetImage';
import { DraggableToken } from '@/features/editor/DraggableToken';
import { v4 as uuidv4 } from 'uuid';
import type { SceneAsset } from '@/types';

export const EditorCanvas = () => {
    const { getCurrentScene, updateScene, isEditMode, scenes } = useGameStore();
    const scene = getCurrentScene();
    const containerRef = useRef<HTMLDivElement>(null);

    // Placeholder Logic: Show different messages for Editor vs Player
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
        // Allow drops in Play Mode if it is a token
        e.preventDefault();
        const data = e.dataTransfer.getData('dungeon-asset');
        if (!data) return;

        try {
            const asset = JSON.parse(data);
            const rect = containerRef.current?.getBoundingClientRect();
            if (!rect) return;

            // Calculate position relative to container
            const x = e.clientX - rect.left - 32; // Center offset
            const y = e.clientY - rect.top - 32;

            if (asset.type === 'map') {
                // Maps only allowed in Edit Mode
                if (isEditMode) {
                    updateScene(scene.id, { backgroundAssetId: asset.id });
                }
            } else if (asset.type === 'audio') {
                // Audio only allowed in Edit Mode (or maybe Play too? User only asked for Tokens)
                if (isEditMode) {
                    updateScene(scene.id, { musicUrl: asset.imageUrl, musicData: asset.fileData });
                    alert(`Music set: ${asset.name}`);
                }
            } else {
                // Tokens are added to the stage (Allowed in Play Mode)
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
        // Allow moving tokens in Play Mode
        const { x, y } = data;
        if (!scene.tokens) return;

        const newTokens = scene.tokens.map(t =>
            t.id === tokenId ? { ...t, x, y } : t
        );
        updateScene(scene.id, { tokens: newTokens });
    };

    const updateToken = (tokenId: string, data: Partial<SceneAsset>) => {
        // Update token properties (scale, shape, etc)
        if (!scene.tokens) return;
        const newTokens = scene.tokens.map(t =>
            t.id === tokenId ? { ...t, ...data } : t
        );
        updateScene(scene.id, { tokens: newTokens });
    };

    const deleteToken = (tokenId: string) => {
        if (!isEditMode || !scene.tokens) return;
        const newTokens = scene.tokens.filter(t => t.id !== tokenId);
        updateScene(scene.id, { tokens: newTokens });
    };

    const gridSize = scene.gridSize || 48; // Default 48px
    const gridColor = scene.gridColor || '#334155';

    return (
        <div
            ref={containerRef}
            className="flex-1 w-full h-full relative overflow-hidden bg-fantasy-dark select-none"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
        >
            {/* Background Layer */}
            {scene.backgroundAssetId && (
                <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
                    <AssetImage
                        id={scene.backgroundAssetId}
                        className="w-full h-full object-contain opacity-60 blur-[1px]"
                        draggable={false}
                    />
                </div>
            )}

            {/* Grid Layer (Dynamic CSS) */}
            {scene.gridEnabled && (
                <div
                    className="absolute inset-0 z-0 pointer-events-none transition-all duration-300"
                    style={{
                        opacity: 0.5, // Much more visible
                        backgroundImage: `linear-gradient(to right, ${gridColor} 2px, transparent 2px), linear-gradient(to bottom, ${gridColor} 2px, transparent 2px)`,
                        backgroundSize: `${gridSize}px ${gridSize}px`
                    }}
                />
            )}

            {/* Token Layer */}
            <div className="absolute inset-0 z-10 w-full h-full">
                {scene.tokens?.map(token => (
                    <DraggableToken
                        key={token.id}
                        token={token}
                        updateTokenPos={updateTokenPos}
                        updateToken={updateToken}
                        onDelete={isEditMode ? () => deleteToken(token.id) : undefined}
                    />
                ))}
            </div>
        </div>
    )
}
