import Dexie, { type Table } from 'dexie';
import type { Asset, Scene, Story } from '@/types';

export class DungeonDB extends Dexie {
    stories!: Table<Story>;
    scenes!: Table<Scene>;
    assets!: Table<Asset>;

    constructor() {
        super('DungeonFrameDB');
        this.version(1).stores({
            stories: 'id, title, createdAt',
            scenes: 'id, storyId, order',
            assets: 'id, type, name'
        });
    }
}

export const db = new DungeonDB();
