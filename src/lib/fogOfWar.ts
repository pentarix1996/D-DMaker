import type { FogOfWar as FogState } from '@/types';

export const FOG_DEFAULT_WIDTH = 160;
export const FOG_DEFAULT_HEIGHT = 90;
export const FOG_DEFAULT_BRUSH = 10;

export const clamp = (value: number, min: number, max: number): number => {
    return Math.max(min, Math.min(max, value));
};

export const createFogState = (
    width: number = FOG_DEFAULT_WIDTH,
    height: number = FOG_DEFAULT_HEIGHT
): FogState => {
    return {
        enabled: false,
        brushSize: FOG_DEFAULT_BRUSH,
        width,
        height,
        mask: new Array(width * height).fill(0)
    };
};

export const normalizeFogState = (fog?: Partial<FogState> | null): FogState => {
    if (!fog) {
        return createFogState();
    }

    const width = Number.isFinite(fog.width) && (fog.width as number) > 0 ? (fog.width as number) : FOG_DEFAULT_WIDTH;
    const height = Number.isFinite(fog.height) && (fog.height as number) > 0 ? (fog.height as number) : FOG_DEFAULT_HEIGHT;
    const size = width * height;
    const baseMask = Array.isArray(fog.mask) ? fog.mask : [];

    return {
        enabled: Boolean(fog.enabled),
        brushSize: clamp(Number(fog.brushSize ?? FOG_DEFAULT_BRUSH), 2, 40),
        width,
        height,
        mask: new Array(size).fill(0).map((_, idx) => (baseMask[idx] ? 1 : 0))
    };
};

export const applyFogBrush = (
    fog: FogState,
    xPercent: number,
    yPercent: number,
    brushPercent: number,
    mode: 'paint' | 'erase'
): FogState => {
    const safeX = clamp(xPercent, 0, 100);
    const safeY = clamp(yPercent, 0, 100);
    const radiusPercent = clamp(brushPercent, 2, 40) / 2;
    const radiusX = (radiusPercent / 100) * fog.width;
    const radiusY = (radiusPercent / 100) * fog.height;
    const centerX = (safeX / 100) * (fog.width - 1);
    const centerY = (safeY / 100) * (fog.height - 1);
    const nextMask = fog.mask.slice();
    const fillValue = mode === 'paint' ? 1 : 0;

    for (let y = 0; y < fog.height; y++) {
        for (let x = 0; x < fog.width; x++) {
            const dx = (x - centerX) / (radiusX || 1);
            const dy = (y - centerY) / (radiusY || 1);
            if ((dx * dx) + (dy * dy) <= 1) {
                nextMask[(y * fog.width) + x] = fillValue;
            }
        }
    }

    return {
        ...fog,
        brushSize: clamp(brushPercent, 2, 40),
        mask: nextMask
    };
};

export interface FogLightSource {
    xPercent: number;
    yPercent: number;
    radiusPercent: number;
}

export const FOG_LIGHT_RADIUS_SCALE = 0.6;

export const toEffectiveLightRadius = (radiusPercent: number): number => {
    return clamp(radiusPercent * FOG_LIGHT_RADIUS_SCALE, 0, 40);
};

export const applyFogLightingMask = (fog: FogState, lights: FogLightSource[]): number[] => {
    if (lights.length === 0) {
        return fog.mask.slice();
    }

    const litMask = fog.mask.slice();
    for (const light of lights) {
        const cx = (clamp(light.xPercent, 0, 100) / 100) * (fog.width - 1);
        const cy = (clamp(light.yPercent, 0, 100) / 100) * (fog.height - 1);
        const rx = (clamp(light.radiusPercent, 0, 100) / 100) * fog.width;
        const ry = (clamp(light.radiusPercent, 0, 100) / 100) * fog.height;
        for (let y = 0; y < fog.height; y++) {
            for (let x = 0; x < fog.width; x++) {
                const dx = (x - cx) / (rx || 1);
                const dy = (y - cy) / (ry || 1);
                if ((dx * dx) + (dy * dy) <= 1) {
                    litMask[(y * fog.width) + x] = 0;
                }
            }
        }
    }

    return litMask;
};

export const mergeRevealedFogMask = (currentMask: number[], litMask: number[]): { mask: number[]; changed: boolean } => {
    const nextMask = currentMask.slice();
    let changed = false;
    const size = Math.min(currentMask.length, litMask.length);
    for (let idx = 0; idx < size; idx++) {
        if (currentMask[idx] === 1 && litMask[idx] === 0) {
            nextMask[idx] = 0;
            changed = true;
        }
    }
    return { mask: nextMask, changed };
};
