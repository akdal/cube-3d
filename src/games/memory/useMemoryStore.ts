import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Winter/Christmas themed icons (need 12 for 5x5 grid with center empty)
const CARD_ICONS = [
    '🎄', // Christmas tree
    '⭐', // Star
    '🎅', // Santa
    '❄️', // Snowflake
    '🎁', // Gift
    '⛄', // Snowman
    '🦌', // Reindeer
    '🔔', // Bell
    '🧦', // Stocking
    '🕯️', // Candle
    '🍪', // Cookie
    '☃️', // Snowman with snow
];

interface Card {
    id: number;
    icon: string;
    isFlipped: boolean;
    isMatched: boolean;
    isEmpty?: boolean; // For 5x5 grid center
}

interface LeaderboardEntry {
    time: number;
    moves: number;
    gridSize: number;
    date: string;
    hintCount?: number;
}

interface MemoryState {
    cards: Card[];
    gridSize: 4 | 5; // 4x4 (8 pairs) or 5x5 (12 pairs + 1 empty center)
    flippedCards: number[]; // indices of currently flipped cards
    moveCount: number;
    gameStatus: 'IDLE' | 'PLAYING' | 'SOLVED';
    startTime: number | null;
    isProcessing: boolean; // prevent clicks during animation
    leaderboard: LeaderboardEntry[];
    // Hint system
    hintActive: boolean;
    hintCardIndices: number[]; // indices of cards to highlight
    hintCount: number;
}

interface MemoryActions {
    initGame: (gridSize?: 4 | 5) => void;
    setGridSize: (size: 4 | 5) => void;
    flipCard: (index: number) => void;
    checkMatch: () => void;
    scramble: () => void;
    showHint: () => void;
    clearHint: () => void;
}

const createCards = (gridSize: number): Card[] => {
    const cards: Card[] = [];

    if (gridSize === 5) {
        // 5x5 grid: 25 slots, center is empty, 24 cards = 12 pairs
        const pairCount = 12;
        const icons = CARD_ICONS.slice(0, pairCount);

        // Create pairs
        icons.forEach((icon, i) => {
            cards.push({ id: i * 2, icon, isFlipped: false, isMatched: false });
            cards.push({ id: i * 2 + 1, icon, isFlipped: false, isMatched: false });
        });

        // Shuffle
        for (let i = cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cards[i], cards[j]] = [cards[j], cards[i]];
        }

        // Insert empty card at center (index 12 for 5x5 grid)
        cards.splice(12, 0, { id: -1, icon: '', isFlipped: false, isMatched: false, isEmpty: true });
    } else {
        // 4x4 grid: 16 slots = 8 pairs
        const pairCount = 8;
        const icons = CARD_ICONS.slice(0, pairCount);

        // Create pairs
        icons.forEach((icon, i) => {
            cards.push({ id: i * 2, icon, isFlipped: false, isMatched: false });
            cards.push({ id: i * 2 + 1, icon, isFlipped: false, isMatched: false });
        });

        // Shuffle
        for (let i = cards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [cards[i], cards[j]] = [cards[j], cards[i]];
        }
    }

    return cards;
};

export const useMemoryStore = create<MemoryState & MemoryActions>()(
    persist(
        (set, get) => ({
            cards: createCards(4),
            gridSize: 4,
            flippedCards: [],
            moveCount: 0,
            gameStatus: 'IDLE',
            startTime: null,
            isProcessing: false,
            leaderboard: [],
            hintActive: false,
            hintCardIndices: [],
            hintCount: 0,

            initGame: (gridSize?: 4 | 5) => {
                const size = gridSize ?? get().gridSize;
                set({
                    cards: createCards(size),
                    gridSize: size,
                    flippedCards: [],
                    moveCount: 0,
                    gameStatus: 'IDLE',
                    startTime: null,
                    isProcessing: false,
                    hintActive: false,
                    hintCardIndices: [],
                    hintCount: 0,
                });
            },

            setGridSize: (size: 4 | 5) => {
                set({
                    gridSize: size,
                    cards: createCards(size),
                    flippedCards: [],
                    moveCount: 0,
                    gameStatus: 'IDLE',
                    startTime: null,
                    isProcessing: false,
                    hintActive: false,
                    hintCardIndices: [],
                    hintCount: 0,
                });
            },

            scramble: () => {
                const { gridSize } = get();
                set({
                    cards: createCards(gridSize),
                    flippedCards: [],
                    moveCount: 0,
                    gameStatus: 'IDLE',
                    startTime: null,
                    isProcessing: false,
                    hintActive: false,
                    hintCardIndices: [],
                    hintCount: 0,
                });
            },

            flipCard: (index: number) => {
                const state = get();
                if (state.isProcessing) return;
                if (state.gameStatus === 'SOLVED') return;
                if (state.cards[index].isEmpty) return; // Skip empty center card
                if (state.cards[index].isFlipped || state.cards[index].isMatched) return;
                if (state.flippedCards.length >= 2) return;

                const isFirstMove = state.gameStatus === 'IDLE';
                const newCards = [...state.cards];
                newCards[index] = { ...newCards[index], isFlipped: true };

                const newFlipped = [...state.flippedCards, index];

                set({
                    cards: newCards,
                    flippedCards: newFlipped,
                    gameStatus: 'PLAYING',
                    startTime: isFirstMove ? Date.now() : state.startTime,
                });

                // If two cards are flipped, check for match
                if (newFlipped.length === 2) {
                    set({ isProcessing: true });
                    setTimeout(() => get().checkMatch(), 800);
                }
            },

            checkMatch: () => {
                const state = get();
                const [first, second] = state.flippedCards;
                const newCards = [...state.cards];
                const isMatch = newCards[first].icon === newCards[second].icon;

                if (isMatch) {
                    newCards[first] = { ...newCards[first], isMatched: true };
                    newCards[second] = { ...newCards[second], isMatched: true };
                } else {
                    newCards[first] = { ...newCards[first], isFlipped: false };
                    newCards[second] = { ...newCards[second], isFlipped: false };
                }

                const allMatched = newCards.every(card => card.isEmpty || card.isMatched);
                const newMoveCount = state.moveCount + 1;

                let newLeaderboard = state.leaderboard;
                if (allMatched && state.startTime) {
                    const time = (Date.now() - state.startTime) / 1000;
                    newLeaderboard = [
                        ...state.leaderboard,
                        { time, moves: newMoveCount, gridSize: state.gridSize, date: new Date().toISOString(), hintCount: state.hintCount }
                    ].sort((a, b) => a.moves - b.moves || a.time - b.time).slice(0, 10);
                }

                set({
                    cards: newCards,
                    flippedCards: [],
                    moveCount: newMoveCount,
                    gameStatus: allMatched ? 'SOLVED' : 'PLAYING',
                    isProcessing: false,
                    leaderboard: newLeaderboard,
                    hintActive: false,
                    hintCardIndices: [],
                });
            },

            showHint: () => {
                const state = get();
                if (state.gameStatus === 'SOLVED' || state.isProcessing || state.hintActive) return;
                if (state.flippedCards.length > 0) return; // Don't hint when cards are flipped

                // Find unmatched cards and group by icon
                const unmatchedByIcon: { [icon: string]: number[] } = {};
                state.cards.forEach((card, index) => {
                    if (!card.isEmpty && !card.isMatched && !card.isFlipped) {
                        if (!unmatchedByIcon[card.icon]) {
                            unmatchedByIcon[card.icon] = [];
                        }
                        unmatchedByIcon[card.icon].push(index);
                    }
                });

                // Find a pair (should always exist if game is not solved)
                let hintPair: number[] = [];
                for (const indices of Object.values(unmatchedByIcon)) {
                    if (indices.length >= 2) {
                        hintPair = [indices[0], indices[1]];
                        break;
                    }
                }

                if (hintPair.length === 2) {
                    set({
                        hintActive: true,
                        hintCardIndices: hintPair,
                        hintCount: state.hintCount + 1,
                    });

                    // Auto-clear hint after 2 seconds
                    setTimeout(() => {
                        const currentState = get();
                        if (currentState.hintActive) {
                            set({ hintActive: false, hintCardIndices: [] });
                        }
                    }, 2000);
                }
            },

            clearHint: () => {
                set({ hintActive: false, hintCardIndices: [] });
            },
        }),
        {
            name: 'memory-storage',
            partialize: (state) => ({
                leaderboard: state.leaderboard,
                gridSize: state.gridSize,
            }),
        }
    )
);
