import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LeaderboardEntry {
    time: number;
    moves: number;
    gridSize: number;
    date: string;
    hintCount?: number;
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

    // Hint system
    hintActive: boolean;
    hintTileIndex: number | null; // index of tile to highlight (tile to move)
    hintCount: number;

    // Settings & records
    leaderboard: LeaderboardEntry[];

    // View reset
    viewResetRequested: boolean;
}

interface PuzzleActions {
    initGame: (gridSize?: 2 | 3 | 4) => void;
    setGridSize: (size: 2 | 3 | 4) => void;
    moveTile: (index: number) => void;
    scramble: () => void;
    showHint: () => void;
    clearHint: () => void;
    requestViewReset: () => void;
    clearViewReset: () => void;
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

// BFS solver to find the next move towards solution
const findNextMove = (tiles: number[], emptyIndex: number, gridSize: number, maxDepth: number = 30): number | null => {
    const target = createSolvedState(gridSize);
    const targetKey = target.join(',');

    if (tiles.join(',') === targetKey) return null; // Already solved

    interface State {
        tiles: number[];
        emptyIndex: number;
        path: number[]; // Array of tile indices that were moved
    }

    const visited = new Set<string>();
    const queue: State[] = [{ tiles: [...tiles], emptyIndex, path: [] }];
    visited.add(tiles.join(','));

    while (queue.length > 0) {
        const current = queue.shift()!;

        // Limit search depth
        if (current.path.length >= maxDepth) continue;

        const neighbors = getNeighbors(current.emptyIndex, gridSize);

        for (const neighborIndex of neighbors) {
            const newTiles = [...current.tiles];
            newTiles[current.emptyIndex] = newTiles[neighborIndex];
            newTiles[neighborIndex] = 0;

            const key = newTiles.join(',');

            if (visited.has(key)) continue;
            visited.add(key);

            const newPath = [...current.path, neighborIndex];

            if (key === targetKey) {
                // Found solution! Return the first move
                return newPath[0];
            }

            queue.push({
                tiles: newTiles,
                emptyIndex: neighborIndex,
                path: newPath,
            });
        }
    }

    // No solution found within depth limit - return any valid move
    const neighbors = getNeighbors(emptyIndex, gridSize);
    return neighbors.length > 0 ? neighbors[0] : null;
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
            hintActive: false,
            hintTileIndex: null,
            hintCount: 0,
            leaderboard: [],
            viewResetRequested: false,

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
                    hintActive: false,
                    hintTileIndex: null,
                    hintCount: 0,
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
                    hintActive: false,
                    hintTileIndex: null,
                    hintCount: 0,
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
                    hintActive: false,
                    hintTileIndex: null,
                    hintCount: 0,
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
                const newStartTime = isFirstMove ? Date.now() : state.startTime;

                let newLeaderboard = state.leaderboard;
                if (solved && newStartTime) {
                    const time = (Date.now() - newStartTime) / 1000;
                    newLeaderboard = [
                        ...state.leaderboard,
                        { time, moves: newMoveCount, gridSize, date: new Date().toISOString(), hintCount: state.hintCount }
                    ].sort((a, b) => a.moves - b.moves || a.time - b.time).slice(0, 10);
                }

                set({
                    tiles: newTiles,
                    emptyIndex: index,
                    moveCount: newMoveCount,
                    gameStatus: solved ? 'SOLVED' : 'PLAYING',
                    startTime: newStartTime,
                    leaderboard: newLeaderboard,
                    hintActive: false,
                    hintTileIndex: null,
                });
            },

            showHint: () => {
                const state = get();
                if (state.gameStatus === 'SOLVED' || state.hintActive) return;

                // Use BFS to find the next best move
                const maxDepth = state.gridSize === 2 ? 20 : state.gridSize === 3 ? 31 : 25;
                const hintTileIndex = findNextMove(state.tiles, state.emptyIndex, state.gridSize, maxDepth);

                if (hintTileIndex !== null) {
                    set({
                        hintActive: true,
                        hintTileIndex,
                        hintCount: state.hintCount + 1,
                    });

                    // Auto-clear hint after 2 seconds
                    setTimeout(() => {
                        const currentState = get();
                        if (currentState.hintActive) {
                            set({ hintActive: false, hintTileIndex: null });
                        }
                    }, 2000);
                }
            },

            clearHint: () => {
                set({ hintActive: false, hintTileIndex: null });
            },

            requestViewReset: () => set({ viewResetRequested: true }),
            clearViewReset: () => set({ viewResetRequested: false }),
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
