import { useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { Vector3 } from 'three';
import { Game2048 as Game2048Board } from './Game2048';
import { Game2048UI } from './Game2048UI';
import { use2048Store } from './use2048Store';

interface Game2048Props {
    onBack: () => void;
}

// Front view (XY plane) - same as other puzzle games
const DEFAULT_CAMERA_POSITION = new Vector3(0, 0, 6);

function Game2048Scene() {
    const viewResetRequested = use2048Store((s) => s.viewResetRequested);
    const clearViewReset = use2048Store((s) => s.clearViewReset);
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
            {/* Lighting - winter mood */}
            <ambientLight intensity={0.5} color="#b4d7ff" />
            <directionalLight position={[5, 10, 5]} intensity={0.6} color="#fff5e6" />
            <directionalLight position={[-5, 5, 5]} intensity={0.3} color="#a8d8ff" />
            <pointLight position={[0, 0, 5]} intensity={0.4} color="#ffebcd" />

            {/* Game */}
            <Game2048Board />

            {/* Controls - fixed front view, zoom only */}
            <OrbitControls
                ref={controlsRef}
                makeDefault
                enableRotate={false}
                enablePan={false}
                enableDamping
                dampingFactor={0.05}
                minDistance={4}
                maxDistance={12}
            />
        </>
    );
}

export const Game2048 = ({ onBack }: Game2048Props) => {
    const initGame = use2048Store((s) => s.initGame);
    const gameStatus = use2048Store((s) => s.gameStatus);

    useEffect(() => {
        if (gameStatus === 'IDLE') {
            initGame();
        }
    }, [initGame, gameStatus]);

    return (
        <div className="w-full h-full relative game-screen bg-gradient-to-b from-[#0a1628] via-[#0f2937] to-[#1a3a4a]">
            <Game2048UI onBack={onBack} />
            <Canvas
                camera={{ position: [0, 0, 6], fov: 50 }}
                gl={{ alpha: true }}
                style={{ background: 'transparent' }}
            >
                <Game2048Scene />
            </Canvas>
        </div>
    );
};
