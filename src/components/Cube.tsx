import React, { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import type { ThreeEvent } from '@react-three/fiber';
import { Group, Vector3, Quaternion } from 'three';
import { useStore } from '../store/useStore';
import { Cubie } from './Cubie';
import { useCubeInteraction } from '../hooks/useCubeInteraction';
import type { Axis } from '../utils/math';

interface CubieState {
    id: number;
    position: [number, number, number];
    rotation: [number, number, number, number];
    originalPosition: [number, number, number];
}

interface AnimationState {
    isAnimating: boolean;
    axis: Axis | null;
    layer: number | null;
    direction: 1 | -1 | 0;
    speed: number;
}

export const Cube: React.FC = () => {
    const { cubies, animation, triggerRotation, finishRotation, cubeSize, setIsHoveringCube } = useStore();
    const groupRef = useRef<Group>(null);
    const [progress, setProgress] = useState(0);

    const { onPointerDown, onPointerMove, onPointerUp } = useCubeInteraction();

    const handlePointerEnter = () => setIsHoveringCube(true);
    const handlePointerLeave = () => setIsHoveringCube(false);

    // Keyboard controls
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (animation.isAnimating) return;
            switch (e.key.toLowerCase()) {
                case 'r': triggerRotation('x', 1, -1); break;
                case 'l': triggerRotation('x', -1, 1); break;
                case 'u': triggerRotation('y', 1, -1); break;
                case 'd': triggerRotation('y', -1, 1); break;
                case 'f': triggerRotation('z', 1, -1); break;
                case 'b': triggerRotation('z', -1, 1); break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [animation.isAnimating, triggerRotation]);

    useFrame((_state, delta) => {
        if (animation.isAnimating) {
            if (progress < 1) {
                // Animation speed from store or default
                const speed = (3.0 * (animation.speed || 1)) * delta;
                setProgress(p => Math.min(p + speed, 1));
            } else {
                finishRotation();
                setProgress(0);
            }
        }
    });

    return (
        <group ref={groupRef}>
            {cubies.map((cubie) => (
                <CubieWrapper
                    key={cubie.id}
                    cubie={cubie}
                    animation={animation}
                    progress={progress}
                    cubeSize={cubeSize}
                    onPointerDown={(e: ThreeEvent<PointerEvent>) => onPointerDown(e, cubie.position)}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerEnter={handlePointerEnter}
                    onPointerLeave={handlePointerLeave}
                />
            ))}
        </group>
    );
};

const CubieWrapper: React.FC<{
    cubie: CubieState;
    animation: AnimationState;
    progress: number;
    cubeSize: 2 | 3;
    onPointerDown: (e: ThreeEvent<PointerEvent>) => void;
    onPointerMove: (e: ThreeEvent<PointerEvent>) => void;
    onPointerUp: (e: ThreeEvent<PointerEvent>) => void;
    onPointerEnter: () => void;
    onPointerLeave: () => void;
}> = ({ cubie, animation, progress, cubeSize, onPointerDown, onPointerMove, onPointerUp, onPointerEnter, onPointerLeave }) => {
    const groupRef = useRef<Group>(null);

    // Use tolerance for layer matching (works for both 2x2 and 3x3)
    const posVal = animation.axis
        ? cubie.position[animation.axis === 'x' ? 0 : animation.axis === 'y' ? 1 : 2]
        : 0;
    const isRotating = animation.isAnimating && animation.axis && animation.layer !== null &&
        Math.abs(posVal - animation.layer) < 0.1;

    useFrame(() => {
        if (!groupRef.current) return;
        const basePos = new Vector3(...cubie.position);
        const baseRot = new Quaternion(...cubie.rotation);

        if (isRotating) {
            const angle = (Math.PI / 2) * animation.direction * progress;
            const axisVec = new Vector3(
                animation.axis === 'x' ? 1 : 0,
                animation.axis === 'y' ? 1 : 0,
                animation.axis === 'z' ? 1 : 0
            );
            basePos.applyAxisAngle(axisVec, angle);
            const qRot = new Quaternion().setFromAxisAngle(axisVec, angle);
            baseRot.premultiply(qRot);
        }
        groupRef.current.position.copy(basePos);
        groupRef.current.quaternion.copy(baseRot);
    });

    return (
        <group ref={groupRef}>
            <Cubie
                position={[0, 0, 0]}
                rotation={[0, 0, 0, 1]}
                originalPosition={cubie.originalPosition}
                cubeSize={cubeSize}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerEnter={onPointerEnter}
                onPointerLeave={onPointerLeave}
            />
        </group>
    );
};
