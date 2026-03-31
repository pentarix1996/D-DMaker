import { describe, expect, it } from 'vitest';
import { shouldDisableTokenInteractions } from './tokenInteractions';

describe('token interactions in canvas', () => {
    it('keeps interactions enabled in play mode', () => {
        expect(shouldDisableTokenInteractions(false, false)).toBe(false);
    });

    it('disables interactions only when editing fog in editor', () => {
        expect(shouldDisableTokenInteractions(true, true)).toBe(true);
        expect(shouldDisableTokenInteractions(true, false)).toBe(false);
    });
});
