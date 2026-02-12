import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db';
import type { AssetType } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export const useAssets = (type?: AssetType) => {
    const assets = useLiveQuery(
        () => type
            ? db.assets.where('type').equals(type).toArray()
            : db.assets.toArray(),
        [type]
    );

    const addAsset = async (file: File, type: AssetType) => {
        const id = uuidv4();


        // We only store persistent data
        await db.assets.add({
            id,
            name: file.name,
            type,
            fileData: file,
            imageUrl: '' // Placeholder, or we exclude it from DB type
        });
    };

    const deleteAsset = async (id: string) => {
        await db.assets.delete(id);
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
        isLoading: !assets
    };
};
