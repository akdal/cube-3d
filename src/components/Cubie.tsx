import { useMemo } from 'react';
import { BoxGeometry, Quaternion, MeshPhysicalMaterial } from 'three';
import type { ThreeEvent } from '@react-three/fiber';

interface CubieProps {
    position: [number, number, number];
    rotation: [number, number, number, number];
    originalPosition: [number, number, number];
    cubeSize: 2 | 3;
    onPointerDown?: (e: ThreeEvent<PointerEvent>) => void;
    onPointerMove?: (e: ThreeEvent<PointerEvent>) => void;
    onPointerUp?: (e: ThreeEvent<PointerEvent>) => void;
}

// Vibrant, saturated colors
const COLORS = {
    U: '#FFFFFF',  // White - top
    D: '#FFD700',  // Gold Yellow - bottom
    R: '#FF4757',  // Vibrant Red - right
    L: '#FFA502',  // Bright Orange - left
    F: '#2ED573',  // Vivid Green - front
    B: '#3742FA',  // Electric Blue - back
    CORE: '#2C3E50' // Slate core
};

// Shared geometry for all cubies
const boxGeometry = new BoxGeometry(0.93, 0.93, 0.93);

// Material settings - matte plastic look with subtle sheen
const createMaterial = (color: string, isCore: boolean) => {
    return new MeshPhysicalMaterial({
        color,
        metalness: 0.0,
        roughness: isCore ? 0.7 : 0.4,
        clearcoat: isCore ? 0 : 0.2,
        clearcoatRoughness: 0.4,
        reflectivity: 0.1,
    });
};

export const Cubie = ({
    position,
    rotation,
    originalPosition,
    cubeSize,
    onPointerDown,
    onPointerMove,
    onPointerUp
}: CubieProps) => {
    const [ox, oy, oz] = originalPosition;

    const quaternion = useMemo(() => new Quaternion(...rotation), [rotation]);

    // Boundary value depends on cube size: 1 for 3x3, 0.5 for 2x2
    const boundary = cubeSize === 2 ? 0.5 : 1;

    // Create materials array for 6 faces
    // BoxGeometry face order: +X, -X, +Y, -Y, +Z, -Z
    const materials = useMemo(() => [
        createMaterial(ox === boundary ? COLORS.R : COLORS.CORE, ox !== boundary),   // Right (+X)
        createMaterial(ox === -boundary ? COLORS.L : COLORS.CORE, ox !== -boundary), // Left (-X)
        createMaterial(oy === boundary ? COLORS.U : COLORS.CORE, oy !== boundary),   // Up (+Y)
        createMaterial(oy === -boundary ? COLORS.D : COLORS.CORE, oy !== -boundary), // Down (-Y)
        createMaterial(oz === boundary ? COLORS.F : COLORS.CORE, oz !== boundary),   // Front (+Z)
        createMaterial(oz === -boundary ? COLORS.B : COLORS.CORE, oz !== -boundary), // Back (-Z)
    ], [ox, oy, oz, boundary]);

    return (
        <group position={position} quaternion={quaternion}>
            <mesh
                geometry={boxGeometry}
                material={materials}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
            />
        </group>
    );
};
