import { useMemo, useState } from 'react';
import { ArrowLeft, Upload } from 'lucide-react';
import { useAssets } from '@/hooks/useAssets';
import { Button } from '@/components/ui/Button';
import { GlassPanel } from '@/components/ui/GlassPanel';
import type { Asset, AssetRole, AssetType, TokenRole } from '@/types';
import { canConfigureTokenLightRadius } from '@/lib/assetConfig';

interface ConfigAssetsViewProps {
    onNavigate: (view: 'HOME') => void;
}

const TABS: AssetType[] = ['map', 'token', 'asset', 'audio'];

export const ConfigAssetsView = ({ onNavigate }: ConfigAssetsViewProps) => {
    const [tab, setTab] = useState<AssetType>('map');
    const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
    const { assets, addAsset, updateAsset } = useAssets(tab);
    const selectedAsset = useMemo<Asset | null>(() => {
        if (!selectedAssetId) return null;
        return assets.find(asset => asset.id === selectedAssetId) ?? null;
    }, [assets, selectedAssetId]);
    const tokenRole = (selectedAsset?.tokenRole ?? 'enemy') as TokenRole;
    const assetRole = (selectedAsset?.assetRole ?? 'common') as AssetRole;
    const canUseLightRadius = canConfigureTokenLightRadius(tokenRole);

    return (
        <div className="h-screen w-screen overflow-hidden bg-fantasy-bg p-6">
            <div className="h-full grid grid-cols-12 gap-4">
                <GlassPanel className="col-span-4 h-full p-4 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <Button variant="secondary" onClick={() => onNavigate('HOME')}>
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back
                        </Button>
                        <h2 className="font-cinzel text-fantasy-gold text-xl">Config Assets</h2>
                    </div>
                    <div className="flex gap-2 mb-4">
                        {TABS.map(item => (
                            <Button
                                key={item}
                                variant={tab === item ? 'primary' : 'secondary'}
                                size="sm"
                                onClick={() => {
                                    setTab(item);
                                    setSelectedAssetId(null);
                                }}
                            >
                                {item}
                            </Button>
                        ))}
                    </div>
                    <label className="mb-4 border-2 border-dashed border-fantasy-muted/30 rounded-lg p-4 cursor-pointer hover:border-fantasy-accent/50">
                        <div className="flex items-center justify-center gap-2 text-fantasy-muted">
                            <Upload className="w-4 h-4" />
                            Upload
                        </div>
                        <input
                            type="file"
                            className="hidden"
                            accept={tab === 'audio' ? 'audio/*' : 'image/*'}
                            onChange={(event) => {
                                if (!event.target.files?.[0]) return;
                                addAsset(event.target.files[0], tab);
                                event.target.value = '';
                            }}
                        />
                    </label>
                    <div className="overflow-y-auto space-y-2">
                        {assets.map(asset => (
                            <button
                                key={asset.id}
                                className={`w-full text-left p-2 rounded-lg border ${selectedAssetId === asset.id ? 'border-fantasy-gold bg-fantasy-accent/10' : 'border-white/10 bg-black/20'}`}
                                onClick={() => setSelectedAssetId(asset.id)}
                            >
                                <p className="text-sm text-fantasy-text truncate">{asset.name}</p>
                                <p className="text-xs text-fantasy-muted">{asset.type}</p>
                            </button>
                        ))}
                    </div>
                </GlassPanel>
                <GlassPanel className="col-span-8 h-full p-6 overflow-y-auto">
                    {!selectedAsset && (
                        <div className="h-full flex items-center justify-center text-fantasy-muted">
                            Select an asset to configure
                        </div>
                    )}
                    {selectedAsset && (
                        <div className="space-y-4">
                            <h3 className="font-cinzel text-2xl text-fantasy-gold">{selectedAsset.name}</h3>
                            {selectedAsset.type === 'token' && (
                                <div className="space-y-4">
                                    <label className="block text-sm text-fantasy-muted">
                                        Token Type
                                        <select
                                            className="w-full mt-1 bg-black/30 border border-white/10 rounded-lg p-2"
                                            value={tokenRole}
                                            onChange={(event) => {
                                                updateAsset(selectedAsset.id, { tokenRole: event.target.value as TokenRole });
                                            }}
                                        >
                                            <option value="enemy">Enemy</option>
                                            <option value="player">Player</option>
                                            <option value="npc">NPC</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </label>
                                    {(tokenRole === 'player') && (
                                        <>
                                            <label className="block text-sm text-fantasy-muted">
                                                Name
                                                <input
                                                    className="w-full mt-1 bg-black/30 border border-white/10 rounded-lg p-2"
                                                    value={selectedAsset.playerConfig?.name ?? ''}
                                                    onChange={(event) => {
                                                        updateAsset(selectedAsset.id, {
                                                            playerConfig: {
                                                                name: event.target.value,
                                                                className: selectedAsset.playerConfig?.className ?? '',
                                                                level: selectedAsset.playerConfig?.level ?? 1
                                                            }
                                                        });
                                                    }}
                                                />
                                            </label>
                                            <label className="block text-sm text-fantasy-muted">
                                                Class
                                                <input
                                                    className="w-full mt-1 bg-black/30 border border-white/10 rounded-lg p-2"
                                                    value={selectedAsset.playerConfig?.className ?? ''}
                                                    onChange={(event) => {
                                                        updateAsset(selectedAsset.id, {
                                                            playerConfig: {
                                                                name: selectedAsset.playerConfig?.name ?? '',
                                                                className: event.target.value,
                                                                level: selectedAsset.playerConfig?.level ?? 1
                                                            }
                                                        });
                                                    }}
                                                />
                                            </label>
                                            <label className="block text-sm text-fantasy-muted">
                                                Level
                                                <input
                                                    type="number"
                                                    min={1}
                                                    max={20}
                                                    className="w-full mt-1 bg-black/30 border border-white/10 rounded-lg p-2"
                                                    value={selectedAsset.playerConfig?.level ?? 1}
                                                    onChange={(event) => {
                                                        updateAsset(selectedAsset.id, {
                                                            playerConfig: {
                                                                name: selectedAsset.playerConfig?.name ?? '',
                                                                className: selectedAsset.playerConfig?.className ?? '',
                                                                level: Number(event.target.value)
                                                            }
                                                        });
                                                    }}
                                                />
                                            </label>
                                        </>
                                    )}
                                    {canUseLightRadius && (
                                        <label className="block text-sm text-fantasy-muted">
                                            Light Radius (% map)
                                            <input
                                                type="number"
                                                min={0}
                                                max={40}
                                                className="w-full mt-1 bg-black/30 border border-white/10 rounded-lg p-2"
                                                value={selectedAsset.lightRadius ?? 0}
                                                onChange={(event) => {
                                                    updateAsset(selectedAsset.id, { lightRadius: Number(event.target.value) });
                                                }}
                                            />
                                        </label>
                                    )}
                                </div>
                            )}
                            {selectedAsset.type === 'asset' && (
                                <div className="space-y-4">
                                    <label className="block text-sm text-fantasy-muted">
                                        Asset Type
                                        <select
                                            className="w-full mt-1 bg-black/30 border border-white/10 rounded-lg p-2"
                                            value={assetRole}
                                            onChange={(event) => {
                                                updateAsset(selectedAsset.id, { assetRole: event.target.value as AssetRole });
                                            }}
                                        >
                                            <option value="common">Common</option>
                                            <option value="light_source">Light source</option>
                                        </select>
                                    </label>
                                    {assetRole === 'light_source' && (
                                        <label className="block text-sm text-fantasy-muted">
                                            Light Radius (% map)
                                            <input
                                                type="number"
                                                min={0}
                                                max={40}
                                                className="w-full mt-1 bg-black/30 border border-white/10 rounded-lg p-2"
                                                value={selectedAsset.lightRadius ?? 10}
                                                onChange={(event) => {
                                                    updateAsset(selectedAsset.id, { lightRadius: Number(event.target.value) });
                                                }}
                                            />
                                        </label>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </GlassPanel>
            </div>
        </div>
    );
};
