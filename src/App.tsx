import { useRef, useEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { Vector3 } from 'three';
import { Cube } from './components/Cube';
import { UI } from './components/UI';
import { GameBackground } from './components/GameBackground';
import { useStore } from './store/useStore';
import { Hanoi } from './games/hanoi';
import { Puzzle } from './games/puzzle';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

type GameType = 'menu' | 'rubiks' | 'hanoi' | 'puzzle';

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
    <div className="w-full min-h-full bg-[#0a0a1a] flex items-center justify-center p-4 py-8 relative overflow-y-auto">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      <div className="text-center relative z-10">
        {/* Dedication */}
        <div className="mb-8">
          <div className="inline-block px-6 py-3 rounded-full bg-gradient-to-r from-pink-500/20 via-rose-500/20 to-pink-500/20 border border-pink-400/30 backdrop-blur-sm">
            <span className="text-xl sm:text-2xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-rose-300 to-pink-300 tracking-wide">
              for 로하
            </span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-5xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-violet-400 to-cyan-400 mb-4 tracking-tight">
          PUZZLE
        </h1>
        <p className="text-white/40 mb-10 sm:mb-14 text-sm tracking-widest uppercase">
          Select your challenge
        </p>

        {/* Game Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 max-w-2xl mx-auto">
          {/* Rubik's Cube */}
          <button
            onClick={() => onSelectGame('rubiks')}
            className="group relative bg-gradient-to-b from-white/[0.08] to-transparent backdrop-blur-sm border border-white/[0.08] rounded-2xl p-6 sm:p-7 transition-all duration-300 hover:border-orange-400/30 hover:bg-orange-500/5 hover:scale-[1.02] hover:-translate-y-1"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <span className="text-2xl sm:text-3xl">🎲</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mb-1.5">루빅스 큐브</h2>
              <p className="text-orange-300/70 text-xs font-medium mb-3">2×2, 3×3</p>
              <p className="text-white/40 text-xs leading-relaxed">
                모든 면의 색상을 맞추세요
              </p>
            </div>
          </button>

          {/* Hanoi Tower */}
          <button
            onClick={() => onSelectGame('hanoi')}
            className="group relative bg-gradient-to-b from-white/[0.08] to-transparent backdrop-blur-sm border border-white/[0.08] rounded-2xl p-6 sm:p-7 transition-all duration-300 hover:border-amber-400/30 hover:bg-amber-500/5 hover:scale-[1.02] hover:-translate-y-1"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <span className="text-2xl sm:text-3xl">🗼</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mb-1.5">하노이 탑</h2>
              <p className="text-amber-300/70 text-xs font-medium mb-3">3~7개 원반</p>
              <p className="text-white/40 text-xs leading-relaxed">
                모든 원반을 오른쪽으로 옮기세요
              </p>
            </div>
          </button>

          {/* Slide Puzzle */}
          <button
            onClick={() => onSelectGame('puzzle')}
            className="group relative bg-gradient-to-b from-white/[0.08] to-transparent backdrop-blur-sm border border-white/[0.08] rounded-2xl p-6 sm:p-7 transition-all duration-300 hover:border-cyan-400/30 hover:bg-cyan-500/5 hover:scale-[1.02] hover:-translate-y-1"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <span className="text-2xl sm:text-3xl">🧩</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mb-1.5">슬라이드 퍼즐</h2>
              <p className="text-cyan-300/70 text-xs font-medium mb-3">2×2, 3×3, 4×4</p>
              <p className="text-white/40 text-xs leading-relaxed">
                숫자를 순서대로 정렬하세요
              </p>
            </div>
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
    case 'puzzle':
      return <Puzzle onBack={handleBack} />;
    default:
      return <GameMenu onSelectGame={setCurrentGame} />;
  }
}

export default App;
