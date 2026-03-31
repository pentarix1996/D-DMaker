import { describe, expect, it } from 'vitest';
import { applyFogBrush, applyFogLightingMask, createFogState, mergeRevealedFogMask, normalizeFogState, toEffectiveLightRadius } from './fogOfWar';

describe('fogOfWar', () => {
    it('creates a normalized default state when input is missing', () => {
        const fog = normalizeFogState(undefined);
        expect(fog.width).toBeGreaterThan(0);
        expect(fog.height).toBeGreaterThan(0);
        expect(fog.mask).toHaveLength(fog.width * fog.height);
        expect(fog.enabled).toBe(false);
    });

    it('paints fog cells with brush', () => {
        const base = createFogState(20, 10);
        const painted = applyFogBrush(base, 50, 50, 20, 'paint');
        const paintedCells = painted.mask.filter(Boolean).length;
        expect(paintedCells).toBeGreaterThan(0);
    });

    it('erases painted fog cells with erase mode', () => {
        const base = createFogState(20, 10);
        const painted = applyFogBrush(base, 50, 50, 30, 'paint');
        const erased = applyFogBrush(painted, 50, 50, 30, 'erase');
        const paintedCells = painted.mask.filter(Boolean).length;
        const erasedCells = erased.mask.filter(Boolean).length;
        expect(paintedCells).toBeGreaterThan(erasedCells);
    });

    it('reveals fog around light sources', () => {
        const fog = {
            ...createFogState(20, 10),
            mask: new Array(200).fill(1)
        };
        const litMask = applyFogLightingMask(fog, [{ xPercent: 50, yPercent: 50, radiusPercent: 20 }]);
        const hiddenCells = litMask.filter(Boolean).length;
        expect(hiddenCells).toBeLessThan(fog.mask.length);
    });

    it('persists newly revealed fog cells after light pass', () => {
        const currentMask = [1, 1, 1, 1];
        const litMask = [1, 0, 1, 0];
        const merged = mergeRevealedFogMask(currentMask, litMask);
        expect(merged.changed).toBe(true);
        expect(merged.mask).toEqual([1, 0, 1, 0]);
    });

    it('scales down configured light radius', () => {
        expect(toEffectiveLightRadius(15)).toBe(9);
    });
});
