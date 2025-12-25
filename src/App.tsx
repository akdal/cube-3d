import { useRef, useEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Vector3 } from 'three';
import { Cube } from './components/Cube';
import { UI } from './components/UI';
import { GameBackground } from './components/GameBackground';
import { useStore } from './store/useStore';
import { Hanoi } from './games/hanoi';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

type GameType = 'menu' | 'rubiks' | 'hanoi';

const DEFAULT_CAMERA_POSITION = new Vector3(5, 5, 5);

function RubiksScene() {
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

interface RubiksGameProps {
  onBack: () => void;
}

function RubiksGame({ onBack }: RubiksGameProps) {
  return (
    <div className="w-full h-full relative">
      <UI onBack={onBack} />
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }} shadows>
        <RubiksScene />
      </Canvas>
    </div>
  );
}

interface GameMenuProps {
  onSelectGame: (game: GameType) => void;
}

function GameMenu({ onSelectGame }: GameMenuProps) {
  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl sm:text-6xl font-bold text-white mb-4">
          3D Puzzle Games
        </h1>
        <p className="text-gray-400 mb-12 text-lg">Choose a game to play</p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          {/* Rubik's Cube */}
          <button
            onClick={() => onSelectGame('rubiks')}
            className="group bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-3xl p-8 transition-all hover:scale-105 hover:shadow-2xl"
          >
            <div className="text-6xl mb-4">🎲</div>
            <h2 className="text-2xl font-bold text-white mb-2">Rubik's Cube</h2>
            <p className="text-gray-400 text-sm">2×2 & 3×3 cubes</p>
            <p className="text-gray-500 text-xs mt-2">Drag to rotate faces</p>
          </button>

          {/* Hanoi Tower */}
          <button
            onClick={() => onSelectGame('hanoi')}
            className="group bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-3xl p-8 transition-all hover:scale-105 hover:shadow-2xl"
          >
            <div className="text-6xl mb-4">🗼</div>
            <h2 className="text-2xl font-bold text-white mb-2">Hanoi Tower</h2>
            <p className="text-gray-400 text-sm">3-7 disks</p>
            <p className="text-gray-500 text-xs mt-2">Click to move disks</p>
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [currentGame, setCurrentGame] = useState<GameType>('menu');

  const handleBack = () => setCurrentGame('menu');

  switch (currentGame) {
    case 'rubiks':
      return <RubiksGame onBack={handleBack} />;
    case 'hanoi':
      return <Hanoi onBack={handleBack} />;
    default:
      return <GameMenu onSelectGame={setCurrentGame} />;
  }
}

export default App;
