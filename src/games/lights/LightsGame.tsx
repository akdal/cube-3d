import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Group, MeshStandardMaterial, MeshBasicMaterial } from 'three';
import { useLightsStore } from './useLightsStore';
import { useResponsiveViewport } from '../../hooks/useResponsiveViewport';

// Christmas tree light colors
const LIGHT_ON_COLORS = [
    '#ef4444', // Red
    '#22c55e', // Green
    '#fbbf24', // Gold
    '#3b82f6', // Blue
    '#f472b6', // Pink
];

interface LightCellProps {
    row: number;
    col: number;
    isOn: boolean;
    gridSize: number;
    onClick: () => void;
}

const LightCell = ({ row, col, isOn, gridSize, onClick }: LightCellProps) => {
    const meshRef = useRef<Mesh>(null);
    const glowRef = useRef<Mesh>(null);

    // Calculate position (centered grid)
    const spacing = 1.1;
    const offset = (gridSize - 1) / 2;
    const x = (col - offset) * spacing;
    const y = (offset - row) * spacing;

    // Assign color based on position
    const colorIndex = (row + col) % LIGHT_ON_COLORS.length;
    const lightColor = LIGHT_ON_COLORS[colorIndex];

    useFrame((_, delta) => {
        if (!meshRef.current) return;

        // Smooth intensity transition
        const currentIntensity = meshRef.current.userData.intensity ?? 0;
        const targetVal = isOn ? 1 : 0;
        const newIntensity = currentIntensity + (targetVal - currentIntensity) * delta * 8;
        meshRef.current.userData.intensity = newIntensity;

        // Update material
        const material = meshRef.current.material as MeshStandardMaterial;
        if (material.emissiveIntensity !== undefined) {
            material.emissiveIntensity = newIntensity * 0.8;
        }

        // Update glow
        if (glowRef.current) {
            const glowMaterial = glowRef.current.material as MeshBasicMaterial;
            glowMaterial.opacity = newIntensity * 0.4;
            glowRef.current.scale.setScalar(1 + newIntensity * 0.2);
        }
    });

    return (
        <group position={[x, y, 0]}>
            {/* Glow effect */}
            <mesh ref={glowRef} position={[0, 0, -0.05]}>
                <circleGeometry args={[0.5, 32]} />
                <meshBasicMaterial
                    color={lightColor}
                    transparent
                    opacity={0}
                    depthWrite={false}
                />
            </mesh>

            {/* Main light button - using circle for clean look */}
            <mesh
                ref={meshRef}
                onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                }}
                onPointerOver={(e) => {
                    e.stopPropagation();
                    document.body.style.cursor = 'pointer';
                }}
                onPointerOut={() => {
                    document.body.style.cursor = 'default';
                }}
            >
                <circleGeometry args={[0.42, 32]} />
                <meshStandardMaterial
                    color={isOn ? lightColor : '#2a3a4a'}
                    emissive={lightColor}
                    emissiveIntensity={0}
                    metalness={0.2}
                    roughness={0.3}
                />
            </mesh>

            {/* Inner highlight ring */}
            <mesh position={[0, 0, 0.01]}>
                <ringGeometry args={[0.3, 0.38, 32]} />
                <meshBasicMaterial
                    color={isOn ? '#ffffff' : '#3a4a5a'}
                    transparent
                    opacity={isOn ? 0.3 : 0.1}
                    depthWrite={false}
                />
            </mesh>
        </group>
    );
};

export const LightsGame = () => {
    const { grid, gridSize, toggleLight } = useLightsStore();
    const groupRef = useRef<Group>(null);
    const { gameScale } = useResponsiveViewport({
        veryNarrowScale: 0.55,
        narrowScale: 0.7,
        portraitScale: 0.85,
        landscapeScale: 1.0,
    });

    if (grid.length === 0) return null;

    return (
        <group ref={groupRef} scale={gameScale}>
            {/* Base plate */}
            <mesh position={[0, 0, -0.2]} receiveShadow>
                <boxGeometry args={[gridSize * 1.2, gridSize * 1.2, 0.1]} />
                <meshStandardMaterial
                    color="#1a2a3a"
                    metalness={0.5}
                    roughness={0.5}
                />
            </mesh>

            {/* Light cells */}
            {grid.map((row, rowIndex) =>
                row.map((isOn, colIndex) => (
                    <LightCell
                        key={`${rowIndex}-${colIndex}`}
                        row={rowIndex}
                        col={colIndex}
                        isOn={isOn}
                        gridSize={gridSize}
                        onClick={() => toggleLight(rowIndex, colIndex)}
                    />
                ))
            )}
        </group>
    );
};
