import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { rotateVector, rotateQuaternion, type Axis } from '../utils/math';
import { Quaternion } from 'three';

interface CubieState {
    id: number;
    position: [number, number, number];
    rotation: [number, number, number, number];
    originalPosition: [number, number, number];
}

interface AnimationState {
    isAnimating: boolean;
    axis: Axis | null;
    layer: number | null;
    direction: 1 | -1 | 0;
    speed: number;
}

interface LeaderboardEntry {
    time: number;
    moves: number;
    date: string;
    hintCount?: number;
}

interface HintMove {
    axis: Axis;
    layer: number;
    direction: 1 | -1;
}

interface GameState {
    cubies: CubieState[];
    cubeSize: 2 | 3;
    difficulty: 'easy' | 'medium' | 'hard';
    isSolving: boolean;
    gameStatus: 'IDLE' | 'RUNNING' | 'SOLVED';
    startTime: number | null;
    moveCount: number;
    animation: AnimationState;
    scrambleQueue: { axis: Axis, layer: number, direction: 1 | -1 }[];
    leaderboard: LeaderboardEntry[];
    theme: 'dark' | 'light' | 'blue';
    isDraggingCube: boolean;
    isHoveringCube: boolean;
    invertControls: boolean;
    orbitLocked: boolean;
    cubeLocked: boolean;
    viewResetRequested: boolean;
    // Hint system
    solutionMoves: HintMove[];
    solutionIndex: number;
    hintActive: boolean;
    hintMove: HintMove | null;
    hintCount: number;
}

interface Action {
    initCube: () => void;
    triggerRotation: (axis: Axis, layer: number, direction: 1 | -1, speed?: number) => void;
    finishRotation: () => void;
    scramble: () => void;
    resetGame: () => void;
    setCubeSize: (size: 2 | 3) => void;
    setDifficulty: (difficulty: 'easy' | 'medium' | 'hard') => void;
    setTheme: (theme: 'dark' | 'light' | 'blue') => void;
    setIsDraggingCube: (isDragging: boolean) => void;
    setIsHoveringCube: (isHovering: boolean) => void;
    toggleInvertControls: () => void;
    toggleOrbitLock: () => void;
    toggleCubeLock: () => void;
    requestViewReset: () => void;
    clearViewReset: () => void;
    showHint: () => void;
    clearHint: () => void;
}

const generateCubies = (size: 2 | 3): CubieState[] => {
    const cubies: CubieState[] = [];
    let id = 0;

    if (size === 2) {
        // 2x2 cube: positions at -0.5 and 0.5
        for (const x of [-0.5, 0.5]) {
            for (const y of [-0.5, 0.5]) {
                for (const z of [-0.5, 0.5]) {
                    cubies.push({
                        id: id++,
                        position: [x, y, z],
                        rotation: [0, 0, 0, 1],
                        originalPosition: [x, y, z]
                    });
                }
            }
        }
    } else {
        // 3x3 cube: positions at -1, 0, 1
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                for (let z = -1; z <= 1; z++) {
                    cubies.push({
                        id: id++,
                        position: [x, y, z],
                        rotation: [0, 0, 0, 1],
                        originalPosition: [x, y, z]
                    });
                }
            }
        }
    }
    return cubies;
};

const DIFFICULTY_MOVES = {
    easy: 5,
    medium: 15,
    hard: 25
};

const checkSolved = (cubies: CubieState[]): boolean => {
    for (const c of cubies) {
        const dx = Math.abs(c.position[0] - c.originalPosition[0]);
        const dy = Math.abs(c.position[1] - c.originalPosition[1]);
        const dz = Math.abs(c.position[2] - c.originalPosition[2]);
        if (dx > 0.1 || dy > 0.1 || dz > 0.1) return false;
        const q = new Quaternion(...c.rotation);
        if (Math.abs(q.dot(new Quaternion(0, 0, 0, 1))) < 0.95) return false;
    }
    return true;
};

export const useStore = create<GameState & Action>()(
    persist(
        (set, get) => ({
            cubies: generateCubies(3),
            cubeSize: 3,
            difficulty: 'medium',
            isSolving: false,
            gameStatus: 'IDLE',
            startTime: null,
            moveCount: 0,
            animation: { isAnimating: false, axis: null, layer: null, direction: 0, speed: 1 },
            scrambleQueue: [],
            leaderboard: [],
            theme: 'dark',
            isDraggingCube: false,
            isHoveringCube: false,
            invertControls: false,
            orbitLocked: false,
            cubeLocked: false,
            viewResetRequested: false,
            solutionMoves: [],
            solutionIndex: 0,
            hintActive: false,
            hintMove: null,
            hintCount: 0,

            initCube: () => set((state) => ({ cubies: generateCubies(state.cubeSize) })),

            setTheme: (theme) => set({ theme }),

            setCubeSize: (size) => set({
                cubeSize: size,
                cubies: generateCubies(size),
                gameStatus: 'IDLE',
                startTime: null,
                moveCount: 0,
                isSolving: false,
                animation: { isAnimating: false, axis: null, layer: null, direction: 0, speed: 1 },
                scrambleQueue: [],
                solutionMoves: [],
                solutionIndex: 0,
                hintActive: false,
                hintMove: null,
                hintCount: 0,
            }),

            setDifficulty: (difficulty) => set({ difficulty }),

            setIsDraggingCube: (isDragging) => set({ isDraggingCube: isDragging }),
            setIsHoveringCube: (isHovering) => set({ isHoveringCube: isHovering }),

            toggleInvertControls: () => set((state) => ({ invertControls: !state.invertControls })),

            toggleOrbitLock: () => set((state) => ({ orbitLocked: !state.orbitLocked })),

            toggleCubeLock: () => set((state) => ({ cubeLocked: !state.cubeLocked })),

            requestViewReset: () => set({ viewResetRequested: true }),

            clearViewReset: () => set({ viewResetRequested: false }),

            triggerRotation: (axis, layer, direction, speed = 1) => {
                const state = get();
                if (state.animation.isAnimating) return;

                if (state.gameStatus === 'IDLE' && state.scrambleQueue.length === 0) {
                    set({ gameStatus: 'RUNNING', startTime: Date.now(), isSolving: true });
                }

                set({ animation: { isAnimating: true, axis, layer, direction, speed } });
            },

            finishRotation: () => set((state) => {
                const { axis, layer, direction } = state.animation;
                if (!axis || layer === null || direction === 0) return { animation: { ...state.animation, isAnimating: false } };

                const newCubies = state.cubies.map((cubie) => {
                    const currentPos = cubie.position;
                    const posVal = axis === 'x' ? currentPos[0] : axis === 'y' ? currentPos[1] : currentPos[2];

                    // Use tolerance for layer matching (works for both 2x2 and 3x3)
                    if (Math.abs(posVal - layer) < 0.1) {
                        return {
                            ...cubie,
                            position: rotateVector(cubie.position, axis, direction),
                            rotation: rotateQuaternion(cubie.rotation, axis, direction)
                        };
                    }
                    return cubie;
                });

                const solved = state.scrambleQueue.length === 0 && state.gameStatus === 'RUNNING' && checkSolved(newCubies);

                // Handle Persistence only on SOLVED
                let newLeaderboard = state.leaderboard;
                if (solved && state.startTime) {
                    const time = (Date.now() - state.startTime) / 1000;
                    newLeaderboard = [...state.leaderboard, {
                        time,
                        moves: state.moveCount + 1,
                        date: new Date().toISOString(),
                        hintCount: state.hintCount
                    }].sort((a, b) => a.time - b.time).slice(0, 5);
                }

                // Check if this was a user move (not a scramble move)
                const isUserMove = state.scrambleQueue.length === 0 && state.gameStatus === 'RUNNING';

                let nextScramble = state.scrambleQueue;
                let nextAnimation: AnimationState = { isAnimating: false, axis: null, layer: null, direction: 0, speed: 1 };

                if (state.scrambleQueue.length > 0) {
                    const [move, ...rest] = state.scrambleQueue;
                    nextScramble = rest;
                    if (move) {
                        nextAnimation = {
                            isAnimating: true,
                            axis: move.axis,
                            layer: move.layer,
                            direction: move.direction,
                            speed: 5
                        };
                    }
                }

                return {
                    cubies: newCubies,
                    moveCount: isUserMove ? state.moveCount + 1 : state.moveCount,
                    gameStatus: solved ? 'SOLVED' : state.gameStatus,
                    isSolving: solved ? false : state.isSolving,
                    scrambleQueue: nextScramble,
                    animation: nextAnimation,
                    leaderboard: newLeaderboard,
                    hintActive: false,
                    hintMove: null,
                    solutionIndex: isUserMove ? state.solutionIndex + 1 : state.solutionIndex,
                };
            }),

            scramble: () => {
                const state = get();
                const count = DIFFICULTY_MOVES[state.difficulty];
                const moves: { axis: Axis, layer: number, direction: 1 | -1 }[] = [];

                // Generate layers based on cube size
                const layers = state.cubeSize === 2 ? [-0.5, 0.5] : [-1, 0, 1];

                for (let i = 0; i < count; i++) {
                    const axes: Axis[] = ['x', 'y', 'z'];
                    const axis = axes[Math.floor(Math.random() * 3)];
                    const layer = layers[Math.floor(Math.random() * layers.length)];
                    const direction = Math.random() > 0.5 ? 1 : -1;
                    moves.push({ axis, layer, direction: direction as 1 | -1 });
                }

                // Create solution moves (reverse order, opposite direction)
                const solutionMoves: HintMove[] = moves.slice().reverse().map(move => ({
                    axis: move.axis,
                    layer: move.layer,
                    direction: (move.direction * -1) as 1 | -1
                }));

                set({
                    gameStatus: 'IDLE',
                    moveCount: 0,
                    startTime: null,
                    isSolving: false,
                    cubies: generateCubies(state.cubeSize),
                    scrambleQueue: moves,
                    solutionMoves,
                    solutionIndex: 0,
                    hintActive: false,
                    hintMove: null,
                    hintCount: 0,
                });

                const first = moves[0];
                if (first) {
                    set((s) => ({
                        scrambleQueue: moves.slice(1),
                        animation: { ...s.animation, isAnimating: true, axis: first.axis, layer: first.layer, direction: first.direction, speed: 5 }
                    }));
                }
            },

            resetGame: () => set((state) => ({
                cubies: generateCubies(state.cubeSize),
                gameStatus: 'IDLE',
                startTime: null,
                moveCount: 0,
                animation: { isAnimating: false, axis: null, layer: null, direction: 0, speed: 1 },
                scrambleQueue: [],
                solutionMoves: [],
                solutionIndex: 0,
                hintActive: false,
                hintMove: null,
                hintCount: 0,
            })),

            showHint: () => {
                const state = get();
                if (state.gameStatus === 'SOLVED' || state.hintActive || state.animation.isAnimating) return;
                if (state.solutionMoves.length === 0) return; // No solution available

                // Get next solution move (accounting for user's progress)
                const nextMove = state.solutionMoves[state.solutionIndex];
                if (!nextMove) return; // Already solved or past solution

                set({
                    hintActive: true,
                    hintMove: nextMove,
                    hintCount: state.hintCount + 1,
                });

                // Auto-clear hint after 3 seconds
                setTimeout(() => {
                    const currentState = get();
                    if (currentState.hintActive) {
                        set({ hintActive: false, hintMove: null });
                    }
                }, 3000);
            },

            clearHint: () => {
                set({ hintActive: false, hintMove: null });
            },
        }),
        {
            name: 'rubiks3d-storage',
            partialize: (state) => ({
                leaderboard: state.leaderboard,
                theme: state.theme,
                invertControls: state.invertControls,
                cubeSize: state.cubeSize,
                difficulty: state.difficulty
            }),
        }
    )
);
