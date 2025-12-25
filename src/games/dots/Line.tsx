import { RoundedBox } from '@react-three/drei';
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';

type Player = 1 | 2;

interface LineProps {
    position: [number, number, number];
    isHorizontal: boolean;
    owner: Player | null;
    onClick: () => void;
    disabled: boolean;
}

const getPlayerColor = (player: Player): string => {
    return player === 1 ? '#22d3ee' : '#f472b6'; // cyan for P1, pink for P2
};

export const Line = ({ position, isHorizontal, owner, onClick, disabled }: LineProps) => {
    const meshRef = useRef<Mesh>(null);
    const [hovered, setHovered] = useState(false);

    useFrame(() => {
        if (meshRef.current && !owner) {
            // Hover effect
            const targetScale = hovered ? 1.1 : 1;
            meshRef.current.scale.y = meshRef.current.scale.y + (targetScale - meshRef.current.scale.y) * 0.2;
        }
    });

    const length = 0.8;
    const thickness = 0.08;
    const height = 0.1;

    const handleClick = () => {
        if (!owner && !disabled) {
            onClick();
        }
    };

    const color = owner
        ? getPlayerColor(owner)
        : hovered && !disabled
            ? '#64748b'
            : '#334155';

    return (
        <RoundedBox
            ref={meshRef}
            args={isHorizontal ? [length, height, thickness] : [thickness, height, length]}
            position={position}
            radius={0.02}
            smoothness={4}
            onClick={handleClick}
            onPointerEnter={() => !disabled && !owner && setHovered(true)}
            onPointerLeave={() => setHovered(false)}
        >
            <meshStandardMaterial
                color={color}
                metalness={owner ? 0.4 : 0.1}
                roughness={owner ? 0.3 : 0.6}
                emissive={owner ? color : '#000000'}
                emissiveIntensity={owner ? 0.3 : 0}
                transparent={!owner}
                opacity={owner ? 1 : hovered ? 0.8 : 0.4}
            />
        </RoundedBox>
    );
};
