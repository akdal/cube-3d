import type { ThreeEvent } from '@react-three/fiber';

interface PegProps {
    position: [number, number, number];
    height: number;
    isSelected: boolean;
    isTarget?: boolean; // Rightmost peg - always white
    isHintSource?: boolean;
    isHintTarget?: boolean;
    onClick: (e: ThreeEvent<MouseEvent>) => void;
}

export const Peg = ({ position, height, isSelected, isTarget, isHintSource, isHintTarget, onClick }: PegProps) => {
    const pegRadius = 0.08;
    const baseRadius = 1.4;
    const baseHeight = 0.15;

    // Determine base color based on state
    const getBaseColor = () => {
        if (isHintSource) return '#FFD700'; // Gold for source
        if (isHintTarget) return '#4ADE80'; // Green for target
        if (isTarget) return '#F5F5F5'; // White/off-white for target peg
        if (isSelected) return '#5C4033';
        return '#8B4513';
    };

    const getPoleColor = () => {
        if (isHintSource) return '#FFA500'; // Orange for source
        if (isHintTarget) return '#22C55E'; // Green for target
        if (isTarget) return '#FFFFFF'; // White pole for target
        if (isSelected) return '#5C4033';
        return '#A0522D';
    };

    return (
        <group position={position}>
            {/* Base */}
            <mesh position={[0, baseHeight / 2, 0]} onClick={onClick} receiveShadow>
                <cylinderGeometry args={[baseRadius, baseRadius, baseHeight, 32]} />
                <meshStandardMaterial
                    color={getBaseColor()}
                    metalness={0.1}
                    roughness={0.7}
                    emissive={isHintSource ? '#FFD700' : isHintTarget ? '#4ADE80' : '#000000'}
                    emissiveIntensity={isHintSource || isHintTarget ? 0.3 : 0}
                />
            </mesh>

            {/* Pole */}
            <mesh position={[0, baseHeight + height / 2, 0]} onClick={onClick} receiveShadow>
                <cylinderGeometry args={[pegRadius, pegRadius, height, 16]} />
                <meshStandardMaterial
                    color={getPoleColor()}
                    metalness={0.1}
                    roughness={0.6}
                    emissive={isHintSource ? '#FFA500' : isHintTarget ? '#22C55E' : '#000000'}
                    emissiveIntensity={isHintSource || isHintTarget ? 0.2 : 0}
                />
            </mesh>
        </group>
    );
};
