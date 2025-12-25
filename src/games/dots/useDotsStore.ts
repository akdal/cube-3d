import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Player = 1 | 2;
type LineState = null | Player;
type BoxState = null | Player;

interface LeaderboardEntry {
    player1Score: number;
    player2Score: number;
    winner: Player | 'draw';
    gridSize: number;
    date: number;
}

interface DotsState {
    gridSize: number;
    // Lines: gridSize rows × (gridSize-1) cols for horizontal, (gridSize-1) rows × gridSize cols for vertical
    horizontalLines: LineState[][];
    verticalLines: LineState[][];
    boxes: BoxState[][];
    currentPlayer: Player;
    scores: { player1: number; player2: number };
    gameStatus: 'IDLE' | 'PLAYING' | 'FINISHED';
    winner: Player | 'draw' | null;
    lastMove: { type: 'h' | 'v'; row: number; col: number } | null;
    leaderboard: LeaderboardEntry[];
    viewResetRequested: boolean;
}

interface DotsActions {
    initGame: (gridSize?: number) => void;
    setGridSize: (size: number) => void;
    drawLine: (type: 'h' | 'v', row: number, col: number) => void;
    requestViewReset: () => void;
    clearViewReset: () => void;
}

const createEmptyGrid = <T>(rows: number, cols: number, fill: T): T[][] => {
    return Array(rows).fill(null).map(() => Array(cols).fill(fill));
};

export const useDotsStore = create<DotsState & DotsActions>()(
    persist(
        (set, get) => ({
            gridSize: 4,
            horizontalLines: [],
            verticalLines: [],
            boxes: [],
            currentPlayer: 1,
            scores: { player1: 0, player2: 0 },
            gameStatus: 'IDLE',
            winner: null,
            lastMove: null,
            leaderboard: [],
            viewResetRequested: false,

            initGame: (gridSize?: number) => {
                const size = gridSize ?? get().gridSize;
                set({
                    gridSize: size,
                    horizontalLines: createEmptyGrid(size, size - 1, null),
                    verticalLines: createEmptyGrid(size - 1, size, null),
                    boxes: createEmptyGrid(size - 1, size - 1, null),
                    currentPlayer: 1,
                    scores: { player1: 0, player2: 0 },
                    gameStatus: 'PLAYING',
                    winner: null,
                    lastMove: null,
                });
            },

            setGridSize: (size: number) => {
                set({ gridSize: size });
                get().initGame(size);
            },

            drawLine: (type, row, col) => {
                const state = get();
                if (state.gameStatus !== 'PLAYING') return;

                // Check if line already drawn
                if (type === 'h') {
                    if (state.horizontalLines[row]?.[col] !== null) return;
                } else {
                    if (state.verticalLines[row]?.[col] !== null) return;
                }

                const currentPlayer = state.currentPlayer;
                let horizontalLines = state.horizontalLines.map(r => [...r]);
                let verticalLines = state.verticalLines.map(r => [...r]);
                let boxes = state.boxes.map(r => [...r]);
                let scores = { ...state.scores };

                // Draw the line
                if (type === 'h') {
                    horizontalLines[row][col] = currentPlayer;
                } else {
                    verticalLines[row][col] = currentPlayer;
                }

                // Check for completed boxes
                let boxesCompleted = 0;
                const gridSize = state.gridSize;

                if (type === 'h') {
                    // Horizontal line can complete box above (row-1, col) and below (row, col)
                    // Box above: row-1 exists
                    if (row > 0) {
                        const boxRow = row - 1;
                        const boxCol = col;
                        if (
                            boxes[boxRow][boxCol] === null &&
                            horizontalLines[boxRow]?.[boxCol] !== null &&
                            horizontalLines[boxRow + 1]?.[boxCol] !== null &&
                            verticalLines[boxRow]?.[boxCol] !== null &&
                            verticalLines[boxRow]?.[boxCol + 1] !== null
                        ) {
                            boxes[boxRow][boxCol] = currentPlayer;
                            boxesCompleted++;
                        }
                    }
                    // Box below: row < gridSize - 1
                    if (row < gridSize - 1) {
                        const boxRow = row;
                        const boxCol = col;
                        if (
                            boxes[boxRow][boxCol] === null &&
                            horizontalLines[boxRow]?.[boxCol] !== null &&
                            horizontalLines[boxRow + 1]?.[boxCol] !== null &&
                            verticalLines[boxRow]?.[boxCol] !== null &&
                            verticalLines[boxRow]?.[boxCol + 1] !== null
                        ) {
                            boxes[boxRow][boxCol] = currentPlayer;
                            boxesCompleted++;
                        }
                    }
                } else {
                    // Vertical line can complete box left (row, col-1) and right (row, col)
                    // Box left: col-1 exists
                    if (col > 0) {
                        const boxRow = row;
                        const boxCol = col - 1;
                        if (
                            boxes[boxRow][boxCol] === null &&
                            horizontalLines[boxRow]?.[boxCol] !== null &&
                            horizontalLines[boxRow + 1]?.[boxCol] !== null &&
                            verticalLines[boxRow]?.[boxCol] !== null &&
                            verticalLines[boxRow]?.[boxCol + 1] !== null
                        ) {
                            boxes[boxRow][boxCol] = currentPlayer;
                            boxesCompleted++;
                        }
                    }
                    // Box right: col < gridSize - 1
                    if (col < gridSize - 1) {
                        const boxRow = row;
                        const boxCol = col;
                        if (
                            boxes[boxRow][boxCol] === null &&
                            horizontalLines[boxRow]?.[boxCol] !== null &&
                            horizontalLines[boxRow + 1]?.[boxCol] !== null &&
                            verticalLines[boxRow]?.[boxCol] !== null &&
                            verticalLines[boxRow]?.[boxCol + 1] !== null
                        ) {
                            boxes[boxRow][boxCol] = currentPlayer;
                            boxesCompleted++;
                        }
                    }
                }

                // Update scores
                if (boxesCompleted > 0) {
                    if (currentPlayer === 1) {
                        scores.player1 += boxesCompleted;
                    } else {
                        scores.player2 += boxesCompleted;
                    }
                }

                // Check if game is over
                const totalBoxes = (gridSize - 1) * (gridSize - 1);
                const filledBoxes = scores.player1 + scores.player2;
                let gameStatus: DotsState['gameStatus'] = 'PLAYING';
                let winner: DotsState['winner'] = null;

                if (filledBoxes === totalBoxes) {
                    gameStatus = 'FINISHED';
                    if (scores.player1 > scores.player2) {
                        winner = 1;
                    } else if (scores.player2 > scores.player1) {
                        winner = 2;
                    } else {
                        winner = 'draw';
                    }

                    // Add to leaderboard
                    const entry: LeaderboardEntry = {
                        player1Score: scores.player1,
                        player2Score: scores.player2,
                        winner,
                        gridSize,
                        date: Date.now(),
                    };
                    const newLeaderboard = [...state.leaderboard, entry].slice(-10);

                    set({
                        horizontalLines,
                        verticalLines,
                        boxes,
                        scores,
                        gameStatus,
                        winner,
                        lastMove: { type, row, col },
                        leaderboard: newLeaderboard,
                    });
                    return;
                }

                // Switch player only if no box was completed
                const nextPlayer: Player = boxesCompleted > 0 ? currentPlayer : (currentPlayer === 1 ? 2 : 1);

                set({
                    horizontalLines,
                    verticalLines,
                    boxes,
                    scores,
                    currentPlayer: nextPlayer,
                    lastMove: { type, row, col },
                });
            },

            requestViewReset: () => set({ viewResetRequested: true }),
            clearViewReset: () => set({ viewResetRequested: false }),
        }),
        {
            name: 'dots-game-storage',
            partialize: (state) => ({
                gridSize: state.gridSize,
                leaderboard: state.leaderboard,
            }),
        }
    )
);
