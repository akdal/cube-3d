import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LeaderboardEntry {
    time: number;
    moves: number;
    diskCount: number;
    date: string;
    hintCount?: number;
}

interface HintInfo {
    fromPeg: number;
    toPeg: number;
    disk: number;
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

    // Hint system
    hintActive: boolean;
    hintInfo: HintInfo | null;
    hintCount: number;

    // Settings & records
    leaderboard: LeaderboardEntry[];

    // View reset
    viewResetRequested: boolean;
}

interface HanoiActions {
    initGame: (diskCount?: number) => void;
    selectPeg: (pegIndex: number) => void;
    setDiskCount: (count: number) => void;
    finishAnimation: () => void;
    showHint: () => void;
    clearHint: () => void;
    requestViewReset: () => void;
    clearViewReset: () => void;
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

// Generate optimal solution moves for Tower of Hanoi
const generateOptimalMoves = (n: number, from: number, to: number, aux: number): { from: number; to: number; disk: number }[] => {
    if (n === 0) return [];
    const moves: { from: number; to: number; disk: number }[] = [];

    // Move n-1 disks from 'from' to 'aux'
    moves.push(...generateOptimalMoves(n - 1, from, aux, to));
    // Move disk n from 'from' to 'to'
    moves.push({ from, to, disk: n });
    // Move n-1 disks from 'aux' to 'to'
    moves.push(...generateOptimalMoves(n - 1, aux, to, from));

    return moves;
};

// Calculate next optimal move from ANY current state
// Uses recursive Tower of Hanoi strategy
const calculateNextMove = (pegs: number[][], diskCount: number): HintInfo | null => {
    // Check if already solved
    if (pegs[2].length === diskCount) return null;

    // Helper: find which peg contains a disk
    const findDisk = (disk: number): number => {
        for (let p = 0; p < 3; p++) {
            if (pegs[p].includes(disk)) return p;
        }
        return -1;
    };

    // Helper: check if disk is on top of its peg
    const isTop = (disk: number): boolean => {
        const peg = findDisk(disk);
        return peg >= 0 && pegs[peg][pegs[peg].length - 1] === disk;
    };

    // Helper: check if disk can be placed on target peg
    const canMoveTo = (disk: number, targetPeg: number): boolean => {
        if (pegs[targetPeg].length === 0) return true;
        return disk < pegs[targetPeg][pegs[targetPeg].length - 1];
    };

    // Recursive solver: move disks [start..end] to targetPeg
    // Returns the next move to make progress toward this goal
    const solve = (start: number, end: number, targetPeg: number): HintInfo | null => {
        if (start > end) return null;

        const endPeg = findDisk(end);

        // If largest disk already on target, solve for remaining disks
        if (endPeg === targetPeg) {
            return solve(start, end - 1, targetPeg);
        }

        // To move disk `end` from endPeg to targetPeg:
        // First, all smaller disks [start..end-1] must be on auxiliary peg
        const auxPeg = 3 - endPeg - targetPeg;

        // Find the largest disk in [start, end-1] not on auxPeg
        // Check from largest to smallest to prioritize moving larger disks first
        for (let d = end - 1; d >= start; d--) {
            if (findDisk(d) !== auxPeg) {
                // This disk needs to move to auxPeg
                return solve(start, d, auxPeg);
            }
        }

        // All smaller disks are on auxPeg, now move disk `end`
        if (isTop(end) && canMoveTo(end, targetPeg)) {
            return { fromPeg: endPeg, toPeg: targetPeg, disk: end };
        }

        // Shouldn't reach here with valid Hanoi state
        return null;
    };

    // Goal: move all disks [1..diskCount] to peg 2
    return solve(1, diskCount, 2);
};

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
            hintActive: false,
            hintInfo: null,
            hintCount: 0,
            leaderboard: [],
            viewResetRequested: false,

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
                    hintActive: false,
                    hintInfo: null,
                    hintCount: 0,
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
                        { time, moves: newMoveCount, diskCount, date: new Date().toISOString(), hintCount: state.hintCount }
                    ].sort((a, b) => a.moves - b.moves || a.time - b.time).slice(0, 10);
                }

                set({
                    pegs: newPegs,
                    moveCount: newMoveCount,
                    animating: false,
                    animatingDisk: null,
                    gameStatus: solved ? 'SOLVED' : 'PLAYING',
                    leaderboard: newLeaderboard,
                    hintActive: false,
                    hintInfo: null,
                });
            },

            showHint: () => {
                const state = get();
                if (state.gameStatus === 'SOLVED' || state.animating) return;

                const hintInfo = calculateNextMove(state.pegs, state.diskCount);
                if (hintInfo) {
                    set({
                        hintActive: true,
                        hintInfo,
                        hintCount: state.hintCount + 1,
                        selectedPeg: null, // Clear selection when showing hint
                    });

                    // Auto-clear hint after 3 seconds
                    setTimeout(() => {
                        const currentState = get();
                        if (currentState.hintActive) {
                            set({ hintActive: false, hintInfo: null });
                        }
                    }, 3000);
                }
            },

            clearHint: () => {
                set({ hintActive: false, hintInfo: null });
            },

            requestViewReset: () => set({ viewResetRequested: true }),
            clearViewReset: () => set({ viewResetRequested: false }),
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
