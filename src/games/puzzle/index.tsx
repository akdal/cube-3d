import { useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { Vector3 } from 'three';
import { PuzzleGame } from './PuzzleGame';
import { PuzzleUI } from './PuzzleUI';
import { usePuzzleStore } from './usePuzzleStore';

interface PuzzleProps {
    onBack: () => void;
}

const DEFAULT_CAMERA_POSITION = new Vector3(0, 0, 5);

function PuzzleScene() {
    const viewResetRequested = usePuzzleStore((s) => s.viewResetRequested);
    const clearViewReset = usePuzzleStore((s) => s.clearViewReset);
    const controlsRef = useRef<OrbitControlsImpl>(null);
    const { camera } = useThree();

    useEffect(() => {
        if (viewResetRequested && controlsRef.current) {
            camera.position.copy(DEFAULT_CAMERA_POSITION);
            controlsRef.current.target.set(0, 0, 0);
            controlsRef.current.update();
            clearViewReset();
        }
    }, [viewResetRequested, camera, clearViewReset]);

    return (
        <>
            {/* Lighting */}
            <ambientLight intensity={0.7} />
            <directionalLight position={[5, 10, 5]} intensity={0.8} />
            <directionalLight position={[-5, 5, 5]} intensity={0.4} />
            <pointLight position={[0, 0, 5]} intensity={0.3} color="#fff" />

            {/* Game */}
            <PuzzleGame />

            {/* Controls - fixed front view, zoom only */}
            <OrbitControls
                ref={controlsRef}
                makeDefault
                enableRotate={false}
                enablePan={false}
                enableDamping
                dampingFactor={0.05}
                minDistance={3}
                maxDistance={10}
            />
        </>
    );
}

export const Puzzle = ({ onBack }: PuzzleProps) => {
    const initGame = usePuzzleStore((s) => s.initGame);

    useEffect(() => {
        initGame();
    }, [initGame]);

    return (
        <div className="w-full h-full relative game-screen bg-gradient-to-b from-[#0a1628] via-[#0f2937] to-[#1a3a4a]">
            <PuzzleUI onBack={onBack} />
            <Canvas
                camera={{ position: [0, 0, 5], fov: 50 }}
                gl={{ alpha: true }}
                style={{ background: 'transparent' }}
            >
                <PuzzleScene />
            </Canvas>
        </div>
    );
};
