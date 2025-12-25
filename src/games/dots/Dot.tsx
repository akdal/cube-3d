import { RoundedBox } from '@react-three/drei';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

interface DotProps {
    position: [number, number, number];
}

export const Dot = ({ position }: DotProps) => {
    const meshRef = useRef<Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            // Subtle floating animation
            meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0] + position[2]) * 0.02;
        }
    });

    return (
        <RoundedBox
            ref={meshRef}
            args={[0.2, 0.2, 0.2]}
            position={position}
            radius={0.05}
            smoothness={4}
        >
            <meshStandardMaterial
                color="#e2e8f0"
                metalness={0.3}
                roughness={0.4}
                emissive="#a8d8ff"
                emissiveIntensity={0.2}
            />
        </RoundedBox>
    );
};
