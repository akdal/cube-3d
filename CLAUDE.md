# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Deployment

**Production Domain**: `3d-puzzle-roha.vercel.app`

⚠️ **IMPORTANT**: Always deploy to this domain only. Do NOT deploy to other domains like `cube-3d-ten.vercel.app`.

```bash
# Deploy to production
npx vercel --prod --yes
```

## Commands

```bash
npm run dev      # Start development server (Vite)
npm run build    # TypeScript check + Vite build
npm run lint     # ESLint check
npm run preview  # Preview production build
```

## Architecture

This is a 3D Rubik's Cube game built with React Three Fiber and TypeScript.

### Tech Stack
- **Rendering**: React Three Fiber (@react-three/fiber) with Three.js
- **3D Helpers**: @react-three/drei (OrbitControls, RoundedBox)
- **State**: Zustand with persist middleware (localStorage)
- **Styling**: Tailwind CSS v4
- **Build**: Vite

### Core Structure

```
src/
├── store/useStore.ts    # Central game state (cubies, animations, leaderboard)
├── components/
│   ├── Cube.tsx         # Main cube group, keyboard controls, animation loop
│   ├── Cubie.tsx        # Individual cubie rendering with 6-face colors
│   ├── UI.tsx           # HUD overlay (timer, moves, scramble/reset buttons)
│   └── GameBackground.tsx
├── hooks/
│   └── useCubeInteraction.ts  # Drag-to-rotate gesture handling
└── utils/math.ts        # 90° rotation transforms for vectors and quaternions
```

### State Model (useStore.ts)

The Zustand store manages:
- `cubies[]`: 27 cubie states with position, quaternion rotation, and original position
- `animation`: Current rotation animation (axis, layer, direction, progress)
- `scrambleQueue`: Queue for scramble animations
- `gameStatus`: 'IDLE' | 'RUNNING' | 'SOLVED'
- `leaderboard`: Top 5 solve times (persisted)
- `theme`: 'dark' | 'light' | 'blue' (persisted)

Key actions: `triggerRotation()`, `finishRotation()`, `scramble()`, `resetGame()`

### Rotation System

Cube rotations are layer-based on X/Y/Z axes:
- Layer values: -1, 0, 1 (corresponding to cube slices)
- Direction: 1 or -1 (90° clockwise/counter-clockwise)
- `rotateVector()` and `rotateQuaternion()` in utils/math.ts handle the 90° transforms
- Animation interpolation happens in Cube.tsx's useFrame loop

### Interaction

- **Keyboard**: R/L/U/D/F/B keys rotate corresponding faces
- **Mouse**: Drag on cube faces to rotate layers (handled by useCubeInteraction)
- **Camera**: OrbitControls for scene rotation (click on background)

### Color Scheme

Standard Rubik's cube colors defined in Cubie.tsx:
- U (top): White, D (bottom): Yellow
- R (right): Red, L (left): Orange
- F (front): Green, B (back): Blue
