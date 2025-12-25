import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LeaderboardEntry {
    time: number;
    moves: number;
    gridSize: number;
    date: string;
}

interface PuzzleState {
    // Game state
    tiles: number[]; // 0 = empty, 1-3, 1-8, or 1-15 = tile numbers
    gridSize: 2 | 3 | 4;
    emptyIndex: number;
    moveCount: number;

    // Game status
    gameStatus: 'IDLE' | 'PLAYING' | 'SOLVED';
    startTime: number | null;

    // Animation
    animatingTile: number | null; // index of tile being animated

    // Settings & records
    leaderboard: LeaderboardEntry[];
}

interface PuzzleActions {
    initGame: (gridSize?: 2 | 3 | 4) => void;
    setGridSize: (size: 2 | 3 | 4) => void;
    moveTile: (index: number) => void;
    scramble: () => void;
}

const createSolvedState = (gridSize: number): number[] => {
    const tiles: number[] = [];
    for (let i = 1; i < gridSize * gridSize; i++) {
        tiles.push(i);
    }
    tiles.push(0); // Empty space at the end
    return tiles;
};

const checkSolved = (tiles: number[]): boolean => {
    for (let i = 0; i < tiles.length - 1; i++) {
        if (tiles[i] !== i + 1) return false;
    }
    return tiles[tiles.length - 1] === 0;
};

const getNeighbors = (index: number, gridSize: number): number[] => {
    const neighbors: number[] = [];
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;

    if (row > 0) neighbors.push(index - gridSize); // Up
    if (row < gridSize - 1) neighbors.push(index + gridSize); // Down
    if (col > 0) neighbors.push(index - 1); // Left
    if (col < gridSize - 1) neighbors.push(index + 1); // Right

    return neighbors;
};

// Fisher-Yates shuffle with solvability check
const shuffleTiles = (gridSize: number): { tiles: number[]; emptyIndex: number } => {
    const tiles = createSolvedState(gridSize);
    let emptyIndex = tiles.length - 1;

    // Perform random valid moves (ensures solvability)
    const moveCount = gridSize === 2 ? 30 : gridSize === 3 ? 100 : 200;

    for (let i = 0; i < moveCount; i++) {
        const neighbors = getNeighbors(emptyIndex, gridSize);
        const randomNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];

        // Swap
        tiles[emptyIndex] = tiles[randomNeighbor];
        tiles[randomNeighbor] = 0;
        emptyIndex = randomNeighbor;
    }

    return { tiles, emptyIndex };
};

export const usePuzzleStore = create<PuzzleState & PuzzleActions>()(
    persist(
        (set, get) => ({
            tiles: createSolvedState(3),
            gridSize: 3,
            emptyIndex: 8,
            moveCount: 0,
            gameStatus: 'IDLE',
            startTime: null,
            animatingTile: null,
            leaderboard: [],

            initGame: (gridSize?: 2 | 3 | 4) => {
                const size = gridSize ?? get().gridSize;
                set({
                    tiles: createSolvedState(size),
                    gridSize: size,
                    emptyIndex: size * size - 1,
                    moveCount: 0,
                    gameStatus: 'IDLE',
                    startTime: null,
                    animatingTile: null,
                });
            },

            setGridSize: (size: 2 | 3 | 4) => {
                set({
                    gridSize: size,
                    tiles: createSolvedState(size),
                    emptyIndex: size * size - 1,
                    moveCount: 0,
                    gameStatus: 'IDLE',
                    startTime: null,
                });
            },

            scramble: () => {
                const { gridSize } = get();
                const { tiles, emptyIndex } = shuffleTiles(gridSize);
                set({
                    tiles,
                    emptyIndex,
                    moveCount: 0,
                    gameStatus: 'IDLE',
                    startTime: null,
                    animatingTile: null,
                });
            },

            moveTile: (index: number) => {
                const state = get();
                if (state.gameStatus === 'SOLVED' || state.animatingTile !== null) return;

                const { tiles, emptyIndex, gridSize, moveCount } = state;

                // Check if clicked tile is adjacent to empty space
                const neighbors = getNeighbors(emptyIndex, gridSize);
                if (!neighbors.includes(index)) return;

                // Start game on first move
                const isFirstMove = state.gameStatus === 'IDLE';

                // Perform the move
                const newTiles = [...tiles];
                newTiles[emptyIndex] = newTiles[index];
                newTiles[index] = 0;

                const solved = checkSolved(newTiles);
                const newMoveCount = moveCount + 1;

                let newLeaderboard = state.leaderboard;
                if (solved && (isFirstMove ? Date.now() : state.startTime)) {
                    const startTime = isFirstMove ? Date.now() : state.startTime!;
                    const time = (Date.now() - startTime) / 1000;
                    newLeaderboard = [
                        ...state.leaderboard,
                        { time, moves: newMoveCount, gridSize, date: new Date().toISOString() }
                    ].sort((a, b) => a.moves - b.moves || a.time - b.time).slice(0, 10);
                }

                set({
                    tiles: newTiles,
                    emptyIndex: index,
                    moveCount: newMoveCount,
                    gameStatus: solved ? 'SOLVED' : 'PLAYING',
                    startTime: isFirstMove ? Date.now() : state.startTime,
                    leaderboard: newLeaderboard,
                });
            },
        }),
        {
            name: 'puzzle-storage',
            partialize: (state) => ({
                leaderboard: state.leaderboard,
                gridSize: state.gridSize,
            }),
        }
    )
);
