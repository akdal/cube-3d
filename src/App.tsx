import { useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Vector3 } from 'three';
import { Cube } from './components/Cube';
import { UI } from './components/UI';
import { GameBackground } from './components/GameBackground';
import { useStore } from './store/useStore';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

const DEFAULT_CAMERA_POSITION = new Vector3(5, 5, 5);

function Scene() {
  const isDraggingCube = useStore((s) => s.isDraggingCube);
  const orbitLocked = useStore((s) => s.orbitLocked);
  const viewResetRequested = useStore((s) => s.viewResetRequested);
  const clearViewReset = useStore((s) => s.clearViewReset);

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
      <GameBackground />

      {/* Ambient light for even base illumination */}
      <ambientLight intensity={0.6} />

      {/* Key light - main light source */}
      <directionalLight
        position={[5, 8, 5]}
        intensity={0.8}
      />

      {/* Fill light - softer, from opposite side */}
      <directionalLight
        position={[-5, 3, -5]}
        intensity={0.5}
      />

      {/* Bottom fill light */}
      <directionalLight
        position={[0, -5, 3]}
        intensity={0.3}
      />

      <Cube />

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.05}
        minDistance={4}
        maxDistance={15}
        enabled={!isDraggingCube && !orbitLocked}
      />
    </>
  );
}

function App() {
  return (
    <div className="w-full h-full relative">
      <UI />

      <Canvas camera={{ position: [5, 5, 5], fov: 50 }} shadows>
        <Scene />
      </Canvas>
    </div>
  );
}

export default App;
