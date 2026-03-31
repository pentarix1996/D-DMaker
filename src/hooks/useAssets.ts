import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db';
import type { Asset, AssetType } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export const useAssets = (type?: AssetType | AssetType[]) => {
    const assets = useLiveQuery(
        () => {
            if (!type) return db.assets.toArray();
            if (Array.isArray(type)) return db.assets.where('type').anyOf(type).toArray();
            return db.assets.where('type').equals(type).toArray();
        },
        [Array.isArray(type) ? type.join(',') : type]
    );

    const addAsset = async (file: File, type: AssetType) => {
        const id = uuidv4();
        const base: Asset = {
            id,
            name: file.name,
            type,
            fileData: file,
            imageUrl: '',
            tokenRole: type === 'token' ? 'enemy' : undefined,
            assetRole: type === 'asset' ? 'common' : undefined,
            lightRadius: 0,
            playerConfig: undefined
        };

        // We only store persistent data
        await db.assets.add(base);
    };

    const deleteAsset = async (id: string) => {
        await db.assets.delete(id);
    };

    const updateAsset = async (id: string, updates: Partial<Asset>) => {
        await db.assets.update(id, updates);
    };

    // Helper to get URL from blob (React component should handle this, or we return a wrapper)
    // For the list returned by useLiveQuery, the blobs are there. 
    // We need to map them to URLs.

    const assetsWithUrls = assets?.map(a => ({
        ...a,
        imageUrl: URL.createObjectURL(a.fileData) // Note: This creates a leak if not revamped. 
        // In a real app, use a dedicated component <AssetImage blob={a.fileData} /> to handle URL creation/revocation.
    }));

    return {
        assets: assetsWithUrls ?? [],
        addAsset,
        deleteAsset,
        updateAsset,
        isLoading: !assets
    };
};
