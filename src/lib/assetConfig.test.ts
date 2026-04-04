import { describe, expect, it } from 'vitest';
import {
    canConfigureTokenLightRadius,
    resolveAssetRole,
    resolveFolderPath,
    resolveLightRadius,
    resolveMapKind,
    resolveShopCatalog,
    resolveShopTemplateId,
    resolveTokenRole
} from './assetConfig';

describe('assetConfig', () => {
    it('resolves defaults for token and asset roles', () => {
        expect(resolveTokenRole(undefined, 'token')).toBe('enemy');
        expect(resolveAssetRole(undefined, 'asset')).toBe('common');
    });

    it('keeps valid configured roles', () => {
        expect(resolveTokenRole('player', 'token')).toBe('player');
        expect(resolveAssetRole('light_source', 'asset')).toBe('light_source');
    });

    it('only allows light radius configuration for player and other tokens', () => {
        expect(canConfigureTokenLightRadius('player')).toBe(true);
        expect(canConfigureTokenLightRadius('other')).toBe(true);
        expect(canConfigureTokenLightRadius('enemy')).toBe(false);
        expect(canConfigureTokenLightRadius('npc')).toBe(false);
    });

    it('normalizes light radius bounds', () => {
        expect(resolveLightRadius(15)).toBe(15);
        expect(resolveLightRadius(-1)).toBe(0);
        expect(resolveLightRadius(60)).toBe(40);
    });

    it('normalizes folder path and shop template assignment', () => {
        expect(resolveFolderPath('  maps/town  ')).toBe('maps/town');
        expect(resolveFolderPath(undefined)).toBe('');
        expect(resolveShopTemplateId('template-1', 'map')).toBe('template-1');
        expect(resolveShopTemplateId('', 'map')).toBeUndefined();
        expect(resolveShopTemplateId('template-1', 'token')).toBeUndefined();
    });

    it('keeps backwards compatibility for map shop fields', () => {
        expect(resolveMapKind(undefined, 'map')).toBe('common');
        expect(resolveShopCatalog(undefined, 'map')).toEqual([]);
        expect(resolveShopCatalog([], 'map')).toEqual([]);
    });
});
