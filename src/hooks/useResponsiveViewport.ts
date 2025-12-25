import { useThree } from '@react-three/fiber';
import { useMemo } from 'react';

export interface ViewportInfo {
    /** Viewport width / height */
    aspectRatio: number;
    /** True if aspectRatio < 1 (portrait mode) */
    isPortrait: boolean;
    /** True if aspectRatio < 0.7 (very narrow) */
    isNarrow: boolean;
    /** True if aspectRatio < 0.5 (extremely narrow, like phone in portrait) */
    isVeryNarrow: boolean;
    /** Recommended scale for the game scene */
    gameScale: number;
    /** Viewport width in Three.js units */
    width: number;
    /** Viewport height in Three.js units */
    height: number;
}

export interface UseResponsiveViewportOptions {
    /** Scale for narrow screens (default: 0.65) */
    narrowScale?: number;
    /** Scale for portrait screens (default: 0.8) */
    portraitScale?: number;
    /** Scale for landscape screens (default: 1.0) */
    landscapeScale?: number;
    /** Scale for very narrow screens (default: 0.55) */
    veryNarrowScale?: number;
}

/**
 * Hook for responsive viewport handling in Three.js scenes.
 * Returns viewport information and recommended scale for game scenes.
 *
 * Usage:
 * ```tsx
 * const { gameScale, isPortrait, isNarrow } = useResponsiveViewport();
 * return <group scale={gameScale}>...</group>;
 * ```
 */
export const useResponsiveViewport = (options: UseResponsiveViewportOptions = {}): ViewportInfo => {
    const { viewport } = useThree();

    const {
        veryNarrowScale = 0.55,
        narrowScale = 0.65,
        portraitScale = 0.8,
        landscapeScale = 1.0,
    } = options;

    return useMemo(() => {
        const aspectRatio = viewport.width / viewport.height;
        const isVeryNarrow = aspectRatio < 0.5;
        const isNarrow = aspectRatio < 0.7;
        const isPortrait = aspectRatio < 1;

        let gameScale: number;
        if (isVeryNarrow) {
            gameScale = veryNarrowScale;
        } else if (isNarrow) {
            gameScale = narrowScale;
        } else if (isPortrait) {
            gameScale = portraitScale;
        } else {
            gameScale = landscapeScale;
        }

        return {
            aspectRatio,
            isPortrait,
            isNarrow,
            isVeryNarrow,
            gameScale,
            width: viewport.width,
            height: viewport.height,
        };
    }, [viewport.width, viewport.height, veryNarrowScale, narrowScale, portraitScale, landscapeScale]);
};

/**
 * Calculate responsive camera Z position based on viewport.
 * Use this to move camera back on narrow screens.
 */
export const getResponsiveCameraZ = (
    baseZ: number,
    aspectRatio: number,
    options: { narrowMultiplier?: number; portraitMultiplier?: number } = {}
): number => {
    const { narrowMultiplier = 1.4, portraitMultiplier = 1.2 } = options;

    if (aspectRatio < 0.7) {
        return baseZ * narrowMultiplier;
    } else if (aspectRatio < 1) {
        return baseZ * portraitMultiplier;
    }
    return baseZ;
};
