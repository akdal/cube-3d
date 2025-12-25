import { useEffect, useState } from 'react';
import { useHanoiStore, getMinMoves } from './useHanoiStore';

interface HanoiUIProps {
    onBack: () => void;
}

export const HanoiUI = ({ onBack }: HanoiUIProps) => {
    const {
        gameStatus,
        startTime,
        moveCount,
        diskCount,
        setDiskCount,
        initGame,
        leaderboard,
    } = useHanoiStore();

    const [showSettings, setShowSettings] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        if (gameStatus !== 'PLAYING' || !startTime) return;
        const interval = setInterval(() => {
            setNow(Date.now());
        }, 50);
        return () => clearInterval(interval);
    }, [gameStatus, startTime]);

    const timeDisplay =
        gameStatus === 'IDLE' || !startTime
            ? '0.00'
            : ((now - startTime) / 1000).toFixed(2);

    const minMoves = getMinMoves(diskCount);

    // Solved screen
    if (gameStatus === 'SOLVED') {
        const isPerfect = moveCount === minMoves;
        return (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-sm w-full">
                    <h1 className="text-4xl font-bold text-green-600 mb-4">
                        {isPerfect ? 'PERFECT!' : 'SOLVED!'}
                    </h1>
                    <div className="text-2xl mb-2">
                        Time: <span className="font-mono">{timeDisplay}</span>s
                    </div>
                    <div className="text-xl mb-2">
                        Moves: {moveCount} / {minMoves}
                    </div>
                    {isPerfect && (
                        <div className="text-yellow-500 text-lg mb-4">
                            Minimum moves achieved!
                        </div>
                    )}

                    <div className="flex flex-col gap-3 mt-6">
                        <button
                            onClick={() => initGame()}
                            className="px-8 py-4 bg-blue-600 text-white text-lg rounded-full font-bold hover:bg-blue-700 transition"
                        >
                            Play Again
                        </button>
                        <button
                            onClick={() => setShowLeaderboard(true)}
                            className="text-gray-500 underline hover:text-gray-800"
                        >
                            View Leaderboard
                        </button>
                        <button
                            onClick={onBack}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            Back to Menu
                        </button>
                    </div>
                </div>

                {showLeaderboard && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/90">
                        <div className="bg-white p-6 rounded-xl w-80 relative">
                            <button
                                onClick={() => setShowLeaderboard(false)}
                                className="absolute top-2 right-2 text-xl font-bold"
                            >
                                ×
                            </button>
                            <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>
                            {leaderboard.length === 0 ? (
                                <p className="text-gray-500">No records yet.</p>
                            ) : (
                                <ul className="space-y-2">
                                    {leaderboard.map((entry, i) => (
                                        <li
                                            key={i}
                                            className="flex justify-between border-b pb-1 text-sm"
                                        >
                                            <span>
                                                {i + 1}. {entry.diskCount} disks
                                            </span>
                                            <span className="font-mono">
                                                {entry.moves} moves / {entry.time.toFixed(2)}s
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6 z-20">
            {/* Top Bar */}
            <div className="flex justify-between items-start gap-3 pointer-events-auto">
                {/* Left Panel - Controls */}
                <div className="bg-black/60 rounded-2xl text-white backdrop-blur-md border border-white/10 overflow-hidden min-w-[160px] sm:min-w-[200px]">
                    {/* Header */}
                    <div className="flex items-center justify-between p-3 sm:p-4">
                        <h1 className="text-base sm:text-xl font-bold">Hanoi Tower</h1>
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="text-xl sm:text-2xl px-1"
                        >
                            {showSettings ? '✕' : '⚙️'}
                        </button>
                    </div>

                    {/* Back button */}
                    <div className="flex border-t border-white/10">
                        <button
                            onClick={onBack}
                            className="flex-1 py-3 sm:py-4 text-center text-gray-300 active:bg-white/10 transition"
                        >
                            <span className="text-xl sm:text-2xl">←</span>
                        </button>
                        <button
                            onClick={() => initGame()}
                            className="flex-1 py-3 sm:py-4 text-center text-gray-300 active:bg-white/10 transition border-l border-white/10"
                        >
                            <span className="text-xl sm:text-2xl">↺</span>
                        </button>
                    </div>

                    {/* Settings */}
                    {showSettings && (
                        <div className="p-3 sm:p-4 border-t border-white/10 space-y-3">
                            {/* Disk Count */}
                            <div>
                                <div className="text-xs text-gray-400 mb-1.5">
                                    Disk Count
                                </div>
                                <div className="flex gap-1">
                                    {[3, 4, 5, 6, 7].map((count) => (
                                        <button
                                            key={count}
                                            onClick={() => {
                                                setDiskCount(count);
                                                setShowSettings(false);
                                            }}
                                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${
                                                diskCount === count
                                                    ? 'bg-yellow-500 text-black'
                                                    : 'bg-gray-700 text-gray-300'
                                            }`}
                                        >
                                            {count}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Leaderboard */}
                            <button
                                onClick={() => {
                                    setShowLeaderboard(!showLeaderboard);
                                    setShowSettings(false);
                                }}
                                className="w-full text-left text-sm text-blue-300 active:text-blue-100 py-1"
                            >
                                📊 Leaderboard
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Panel - Stats */}
                <div className="flex gap-2 sm:gap-3">
                    <div className="bg-black/60 px-4 py-3 sm:px-5 sm:py-4 rounded-2xl text-white backdrop-blur-md border border-white/10">
                        <div className="text-xs sm:text-sm text-gray-400 uppercase">
                            Time
                        </div>
                        <div className="text-xl sm:text-3xl font-mono font-bold text-yellow-400">
                            {timeDisplay}
                        </div>
                    </div>
                    <div className="bg-black/60 px-4 py-3 sm:px-5 sm:py-4 rounded-2xl text-white backdrop-blur-md border border-white/10">
                        <div className="text-xs sm:text-sm text-gray-400 uppercase">
                            Moves
                        </div>
                        <div className="text-xl sm:text-2xl font-mono font-bold">
                            {moveCount}
                            <span className="text-sm text-gray-500">/{minMoves}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Leaderboard Modal */}
            {showLeaderboard && (
                <div className="absolute top-20 left-6 pointer-events-auto bg-white p-4 rounded-xl w-72 shadow-xl z-50">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-black">Leaderboard</h2>
                        <button
                            onClick={() => setShowLeaderboard(false)}
                            className="text-gray-500 hover:text-black text-xl font-bold leading-none"
                        >
                            ×
                        </button>
                    </div>
                    {leaderboard.length === 0 ? (
                        <p className="text-gray-500 text-sm">No records.</p>
                    ) : (
                        <ul className="space-y-1">
                            {leaderboard.map((entry, i) => (
                                <li
                                    key={i}
                                    className="flex justify-between border-b border-gray-200 pb-1 text-sm text-black"
                                >
                                    <span>
                                        {i + 1}. {entry.diskCount} disks
                                    </span>
                                    <span className="font-mono">
                                        {entry.moves}/{getMinMoves(entry.diskCount)} - {entry.time.toFixed(2)}s
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {/* Bottom - Instructions */}
            <div className="flex flex-col items-center gap-3 pointer-events-auto mb-6 sm:mb-8">
                {/* Info */}
                <div className="flex items-center gap-2 text-white/70 text-sm sm:text-base">
                    <span className="bg-white/10 px-3 py-1 rounded-full font-bold">
                        {diskCount} Disks
                    </span>
                    <span>Min: {minMoves} moves</span>
                </div>
            </div>

            <div className="absolute bottom-3 left-4 sm:bottom-4 sm:left-6 text-white/50 text-xs sm:text-sm">
                Click peg to select/move disk • Move all to right peg
            </div>
        </div>
    );
};
