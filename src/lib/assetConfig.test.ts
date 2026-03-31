import { describe, expect, it } from 'vitest';
import { canConfigureTokenLightRadius, resolveAssetRole, resolveLightRadius, resolveTokenRole } from './assetConfig';

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
});
