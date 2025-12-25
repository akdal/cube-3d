import type { ThreeEvent } from '@react-three/fiber';

interface PegProps {
    position: [number, number, number];
    height: number;
    isSelected: boolean;
    onClick: (e: ThreeEvent<MouseEvent>) => void;
}

export const Peg = ({ position, height, isSelected, onClick }: PegProps) => {
    const pegRadius = 0.08;
    const baseRadius = 1.4;
    const baseHeight = 0.15;

    return (
        <group position={position}>
            {/* Base */}
            <mesh position={[0, baseHeight / 2, 0]} onClick={onClick} receiveShadow>
                <cylinderGeometry args={[baseRadius, baseRadius, baseHeight, 32]} />
                <meshStandardMaterial
                    color={isSelected ? '#5C4033' : '#8B4513'}
                    metalness={0.1}
                    roughness={0.7}
                />
            </mesh>

            {/* Pole */}
            <mesh position={[0, baseHeight + height / 2, 0]} onClick={onClick} receiveShadow>
                <cylinderGeometry args={[pegRadius, pegRadius, height, 16]} />
                <meshStandardMaterial
                    color={isSelected ? '#5C4033' : '#A0522D'}
                    metalness={0.1}
                    roughness={0.6}
                />
            </mesh>
        </group>
    );
};
