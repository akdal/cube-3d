import { useEffect, useState, useRef } from 'react';
import { usePuzzleStore } from './usePuzzleStore';
import { useCelebration } from '../../components/Celebration';

interface PuzzleUIProps {
    onBack: () => void;
}

export const PuzzleUI = ({ onBack }: PuzzleUIProps) => {
    const {
        gameStatus,
        startTime,
        moveCount,
        gridSize,
        setGridSize,
        initGame,
        scramble,
        leaderboard,
        hintCount,
        showHint,
        hintActive,
    } = usePuzzleStore();

    const [showSettings, setShowSettings] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [now, setNow] = useState(() => Date.now());
    const { celebrate } = useCelebration();
    const celebratedRef = useRef(false);

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

    // Solved screen
    if (gameStatus === 'SOLVED') {
        return (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
                <div className="bg-white p-8 rounded-2xl shadow-2xl text-center max-w-sm w-full">
                    <h1 className="text-4xl font-bold text-green-600 mb-4">완료!</h1>
                    <div className="text-2xl mb-2">
                        시간: <span className="font-mono">{timeDisplay}</span>초
                    </div>
                    <div className="text-xl mb-2">횟수: {moveCount}회</div>
                    {hintCount > 0 && (
                        <div className="text-purple-500 text-sm mb-4">
                            💡 힌트 사용: {hintCount}회
                        </div>
                    )}

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => scramble()}
                            className="px-8 py-4 bg-blue-600 text-white text-lg rounded-full font-bold hover:bg-blue-700 transition"
                        >
                            다시 하기
                        </button>
                        <button
                            onClick={() => setShowLeaderboard(true)}
                            className="text-gray-500 underline hover:text-gray-800"
                        >
                            기록 보기
                        </button>
                        <button
                            onClick={onBack}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            메뉴로 돌아가기
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
                            <h2 className="text-2xl font-bold mb-4">기록</h2>
                            {leaderboard.length === 0 ? (
                                <p className="text-gray-500">기록이 없습니다.</p>
                            ) : (
                                <ul className="space-y-2">
                                    {leaderboard.map((entry, i) => (
                                        <li
                                            key={i}
                                            className="flex justify-between border-b pb-1 text-sm"
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
                <div className="bg-black/60 rounded-2xl text-white backdrop-blur-md border border-white/10 overflow-hidden min-w-[160px] sm:min-w-[200px]">
                    {/* Header */}
                    <div className="flex items-center justify-between p-3 sm:p-4">
                        <h1 className="text-base sm:text-xl font-bold">슬라이드 퍼즐</h1>
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="text-xl sm:text-2xl px-1"
                        >
                            {showSettings ? '✕' : '⚙️'}
                        </button>
                    </div>

                    {/* Quick buttons */}
                    <div className="flex border-t border-white/10">
                        <button
                            onClick={onBack}
                            className="flex-1 py-3 sm:py-4 text-center text-gray-300 active:bg-white/10 transition border-r border-white/10"
                        >
                            <span className="text-xl sm:text-2xl">←</span>
                        </button>
                        <button
                            onClick={() => initGame()}
                            className="flex-1 py-3 sm:py-4 text-center text-gray-300 active:bg-white/10 transition border-r border-white/10"
                        >
                            <span className="text-xl sm:text-2xl">↺</span>
                        </button>
                        <button
                            onClick={showHint}
                            disabled={hintActive}
                            className={`flex-1 py-3 sm:py-4 text-center transition ${
                                hintActive
                                    ? 'text-gray-600 cursor-not-allowed'
                                    : 'text-yellow-400 active:bg-white/10'
                            }`}
                        >
                            <span className="text-xl sm:text-2xl">💡</span>
                        </button>
                    </div>

                    {/* Settings */}
                    {showSettings && (
                        <div className="p-3 sm:p-4 border-t border-white/10 space-y-3">
                            {/* Grid Size */}
                            <div>
                                <div className="text-xs text-gray-400 mb-1.5">크기</div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setGridSize(2);
                                            setShowSettings(false);
                                        }}
                                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${
                                            gridSize === 2
                                                ? 'bg-yellow-500 text-black'
                                                : 'bg-gray-700 text-gray-300'
                                        }`}
                                    >
                                        2×2
                                    </button>
                                    <button
                                        onClick={() => {
                                            setGridSize(3);
                                            setShowSettings(false);
                                        }}
                                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${
                                            gridSize === 3
                                                ? 'bg-yellow-500 text-black'
                                                : 'bg-gray-700 text-gray-300'
                                        }`}
                                    >
                                        3×3
                                    </button>
                                    <button
                                        onClick={() => {
                                            setGridSize(4);
                                            setShowSettings(false);
                                        }}
                                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${
                                            gridSize === 4
                                                ? 'bg-yellow-500 text-black'
                                                : 'bg-gray-700 text-gray-300'
                                        }`}
                                    >
                                        4×4
                                    </button>
                                </div>
                            </div>

                            {/* New Game */}
                            <button
                                onClick={() => { scramble(); setShowSettings(false); }}
                                className="w-full py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold rounded-lg text-sm"
                            >
                                🎮 새 게임
                            </button>

                            {/* Leaderboard */}
                            <button
                                onClick={() => {
                                    setShowLeaderboard(!showLeaderboard);
                                    setShowSettings(false);
                                }}
                                className="w-full text-left text-sm text-blue-300 active:text-blue-100 py-1"
                            >
                                📊 기록
                            </button>
                        </div>
                    )}
                </div>

                {/* Right Panel - Stats */}
                <div className="flex gap-2 sm:gap-3">
                    <div className="bg-black/60 px-4 py-3 sm:px-5 sm:py-4 rounded-2xl text-white backdrop-blur-md border border-white/10">
                        <div className="text-xs sm:text-sm text-gray-400 uppercase">시간</div>
                        <div className="text-xl sm:text-3xl font-mono font-bold text-yellow-400">
                            {timeDisplay}
                        </div>
                    </div>
                    <div className="bg-black/60 px-4 py-3 sm:px-5 sm:py-4 rounded-2xl text-white backdrop-blur-md border border-white/10">
                        <div className="text-xs sm:text-sm text-gray-400 uppercase">횟수</div>
                        <div className="text-xl sm:text-2xl font-mono font-bold">{moveCount}</div>
                    </div>
                </div>
            </div>

            {/* Leaderboard Modal */}
            {showLeaderboard && (
                <div className="absolute top-20 left-6 pointer-events-auto bg-white p-4 rounded-xl w-72 shadow-xl z-50">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-black">기록</h2>
                        <button
                            onClick={() => setShowLeaderboard(false)}
                            className="text-gray-500 hover:text-black text-xl font-bold leading-none"
                        >
                            ×
                        </button>
                    </div>
                    {leaderboard.length === 0 ? (
                        <p className="text-gray-500 text-sm">기록이 없습니다.</p>
                    ) : (
                        <ul className="space-y-1">
                            {leaderboard.map((entry, i) => (
                                <li
                                    key={i}
                                    className="flex justify-between border-b border-gray-200 pb-1 text-sm text-black"
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

            {/* Bottom - Scramble button */}
            <div className="flex flex-col items-center gap-3 pointer-events-auto mb-6 sm:mb-8">
                <div className="flex items-center gap-2 text-white/70 text-sm sm:text-base">
                    <span className="bg-white/10 px-3 py-1 rounded-full font-bold">
                        {gridSize}×{gridSize}
                    </span>
                </div>

                <button
                    onClick={() => scramble()}
                    className="px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg sm:text-xl font-bold rounded-2xl shadow-lg hover:from-purple-600 hover:to-pink-600 transition transform hover:scale-105"
                >
                    섞기
                </button>
            </div>

            <div className="absolute bottom-3 left-4 sm:bottom-4 sm:left-6 text-white/50 text-xs sm:text-sm">
                🎯 1~{gridSize * gridSize - 1}을 순서대로 정렬하세요 • 클릭으로 슬라이드
            </div>
        </div>
    );
};
