import React from 'react';
import JSZip from 'jszip';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db';
import { Button } from '@/components/ui/Button';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Play, Plus, Trash2, Upload, Download, Edit2, Settings } from 'lucide-react';
import type { Asset, Story } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { useGameStore } from '@/store/gameStore';
import { resolveAssetRole, resolveLightRadius, resolveMapKind, resolveShopCatalog, resolveTokenRole } from '@/lib/assetConfig';

interface HomeProps {
    onNavigate: (view: 'EDITOR' | 'PLAYER' | 'CONFIG_ASSETS') => void;
}

export const Home = ({ onNavigate }: HomeProps) => {
    const stories = useLiveQuery(() => db.stories.toArray());
    const { loadStory } = useGameStore();

    const handleCreateStory = async () => {
        const name = window.prompt("Enter story name:", "New Chronicle");
        if (!name) return; // Cancelled

        const newStory: Story = {
            id: uuidv4(),
            name: name,
            createdAt: new Date().toISOString(),
            lastPlayed: new Date().toISOString(),
            theme: 'fantasy',
            scenes: []
        };
        await db.stories.add(newStory);
    };

    const importStory = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const zip = await JSZip.loadAsync(file);

            // Read story data
            const storyFile = zip.file("story.json");
            if (!storyFile) throw new Error("Invalid format: missing story.json");
            const storyText = await storyFile.async("text");
            const { story, scenes } = JSON.parse(storyText);

            // Read asset metadata
            const assetsFile = zip.file("assets.json");
            const newAssets: Asset[] = [];

            if (assetsFile) {
                const assetsText = await assetsFile.async("text");
                const assetMetadata = JSON.parse(assetsText);

                // Read each asset file
                for (const meta of assetMetadata) {
                    const assetDataFile = zip.file(`assets/${meta.id}`);
                    if (assetDataFile) {
                        const blob = await assetDataFile.async("blob");
                        const imageUrl = URL.createObjectURL(blob);

                        newAssets.push({
                            id: meta.id,
                            name: meta.name,
                            type: meta.type,
                            fileData: blob,
                            imageUrl: imageUrl,
                            tokenRole: resolveTokenRole(meta.tokenRole, meta.type),
                            assetRole: resolveAssetRole(meta.assetRole, meta.type),
                            lightRadius: resolveLightRadius(meta.lightRadius),
                            playerConfig: meta.playerConfig,
                            mapKind: resolveMapKind(meta.mapKind, meta.type),
                            shopCatalog: resolveShopCatalog(meta.shopCatalog, meta.type)
                        });
                    }
                }
            }

            if (story && Array.isArray(scenes)) {
                await db.transaction('rw', db.stories, db.scenes, db.assets, async () => {
                    await db.stories.put(story);
                    await db.scenes.bulkPut(scenes);
                    if (newAssets.length > 0) {
                        await db.assets.bulkPut(newAssets);
                    }
                });
            }
        } catch (err) {
            console.error(err);
            alert('Failed to import story from ZIP');
        } finally {
            e.target.value = '';
        }
    };

    const exportStory = async (storyId: string) => {
        const story = await db.stories.get(storyId);
        if (!story) return;

        const scenes = await db.scenes.where('storyId').equals(storyId).toArray();

        // Collect all asset IDs used in scenes
        const assetIds = new Set<string>();
        scenes.forEach(scene => {
            if (scene.backgroundAssetId) assetIds.add(scene.backgroundAssetId);
            if (scene.musicAssetId) assetIds.add(scene.musicAssetId);
            scene.tokens.forEach(token => assetIds.add(token.assetId));
        });

        // Fetch assets from DB
        const assets = await Promise.all(
            Array.from(assetIds).map(id => db.assets.get(id))
        );
        const validAssets = assets.filter((a): a is NonNullable<typeof a> => a !== undefined);

        const zip = new JSZip();

        // Add story data
        zip.file("story.json", JSON.stringify({ story, scenes }, null, 2));

        // Add asset metadata
        const assetMetadata = validAssets.map(a => ({
            id: a.id,
            name: a.name,
            type: a.type,
            tokenRole: a.tokenRole,
            assetRole: a.assetRole,
            lightRadius: a.lightRadius,
            playerConfig: a.playerConfig,
            mapKind: a.mapKind,
            shopCatalog: a.shopCatalog
        }));
        zip.file("assets.json", JSON.stringify(assetMetadata, null, 2));

        // Add asset files
        const assetsFolder = zip.folder("assets");
        validAssets.forEach(asset => {
            assetsFolder?.file(asset.id, asset.fileData);
        });

        // Generate and download zip
        const zipContent = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(zipContent);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${story.name || 'story'}.zip`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const deleteStory = (id: string) => {
        if (confirm('Are you sure?')) db.stories.delete(id);
    };

    const handleSelect = async (story: Story, mode: 'EDITOR' | 'PLAYER') => {
        // Load scenes
        const scenes = await db.scenes.where('storyId').equals(story.id).toArray();
        loadStory(story, scenes);
        onNavigate(mode);
    };

    return (
        <div className="min-h-screen p-8 flex flex-col items-center justify-center relative bg-[url('https://images.unsplash.com/photo-1605806616949-1e87b487bc2a?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center">
            <div className="absolute inset-0 bg-fantasy-bg/85 backdrop-blur-sm" />

            <div className="z-10 w-full max-w-5xl space-y-8">
                <header className="text-center space-y-2">
                    <h1 className="text-6xl font-cinzel text-transparent bg-clip-text bg-gradient-to-br from-fantasy-gold via-yellow-200 to-fantasy-gold-dim drop-shadow-[0_2px_10px_rgba(255,215,0,0.3)]">
                        DungeonFrame
                    </h1>
                    <p className="text-fantasy-muted text-lg tracking-widest uppercase text-xs">Immersive Storytelling Engine</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Create New */}
                    <GlassPanel
                        onClick={handleCreateStory}
                        className="h-72 flex flex-col items-center justify-center cursor-pointer hover:bg-fantasy-accent/5 group transition-all border-dashed border-2 border-fantasy-muted/20 hover:border-fantasy-accent"
                    >
                        <div className="w-16 h-16 rounded-full bg-fantasy-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-fantasy-accent/20">
                            <Plus className="w-8 h-8 text-fantasy-accent" />
                        </div>
                        <h3 className="text-xl font-cinzel text-fantasy-text group-hover:text-fantasy-accent transition-colors">New Story</h3>
                    </GlassPanel>

                    {/* Import */}
                    <label className="h-72 flex flex-col items-center justify-center cursor-pointer hover:bg-fantasy-gold/5 group transition-all border-dashed border-2 border-fantasy-muted/20 hover:border-fantasy-gold relative bg-fantasy-panel/40 rounded-xl overflow-hidden backdrop-blur-md">
                        <input type="file" className="hidden" accept=".zip" onChange={importStory} />
                        <div className="w-16 h-16 rounded-full bg-fantasy-gold/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Upload className="w-8 h-8 text-fantasy-gold" />
                        </div>
                        <h3 className="text-xl font-cinzel text-fantasy-text group-hover:text-fantasy-gold transition-colors">Import ZIP</h3>
                    </label>

                    <GlassPanel
                        onClick={() => onNavigate('CONFIG_ASSETS')}
                        className="h-72 flex flex-col items-center justify-center cursor-pointer hover:bg-fantasy-accent/5 group transition-all border-dashed border-2 border-fantasy-muted/20 hover:border-fantasy-accent"
                    >
                        <div className="w-16 h-16 rounded-full bg-fantasy-accent/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-fantasy-accent/20">
                            <Settings className="w-8 h-8 text-fantasy-accent" />
                        </div>
                        <h3 className="text-xl font-cinzel text-fantasy-text group-hover:text-fantasy-accent transition-colors">Config Assets</h3>
                    </GlassPanel>

                    {/* List Stories */}
                    {stories?.map(story => (
                        <GlassPanel key={story.id} className="h-72 flex flex-col p-6 relative group transition-all hover:-translate-y-1 hover:shadow-fantasy-accent/20">
                            <div className="flex-1">
                                <h3 className="text-2xl font-cinzel text-fantasy-gold mb-2 line-clamp-2 leading-none">{story.name}</h3>
                                <p className="text-xs text-fantasy-muted uppercase tracking-wider mb-4">Last played: {new Date(story.createdAt).toLocaleDateString()}</p>
                            </div>

                            <div className="mt-auto grid grid-cols-2 gap-2 opacity-100">
                                <Button
                                    variant="primary"
                                    className="col-span-2 group-hover:animate-pulse"
                                    onClick={() => handleSelect(story, 'PLAYER')}
                                >
                                    <Play className="w-4 h-4 mr-2" /> Play
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => handleSelect(story, 'EDITOR')}
                                >
                                    <Edit2 className="w-3 h-3 mr-1" /> Edit
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => exportStory(story.id)}
                                    title="Export"
                                >
                                    <Download className="w-3 h-3" />
                                </Button>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const newName = window.prompt("Rename story:", story.name);
                                            if (newName) {
                                                // Direct DB update for now since store might not expose updateStory name easily or maybe it does?
                                                // Actually gameStore usually has updateStory. Let's check or just use db directly.
                                                // A cleaner way is to use db.stories.update
                                                db.stories.update(story.id, { name: newName });
                                                // Force reload or depend on liveQuery? Home uses useLiveQuery so it should update.
                                            }
                                        }}
                                        title="Rename Story"
                                        className="h-8 w-8 hover:bg-white/10 text-fantasy-muted hover:text-white"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            deleteStory(story.id);
                                        }}
                                        className="h-8 w-8 hover:bg-red-500/20 text-fantasy-muted hover:text-red-500"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </GlassPanel>
                    ))}
                </div>
            </div>

            <span className="fixed bottom-4 right-4 text-fantasy-muted/50 text-xs tracking-wider z-10 select-none">
                v1.3.0
            </span>
        </div>
    );
};
