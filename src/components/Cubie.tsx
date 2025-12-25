import { useMemo } from 'react';
import { BoxGeometry, Quaternion, MeshStandardMaterial } from 'three';
import type { ThreeEvent } from '@react-three/fiber';

interface CubieProps {
    position: [number, number, number];
    rotation: [number, number, number, number];
    originalPosition: [number, number, number];
    onPointerDown?: (e: ThreeEvent<PointerEvent>) => void;
    onPointerMove?: (e: ThreeEvent<PointerEvent>) => void;
    onPointerUp?: (e: ThreeEvent<PointerEvent>) => void;
}

const COLORS = {
    U: '#FFFFFF',
    D: '#FFD500',
    R: '#B90000',
    L: '#FF5800',
    F: '#009E60',
    B: '#0051BA',
    CORE: '#1a1a1a'
};

// Shared geometry for all cubies
const boxGeometry = new BoxGeometry(0.95, 0.95, 0.95);

export const Cubie = ({
    position,
    rotation,
    originalPosition,
    onPointerDown,
    onPointerMove,
    onPointerUp
}: CubieProps) => {
    const [ox, oy, oz] = originalPosition;

    const quaternion = useMemo(() => new Quaternion(...rotation), [rotation]);

    // Create materials array for 6 faces
    // BoxGeometry face order: +X, -X, +Y, -Y, +Z, -Z
    const materials = useMemo(() => [
        new MeshStandardMaterial({ color: ox === 1 ? COLORS.R : COLORS.CORE }),   // Right (+X)
        new MeshStandardMaterial({ color: ox === -1 ? COLORS.L : COLORS.CORE }),  // Left (-X)
        new MeshStandardMaterial({ color: oy === 1 ? COLORS.U : COLORS.CORE }),   // Up (+Y)
        new MeshStandardMaterial({ color: oy === -1 ? COLORS.D : COLORS.CORE }),  // Down (-Y)
        new MeshStandardMaterial({ color: oz === 1 ? COLORS.F : COLORS.CORE }),   // Front (+Z)
        new MeshStandardMaterial({ color: oz === -1 ? COLORS.B : COLORS.CORE }),  // Back (-Z)
    ], [ox, oy, oz]);

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
