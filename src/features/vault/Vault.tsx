import React, { useState } from 'react';
import { useAssets } from '@/hooks/useAssets';
import { Button } from '@/components/ui/Button';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Upload, Map as MapIcon, Sword, Trash2, Music, X } from 'lucide-react';
import type { Asset } from '@/types';

interface VaultProps {
    allowedTypes?: ('map' | 'token' | 'audio')[];
    onClose?: () => void;
}

export const Vault = ({ allowedTypes = ['map', 'token'], className, onClose }: VaultProps & { className?: string }) => {
    const [tab, setTab] = useState<'map' | 'token' | 'audio'>((allowedTypes[0] as any) || 'map');
    const { assets, addAsset, deleteAsset } = useAssets(tab);

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            addAsset(e.target.files[0], tab);
        }
    };

    const onDragStart = (e: React.DragEvent, asset: Asset) => {
        e.dataTransfer.setData('dungeon-asset', JSON.stringify(asset));
        e.dataTransfer.effectAllowed = 'copy';
    };

    return (
        <GlassPanel className={className || "h-full w-80 flex flex-col border-r border-t-0 border-b-0 rounded-none fixed left-0 top-0 z-20 backdrop-blur-xl bg-fantasy-dark/90"}>
            <div className="p-4 border-b border-white/5 space-y-4">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-cinzel text-fantasy-gold">Vault</h2>
                    {onClose && (
                        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 hover:bg-white/10">
                            <X className="w-5 h-5 text-fantasy-muted" />
                        </Button>
                    )}
                </div>
                <div className="flex gap-2">
                    {allowedTypes.includes('map') && (
                        <Button
                            variant={tab === 'map' ? 'primary' : 'ghost'}
                            size="sm"
                            className="flex-1"
                            onClick={() => setTab('map')}
                        >
                            <MapIcon className="w-4 h-4 mr-2" /> Maps
                        </Button>
                    )}
                    {allowedTypes.includes('token') && (
                        <Button
                            variant={tab === 'token' ? 'primary' : 'ghost'}
                            size="sm"
                            className="flex-1"
                            onClick={() => setTab('token')}
                        >
                            <Sword className="w-4 h-4 mr-2" /> Tokens
                        </Button>
                    )}
                    {allowedTypes.includes('audio') && (
                        <Button
                            variant={tab === 'audio' ? 'primary' : 'ghost'}
                            size="sm"
                            className="flex-1"
                            onClick={() => setTab('audio')}
                        >
                            <Music className="w-4 h-4 mr-2" /> Tracks
                        </Button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3 content-start">
                <label className="aspect-square border-2 border-dashed border-fantasy-muted/20 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-fantasy-accent/50 hover:bg-fantasy-accent/5 transition-colors group">
                    <Upload className="w-6 h-6 text-fantasy-muted group-hover:text-fantasy-accent mb-2" />
                    <span className="text-xs text-fantasy-muted text-center px-1">Upload {tab === 'map' ? 'BG' : tab === 'token' ? 'Token' : 'Track'}</span>
                    <input type="file" className="hidden" accept={tab === 'audio' ? "audio/*" : "image/*"} onChange={handleUpload} />
                </label>

                {assets.map((asset) => (
                    <div
                        key={asset.id}
                        className="group relative aspect-square bg-black/40 rounded-lg overflow-hidden border border-white/5 hover:border-fantasy-gold/50 cursor-grab flex items-center justify-center"
                        draggable
                        onDragStart={(e) => onDragStart(e, asset)}
                    >
                        {asset.type === 'audio' ? (
                            <div className="flex flex-col items-center justify-center text-fantasy-muted p-2 text-center">
                                <Music className="w-8 h-8 mb-2 opacity-50" />
                                <span className="text-xs line-clamp-2">{asset.name}</span>
                            </div>
                        ) : (
                            <img src={asset.imageUrl} alt={asset.name} className="w-full h-full object-cover" />
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                            {asset.type !== 'audio' && <span className="text-xs truncate text-white">{asset.name}</span>}
                            <button
                                onClick={() => deleteAsset(asset.id)}
                                className="absolute top-1 right-1 p-1 bg-red-500/20 rounded hover:bg-red-500/50 text-red-200"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </GlassPanel>
    );
};
