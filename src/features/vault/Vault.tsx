import React, { useMemo, useState } from 'react';
import { useAssets } from '@/hooks/useAssets';
import { useVaultFolders } from '@/hooks/useVaultFolders';
import { Button } from '@/components/ui/Button';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Upload, Map as MapIcon, Sword, Trash2, Music, X, Package, Folder, FolderPlus, ArrowUp, Pencil, Play } from 'lucide-react';
import type { Asset, AssetType } from '@/types';

interface VaultProps {
    allowedTypes?: ('map' | 'token' | 'asset' | 'audio')[];
    onClose?: () => void;
}

export const Vault = ({ allowedTypes = ['map', 'token'], className, onClose }: VaultProps & { className?: string }) => {
    const [tab, setTab] = useState<'map' | 'token' | 'audio'>((allowedTypes[0] as 'map' | 'token' | 'audio') || 'map');
    const [tokenSection, setTokenSection] = useState<'token' | 'asset'>('token');
    const [mapPath, setMapPath] = useState('');
    const [tokenPath, setTokenPath] = useState('');
    const [assetPath, setAssetPath] = useState('');
    const [draggedAssetId, setDraggedAssetId] = useState<string | null>(null);
    const activeAssetType: AssetType = tab === 'token' ? tokenSection : tab;
    const currentPath = activeAssetType === 'map' ? mapPath : activeAssetType === 'token' ? tokenPath : activeAssetType === 'asset' ? assetPath : '';
    const { assets, addAsset, deleteAsset, updateAsset } = useAssets(activeAssetType as AssetType, activeAssetType === 'audio' ? undefined : currentPath);
    const { folders: mapFolders, addFolder: addMapFolder, renameFolder: renameMapFolder, deleteFolder: deleteMapFolder } = useVaultFolders('map');
    const { folders: tokenFolders, addFolder: addTokenFolder, renameFolder: renameTokenFolder, deleteFolder: deleteTokenFolder } = useVaultFolders('token');
    const { folders: assetFolders, addFolder: addAssetFolder, renameFolder: renameAssetFolder, deleteFolder: deleteAssetFolder } = useVaultFolders('asset');

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>, uploadType?: AssetType) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            const MAX_SIZE = 150 * 1024 * 1024; // 150MB
            if (file.size > MAX_SIZE) {
                alert('El archivo es demasiado grande. Máximo 150MB.');
                return;
            }
            const type = (uploadType || activeAssetType) as AssetType;
            const folderPath = type === 'audio'
                ? ''
                : type === 'map'
                    ? mapPath
                    : type === 'token'
                        ? tokenPath
                        : assetPath;
            addAsset(file, type, folderPath);
        }
    };

    const onDragStart = (e: React.DragEvent, asset: Asset) => {
        e.dataTransfer.setData('dungeon-asset', JSON.stringify(asset));
        e.dataTransfer.effectAllowed = 'copy';
        setDraggedAssetId(asset.id);
    };

    const folders = useMemo(() => {
        if (activeAssetType === 'map') return mapFolders;
        if (activeAssetType === 'token') return tokenFolders;
        if (activeAssetType === 'asset') return assetFolders;
        return [];
    }, [activeAssetType, mapFolders, tokenFolders, assetFolders]);

    const currentFolders = folders.filter((folder) => folder.parentPath === currentPath).sort((a, b) => a.name.localeCompare(b.name));
    const sortedAssets = [...assets].sort((a, b) => a.name.localeCompare(b.name));
    const pathParts = currentPath ? currentPath.split('/') : [];

    const setCurrentPath = (nextPath: string) => {
        if (activeAssetType === 'map') setMapPath(nextPath);
        if (activeAssetType === 'token') setTokenPath(nextPath);
        if (activeAssetType === 'asset') setAssetPath(nextPath);
    };

    const goToParent = () => {
        if (!currentPath) return;
        const parent = currentPath.includes('/') ? currentPath.split('/').slice(0, -1).join('/') : '';
        setCurrentPath(parent);
    };

    const createFolder = async () => {
        if (activeAssetType === 'audio') return;
        const name = window.prompt('Nombre de carpeta:');
        if (!name) return;
        if (activeAssetType === 'map') await addMapFolder(name, mapPath);
        if (activeAssetType === 'token') await addTokenFolder(name, tokenPath);
        if (activeAssetType === 'asset') await addAssetFolder(name, assetPath);
    };

    const renameFolder = async (folderId: string, currentName: string) => {
        if (activeAssetType === 'audio') return;
        const nextName = window.prompt('Nuevo nombre de carpeta:', currentName);
        if (!nextName) return;
        if (activeAssetType === 'map') await renameMapFolder(folderId, nextName);
        if (activeAssetType === 'token') await renameTokenFolder(folderId, nextName);
        if (activeAssetType === 'asset') await renameAssetFolder(folderId, nextName);
    };

    const deleteFolder = async (folderId: string) => {
        if (!confirm('Eliminar carpeta y subcarpetas? Los assets se moveran a raiz.')) return;
        if (activeAssetType === 'map') await deleteMapFolder(folderId);
        if (activeAssetType === 'token') await deleteTokenFolder(folderId);
        if (activeAssetType === 'asset') await deleteAssetFolder(folderId);
    };

    const moveAssetToCurrentPath = async (asset: Asset) => {
        await updateAsset(asset.id, { folderPath: currentPath });
    };

    const moveAssetToPath = async (targetPath: string, fallbackAsset?: Asset) => {
        const targetId = draggedAssetId ?? fallbackAsset?.id ?? null;
        if (!targetId) return;
        await updateAsset(targetId, { folderPath: targetPath });
        setDraggedAssetId(null);
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
                    {(allowedTypes.includes('token') || allowedTypes.includes('asset')) && (
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

            <div className="flex-1 overflow-y-auto p-4 space-y-4 content-start">
                {tab === 'token' && allowedTypes.includes('asset') && (
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            variant={tokenSection === 'token' ? 'primary' : 'secondary'}
                            className="flex-1"
                            onClick={() => setTokenSection('token')}
                        >
                            <Sword className="w-4 h-4 mr-1" /> Tokens
                        </Button>
                        <Button
                            size="sm"
                            variant={tokenSection === 'asset' ? 'primary' : 'secondary'}
                            className="flex-1"
                            onClick={() => setTokenSection('asset')}
                        >
                            <Package className="w-4 h-4 mr-1" /> Assets
                        </Button>
                    </div>
                )}
                {activeAssetType !== 'audio' && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                            <div className="text-xs text-fantasy-muted truncate">
                                <button
                                    className="hover:text-fantasy-gold"
                                    onClick={() => setCurrentPath('')}
                                    onDragOver={(event) => event.preventDefault()}
                                    onDrop={(event) => {
                                        event.preventDefault();
                                        void moveAssetToPath('');
                                    }}
                                >
                                    Raiz
                                </button>
                                {pathParts.map((part, index) => {
                                    const path = pathParts.slice(0, index + 1).join('/');
                                    return (
                                        <span key={path}>
                                            {' / '}
                                            <button
                                                className="hover:text-fantasy-gold"
                                                onClick={() => setCurrentPath(path)}
                                                onDragOver={(event) => event.preventDefault()}
                                                onDrop={(event) => {
                                                    event.preventDefault();
                                                    void moveAssetToPath(path);
                                                }}
                                            >
                                                {part}
                                            </button>
                                        </span>
                                    );
                                })}
                            </div>
                            <div className="flex gap-1">
                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={goToParent} disabled={!currentPath}>
                                    <ArrowUp className="w-4 h-4" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={createFolder}>
                                    <FolderPlus className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
                <div className="grid grid-cols-2 gap-3">
                    <label className="aspect-square border-2 border-dashed border-fantasy-muted/20 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-fantasy-accent/50 hover:bg-fantasy-accent/5 transition-colors group">
                        <Upload className="w-6 h-6 text-fantasy-muted group-hover:text-fantasy-accent mb-2" />
                        <span className="text-xs text-fantasy-muted text-center px-1">Upload {activeAssetType === 'map' ? 'BG' : activeAssetType === 'audio' ? 'Track' : activeAssetType === 'token' ? 'Token' : 'Asset'}</span>
                        <input type="file" className="hidden" accept={activeAssetType === 'audio' ? "audio/*" : activeAssetType === 'map' ? "image/*,video/mp4,video/webm" : "image/*"} onChange={handleUpload} />
                    </label>
                    {activeAssetType !== 'audio' && currentFolders.map((folder) => (
                        <div
                            key={folder.id}
                            className="group relative aspect-square bg-black/40 rounded-lg overflow-hidden border border-white/5 hover:border-fantasy-gold/50 cursor-pointer flex flex-col items-center justify-center p-2"
                            onClick={() => setCurrentPath(folder.path)}
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={(event) => {
                                event.preventDefault();
                                void moveAssetToPath(folder.path);
                            }}
                        >
                            <Folder className="w-8 h-8 text-fantasy-gold/90 mb-1" />
                            <span className="text-xs text-center text-fantasy-text truncate w-full">{folder.name}</span>
                            <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        void renameFolder(folder.id, folder.name);
                                    }}
                                    className="p-1 bg-black/40 rounded hover:bg-black/70 text-fantasy-muted"
                                >
                                    <Pencil className="w-3 h-3" />
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        void deleteFolder(folder.id);
                                    }}
                                    className="p-1 bg-red-500/20 rounded hover:bg-red-500/50 text-red-200"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {sortedAssets.map((asset) => {
                        const videoUrl = asset.fileData.type.startsWith('video/') ? URL.createObjectURL(asset.fileData) : null;
                        return (
                            <div
                                key={asset.id}
                                className="group relative aspect-square bg-black/40 rounded-lg overflow-hidden border border-white/5 hover:border-fantasy-gold/50 cursor-grab flex items-center justify-center"
                                draggable
                                onDragStart={(e) => onDragStart(e, asset)}
                                onDragEnd={() => setDraggedAssetId(null)}
                            >
                                {asset.type === 'audio' ? (
                                    <div className="flex flex-col items-center justify-center text-fantasy-muted p-2 text-center">
                                        <Music className="w-8 h-8 mb-2 opacity-50" />
                                        <span className="text-xs line-clamp-2">{asset.name}</span>
                                    </div>
                                ) : (
                                    <>
                                        {asset.fileData.type.startsWith('video/') ? (
                                            <video src={videoUrl ?? undefined} className="w-full h-full object-cover" muted />
                                        ) : (
                                            <img src={asset.imageUrl} alt={asset.name} className="w-full h-full object-cover" />
                                        )}
                                        {asset.fileData.type.startsWith('video/') && (
                                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                <Play className="w-10 h-10 text-white/70" fill="rgba(255,255,255,0.3)" />
                                            </div>
                                        )}
                                    </>
                                )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                                {asset.type !== 'audio' && <span className="text-xs truncate text-white">{asset.name}</span>}
                                <div className="absolute top-1 left-1">
                                    {activeAssetType !== 'audio' && (asset.folderPath ?? '') !== currentPath && (
                                        <button
                                            onClick={() => { void moveAssetToCurrentPath(asset); }}
                                            className="p-1 bg-black/40 rounded hover:bg-black/70 text-fantasy-muted"
                                        >
                                            <Folder className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                                <button
                                    onClick={() => deleteAsset(asset.id)}
                                    className="absolute top-1 right-1 p-1 bg-red-500/20 rounded hover:bg-red-500/50 text-red-200"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </GlassPanel>
    );
};
