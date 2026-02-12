import { useRef, useState } from 'react';
import Draggable, { type DraggableData, type DraggableEvent } from 'react-draggable';
import { AssetImage } from '@/components/AssetImage';
import type { SceneAsset } from '@/types';
import { X, Square, Circle as CircleIcon, Minus, Plus } from 'lucide-react';

interface DraggableTokenProps {
    token: SceneAsset;
    updateTokenPos: (id: string, data: { x: number, y: number }) => void;
    updateToken: (id: string, data: Partial<SceneAsset>) => void;
    onDelete?: () => void;
    disabled?: boolean;
}

export const DraggableToken = ({ token, updateTokenPos, updateToken, onDelete, disabled }: DraggableTokenProps) => {
    const nodeRef = useRef<HTMLDivElement>(null);
    const [showSettings, setShowSettings] = useState(false);
    const hideTimeout = useRef<ReturnType<typeof setTimeout>>(null);

    const handleMouseEnter = () => {
        if (disabled) return;
        if (hideTimeout.current) clearTimeout(hideTimeout.current);
        setShowSettings(true);
    };

    const handleMouseLeave = () => {
        hideTimeout.current = setTimeout(() => {
            setShowSettings(false);
        }, 300); // 300ms delay
    };

    // Default values if missing
    const scale = token.scale || 1;
    const shape = token.shape || 'circle';

    const handleScale = (delta: number) => {
        const newScale = Math.max(0.5, Math.min(3, scale + delta));
        updateToken(token.id, { scale: newScale });
    };

    const toggleShape = () => {
        updateToken(token.id, { shape: shape === 'circle' ? 'square' : 'circle' });
    };

    return (
        <Draggable
            nodeRef={nodeRef}
            position={{ x: token.x, y: token.y }}
            onStop={(_: DraggableEvent, data: DraggableData) => updateTokenPos(token.id, data)}
            bounds="parent"
            disabled={disabled}
        >
            <div
                ref={nodeRef}
                className={`absolute w-16 h-16 group select-none z-20 ${disabled ? '' : 'cursor-move'}`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {/* Visual Representation */}
                <div
                    className={`w-full h-full transition-all shadow-xl overflow-hidden relative bg-black ${shape === 'circle' ? 'rounded-full' : 'rounded-md'} ${disabled ? '' : 'group-hover:ring-2 group-hover:ring-fantasy-accent/60'}`}
                    style={{ transform: `scale(${scale})` }}
                >
                    <AssetImage
                        id={token.assetId}
                        className="w-full h-full object-cover pointer-events-none"
                        draggable={false}
                    />
                </div>

                {/* Controls Overlay */}
                {!disabled && showSettings && (
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/80 backdrop-blur-md rounded-lg p-1 border border-white/10 shadow-xl z-50 animate-in fade-in slide-in-from-bottom-2">
                        {/* Scale Down */}
                        <button
                            onClick={(e) => { e.stopPropagation(); handleScale(-0.1); }}
                            className="p-1 hover:bg-white/20 rounded text-white"
                            title="Shrink"
                        >
                            <Minus className="w-3 h-3" />
                        </button>

                        {/* Scale Up */}
                        <button
                            onClick={(e) => { e.stopPropagation(); handleScale(0.1); }}
                            className="p-1 hover:bg-white/20 rounded text-white"
                            title="Grow"
                        >
                            <Plus className="w-3 h-3" />
                        </button>

                        <div className="w-px h-3 bg-white/20 mx-0.5" />

                        {/* Shape Toggle */}
                        <button
                            onClick={(e) => { e.stopPropagation(); toggleShape(); }}
                            className="p-1 hover:bg-white/20 rounded text-white"
                            title="Toggle Shape"
                        >
                            {shape === 'circle' ? <Square className="w-3 h-3" /> : <CircleIcon className="w-3 h-3" />}
                        </button>

                        {onDelete && (
                            <>
                                <div className="w-px h-3 bg-white/20 mx-0.5" />
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (confirm('Delete token?')) onDelete();
                                    }}
                                    className="p-1 hover:bg-red-500/80 rounded text-red-300 hover:text-white"
                                    title="Delete Token"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
        </Draggable>
    );
};
