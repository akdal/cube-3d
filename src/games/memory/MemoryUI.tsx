import { useEffect, useState, useRef } from 'react';
import { useMemoryStore } from './useMemoryStore';
import { useCelebration } from '../../components/Celebration';

interface MemoryUIProps {
    onBack: () => void;
}

export const MemoryUI = ({ onBack }: MemoryUIProps) => {
    const {
        gameStatus,
        startTime,
        moveCount,
        gridSize,
        setGridSize,
        scramble,
        leaderboard,
        cards,
        hintCount,
        showHint,
        hintActive,
        flippedCards,
        isProcessing,
        requestViewReset,
    } = useMemoryStore();

    const [showSettings, setShowSettings] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [now, setNow] = useState(() => Date.now());
    const { celebrate } = useCelebration();
    const celebratedRef = useRef(false);

    // Count matched pairs (exclude empty card for 5x5)
    const matchedPairs = cards.filter(c => c.isMatched).length / 2;
    const totalPairs = cards.filter(c => !c.isEmpty).length / 2;

    // Celebration effect when solved
    useEffect(() => {
        if (gameStatus === 'SOLVED' && !celebratedRef.current) {
            celebratedRef.current = true;
            celebrate('default');
        } else if (gameStatus !== 'SOLVED') {
            celebratedRef.current = false;
        }
    }, [gameStatus, celebrate]);

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

    // Solved screen with winter theme
    if (gameStatus === 'SOLVED') {
        return (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-[#0a1628]/95 to-[#1a3a4a]/95 backdrop-blur-sm">
                {/* Snowflakes decoration */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute text-white/20 animate-pulse"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                fontSize: `${Math.random() * 20 + 10}px`,
                                animationDelay: `${Math.random() * 2}s`,
                            }}
                        >
                            ❄️
                        </div>
                    ))}
                </div>

                <div className="bg-gradient-to-b from-[#1a3a4a] to-[#0f2937] p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full border border-cyan-500/20">
                    <div className="text-4xl mb-2">🎄</div>
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300 mb-4">
                        성공!
                    </h1>
                    <div className="text-2xl mb-2 text-cyan-100">
                        시간: <span className="font-mono text-yellow-300">{timeDisplay}</span>초
                    </div>
                    <div className="text-xl mb-2 text-cyan-200">횟수: {moveCount}회</div>
                    {hintCount > 0 && (
                        <div className="text-purple-400 text-sm mb-4">
                            💡 힌트 사용: {hintCount}회
                        </div>
                    )}

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => scramble()}
                            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-lg rounded-full font-bold hover:from-cyan-400 hover:to-blue-400 transition shadow-lg"
                        >
                            🎮 새 게임
                        </button>
                        <button
                            onClick={() => setShowLeaderboard(true)}
                            className="text-cyan-300 underline hover:text-cyan-100"
                        >
                            기록 보기
                        </button>
                        <button
                            onClick={onBack}
                            className="text-cyan-400/60 hover:text-cyan-300"
                        >
                            메뉴로 돌아가기
                        </button>
                    </div>
                </div>

                {showLeaderboard && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/90">
                        <div className="bg-gradient-to-b from-[#1a3a4a] to-[#0f2937] p-6 rounded-xl w-80 relative border border-cyan-500/20">
                            <button
                                onClick={() => setShowLeaderboard(false)}
                                className="absolute top-2 right-3 text-xl font-bold text-cyan-300"
                            >
                                ×
                            </button>
                            <h2 className="text-2xl font-bold mb-4 text-cyan-100">기록</h2>
                            {leaderboard.length === 0 ? (
                                <p className="text-cyan-400/60">기록이 없습니다.</p>
                            ) : (
                                <ul className="space-y-2">
                                    {leaderboard.map((entry, i) => (
                                        <li
                                            key={i}
                                            className="flex justify-between border-b border-cyan-500/20 pb-1 text-sm text-cyan-200"
                                        >
                                            <span>
                                                {i + 1}. {entry.gridSize}×{entry.gridSize}
                                                {entry.hintCount ? ` 💡${entry.hintCount}` : ''}
                                            </span>
                                            <span className="font-mono">
                                                {entry.moves}회 / {entry.time.toFixed(2)}초
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
                <div className="bg-gradient-to-b from-[#1a3a4a]/90 to-[#0f2937]/90 rounded-2xl text-white backdrop-blur-md border border-cyan-500/20 overflow-hidden min-w-[160px] sm:min-w-[200px]">
                    {/* Header */}
                    <div className="flex items-center justify-between p-3 sm:p-4">
                        <h1 className="text-base sm:text-xl font-bold text-cyan-100">
                            <span className="mr-2">🎄</span>메모리 카드
                        </h1>
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="text-xl sm:text-2xl px-1"
                        >
                            {showSettings ? '✕' : '⚙️'}
                        </button>
                    </div>

                    {/* Quick buttons */}
                    <div className="flex border-t border-cyan-500/20">
                        <button
                            onClick={onBack}
                            className="flex-1 py-3 sm:py-4 text-center text-cyan-300 active:bg-cyan-500/10 transition border-r border-cyan-500/20"
                        >
                            <span className="text-xl sm:text-2xl">←</span>
                        </button>
                        <button
                            onClick={() => requestViewReset()}
                            className="flex-1 py-3 sm:py-4 text-center text-cyan-300 active:bg-cyan-500/10 transition border-r border-cyan-500/20"
                            title="3D 뷰 초기화"
                        >
                            <span className="text-xl sm:text-2xl">🔄</span>
                        </button>
                        <button
                            onClick={showHint}
                            disabled={hintActive || isProcessing || flippedCards.length > 0}
                            className={`flex-1 py-3 sm:py-4 text-center transition ${
                                hintActive || isProcessing || flippedCards.length > 0
                                    ? 'text-gray-600 cursor-not-allowed'
                                    : 'text-yellow-400 active:bg-cyan-500/10'
                            }`}
                        >
                            <span className="text-xl sm:text-2xl">💡</span>
                        </button>
                    </div>

                    {/* Settings */}
                    {showSettings && (
                        <div className="p-3 sm:p-4 border-t border-cyan-500/20 space-y-3">
                            {/* Grid Size */}
                            <div>
                                <div className="text-xs text-cyan-400/60 mb-1.5">크기</div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setGridSize(4);
                                            setShowSettings(false);
                                        }}
                                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${
                                            gridSize === 4
                                                ? 'bg-cyan-500 text-white'
                                                : 'bg-cyan-900/50 text-cyan-300'
                                        }`}
                                    >
                                        4×4
                                    </button>
                                    <button
                                        onClick={() => {
                                            setGridSize(5);
                                            setShowSettings(false);
                                        }}
                                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${
                                            gridSize === 5
                                                ? 'bg-cyan-500 text-white'
                                                : 'bg-cyan-900/50 text-cyan-300'
                                        }`}
                                    >
                                        5×5
                                    </button>
                                </div>
                            </div>

                            {/* Leaderboard */}
                            <button
                                onClick={() => {
                                    setShowLeaderboard(!showLeaderboard);
                                    setShowSettings(false);
                                }}
                                className="w-full text-left text-sm text-cyan-300 active:text-cyan-100 py-1"
                            >
                                📊 기록
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Panel - Stats */}
                <div className="flex gap-2 sm:gap-3">
                    <div className="bg-gradient-to-b from-[#1a3a4a]/90 to-[#0f2937]/90 px-4 py-3 sm:px-5 sm:py-4 rounded-2xl text-white backdrop-blur-md border border-cyan-500/20">
                        <div className="text-xs sm:text-sm text-cyan-400/60 uppercase">시간</div>
                        <div className="text-xl sm:text-3xl font-mono font-bold text-yellow-300">
                            {timeDisplay}
                        </div>
                    </div>
                    <div className="bg-gradient-to-b from-[#1a3a4a]/90 to-[#0f2937]/90 px-4 py-3 sm:px-5 sm:py-4 rounded-2xl text-white backdrop-blur-md border border-cyan-500/20">
                        <div className="text-xs sm:text-sm text-cyan-400/60 uppercase">짝</div>
                        <div className="text-xl sm:text-2xl font-mono font-bold text-cyan-100">
                            {matchedPairs}/{totalPairs}
                        </div>
                    </div>
                </div>
            </div>

            {/* Leaderboard Modal */}
            {showLeaderboard && (
                <div className="absolute top-20 left-6 pointer-events-auto bg-gradient-to-b from-[#1a3a4a] to-[#0f2937] p-4 rounded-xl w-72 shadow-xl z-50 border border-cyan-500/20">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-cyan-100">기록</h2>
                        <button
                            onClick={() => setShowLeaderboard(false)}
                            className="text-cyan-400/60 hover:text-cyan-100 text-xl font-bold leading-none"
                        >
                            ×
                        </button>
                    </div>
                    {leaderboard.length === 0 ? (
                        <p className="text-cyan-400/60 text-sm">기록이 없습니다.</p>
                    ) : (
                        <ul className="space-y-1">
                            {leaderboard.map((entry, i) => (
                                <li
                                    key={i}
                                    className="flex justify-between border-b border-cyan-500/20 pb-1 text-sm text-cyan-200"
                                >
                                    <span>
                                        {i + 1}. {entry.gridSize}×{entry.gridSize}
                                        {entry.hintCount ? ` 💡${entry.hintCount}` : ''}
                                    </span>
                                    <span className="font-mono">
                                        {entry.moves}회 - {entry.time.toFixed(2)}초
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {/* Bottom - Small New Game Button */}
            <div className="flex flex-col items-center gap-2 pointer-events-auto mb-4">
                <div className="flex items-center gap-2 text-cyan-300/70 text-xs">
                    <span className="bg-cyan-500/10 px-2 py-0.5 rounded-full font-bold border border-cyan-500/20">{gridSize}×{gridSize}</span>
                    <span>•</span>
                    <span>횟수: {moveCount}</span>
                </div>
                <button
                    onClick={() => scramble()}
                    className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-bold rounded-full shadow-lg hover:from-cyan-400 hover:to-blue-400 transition"
                >
                    🎮 새 게임
                </button>
            </div>

            <div className="absolute bottom-3 left-4 sm:bottom-4 sm:left-6 text-cyan-400/50 text-xs sm:text-sm">
                🎯 같은 그림의 카드 짝을 찾으세요
            </div>
        </div>
    );
};
