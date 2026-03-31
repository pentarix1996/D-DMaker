import type { AssetRole, TokenRole } from '@/types';

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
