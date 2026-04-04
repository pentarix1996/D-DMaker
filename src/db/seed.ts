import { db } from './index';
import { v4 as uuidv4 } from 'uuid';
import type { Asset, AssetType } from '@/types';

interface ManifestEntry {
    file: string;
    name: string;
    folderPath?: string;
}

interface Manifest {
    maps: ManifestEntry[];
    tokens: ManifestEntry[];
    assets?: ManifestEntry[];
}

async function fetchAsset(path: string, name: string, type: AssetType, folderPath = ''): Promise<Asset> {
    const response = await fetch(path);
    const blob = await response.blob();
    return {
        id: uuidv4(),
        name,
        type,
        fileData: blob,
        imageUrl: URL.createObjectURL(blob),
        folderPath
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
        const foldersToEnsure = new Set<string>();

        const ensureFolderAndParents = (type: 'map' | 'token' | 'asset', path: string) => {
            const trimmed = path.trim();
            if (!trimmed) return;
            const segments = trimmed.split('/').filter(Boolean);
            for (let i = 0; i < segments.length; i++) {
                const currentPath = segments.slice(0, i + 1).join('/');
                foldersToEnsure.add(`${type}::${currentPath}`);
            }
        };

        for (const entry of manifest.maps) {
            if (await assetExistsByName(entry.name, 'map')) continue;
            const folderPath = entry.folderPath?.trim() ?? '';
            ensureFolderAndParents('map', folderPath);
            newAssets.push(await fetchAsset(`/assets/maps/${entry.file}`, entry.name, 'map', folderPath));
        }

        for (const entry of manifest.tokens) {
            if (await assetExistsByName(entry.name, 'token')) continue;
            const folderPath = entry.folderPath?.trim() ?? '';
            ensureFolderAndParents('token', folderPath);
            newAssets.push(await fetchAsset(`/assets/tokens/${entry.file}`, entry.name, 'token', folderPath));
        }

        for (const entry of manifest.assets ?? []) {
            if (await assetExistsByName(entry.name, 'asset')) continue;
            const folderPath = entry.folderPath?.trim() ?? '';
            ensureFolderAndParents('asset', folderPath);
            newAssets.push(await fetchAsset(`/assets/assets/${entry.file}`, entry.name, 'asset', folderPath));
        }

        if (foldersToEnsure.size > 0) {
            const existingFolders = await db.vaultFolders.toArray();
            const existingKeys = new Set(existingFolders.map((folder) => `${folder.type}::${folder.path}`));
            const foldersToCreate = Array.from(foldersToEnsure).flatMap((key) => {
                if (existingKeys.has(key)) return [];
                const [type, path] = key.split('::');
                const parts = path.split('/');
                const parentPath = parts.length > 1 ? parts.slice(0, -1).join('/') : '';
                return [{
                    id: uuidv4(),
                    type: type as 'map' | 'token' | 'asset',
                    name: parts[parts.length - 1],
                    path,
                    parentPath
                }];
            });
            if (foldersToCreate.length > 0) {
                await db.vaultFolders.bulkAdd(foldersToCreate);
            }
        }

        if (newAssets.length > 0) {
            await db.assets.bulkAdd(newAssets);
        }
    } catch (err) {
        console.error('Failed to seed default assets:', err);
    }
}
