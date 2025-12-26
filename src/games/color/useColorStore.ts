import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface RGB {
    r: number;
    g: number;
    b: number;
}

type Difficulty = 'easy' | 'medium' | 'hard';

interface LeaderboardEntry {
    time: number;
    moves: number;
    level: number;
    accuracy: number;
    difficulty: Difficulty;
    date: string;
}

interface ColorState {
    // Game state
    targetColor: RGB;
    currentColor: RGB;
    availableColors: RGB[];
    selectedColor: number | null;
    level: number;
    moveCount: number;
    difficulty: Difficulty;

    // Solution tracking (for hints)
    solutionPath: number[];
    currentHintStep: number;
    minMoves: number;

    // Game status
    gameStatus: 'IDLE' | 'PLAYING' | 'SOLVED';
    startTime: number | null;
    accuracy: number;

    // Hint
    hintCount: number;
    hintColorIndex: number | null;

    // Settings & records
    leaderboard: LeaderboardEntry[];

    // View reset
    viewResetRequested: boolean;
}

interface ColorActions {
    initGame: () => void;
    selectColor: (index: number) => void;
    mixColor: () => void;
    resetMix: () => void;
    nextLevel: () => void;
    showHint: () => void;
    setDifficulty: (difficulty: Difficulty) => void;
    requestViewReset: () => void;
    clearViewReset: () => void;
}

// Predefined vibrant colors for mixing (brighter, more saturated)
const BASE_COLORS: RGB[] = [
    { r: 245, g: 95, b: 85 },   // Vibrant Coral Red
    { r: 85, g: 155, b: 235 },  // Bright Sky Blue
    { r: 255, g: 220, b: 80 },  // Sunny Yellow
    { r: 255, g: 255, b: 255 }, // White
    { r: 65, g: 70, b: 85 },    // Soft Charcoal
];

const rgbToHex = (rgb: RGB): string => {
    return `#${rgb.r.toString(16).padStart(2, '0')}${rgb.g.toString(16).padStart(2, '0')}${rgb.b.toString(16).padStart(2, '0')}`;
};

const mixColors = (color1: RGB, color2: RGB): RGB => {
    return {
        r: Math.round((color1.r + color2.r) / 2),
        g: Math.round((color1.g + color2.g) / 2),
        b: Math.round((color1.b + color2.b) / 2),
    };
};

const colorDistance = (c1: RGB, c2: RGB): number => {
    const dr = c1.r - c2.r;
    const dg = c1.g - c2.g;
    const db = c1.b - c2.b;
    return Math.sqrt(dr * dr + dg * dg + db * db);
};

const calculateAccuracy = (current: RGB, target: RGB): number => {
    const maxDistance = Math.sqrt(255 * 255 * 3); // Max possible distance
    const distance = colorDistance(current, target);
    return Math.max(0, Math.round((1 - distance / maxDistance) * 100));
};

// Difficulty settings: [numColors, minMoves, maxMoves]
const DIFFICULTY_SETTINGS: Record<Difficulty, { numColors: number; minMoves: number; maxMoves: number }> = {
    easy: { numColors: 3, minMoves: 4, maxMoves: 5 },     // 81-243 combinations
    medium: { numColors: 3, minMoves: 5, maxMoves: 6 },   // 243-729 combinations
    hard: { numColors: 4, minMoves: 6, maxMoves: 7 },     // 4096-16384 combinations
};

const generateTarget = (difficulty: Difficulty): { target: RGB; available: RGB[]; solutionPath: number[]; minMoves: number } => {
    const settings = DIFFICULTY_SETTINGS[difficulty];
    const shuffled = [...BASE_COLORS].sort(() => Math.random() - 0.5);
    const available = shuffled.slice(0, settings.numColors);

    // Start from white (same as game start)
    let target: RGB = { r: 255, g: 255, b: 255 };
    const solutionPath: number[] = [];

    // Determine number of mixing steps
    const steps = settings.minMoves + Math.floor(Math.random() * (settings.maxMoves - settings.minMoves + 1));

    // Generate solution path and target
    for (let i = 0; i < steps; i++) {
        const colorIndex = Math.floor(Math.random() * settings.numColors);
        solutionPath.push(colorIndex);
        target = mixColors(target, available[colorIndex]);
    }

    return { target, available, solutionPath, minMoves: steps };
};

export const useColorStore = create<ColorState & ColorActions>()(
    persist(
        (set, get) => ({
            targetColor: { r: 128, g: 128, b: 128 },
            currentColor: { r: 255, g: 255, b: 255 },
            availableColors: BASE_COLORS.slice(0, 3),
            selectedColor: null,
            level: 1,
            moveCount: 0,
            difficulty: 'easy' as Difficulty,
            solutionPath: [],
            currentHintStep: 0,
            minMoves: 2,
            gameStatus: 'IDLE',
            startTime: null,
            accuracy: 0,
            hintCount: 0,
            hintColorIndex: null,
            leaderboard: [],
            viewResetRequested: false,

            initGame: () => {
                const { target, available, solutionPath, minMoves } = generateTarget(get().difficulty);
                set({
                    targetColor: target,
                    currentColor: { r: 255, g: 255, b: 255 }, // Start with white
                    availableColors: available,
                    solutionPath,
                    currentHintStep: 0,
                    minMoves,
                    selectedColor: null,
                    moveCount: 0,
                    gameStatus: 'IDLE',
                    startTime: null,
                    accuracy: 0,
                    hintCount: 0,
                    hintColorIndex: null,
                });
            },

            selectColor: (index: number) => {
                const state = get();
                if (state.gameStatus === 'SOLVED') return;

                set({ selectedColor: index, hintColorIndex: null });
            },

            mixColor: () => {
                const state = get();
                if (state.selectedColor === null || state.gameStatus === 'SOLVED') return;

                const isFirstMove = state.gameStatus === 'IDLE';
                const selectedRGB = state.availableColors[state.selectedColor];
                const newColor = mixColors(state.currentColor, selectedRGB);
                const accuracy = calculateAccuracy(newColor, state.targetColor);
                const solved = accuracy >= 95; // 95% accuracy = solved
                const newStartTime = isFirstMove ? Date.now() : state.startTime;

                // Check if user followed the hint and advance hint step
                let newHintStep = state.currentHintStep;
                if (state.solutionPath[state.currentHintStep] === state.selectedColor) {
                    newHintStep = state.currentHintStep + 1;
                }

                let newLeaderboard = state.leaderboard;
                if (solved && newStartTime) {
                    const time = (Date.now() - newStartTime) / 1000;
                    newLeaderboard = [
                        ...state.leaderboard,
                        {
                            time,
                            moves: state.moveCount + 1,
                            level: state.level,
                            accuracy,
                            difficulty: state.difficulty,
                            date: new Date().toISOString()
                        }
                    ].sort((a, b) => b.accuracy - a.accuracy || a.moves - b.moves).slice(0, 10);
                }

                set({
                    currentColor: newColor,
                    moveCount: state.moveCount + 1,
                    accuracy,
                    gameStatus: solved ? 'SOLVED' : 'PLAYING',
                    startTime: newStartTime,
                    selectedColor: null,
                    currentHintStep: newHintStep,
                    leaderboard: newLeaderboard,
                    hintColorIndex: null,
                });
            },

            resetMix: () => {
                set({
                    currentColor: { r: 255, g: 255, b: 255 },
                    selectedColor: null,
                    moveCount: 0,
                    accuracy: 0,
                    gameStatus: 'IDLE',
                    startTime: null,
                    currentHintStep: 0,
                    hintColorIndex: null,
                });
            },

            showHint: () => {
                const state = get();
                if (state.gameStatus === 'SOLVED') return;

                // Use the solution path to show the correct next step
                const nextStep = state.currentHintStep;

                // If we haven't deviated from the path, show the next color in solution
                if (nextStep < state.solutionPath.length) {
                    const hintIndex = state.solutionPath[nextStep];

                    set({
                        hintColorIndex: hintIndex,
                        hintCount: state.hintCount + 1,
                        selectedColor: null,
                    });
                } else {
                    // If already past the solution path (user took different route),
                    // use greedy approach as fallback
                    let bestIndex = 0;
                    let bestAccuracy = 0;

                    state.availableColors.forEach((color, index) => {
                        const mixed = mixColors(state.currentColor, color);
                        const acc = calculateAccuracy(mixed, state.targetColor);
                        if (acc > bestAccuracy) {
                            bestAccuracy = acc;
                            bestIndex = index;
                        }
                    });

                    set({
                        hintColorIndex: bestIndex,
                        hintCount: state.hintCount + 1,
                        selectedColor: null,
                    });
                }

                // Clear hint after 1.5 seconds
                setTimeout(() => {
                    set({ hintColorIndex: null });
                }, 1500);
            },

            nextLevel: () => {
                set((state) => ({ level: state.level + 1 }));
                get().initGame();
            },

            setDifficulty: (difficulty: Difficulty) => {
                set({ difficulty, level: 1 });
                get().initGame();
            },

            requestViewReset: () => set({ viewResetRequested: true }),
            clearViewReset: () => set({ viewResetRequested: false }),
        }),
        {
            name: 'color-storage',
            partialize: (state) => ({
                leaderboard: state.leaderboard,
                level: state.level,
                difficulty: state.difficulty,
            }),
        }
    )
);

export { rgbToHex, calculateAccuracy, DIFFICULTY_SETTINGS };
export type { Difficulty };
