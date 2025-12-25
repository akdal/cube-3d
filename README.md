# 3D Puzzle Games Collection

A collection of four interactive 3D puzzle games built with React Three Fiber and TypeScript.

## Games

### 1. Rubik's Cube
Classic 3D Rubik's Cube with mouse drag and keyboard controls.
- **Controls**: Click and drag faces to rotate, or use R/L/U/D/F/B keys
- **Features**: Auto-scramble, timer, move counter, leaderboard
- **Hint System**: Reverses scramble moves to guide you to solution

### 2. Tower of Hanoi (하노이 탑)
Move all disks from the first peg to the last peg.
- **Rules**: Only one disk at a time, larger disk can't go on smaller disk
- **Features**: Configurable difficulty (3-7 disks), move counter, leaderboard
- **Hint System**: Shows optimal next move using recursive algorithm

### 3. Memory Cards (메모리 카드)
Match pairs of cards with the same symbol.
- **Features**: 4x4 grid (8 pairs), flip counter, leaderboard
- **Hint System**: Highlights matching pairs with glow effect (without revealing content)

### 4. Slide Puzzle (슬라이드 퍼즐)
Arrange numbered tiles in order by sliding them.
- **Features**: 3x3 grid, move counter, leaderboard
- **Hint System**: BFS solver shows which tile to move next

## Features

- **3D Graphics**: Powered by React Three Fiber and Three.js
- **Persistent State**: Game progress and leaderboards saved to localStorage
- **Hint System**: Each game includes intelligent hints (tracks usage count)
- **Confetti Effects**: Celebration animation when games are completed
- **Responsive Design**: Works on desktop and mobile devices
- **Korean + English**: Bilingual UI support

## Tech Stack

- **Framework**: React 18 with TypeScript
- **3D Rendering**: React Three Fiber (@react-three/fiber)
- **3D Helpers**: @react-three/drei (OrbitControls, RoundedBox, Text3D)
- **State Management**: Zustand with persist middleware
- **Styling**: Tailwind CSS v4
- **Build Tool**: Vite
- **Deployment**: Vercel

## Development

```bash
npm install      # Install dependencies
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Recent Updates

### Hint System (2025-12-25)
Added comprehensive hint system to all four games:
- Tower of Hanoi: Recursive optimal solution algorithm
- Memory Cards: Matching pair finder with visual highlights
- Slide Puzzle: BFS solver for step-by-step guidance
- Rubik's Cube: Scramble move reversal system

Hint usage is tracked and displayed in leaderboards alongside time and move counts.

## Architecture

```
src/
├── store/useStore.ts              # Rubik's Cube state
├── components/
│   ├── Cube.tsx                   # Main cube component
│   ├── Cubie.tsx                  # Individual cube piece
│   ├── UI.tsx                     # Rubik's Cube UI overlay
│   └── GameBackground.tsx         # Shared background
├── games/
│   ├── hanoi/                     # Tower of Hanoi game
│   ├── memory/                    # Memory Cards game
│   └── puzzle/                    # Slide Puzzle game
└── hooks/
    └── useCubeInteraction.ts      # Cube drag interaction
```

Each game directory contains:
- `*Game.tsx` - Main game component with 3D scene
- `*UI.tsx` - UI overlay (timer, controls, leaderboard)
- `use*Store.ts` - Zustand state management
- Component files for game-specific 3D objects

## License

MIT
