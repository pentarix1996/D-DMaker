export type AssetType = 'map' | 'token' | 'audio';

export interface Asset {
    id: string;
    name: string;
    type: AssetType;
    fileData: Blob; // For IndexedDB storage
    imageUrl: string; // Blob URL for preview (or object URL for audio)
}

export interface SceneAsset {
    id: string; // Instance ID in the scene
    assetId: string; // Reference to original asset
    x: number;
    y: number;
    scale: number;
    shape: 'circle' | 'square';
    rotation?: number;
    layer?: number; // z-index equivalent
}

export interface Scene {
    id: string;
    storyId: string;
    name: string;
    order: number;
    backgroundAssetId?: string; // Reference to an asset of type 'map'
    musicData?: Blob; // Optional mp3
    musicUrl?: string;
    tokens: SceneAsset[];
    gridEnabled: boolean;
    gridColor?: string;
    gridSize?: number;
}

export interface Story {
    id: string;
    name: string;
    createdAt: string; // ISO String
    lastPlayed: string;
    theme: 'fantasy' | 'scifi' | 'horror';
    scenes?: Scene[];
    thumbnail?: Blob; // Cover image
    thumbnailUrl?: string;
}
