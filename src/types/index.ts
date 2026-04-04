export type AssetType = 'map' | 'token' | 'asset' | 'audio';
export type TokenRole = 'enemy' | 'player' | 'npc' | 'other';
export type AssetRole = 'light_source' | 'common';
export type MapKind = 'common' | 'shop';
export type CurrencyCode = 'cp' | 'sp' | 'gp' | 'pp';
export type DamageDie = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';
export type DamageType = 'bludgeoning' | 'slashing' | 'piercing';
export type WeaponAmmoType = 'arrow' | 'bolt' | 'projectile' | 'bullet';
export type ShopItemType = 'weapon' | 'armor' | 'object';
export type ArmorType = 'light' | 'medium' | 'heavy' | 'shield';
export type AbilityModifier = 'str' | 'dex' | 'int' | 'wis' | 'cha' | 'con';

export interface ShopPrice {
    cp: number;
    sp: number;
    gp: number;
    pp: number;
}

export interface WeaponProperties {
    versatile?: {
        enabled: boolean;
        twoHandedDamageDie: DamageDie;
    };
    thrown?: {
        enabled: boolean;
        minRange: number;
        maxRange: number;
    };
    light?: boolean;
    finesse?: boolean;
    twoHanded?: boolean;
    ammunition?: {
        enabled: boolean;
        minRange: number;
        maxRange: number;
        ammoType: WeaponAmmoType;
    };
    reload?: boolean;
    longRange?: boolean;
    heavy?: boolean;
}

export interface ShopWeaponItem {
    id: string;
    type: 'weapon';
    name: string;
    imageAssetId?: string;
    damageDiceCount: number;
    damageDie: DamageDie;
    damageType: DamageType;
    properties: WeaponProperties;
    price: ShopPrice;
    weightKg?: number;
    quantityAvailable: number;
}

export interface ArmorClassModifier {
    ability: AbilityModifier;
    maxBonus?: number;
}

export interface ShopArmorItem {
    id: string;
    type: 'armor';
    name: string;
    imageAssetId?: string;
    armorType: ArmorType;
    armorClass: number;
    armorClassModifier?: ArmorClassModifier;
    requiredStrength?: number;
    stealth: 'none' | 'disadvantage';
    weightKg?: number;
    price: ShopPrice;
    quantityAvailable: number;
}

export interface ShopObjectItem {
    id: string;
    type: 'object';
    name: string;
    imageAssetId?: string;
    price: ShopPrice;
    description: string;
    weightKg?: number;
    quantityAvailable: number;
}

export type ShopCatalogItem = ShopWeaponItem | ShopArmorItem | ShopObjectItem;

export interface PlayerConfig {
    name: string;
    className: string;
    level: number;
}

export interface Asset {
    id: string;
    name: string;
    type: AssetType;
    fileData: Blob; // For IndexedDB storage
    imageUrl: string; // Blob URL for preview (or object URL for audio)
    tokenRole?: TokenRole;
    assetRole?: AssetRole;
    lightRadius?: number;
    playerConfig?: PlayerConfig;
    mapKind?: MapKind;
    shopCatalog?: ShopCatalogItem[];
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

export interface FogOfWar {
    enabled: boolean;
    brushSize: number;
    width: number;
    height: number;
    mask: number[];
}

export interface Scene {
    id: string;
    storyId: string;
    name: string;
    order: number;
    backgroundAssetId?: string; // Reference to an asset of type 'map'
    musicAssetId?: string; // Reference to an asset of type 'audio'
    musicData?: Blob; // Deprecated: keep for backwards comp momentarily
    musicUrl?: string; // Deprecated: keep for backwards comp momentarily
    tokens: SceneAsset[];
    gridEnabled: boolean;
    gridColor?: string;
    gridSize?: number;
    fogOfWar?: FogOfWar;
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
