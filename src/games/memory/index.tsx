import { useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { Vector3 } from 'three';
import { MemoryGame } from './MemoryGame';
import { MemoryUI } from './MemoryUI';
import { useMemoryStore } from './useMemoryStore';

interface MemoryProps {
    onBack: () => void;
}

const DEFAULT_CAMERA_POSITION = new Vector3(0, 0, 6);

function MemoryScene() {
    const viewResetRequested = useMemoryStore((s) => s.viewResetRequested);
    const clearViewReset = useMemoryStore((s) => s.clearViewReset);
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
            {/* Lighting - warm winter mood */}
            <ambientLight intensity={0.5} color="#b4d7ff" />
            <directionalLight position={[5, 10, 5]} intensity={0.6} color="#fff5e6" />
            <directionalLight position={[-5, 5, 5]} intensity={0.3} color="#a8d8ff" />
            <pointLight position={[0, 0, 5]} intensity={0.4} color="#ffebcd" />

            {/* Game */}
            <MemoryGame />

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

export const Memory = ({ onBack }: MemoryProps) => {
    const initGame = useMemoryStore((s) => s.initGame);

    useEffect(() => {
        initGame();
    }, [initGame]);

    return (
        <div className="w-full h-full relative game-screen bg-gradient-to-b from-[#0a1628] via-[#0f2937] to-[#1a3a4a]">
            <MemoryUI onBack={onBack} />
            <Canvas
                camera={{ position: [0, 0, 6], fov: 50 }}
                gl={{ alpha: true }}
                style={{ background: 'transparent' }}
            >
                <MemoryScene />
            </Canvas>
        </div>
    );
};
