import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LeaderboardEntry {
    time: number;
    moves: number;
    gridSize: number;
    level: number;
    date: string;
}

interface LightsState {
    // Game state
    grid: boolean[][]; // true = light on, false = light off
    gridSize: number;
    level: number;
    moveCount: number;

    // Game status
    gameStatus: 'IDLE' | 'PLAYING' | 'SOLVED';
    startTime: number | null;

    // Settings & records
    leaderboard: LeaderboardEntry[];

    // View reset
    viewResetRequested: boolean;
}

interface LightsActions {
    initGame: (gridSize?: number) => void;
    setGridSize: (size: number) => void;
    toggleLight: (row: number, col: number) => void;
    nextLevel: () => void;
    requestViewReset: () => void;
    clearViewReset: () => void;
}

// Generate a solvable puzzle by starting from solved state and making random moves
const generatePuzzle = (size: number, moves: number): boolean[][] => {
    // Start with all lights off (solved state)
    const grid: boolean[][] = Array(size).fill(null).map(() => Array(size).fill(false));

    // Make random moves to create puzzle
    for (let i = 0; i < moves; i++) {
        const row = Math.floor(Math.random() * size);
        const col = Math.floor(Math.random() * size);
        toggleCell(grid, row, col, size);
    }

    // Make sure at least some lights are on
    const hasLightsOn = grid.some(row => row.some(cell => cell));
    if (!hasLightsOn) {
        // Toggle center if no lights on
        const center = Math.floor(size / 2);
        toggleCell(grid, center, center, size);
    }

    return grid;
};

const toggleCell = (grid: boolean[][], row: number, col: number, size: number) => {
    // Toggle clicked cell and adjacent cells
    const toggles = [
        [row, col],
        [row - 1, col],
        [row + 1, col],
        [row, col - 1],
        [row, col + 1],
    ];

    toggles.forEach(([r, c]) => {
        if (r >= 0 && r < size && c >= 0 && c < size) {
            grid[r][c] = !grid[r][c];
        }
    });
};

const checkSolved = (grid: boolean[][]): boolean => {
    return grid.every(row => row.every(cell => !cell));
};

export const useLightsStore = create<LightsState & LightsActions>()(
    persist(
        (set, get) => ({
            grid: [],
            gridSize: 3,
            level: 1,
            moveCount: 0,
            gameStatus: 'IDLE',
            startTime: null,
            leaderboard: [],
            viewResetRequested: false,

            initGame: (gridSize?: number) => {
                const size = gridSize ?? get().gridSize;
                const level = get().level;
                // More moves = harder puzzle
                const puzzleMoves = 3 + level * 2;
                const grid = generatePuzzle(size, puzzleMoves);

                set({
                    grid,
                    gridSize: size,
                    moveCount: 0,
                    gameStatus: 'IDLE',
                    startTime: null,
                });
            },

            setGridSize: (size: number) => {
                set({ gridSize: size, level: 1 });
                get().initGame(size);
            },

            toggleLight: (row: number, col: number) => {
                const state = get();
                if (state.gameStatus === 'SOLVED') return;

                const newGrid = state.grid.map(r => [...r]);
                const size = state.gridSize;

                toggleCell(newGrid, row, col, size);

                const isFirstMove = state.gameStatus === 'IDLE';
                const solved = checkSolved(newGrid);
                const newMoveCount = state.moveCount + 1;

                let newLeaderboard = state.leaderboard;
                if (solved && state.startTime) {
                    const time = (Date.now() - (isFirstMove ? Date.now() : state.startTime)) / 1000;
                    newLeaderboard = [
                        ...state.leaderboard,
                        {
                            time,
                            moves: newMoveCount,
                            gridSize: size,
                            level: state.level,
                            date: new Date().toISOString()
                        }
                    ].sort((a, b) => a.moves - b.moves || a.time - b.time).slice(0, 10);
                }

                set({
                    grid: newGrid,
                    moveCount: newMoveCount,
                    gameStatus: solved ? 'SOLVED' : 'PLAYING',
                    startTime: isFirstMove ? Date.now() : state.startTime,
                    leaderboard: newLeaderboard,
                });
            },

            nextLevel: () => {
                set((state) => ({ level: state.level + 1 }));
                get().initGame();
            },

            requestViewReset: () => set({ viewResetRequested: true }),
            clearViewReset: () => set({ viewResetRequested: false }),
        }),
        {
            name: 'lights-storage',
            partialize: (state) => ({
                leaderboard: state.leaderboard,
                gridSize: state.gridSize,
            }),
        }
    )
);
