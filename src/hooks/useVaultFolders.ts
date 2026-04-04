import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db';
import type { VaultFolder, VaultFolderType } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export const useVaultFolders = (type: VaultFolderType) => {
    const folders = useLiveQuery(
        () => db.vaultFolders.where('type').equals(type).sortBy('path'),
        [type]
    );

    const addFolder = async (name: string, parentPath = '') => {
        const normalizedName = name.trim();
        if (!normalizedName) return null;
        const path = parentPath ? `${parentPath}/${normalizedName}` : normalizedName;
        const existing = await db.vaultFolders.where({ type, path }).first();
        if (existing) return existing.id;
        const folder: VaultFolder = {
            id: uuidv4(),
            type,
            name: normalizedName,
            path,
            parentPath
        };
        await db.vaultFolders.add(folder);
        return folder.id;
    };

    const renameFolder = async (folderId: string, nextName: string) => {
        const target = await db.vaultFolders.get(folderId);
        if (!target) return;
        const normalizedName = nextName.trim();
        if (!normalizedName) return;
        const baseParent = target.parentPath;
        const nextPath = baseParent ? `${baseParent}/${normalizedName}` : normalizedName;
        const allFolders = await db.vaultFolders.where('type').equals(type).toArray();
        const allAssets = await db.assets.where('type').equals(type).toArray();
        await db.transaction('rw', db.vaultFolders, db.assets, async () => {
            await db.vaultFolders.update(folderId, { name: normalizedName, path: nextPath });
            for (const folder of allFolders) {
                if (folder.path.startsWith(`${target.path}/`)) {
                    const suffix = folder.path.slice(target.path.length + 1);
                    const updatedPath = `${nextPath}/${suffix}`;
                    const updatedParent = updatedPath.includes('/') ? updatedPath.split('/').slice(0, -1).join('/') : '';
                    await db.vaultFolders.update(folder.id, { path: updatedPath, parentPath: updatedParent });
                }
            }
            for (const asset of allAssets) {
                const currentPath = asset.folderPath ?? '';
                if (currentPath === target.path || currentPath.startsWith(`${target.path}/`)) {
                    const suffix = currentPath.slice(target.path.length);
                    await db.assets.update(asset.id, { folderPath: `${nextPath}${suffix}` });
                }
            }
        });
    };

    const deleteFolder = async (folderId: string) => {
        const target = await db.vaultFolders.get(folderId);
        if (!target) return;
        await db.transaction('rw', db.vaultFolders, db.assets, async () => {
            const allFolders = await db.vaultFolders.where('type').equals(type).toArray();
            const allAssets = await db.assets.where('type').equals(type).toArray();
            const idsToDelete = allFolders.filter((folder) => folder.path === target.path || folder.path.startsWith(`${target.path}/`)).map((folder) => folder.id);
            if (idsToDelete.length > 0) {
                await db.vaultFolders.bulkDelete(idsToDelete);
            }
            for (const asset of allAssets) {
                const currentPath = asset.folderPath ?? '';
                if (currentPath === target.path || currentPath.startsWith(`${target.path}/`)) {
                    await db.assets.update(asset.id, { folderPath: '' });
                }
            }
        });
    };

    return {
        folders: folders ?? [],
        addFolder,
        renameFolder,
        deleteFolder,
        isLoading: !folders
    };
};
