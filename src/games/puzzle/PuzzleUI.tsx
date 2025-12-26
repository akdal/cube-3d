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
        scramble,
        leaderboard,
        hintCount,
        showHint,
        hintActive,
        requestViewReset,
    } = usePuzzleStore();

    const [showSettings, setShowSettings] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [now, setNow] = useState(() => Date.now());
    const [hideTimer, setHideTimer] = useState(false);
    const [showModal, setShowModal] = useState(false);
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

    // Delayed modal when solved
    useEffect(() => {
        if (gameStatus === 'SOLVED') {
            const timer = setTimeout(() => {
                setShowModal(true);
            }, 1200); // 1.2 second delay
            return () => clearTimeout(timer);
        } else {
            setShowModal(false);
        }
    }, [gameStatus]);

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

    // Solved screen - Winter theme
    if (showModal) {
        const currentTime = startTime ? (now - startTime) / 1000 : 0;

        // Check if this is a new record (best time for same grid size)
        const sameGridRecords = leaderboard.filter(e => e.gridSize === gridSize);
        const isNewRecord = sameGridRecords.length <= 1 ||
            (sameGridRecords.length > 1 && currentTime < sameGridRecords[1].time);

        return (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-[#0a1628]/95 to-[#1a3a4a]/95 backdrop-blur-sm">
                {/* Snowflakes decoration */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(12)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute text-white/15 animate-pulse"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                fontSize: `${Math.random() * 16 + 10}px`,
                                animationDelay: `${Math.random() * 2}s`,
                            }}
                        >
                            ❄️
                        </div>
                    ))}
                </div>

                <div className="bg-gradient-to-b from-[#1a3a4a] to-[#0f2937] p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full border border-cyan-500/20">
                    <div className="text-4xl mb-2">{isNewRecord ? '🏆' : '🧩'}</div>
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300 mb-2">
                        {isNewRecord ? '새로운 기록!' : '잘했어요!'}
                    </h1>
                    <p className="text-lg text-cyan-200 mb-4">
                        {isNewRecord
                            ? `${gridSize}×${gridSize} 퍼즐을 ${timeDisplay}초 만에 완성했어요!`
                            : `${gridSize}×${gridSize} 퍼즐을 완성했어요!`
                        }
                    </p>
                    <div className="bg-cyan-900/30 rounded-xl p-4 mb-4">
                        <div className="flex justify-center gap-6 text-sm">
                            <div>
                                <div className="text-cyan-400/60">시간</div>
                                <div className="text-xl font-mono font-bold text-yellow-300">{timeDisplay}초</div>
                            </div>
                            <div>
                                <div className="text-cyan-400/60">횟수</div>
                                <div className="text-xl font-mono font-bold text-cyan-100">{moveCount}회</div>
                            </div>
                        </div>
                    </div>
                    {hintCount > 0 && (
                        <div className="text-purple-400 text-sm mb-2">
                            💡 힌트를 {hintCount}번 사용했어요
                        </div>
                    )}

                    <button
                        onClick={() => scramble()}
                        className="px-8 py-4 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 text-white text-lg rounded-full font-bold hover:from-red-400 hover:via-yellow-400 hover:to-green-400 transition shadow-lg mt-2"
                    >
                        ❄️ 다시 하기
                    </button>
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
                                            className="border-b border-cyan-500/20 pb-1 text-sm text-cyan-200"
                                        >
                                            <div className="flex justify-between">
                                                <span>
                                                    {i + 1}. {entry.gridSize}×{entry.gridSize}
                                                    {entry.hintCount ? ` 💡${entry.hintCount}` : ''}
                                                </span>
                                                <span className="font-mono">
                                                    {entry.moves}회 - {entry.time.toFixed(2)}초
                                                </span>
                                            </div>
                                            <div className="text-cyan-400/50 text-xs">
                                                {new Date(entry.date).toLocaleString('ko-KR')}
                                            </div>
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
                            <span className="mr-2">🧩</span>슬라이드 퍼즐
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
                            <span className="text-xl sm:text-2xl">🏠</span>
                        </button>
                        <button
                            onClick={() => requestViewReset()}
                            className="flex-1 py-3 sm:py-4 text-center text-cyan-300 active:bg-cyan-500/10 transition border-r border-cyan-500/20"
                            title="3D 뷰 초기화"
                        >
                            <span className="text-xl sm:text-2xl">🔄</span>
                        </button>
                        <button
                            onClick={() => scramble()}
                            className="flex-1 py-3 sm:py-4 text-center text-yellow-400 active:bg-cyan-500/10 transition font-bold text-sm"
                            title="새 게임"
                        >
                            NEW
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
                                            setGridSize(2);
                                            setShowSettings(false);
                                        }}
                                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${
                                            gridSize === 2
                                                ? 'bg-cyan-500 text-white'
                                                : 'bg-cyan-900/50 text-cyan-300'
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
                                                ? 'bg-cyan-500 text-white'
                                                : 'bg-cyan-900/50 text-cyan-300'
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
                                                ? 'bg-cyan-500 text-white'
                                                : 'bg-cyan-900/50 text-cyan-300'
                                        }`}
                                    >
                                        4×4
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
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-cyan-400/60 uppercase">
                            <span>시간</span>
                            <button
                                onClick={() => setHideTimer(!hideTimer)}
                                className="text-sm sm:text-base hover:text-cyan-300 transition"
                                title={hideTimer ? '시간 보기' : '시간 숨기기'}
                            >
                                {hideTimer ? '😎' : '🙂'}
                            </button>
                        </div>
                        <div className="text-lg sm:text-xl font-mono font-bold text-yellow-300">
                            {hideTimer ? '---' : timeDisplay}
                        </div>
                    </div>
                    <div className="bg-gradient-to-b from-[#1a3a4a]/90 to-[#0f2937]/90 px-4 py-3 sm:px-5 sm:py-4 rounded-2xl text-white backdrop-blur-md border border-cyan-500/20">
                        <div className="text-xs sm:text-sm text-cyan-400/60 uppercase">횟수</div>
                        <div className="text-base sm:text-lg font-mono font-bold text-cyan-100">{moveCount}</div>
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
                                    className="border-b border-cyan-500/20 pb-1 text-sm text-cyan-200"
                                >
                                    <div className="flex justify-between">
                                        <span>
                                            {i + 1}. {entry.gridSize}×{entry.gridSize}
                                            {entry.hintCount ? ` 💡${entry.hintCount}` : ''}
                                        </span>
                                        <span className="font-mono">
                                            {entry.moves}회 - {entry.time.toFixed(2)}초
                                        </span>
                                    </div>
                                    <div className="text-cyan-400/50 text-xs">
                                        {new Date(entry.date).toLocaleString('ko-KR')}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {/* Bottom - Info and Hint */}
            <div className="flex flex-col items-center gap-2 pointer-events-auto mb-4">
                <div className="flex items-center gap-2 text-cyan-300/70 text-xs">
                    <span className="bg-cyan-500/10 px-2 py-0.5 rounded-full font-bold border border-cyan-500/20">{gridSize}×{gridSize}</span>
                    {hintCount > 0 && (
                        <>
                            <span>•</span>
                            <span className="text-yellow-400">💡{hintCount}</span>
                        </>
                    )}
                </div>
                <button
                    onClick={showHint}
                    disabled={hintActive}
                    className={`px-6 py-2 text-sm font-bold rounded-full shadow-lg transition ${
                        hintActive
                            ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white hover:from-yellow-400 hover:to-amber-400'
                    }`}
                >
                    💡 힌트
                </button>
            </div>

            <div className="absolute bottom-3 left-4 sm:bottom-4 sm:left-6 text-cyan-400/50 text-xs sm:text-sm">
                🎯 1~{gridSize * gridSize - 1}을 순서대로 정렬하세요 • 클릭으로 슬라이드
            </div>
        </div>
    );
};
