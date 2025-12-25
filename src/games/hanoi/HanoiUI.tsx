import { useEffect, useState, useRef } from 'react';
import { useHanoiStore, getMinMoves } from './useHanoiStore';
import { useCelebration } from '../../components/Celebration';

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
        hintCount,
        showHint,
        hintActive,
        requestViewReset,
    } = useHanoiStore();

    const [showSettings, setShowSettings] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [now, setNow] = useState(() => Date.now());
    const [hideTimer, setHideTimer] = useState(false);
    const { celebrate } = useCelebration();
    const celebratedRef = useRef(false);

    // Celebration effect when solved
    useEffect(() => {
        if (gameStatus === 'SOLVED' && !celebratedRef.current) {
            celebratedRef.current = true;
            const isPerfect = moveCount === getMinMoves(diskCount);
            celebrate(isPerfect ? 'stars' : 'default');
        } else if (gameStatus !== 'SOLVED') {
            celebratedRef.current = false;
        }
    }, [gameStatus, celebrate, moveCount, diskCount]);

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

    // Solved screen - Winter theme
    if (gameStatus === 'SOLVED') {
        const isPerfect = moveCount === minMoves;
        const currentTime = startTime ? (now - startTime) / 1000 : 0;

        // Check if this is a new record (best time for same disk count)
        const sameDisksRecords = leaderboard.filter(e => e.diskCount === diskCount);
        const isNewRecord = sameDisksRecords.length <= 1 ||
            (sameDisksRecords.length > 1 && currentTime < sameDisksRecords[1].time);

        return (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-[#0a1628]/95 to-[#1a3a4a]/95 backdrop-blur-sm">
                <div className="bg-gradient-to-b from-[#1a3a4a] to-[#0f2937] p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full border border-cyan-500/20">
                    <div className="text-4xl mb-2">{isNewRecord ? '🏆' : '🎄'}</div>
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300 mb-2">
                        {isNewRecord ? '새로운 기록!' : isPerfect ? '완벽해요!' : '잘했어요!'}
                    </h1>
                    <p className="text-lg text-cyan-200 mb-4">
                        {isNewRecord
                            ? `${diskCount}개 원반을 ${timeDisplay}초 만에 옮겼어요!`
                            : isPerfect
                                ? `최소 횟수로 완료했어요!`
                                : `${diskCount}개의 원반을 모두 옮겼어요!`
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
                                <div className="text-xl font-mono font-bold text-cyan-100">{moveCount}/{minMoves}</div>
                            </div>
                        </div>
                    </div>
                    {hintCount > 0 && (
                        <div className="text-purple-400 text-sm mb-2">
                            💡 힌트를 {hintCount}번 사용했어요
                        </div>
                    )}

                    <div className="flex flex-col gap-3 mt-6">
                        <button
                            onClick={() => initGame()}
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
                                                {i + 1}. {entry.diskCount}개
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
                            <span className="mr-2">🗼</span>하노이 탑
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
                            className="flex-1 py-3 sm:py-4 text-center text-cyan-300 active:bg-cyan-500/10 transition"
                            title="3D 뷰 초기화"
                        >
                            <span className="text-xl sm:text-2xl">🔄</span>
                        </button>
                    </div>

                    {/* Settings */}
                    {showSettings && (
                        <div className="p-3 sm:p-4 border-t border-cyan-500/20 space-y-3">
                            {/* New Game */}
                            <button
                                onClick={() => {
                                    initGame();
                                    setShowSettings(false);
                                }}
                                className="w-full text-left text-sm text-cyan-300 active:text-cyan-100 py-1"
                            >
                                🎮 새 게임
                            </button>
                            {/* Disk Count */}
                            <div>
                                <div className="text-xs text-cyan-400/60 mb-1.5">
                                    원반 개수
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
                                                    ? 'bg-cyan-500 text-white'
                                                    : 'bg-cyan-900/50 text-cyan-300'
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
                                {hideTimer ? '🙈' : '👁️'}
                            </button>
                        </div>
                        <div className="text-xl sm:text-3xl font-mono font-bold text-yellow-300">
                            {hideTimer ? '---' : timeDisplay}
                        </div>
                    </div>
                    <div className="bg-gradient-to-b from-[#1a3a4a]/90 to-[#0f2937]/90 px-4 py-3 sm:px-5 sm:py-4 rounded-2xl text-white backdrop-blur-md border border-cyan-500/20">
                        <div className="text-xs sm:text-sm text-cyan-400/60 uppercase">횟수</div>
                        <div className="text-xl sm:text-2xl font-mono font-bold text-cyan-100">
                            {moveCount}
                            <span className="text-sm text-cyan-400/60">/{minMoves}</span>
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
                                        {i + 1}. {entry.diskCount}개
                                        {entry.hintCount ? ` 💡${entry.hintCount}` : ''}
                                    </span>
                                    <span className="font-mono">
                                        {entry.moves}/{getMinMoves(entry.diskCount)} - {entry.time.toFixed(2)}초
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {/* Bottom - Info and Hint */}
            <div className="flex flex-col items-center gap-2 pointer-events-auto mb-4">
                <div className="flex items-center gap-2 text-cyan-300/70 text-xs">
                    <span className="bg-cyan-500/10 px-2 py-0.5 rounded-full font-bold border border-cyan-500/20">{diskCount}개</span>
                    <span>•</span>
                    <span>최소: {minMoves}회</span>
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
                🎯 모든 원반을 하얀색 기둥으로 옮기세요 • 클릭으로 이동
            </div>
        </div>
    );
};
