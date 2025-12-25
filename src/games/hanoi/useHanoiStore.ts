import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LeaderboardEntry {
    time: number;
    moves: number;
    diskCount: number;
    date: string;
}

interface HanoiState {
    // Game state
    pegs: number[][]; // 3 pegs, each containing disk sizes (smaller number = smaller disk)
    diskCount: number;
    selectedPeg: number | null;
    moveCount: number;

    // Game status
    gameStatus: 'IDLE' | 'PLAYING' | 'SOLVED';
    startTime: number | null;

    // Animation
    animating: boolean;
    animatingDisk: { from: number; to: number; disk: number } | null;

    // Settings & records
    leaderboard: LeaderboardEntry[];
}

interface HanoiActions {
    initGame: (diskCount?: number) => void;
    selectPeg: (pegIndex: number) => void;
    setDiskCount: (count: number) => void;
    finishAnimation: () => void;
}

const createInitialPegs = (diskCount: number): number[][] => {
    // All disks start on peg 0, largest (diskCount) at bottom
    const peg0 = Array.from({ length: diskCount }, (_, i) => diskCount - i);
    return [peg0, [], []];
};

const checkSolved = (pegs: number[][], diskCount: number): boolean => {
    // All disks should be on peg 2 (rightmost)
    return pegs[2].length === diskCount;
};

// Minimum moves required: 2^n - 1
const getMinMoves = (diskCount: number): number => Math.pow(2, diskCount) - 1;

export const useHanoiStore = create<HanoiState & HanoiActions>()(
    persist(
        (set, get) => ({
            pegs: createInitialPegs(3),
            diskCount: 3,
            selectedPeg: null,
            moveCount: 0,
            gameStatus: 'IDLE',
            startTime: null,
            animating: false,
            animatingDisk: null,
            leaderboard: [],

            initGame: (diskCount?: number) => {
                const count = diskCount ?? get().diskCount;
                set({
                    pegs: createInitialPegs(count),
                    diskCount: count,
                    selectedPeg: null,
                    moveCount: 0,
                    gameStatus: 'IDLE',
                    startTime: null,
                    animating: false,
                    animatingDisk: null,
                });
            },

            setDiskCount: (count: number) => {
                set({
                    diskCount: count,
                    pegs: createInitialPegs(count),
                    selectedPeg: null,
                    moveCount: 0,
                    gameStatus: 'IDLE',
                    startTime: null,
                });
            },

            selectPeg: (pegIndex: number) => {
                const state = get();
                if (state.animating || state.gameStatus === 'SOLVED') return;

                const { pegs, selectedPeg } = state;

                if (selectedPeg === null) {
                    // No peg selected - try to select this peg if it has disks
                    if (pegs[pegIndex].length > 0) {
                        set({ selectedPeg: pegIndex });
                    }
                } else {
                    // A peg is already selected
                    if (selectedPeg === pegIndex) {
                        // Deselect if clicking same peg
                        set({ selectedPeg: null });
                    } else {
                        // Try to move disk
                        const fromPeg = pegs[selectedPeg];
                        const toPeg = pegs[pegIndex];
                        const movingDisk = fromPeg[fromPeg.length - 1];
                        const topDiskOnTarget = toPeg[toPeg.length - 1];

                        // Valid move: target is empty OR moving disk is smaller than top disk
                        if (toPeg.length === 0 || movingDisk < topDiskOnTarget) {
                            // Start game on first move
                            const isFirstMove = state.gameStatus === 'IDLE';

                            // Start animation
                            set({
                                animating: true,
                                animatingDisk: { from: selectedPeg, to: pegIndex, disk: movingDisk },
                                selectedPeg: null,
                                gameStatus: isFirstMove ? 'PLAYING' : state.gameStatus,
                                startTime: isFirstMove ? Date.now() : state.startTime,
                            });
                        } else {
                            // Invalid move - just deselect
                            set({ selectedPeg: null });
                        }
                    }
                }
            },

            finishAnimation: () => {
                const state = get();
                const { animatingDisk, pegs, moveCount, diskCount, startTime } = state;

                if (!animatingDisk) {
                    set({ animating: false });
                    return;
                }

                const newPegs = pegs.map(peg => [...peg]);
                newPegs[animatingDisk.from].pop();
                newPegs[animatingDisk.to].push(animatingDisk.disk);

                const solved = checkSolved(newPegs, diskCount);
                const newMoveCount = moveCount + 1;

                let newLeaderboard = state.leaderboard;
                if (solved && startTime) {
                    const time = (Date.now() - startTime) / 1000;
                    newLeaderboard = [
                        ...state.leaderboard,
                        { time, moves: newMoveCount, diskCount, date: new Date().toISOString() }
                    ].sort((a, b) => a.moves - b.moves || a.time - b.time).slice(0, 10);
                }

                set({
                    pegs: newPegs,
                    moveCount: newMoveCount,
                    animating: false,
                    animatingDisk: null,
                    gameStatus: solved ? 'SOLVED' : 'PLAYING',
                    leaderboard: newLeaderboard,
                });
            },
        }),
        {
            name: 'hanoi-storage',
            partialize: (state) => ({
                leaderboard: state.leaderboard,
                diskCount: state.diskCount,
            }),
        }
    )
);

export { getMinMoves };
