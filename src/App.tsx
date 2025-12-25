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
import { Memory } from './games/memory';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

type GameType = 'menu' | 'rubiks' | 'hanoi' | 'puzzle' | 'memory';

const DEFAULT_CAMERA_POSITION = new Vector3(5, 5, 5);

function RubiksScene() {
  const isDraggingCube = useStore((s) => s.isDraggingCube);
  const isHoveringCube = useStore((s) => s.isHoveringCube);
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
        enabled={!isDraggingCube && !isHoveringCube && !orbitLocked}
      />
    </>
  );
}

interface RubiksGameProps {
  onBack: () => void;
}

function RubiksGame({ onBack }: RubiksGameProps) {
  return (
    <div className="w-full h-full relative game-screen">
      <UI onBack={onBack} />
      <Canvas camera={{ position: [5, 5, 5], fov: 50 }} shadows>
        <RubiksScene />
      </Canvas>
    </div>
  );
}

// Snowflake component for background animation
function Snowflake({ style, emoji = '❄️' }: { style: React.CSSProperties; emoji?: string }) {
  return (
    <div
      className="absolute animate-snowfall pointer-events-none"
      style={style}
    >
      {emoji}
    </div>
  );
}

interface GameMenuProps {
  onSelectGame: (game: GameType) => void;
}

function GameMenu({ onSelectGame }: GameMenuProps) {
  // Generate random snowflakes with varied sizes and speeds
  const snowflakes = [...Array(50)].map((_, i) => ({
    left: `${Math.random() * 100}%`,
    top: `-${Math.random() * 20}%`,
    fontSize: `${Math.random() * 14 + 10}px`,
    animationDelay: `${Math.random() * 8}s`,
    animationDuration: `${Math.random() * 8 + 8}s`,
    opacity: Math.random() * 0.4 + 0.2,
    emoji: i % 5 === 0 ? '❅' : i % 7 === 0 ? '✦' : '❄️',
  }));

  return (
    <div className="w-full min-h-full bg-gradient-to-b from-[#0a1628] via-[#0f2937] to-[#1a3a4a] flex items-center justify-center p-4 py-8 relative overflow-y-auto">
      {/* Animated winter background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Aurora-like glow */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-gradient-to-b from-green-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-10 right-1/4 w-[400px] h-[250px] bg-gradient-to-b from-blue-500/10 via-purple-500/5 to-transparent rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />

        {/* Christmas lights glow */}
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-red-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-1/3 right-1/3 w-48 h-48 bg-green-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />

        {/* Snowflakes */}
        {snowflakes.map((sf, i) => (
          <Snowflake key={i} style={sf} emoji={sf.emoji} />
        ))}
      </div>

      {/* Stars overlay */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(2px 2px at 20px 30px, white, transparent),
                           radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
                           radial-gradient(1px 1px at 90px 40px, white, transparent),
                           radial-gradient(2px 2px at 160px 120px, rgba(255,255,255,0.9), transparent),
                           radial-gradient(1px 1px at 230px 80px, white, transparent)`,
          backgroundSize: '250px 150px',
        }}
      />

      <div className="text-center relative z-10">
        {/* Season's Greetings */}
        <div className="mb-3 text-2xl">
          <span className="animate-pulse">⭐</span>
        </div>

        {/* Dedication - Enhanced */}
        <div className="mb-6">
          <div className="inline-block px-8 py-4 rounded-2xl bg-gradient-to-r from-red-500/20 via-green-500/20 to-red-500/20 border border-white/20 backdrop-blur-sm shadow-lg">
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl">🎄</span>
              <span className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-300 via-white to-green-300 tracking-wide">
                for 로하
              </span>
              <span className="text-2xl">🎄</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-5xl sm:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-white to-green-400 mb-3 tracking-tight drop-shadow-lg">
          PUZZLE
        </h1>

        {/* Holiday subtitle */}
        <div className="flex items-center justify-center gap-2 mb-8 sm:mb-10">
          <span className="text-yellow-300/80">✦</span>
          <p className="text-cyan-200/60 text-sm tracking-widest uppercase">
            Happy Holidays & New Year 2026
          </p>
          <span className="text-yellow-300/80">✦</span>
        </div>

        {/* Game Cards - 2 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 max-w-2xl mx-auto">
          {/* Rubik's Cube */}
          <button
            onClick={() => onSelectGame('rubiks')}
            className="group relative bg-gradient-to-b from-white/[0.08] to-transparent backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-7 transition-all duration-300 hover:border-orange-400/40 hover:bg-orange-500/10 hover:scale-[1.02] hover:-translate-y-1"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                <span className="text-2xl sm:text-3xl">🎲</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mb-1.5">루빅스 큐브</h2>
              <p className="text-orange-300/70 text-xs font-medium mb-3">2×2, 3×3</p>
              <p className="text-cyan-100/40 text-xs leading-relaxed">
                모든 면의 색상을 맞추세요
              </p>
            </div>
          </button>

          {/* Hanoi Tower */}
          <button
            onClick={() => onSelectGame('hanoi')}
            className="group relative bg-gradient-to-b from-white/[0.08] to-transparent backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-7 transition-all duration-300 hover:border-amber-400/40 hover:bg-amber-500/10 hover:scale-[1.02] hover:-translate-y-1"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <span className="text-2xl sm:text-3xl">🗼</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mb-1.5">하노이 탑</h2>
              <p className="text-amber-300/70 text-xs font-medium mb-3">3~7개 원반</p>
              <p className="text-cyan-100/40 text-xs leading-relaxed">
                모든 원반을 하얀 기둥으로 옮기세요
              </p>
            </div>
          </button>

          {/* Slide Puzzle */}
          <button
            onClick={() => onSelectGame('puzzle')}
            className="group relative bg-gradient-to-b from-white/[0.08] to-transparent backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-7 transition-all duration-300 hover:border-cyan-400/40 hover:bg-cyan-500/10 hover:scale-[1.02] hover:-translate-y-1"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative">
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <span className="text-2xl sm:text-3xl">🧩</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mb-1.5">슬라이드 퍼즐</h2>
              <p className="text-cyan-300/70 text-xs font-medium mb-3">2×2, 3×3, 4×4</p>
              <p className="text-cyan-100/40 text-xs leading-relaxed">
                숫자를 순서대로 정렬하세요
              </p>
            </div>
          </button>

          {/* Memory Card - NEW */}
          <button
            onClick={() => onSelectGame('memory')}
            className="group relative bg-gradient-to-b from-white/[0.08] to-transparent backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-7 transition-all duration-300 hover:border-green-400/40 hover:bg-green-500/10 hover:scale-[1.02] hover:-translate-y-1"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            {/* NEW badge */}
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
              NEW
            </div>
            <div className="relative">
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                <span className="text-2xl sm:text-3xl">🎄</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mb-1.5">메모리 카드</h2>
              <p className="text-green-300/70 text-xs font-medium mb-3">4×4, 5×5</p>
              <p className="text-cyan-100/40 text-xs leading-relaxed">
                같은 그림의 카드 짝을 찾으세요
              </p>
            </div>
          </button>
        </div>

        {/* Footer decoration */}
        <div className="mt-10 flex items-center justify-center gap-4 text-white/30 text-sm">
          <span>❄️</span>
          <span>🎁</span>
          <span>⛄</span>
          <span>🦌</span>
          <span>🔔</span>
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
    case 'memory':
      return <Memory onBack={handleBack} />;
    default:
      return <GameMenu onSelectGame={setCurrentGame} />;
  }
}

export default App;
