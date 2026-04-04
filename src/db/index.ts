import Dexie, { type Table } from 'dexie';
import type { Asset, Scene, ShopTemplate, Story, VaultFolder } from '@/types';

export class DungeonDB extends Dexie {
    stories!: Table<Story>;
    scenes!: Table<Scene>;
    assets!: Table<Asset>;
    shopTemplates!: Table<ShopTemplate>;
    vaultFolders!: Table<VaultFolder>;

    constructor() {
        super('DungeonFrameDB');
        this.version(1).stores({
            stories: 'id, title, createdAt',
            scenes: 'id, storyId, order',
            assets: 'id, type, name'
        });
        this.version(2).stores({
            stories: 'id, title, createdAt',
            scenes: 'id, storyId, order',
            assets: 'id, type, name, folderPath',
            shopTemplates: 'id, name',
            vaultFolders: 'id, type, path, parentPath'
        });
    }
}

export const db = new DungeonDB();
