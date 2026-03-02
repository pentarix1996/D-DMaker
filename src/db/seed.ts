import { db } from './index';
import { v4 as uuidv4 } from 'uuid';
import type { Asset, AssetType } from '@/types';

interface ManifestEntry {
    file: string;
    name: string;
}

interface Manifest {
    maps: ManifestEntry[];
    tokens: ManifestEntry[];
}

async function fetchAsset(path: string, name: string, type: AssetType): Promise<Asset> {
    const response = await fetch(path);
    const blob = await response.blob();
    return {
        id: uuidv4(),
        name,
        type,
        fileData: blob,
        imageUrl: URL.createObjectURL(blob),
    };
}

async function assetExistsByName(name: string, type: AssetType): Promise<boolean> {
    const existing = await db.assets.where({ name, type }).first();
    return !!existing;
}

export async function seedDefaultAssets(): Promise<void> {
    try {
        const res = await fetch('/default-assets.json');
        if (!res.ok) return;

        const manifest: Manifest = await res.json();
        const newAssets: Asset[] = [];

        for (const entry of manifest.maps) {
            if (await assetExistsByName(entry.name, 'map')) continue;
            newAssets.push(await fetchAsset(`/assets/maps/${entry.file}`, entry.name, 'map'));
        }

        for (const entry of manifest.tokens) {
            if (await assetExistsByName(entry.name, 'token')) continue;
            newAssets.push(await fetchAsset(`/assets/tokens/${entry.file}`, entry.name, 'token'));
        }

        if (newAssets.length > 0) {
            await db.assets.bulkAdd(newAssets);
        }
    } catch (err) {
        console.error('Failed to seed default assets:', err);
    }
}
