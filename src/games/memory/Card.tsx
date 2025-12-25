import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Text } from '@react-three/drei';
import { Mesh, MathUtils } from 'three';

interface CardProps {
    icon: string;
    isFlipped: boolean;
    isMatched: boolean;
    isEmpty?: boolean;
    isHint?: boolean;
    position: [number, number, number];
    onClick: () => void;
    gridSize: number;
}

export const Card = ({ icon, isFlipped, isMatched, isEmpty, isHint, position, onClick, gridSize }: CardProps) => {
    const meshRef = useRef<Mesh>(null);
    const targetRotation = isFlipped || isMatched ? Math.PI : 0;

    // Card size based on grid
    const cardSize = gridSize === 4 ? 0.9 : 0.75;
    const fontSize = gridSize === 4 ? 0.4 : 0.35;

    // Don't render empty cards (center of 5x5 grid)
    if (isEmpty) {
        return null;
    }

    useFrame(() => {
        if (meshRef.current) {
            meshRef.current.rotation.y = MathUtils.lerp(
                meshRef.current.rotation.y,
                targetRotation,
                0.15
            );
        }
    });

    // Winter color scheme
    const backColor = isMatched ? '#2d5a3d' : '#1a4a5e'; // Dark green if matched, dark teal otherwise
    const frontColor = isMatched ? '#3d7a4d' : '#c41e3a'; // Green if matched, Christmas red otherwise

    return (
        <group position={position}>
            <mesh
                ref={meshRef}
                onClick={(e) => {
                    e.stopPropagation();
                    if (!isFlipped && !isMatched) onClick();
                }}
            >
                <RoundedBox
                    args={[cardSize, cardSize, 0.08]}
                    radius={0.05}
                    smoothness={4}
                >
                    <meshStandardMaterial
                        color={backColor}
                        metalness={0.1}
                        roughness={0.6}
                    />
                </RoundedBox>

                {/* Front face with icon (visible when flipped) */}
                <group rotation={[0, Math.PI, 0]} position={[0, 0, -0.041]}>
                    <RoundedBox
                        args={[cardSize - 0.02, cardSize - 0.02, 0.01]}
                        radius={0.04}
                        smoothness={4}
                    >
                        <meshStandardMaterial
                            color={frontColor}
                            metalness={0.05}
                            roughness={0.7}
                        />
                    </RoundedBox>
                    <Text
                        position={[0, 0, 0.01]}
                        fontSize={fontSize}
                        anchorX="center"
                        anchorY="middle"
                    >
                        {icon}
                    </Text>
                </group>

                {/* Back face decoration (snowflake pattern) */}
                <group position={[0, 0, 0.041]}>
                    <Text
                        fontSize={fontSize * 0.8}
                        anchorX="center"
                        anchorY="middle"
                        color="#4a90a4"
                    >
                        {isMatched ? '✓' : '❄️'}
                    </Text>
                </group>
            </mesh>

            {/* Glow effect for matched cards */}
            {isMatched && (
                <pointLight
                    position={[0, 0, 0.3]}
                    color="#4ade80"
                    intensity={0.5}
                    distance={1}
                />
            )}

            {/* Hint glow effect - yellow pulsing glow */}
            {isHint && !isMatched && !isFlipped && (
                <pointLight
                    position={[0, 0, 0.5]}
                    color="#FFD700"
                    intensity={1.5}
                    distance={1.5}
                />
            )}
        </group>
    );
};
