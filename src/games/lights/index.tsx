import { useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Vector3 } from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { LightsGame } from './LightsGame';
import { LightsUI } from './LightsUI';
import { useLightsStore } from './useLightsStore';

const DEFAULT_CAMERA_POSITION = new Vector3(0, 0, 6);

interface LightsProps {
    onBack: () => void;
}

function LightsScene() {
    const viewResetRequested = useLightsStore((s) => s.viewResetRequested);
    const clearViewReset = useLightsStore((s) => s.clearViewReset);
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
            <ambientLight intensity={0.4} color="#b4d7ff" />
            <directionalLight position={[5, 10, 5]} intensity={0.5} color="#fff5e6" />
            <directionalLight position={[-5, 5, 5]} intensity={0.3} color="#a8d8ff" />
            <pointLight position={[0, 0, 5]} intensity={0.4} color="#ffebcd" />

            {/* Game */}
            <LightsGame />

            {/* Controls */}
            <OrbitControls
                ref={controlsRef}
                makeDefault
                enableDamping
                dampingFactor={0.05}
                minDistance={4}
                maxDistance={12}
                minPolarAngle={Math.PI / 3}
                maxPolarAngle={Math.PI / 1.5}
                enablePan={false}
            />
        </>
    );
}

export const Lights = ({ onBack }: LightsProps) => {
    const initGame = useLightsStore((s) => s.initGame);

    useEffect(() => {
        initGame();
    }, [initGame]);

    return (
        <div className="w-full h-full relative game-screen bg-gradient-to-b from-[#0a1628] via-[#0f2937] to-[#1a3a4a]">
            <LightsUI onBack={onBack} />
            <Canvas
                camera={{ position: [0, 0, 6], fov: 50 }}
                gl={{ alpha: true }}
                style={{ background: 'transparent' }}
            >
                <LightsScene />
            </Canvas>
        </div>
    );
};
