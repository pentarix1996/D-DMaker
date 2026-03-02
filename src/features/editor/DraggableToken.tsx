import { useRef, useState, useEffect, type RefObject } from 'react';
import Draggable, { type DraggableData, type DraggableEvent } from 'react-draggable';
import { AssetImage } from '@/components/AssetImage';
import type { SceneAsset } from '@/types';
import { X, Square, Circle as CircleIcon, Minus, Plus } from 'lucide-react';

export const TOKEN_SIZE_PCT = 6;

interface DraggableTokenProps {
    token: SceneAsset;
    containerRef: RefObject<HTMLDivElement | null>;
    updateTokenPos: (id: string, data: { x: number, y: number }) => void;
    updateToken: (id: string, data: Partial<SceneAsset>) => void;
    onDelete?: () => void;
    disabled?: boolean;
    isOnTop?: boolean;
    onBringToFront?: () => void;
}

export const DraggableToken = ({ token, containerRef, updateTokenPos, updateToken, onDelete, disabled, isOnTop, onBringToFront }: DraggableTokenProps) => {
    const nodeRef = useRef<HTMLDivElement>(null);
    const [showSettings, setShowSettings] = useState(false);
    const hideTimeout = useRef<ReturnType<typeof setTimeout>>(null);
    const [containerSize, setContainerSize] = useState({ width: 1, height: 1 });

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const updateSize = () => {
            const rect = el.getBoundingClientRect();
            setContainerSize({ width: rect.width, height: rect.height });
        };

        updateSize();

        const observer = new ResizeObserver(updateSize);
        observer.observe(el);

        return () => observer.disconnect();
    }, [containerRef]);

    const handleMouseEnter = () => {
        if (disabled) return;
        if (hideTimeout.current) clearTimeout(hideTimeout.current);
        setShowSettings(true);
    };

    const handleMouseLeave = () => {
        hideTimeout.current = setTimeout(() => {
            setShowSettings(false);
        }, 300);
    };

    const scale = token.scale || 1;
    const shape = token.shape || 'circle';
    const tokenSizePx = (TOKEN_SIZE_PCT / 100) * containerSize.width;

    const handleScale = (delta: number) => {
        const newScale = Math.max(0.5, Math.min(3, scale + delta));
        updateToken(token.id, { scale: newScale });
    };

    const toggleShape = () => {
        updateToken(token.id, { shape: shape === 'circle' ? 'square' : 'circle' });
    };

    const pixelX = (token.x / 100) * containerSize.width;
    const pixelY = (token.y / 100) * containerSize.height;

    return (
        <Draggable
            nodeRef={nodeRef}
            position={{ x: pixelX, y: pixelY }}
            onStart={() => onBringToFront?.()}
            onStop={(_: DraggableEvent, data: DraggableData) => updateTokenPos(token.id, data)}
            bounds="parent"
            disabled={disabled}
        >
            <div
                ref={nodeRef}
                className={`absolute group select-none ${disabled ? '' : 'cursor-move'}`}
                style={{ width: tokenSizePx, height: tokenSizePx, zIndex: isOnTop ? 30 : 20 }}
                onMouseDown={() => onBringToFront?.()}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                {/* Visual Representation */}
                <div
                    className={`w-full h-full transition-all duration-300 overflow-hidden relative ${shape === 'circle' ? 'rounded-full' : 'rounded-md'} ${disabled ? '' : 'shadow-xl group-hover:ring-2 group-hover:ring-fantasy-gold/60 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] group-active:scale-95 group-active:shadow-2xl'}`}
                    style={{ transform: `scale(${scale})` }}
                >
                    <AssetImage
                        id={token.assetId}
                        className="w-full h-full object-contain pointer-events-none"
                        draggable={false}
                    />
                </div>

                {/* Controls Overlay */}
                {!disabled && showSettings && (
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/80 backdrop-blur-md rounded-lg p-1 border border-white/10 shadow-xl z-50 animate-in fade-in slide-in-from-bottom-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); handleScale(-0.1); }}
                            className="p-1 hover:bg-white/20 rounded text-white"
                            title="Shrink"
                        >
                            <Minus className="w-3 h-3" />
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); handleScale(0.1); }}
                            className="p-1 hover:bg-white/20 rounded text-white"
                            title="Grow"
                        >
                            <Plus className="w-3 h-3" />
                        </button>

                        <div className="w-px h-3 bg-white/20 mx-0.5" />

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
