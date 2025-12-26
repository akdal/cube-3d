import { useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { Vector3 } from 'three';
import { DotsGame } from './DotsGame';
import { DotsUI } from './DotsUI';
import { useDotsStore } from './useDotsStore';

interface DotsProps {
    onBack: () => void;
}

// Front view (XY plane) - same as other puzzle games
const DEFAULT_CAMERA_POSITION = new Vector3(0, 0, 8);

function DotsScene() {
    const viewResetRequested = useDotsStore((s) => s.viewResetRequested);
    const clearViewReset = useDotsStore((s) => s.clearViewReset);
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
            {/* Lighting - winter mood - adjusted for front view */}
            <ambientLight intensity={0.5} color="#b4d7ff" />
            <directionalLight position={[5, 10, 5]} intensity={0.6} color="#fff5e6" />
            <directionalLight position={[-5, 5, 5]} intensity={0.3} color="#a8d8ff" />
            <pointLight position={[0, 0, 5]} intensity={0.4} color="#ffebcd" />

            {/* Game */}
            <DotsGame />

            {/* Controls - fixed front view, zoom only */}
            <OrbitControls
                ref={controlsRef}
                makeDefault
                enableRotate={false}
                enablePan={false}
                enableDamping
                dampingFactor={0.05}
                minDistance={5}
                maxDistance={14}
            />
        </>
    );
}

export const Dots = ({ onBack }: DotsProps) => {
    const initGame = useDotsStore((s) => s.initGame);
    const gameStatus = useDotsStore((s) => s.gameStatus);

    useEffect(() => {
        if (gameStatus === 'IDLE') {
            initGame();
        }
    }, [initGame, gameStatus]);

    return (
        <div className="w-full h-full relative game-screen bg-gradient-to-b from-[#0a1628] via-[#0f2937] to-[#1a3a4a]">
            <DotsUI onBack={onBack} />
            <Canvas
                camera={{ position: [0, 0, 8], fov: 50 }}
                gl={{ alpha: true }}
                style={{ background: 'transparent' }}
            >
                <DotsScene />
            </Canvas>
        </div>
    );
};
