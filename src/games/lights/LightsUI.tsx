import { useEffect, useState, useRef } from 'react';
import { useLightsStore } from './useLightsStore';
import { useCelebration } from '../../components/Celebration';

interface LightsUIProps {
    onBack: () => void;
}

export const LightsUI = ({ onBack }: LightsUIProps) => {
    const {
        gameStatus,
        startTime,
        moveCount,
        gridSize,
        level,
        setGridSize,
        initGame,
        nextLevel,
        leaderboard,
        requestViewReset,
    } = useLightsStore();

    const [showSettings, setShowSettings] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [isResultMinimized, setIsResultMinimized] = useState(false);
    const [now, setNow] = useState(() => Date.now());
    const [hideTimer, setHideTimer] = useState(false);
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
        const currentTime = startTime ? (now - startTime) / 1000 : 0;
        const sameRecords = leaderboard.filter(e => e.gridSize === gridSize && e.level === level);
        const isNewRecord = sameRecords.length <= 1 ||
            (sameRecords.length > 1 && currentTime < sameRecords[1].time);

        // Minimized result badge
        if (isResultMinimized) {
            return (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
                    <button
                        onClick={() => setIsResultMinimized(false)}
                        className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 text-white px-6 py-3 rounded-2xl shadow-lg border border-white/20 flex items-center gap-3 hover:scale-105 transition"
                    >
                        <span className="text-2xl">{isNewRecord ? '🏆' : '🎄'}</span>
                        <div className="text-left">
                            <div className="font-bold">트리 완성!</div>
                            <div className="text-xs opacity-80">{timeDisplay}초 • {moveCount}회</div>
                        </div>
                        <span className="text-lg ml-2">▲</span>
                    </button>
                </div>
            );
        }

        return (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-[#0a1628]/90 to-[#1a3a4a]/90 backdrop-blur-sm">
                <div className="bg-gradient-to-b from-[#1a3a4a] to-[#0f2937] p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full border border-cyan-500/20 relative">
                    {/* Minimize button */}
                    <button
                        onClick={() => setIsResultMinimized(true)}
                        className="absolute top-3 right-3 text-cyan-400/60 hover:text-cyan-200 text-sm px-2 py-1 rounded-lg hover:bg-cyan-500/10 transition"
                        title="결과 보기"
                    >
                        ▼ 축소
                    </button>

                    <div className="text-4xl mb-2">{isNewRecord ? '🏆' : '🎄'}</div>
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-yellow-300 to-green-400 mb-2">
                        {isNewRecord ? '새로운 기록!' : '트리 완성!'}
                    </h1>
                    <p className="text-lg text-cyan-200 mb-4">
                        {isNewRecord
                            ? `레벨 ${level}을 ${moveCount}번 만에 클리어!`
                            : `크리스마스 트리 불을 모두 껐어요! ⭐`
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
                            <div>
                                <div className="text-cyan-400/60">레벨</div>
                                <div className="text-xl font-mono font-bold text-amber-300">{level}</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => nextLevel()}
                            className="px-8 py-4 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 text-white text-lg rounded-full font-bold hover:from-red-400 hover:via-yellow-400 hover:to-green-400 transition shadow-lg"
                        >
                            🎄 다음 레벨
                        </button>
                        <button
                            onClick={() => { setIsResultMinimized(false); initGame(); }}
                            className="px-6 py-2 text-cyan-300 hover:text-cyan-100"
                        >
                            이 레벨 다시하기
                        </button>
                        <button
                            onClick={onBack}
                            className="text-cyan-400/60 hover:text-cyan-300"
                        >
                            메뉴로 돌아가기
                        </button>
                    </div>
                </div>
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
                            <span className="mr-2">🎄</span>트리 라이트
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
                            onClick={() => initGame()}
                            className="flex-1 py-3 sm:py-4 text-center text-yellow-400 active:bg-cyan-500/10 transition"
                        >
                            <span className="text-xl sm:text-2xl">🔃</span>
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
                            {/* Grid Size */}
                            <div>
                                <div className="text-xs text-cyan-400/60 mb-1.5">크기</div>
                                <div className="flex gap-2">
                                    {[3, 4, 5].map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => {
                                                setGridSize(size);
                                                setShowSettings(false);
                                            }}
                                            className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${
                                                gridSize === size
                                                    ? 'bg-cyan-500 text-white'
                                                    : 'bg-cyan-900/50 text-cyan-300'
                                            }`}
                                        >
                                            {size}×{size}
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
                        <div className="text-xs sm:text-sm text-cyan-400/60 uppercase">레벨</div>
                        <div className="text-xl sm:text-2xl font-mono font-bold text-amber-300">{level}</div>
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
                                        {i + 1}. Lv{entry.level} ({entry.gridSize}×{entry.gridSize})
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

            {/* Bottom - Info */}
            <div className="flex flex-col items-center gap-2 pointer-events-auto mb-4">
                <div className="flex items-center gap-2 text-cyan-300/70 text-xs">
                    <span className="bg-cyan-500/10 px-2 py-0.5 rounded-full font-bold border border-cyan-500/20">{gridSize}×{gridSize}</span>
                    <span>•</span>
                    <span>레벨: {level}</span>
                    <span>•</span>
                    <span>횟수: {moveCount}</span>
                </div>
            </div>

            <div className="absolute bottom-3 left-4 sm:bottom-4 sm:left-6 text-cyan-400/50 text-xs sm:text-sm">
                🎄 클릭하면 주변 불도 함께 바뀌어요 • 트리 불을 모두 끄세요
            </div>
        </div>
    );
};
