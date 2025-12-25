import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Text } from '@react-three/drei';
import { Mesh, Group } from 'three';
import * as THREE from 'three';
import type { Tile as TileType } from './use2048Store';

// Winter holiday themed colors for tiles
const getTileColor = (value: number): string => {
    switch (value) {
        case 2: return '#a8d8ff';      // Light ice blue
        case 4: return '#7cc4f5';      // Ice blue
        case 8: return '#4ade80';      // Mint green
        case 16: return '#22c55e';     // Green
        case 32: return '#fbbf24';     // Golden
        case 64: return '#f59e0b';     // Amber
        case 128: return '#ef4444';    // Red
        case 256: return '#dc2626';    // Deep red
        case 512: return '#be185d';    // Rose
        case 1024: return '#9333ea';   // Purple
        case 2048: return '#fcd34d';   // Gold (winner!)
        default: return '#f472b6';     // Pink for higher
    }
};

const getTextColor = (value: number): string => {
    if (value <= 4) return '#0f2937';
    return '#ffffff';
};

const getEmissiveIntensity = (value: number): number => {
    if (value >= 2048) return 0.4;
    if (value >= 512) return 0.25;
    if (value >= 128) return 0.15;
    return 0.1;
};

interface TileProps {
    tile: TileType;
    cellSize: number;
    gridOffset: number;
}

export const Tile = ({ tile, cellSize, gridOffset }: TileProps) => {
    const groupRef = useRef<Group>(null);
    const meshRef = useRef<Mesh>(null);
    const scaleRef = useRef(tile.isNew ? 0 : 1);
    const positionRef = useRef({
        x: (tile.previousCol ?? tile.col) * cellSize - gridOffset,
        y: 0,
        z: (tile.previousRow ?? tile.row) * cellSize - gridOffset,
    });

    const targetX = tile.col * cellSize - gridOffset;
    const targetZ = tile.row * cellSize - gridOffset;

    useFrame((_, delta) => {
        if (!groupRef.current) return;

        // Animate position
        positionRef.current.x = THREE.MathUtils.lerp(positionRef.current.x, targetX, delta * 15);
        positionRef.current.z = THREE.MathUtils.lerp(positionRef.current.z, targetZ, delta * 15);
        groupRef.current.position.x = positionRef.current.x;
        groupRef.current.position.z = positionRef.current.z;

        // Animate scale for new tiles
        if (tile.isNew && scaleRef.current < 1) {
            scaleRef.current = Math.min(1, scaleRef.current + delta * 8);
            groupRef.current.scale.setScalar(scaleRef.current);
        }

        // Merge animation (pop effect)
        if (tile.mergedFrom && meshRef.current) {
            const pulse = 1 + Math.sin(Date.now() * 0.01) * 0.05;
            meshRef.current.scale.setScalar(pulse);
        }
    });

    const color = getTileColor(tile.value);
    const textColor = getTextColor(tile.value);
    const emissiveIntensity = getEmissiveIntensity(tile.value);
    const tileHeight = 0.3;

    return (
        <group
            ref={groupRef}
            position={[positionRef.current.x, tileHeight / 2, positionRef.current.z]}
            scale={tile.isNew ? 0 : 1}
        >
            <RoundedBox
                ref={meshRef}
                args={[cellSize * 0.9, tileHeight, cellSize * 0.9]}
                radius={0.08}
                smoothness={4}
            >
                <meshStandardMaterial
                    color={color}
                    metalness={0.1}
                    roughness={0.4}
                    emissive={color}
                    emissiveIntensity={emissiveIntensity}
                />
            </RoundedBox>

            {/* Number text */}
            <Text
                position={[0, tileHeight / 2 + 0.01, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                fontSize={cellSize * (tile.value >= 1000 ? 0.22 : tile.value >= 100 ? 0.28 : 0.35)}
                color={textColor}
                anchorX="center"
                anchorY="middle"
                fontWeight={700}
            >
                {tile.value}
            </Text>

            {/* Glow for high value tiles */}
            {tile.value >= 128 && (
                <pointLight
                    position={[0, 0.5, 0]}
                    color={color}
                    intensity={0.3}
                    distance={2}
                />
            )}
        </group>
    );
};
