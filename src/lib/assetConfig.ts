import type {
    AbilityModifier,
    ArmorType,
    AssetRole,
    DamageDie,
    DamageType,
    MapKind,
    ShopCatalogItem,
    ShopPrice,
    TokenRole,
    WeaponAmmoType
} from '@/types';

export const resolveTokenRole = (value: unknown, type: string): TokenRole | undefined => {
    if (type !== 'token') return undefined;
    if (value === 'enemy' || value === 'player' || value === 'npc' || value === 'other') {
        return value;
    }
    return 'enemy';
};

export const resolveAssetRole = (value: unknown, type: string): AssetRole | undefined => {
    if (type !== 'asset') return undefined;
    if (value === 'light_source' || value === 'common') {
        return value;
    }
    return 'common';
};

export const resolveLightRadius = (value: unknown): number => {
    if (typeof value !== 'number' || Number.isNaN(value)) return 0;
    return Math.max(0, Math.min(40, value));
};

export const canConfigureTokenLightRadius = (role: TokenRole | undefined): boolean => {
    return role === 'player' || role === 'other';
};

const isObjectRecord = (value: unknown): value is Record<string, unknown> => {
    return typeof value === 'object' && value !== null;
};

const safeNumber = (value: unknown, fallback = 0): number => {
    if (typeof value !== 'number' || Number.isNaN(value)) return fallback;
    return value;
};

const safePositiveInt = (value: unknown, fallback = 1): number => {
    const parsed = safeNumber(value, fallback);
    return Math.max(0, Math.floor(parsed));
};

const toDamageDie = (value: unknown): DamageDie => {
    return value === 'd4' || value === 'd6' || value === 'd8' || value === 'd10' || value === 'd12' || value === 'd20' ? value : 'd6';
};

const toDamageType = (value: unknown): DamageType => {
    return value === 'bludgeoning' || value === 'slashing' || value === 'piercing' ? value : 'bludgeoning';
};

const toArmorType = (value: unknown): ArmorType => {
    return value === 'light' || value === 'medium' || value === 'heavy' || value === 'shield' ? value : 'light';
};

const toAbilityModifier = (value: unknown): AbilityModifier | undefined => {
    return value === 'str' || value === 'dex' || value === 'int' || value === 'wis' || value === 'cha' || value === 'con' ? value : undefined;
};

const toAmmoType = (value: unknown): WeaponAmmoType => {
    return value === 'arrow' || value === 'bolt' || value === 'projectile' || value === 'bullet' ? value : 'arrow';
};

export const resolveMapKind = (value: unknown, type: string): MapKind | undefined => {
    if (type !== 'map') return undefined;
    if (value === 'common' || value === 'shop') return value;
    return 'common';
};

export const resolveFolderPath = (value: unknown): string => {
    if (typeof value !== 'string') return '';
    return value.trim();
};

export const resolveShopTemplateId = (value: unknown, type: string): string | undefined => {
    if (type !== 'map') return undefined;
    if (typeof value !== 'string') return undefined;
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
};

export const resolveShopPrice = (value: unknown): ShopPrice => {
    const record = isObjectRecord(value) ? value : {};
    return {
        cp: safePositiveInt(record.cp, 0),
        sp: safePositiveInt(record.sp, 0),
        gp: safePositiveInt(record.gp, 0),
        pp: safePositiveInt(record.pp, 0)
    };
};

export const resolveShopCatalog = (value: unknown, type: string): ShopCatalogItem[] | undefined => {
    if (type !== 'map') return undefined;
    if (!Array.isArray(value)) return [];

    return value.flatMap((item): ShopCatalogItem[] => {
        if (!isObjectRecord(item) || typeof item.id !== 'string' || typeof item.name !== 'string' || typeof item.type !== 'string') {
            return [];
        }

        if (item.type === 'weapon') {
            const props = isObjectRecord(item.properties) ? item.properties : {};
            const versatile = isObjectRecord(props.versatile) ? props.versatile : undefined;
            const thrown = isObjectRecord(props.thrown) ? props.thrown : undefined;
            const ammunition = isObjectRecord(props.ammunition) ? props.ammunition : undefined;

            return [{
                id: item.id,
                type: 'weapon',
                name: item.name,
                imageAssetId: typeof item.imageAssetId === 'string' ? item.imageAssetId : undefined,
                damageDiceCount: safePositiveInt(item.damageDiceCount, 1),
                damageDie: toDamageDie(item.damageDie),
                damageType: toDamageType(item.damageType),
                properties: {
                    versatile: versatile ? {
                        enabled: Boolean(versatile.enabled),
                        twoHandedDamageDie: toDamageDie(versatile.twoHandedDamageDie)
                    } : undefined,
                    thrown: thrown ? {
                        enabled: Boolean(thrown.enabled),
                        minRange: safePositiveInt(thrown.minRange, 0),
                        maxRange: safePositiveInt(thrown.maxRange, 0)
                    } : undefined,
                    light: Boolean(props.light),
                    finesse: Boolean(props.finesse),
                    twoHanded: Boolean(props.twoHanded),
                    ammunition: ammunition ? {
                        enabled: Boolean(ammunition.enabled),
                        minRange: safePositiveInt(ammunition.minRange, 0),
                        maxRange: safePositiveInt(ammunition.maxRange, 0),
                        ammoType: toAmmoType(ammunition.ammoType)
                    } : undefined,
                    reload: Boolean(props.reload),
                    longRange: Boolean(props.longRange),
                    heavy: Boolean(props.heavy)
                },
                price: resolveShopPrice(item.price),
                weightKg: typeof item.weightKg === 'number' ? item.weightKg : undefined,
                quantityAvailable: safePositiveInt(item.quantityAvailable, 1)
            }];
        }

        if (item.type === 'armor') {
            const modifier = isObjectRecord(item.armorClassModifier) ? item.armorClassModifier : undefined;
            const ability = modifier ? toAbilityModifier(modifier.ability) : undefined;

            return [{
                id: item.id,
                type: 'armor',
                name: item.name,
                imageAssetId: typeof item.imageAssetId === 'string' ? item.imageAssetId : undefined,
                armorType: toArmorType(item.armorType),
                armorClass: safePositiveInt(item.armorClass, 10),
                armorClassModifier: ability ? {
                    ability,
                    maxBonus: typeof modifier?.maxBonus === 'number' ? modifier.maxBonus : undefined
                } : undefined,
                requiredStrength: typeof item.requiredStrength === 'number' ? item.requiredStrength : undefined,
                stealth: item.stealth === 'disadvantage' ? 'disadvantage' : 'none',
                weightKg: typeof item.weightKg === 'number' ? item.weightKg : undefined,
                price: resolveShopPrice(item.price),
                quantityAvailable: safePositiveInt(item.quantityAvailable, 1)
            }];
        }

        if (item.type === 'object') {
            return [{
                id: item.id,
                type: 'object',
                name: item.name,
                imageAssetId: typeof item.imageAssetId === 'string' ? item.imageAssetId : undefined,
                price: resolveShopPrice(item.price),
                description: typeof item.description === 'string' ? item.description : '',
                weightKg: typeof item.weightKg === 'number' ? item.weightKg : undefined,
                quantityAvailable: safePositiveInt(item.quantityAvailable, 1)
            }];
        }

        return [];
    });
};
