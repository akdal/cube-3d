import { useEffect, useState, useRef } from 'react';
import { useStore } from '../store/useStore';
import { useCelebration } from './Celebration';

interface UIProps {
    onBack?: () => void;
}

export const UI = ({ onBack }: UIProps) => {
    const {
        gameStatus,
        startTime,
        moveCount,
        scramble,
        isSolving,
        leaderboard,
        orbitLocked,
        toggleOrbitLock,
        cubeLocked,
        toggleCubeLock,
        requestViewReset,
        cubeSize,
        setCubeSize,
        difficulty,
        setDifficulty,
    } = useStore();

    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [now, setNow] = useState(() => Date.now());
    const [hideTimer, setHideTimer] = useState(false);
    const { celebrate } = useCelebration();
    const celebratedRef = useRef(false);

    useEffect(() => {
        if (gameStatus === 'SOLVED' && !celebratedRef.current) {
            celebratedRef.current = true;
            celebrate('fireworks');
        } else if (gameStatus !== 'SOLVED') {
            celebratedRef.current = false;
        }
    }, [gameStatus, celebrate]);

    useEffect(() => {
        if (!isSolving || !startTime) return;
        const interval = setInterval(() => {
            setNow(Date.now());
        }, 50);
        return () => clearInterval(interval);
    }, [isSolving, startTime]);

    const timeDisplay = (gameStatus === 'IDLE' || !startTime)
        ? "0.00"
        : ((now - startTime) / 1000).toFixed(2);

    // Solved screen - Winter theme
    if (gameStatus === 'SOLVED') {
        const currentTime = startTime ? (now - startTime) / 1000 : 0;

        // Check if this is a new record
        const isNewRecord = leaderboard.length <= 1 ||
            (leaderboard.length > 1 && currentTime < leaderboard[1].time);

        return (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-[#0a1628]/95 to-[#1a3a4a]/95 backdrop-blur-sm">
                <div className="bg-gradient-to-b from-[#1a3a4a] to-[#0f2937] p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full border border-cyan-500/20">
                    <div className="text-4xl mb-2">{isNewRecord ? '🏆' : '🎄'}</div>
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300 mb-2">
                        {isNewRecord ? '새로운 기록!' : '잘했어요!'}
                    </h1>
                    <p className="text-lg text-cyan-200 mb-4">
                        {isNewRecord
                            ? `${cubeSize}×${cubeSize} 큐브를 ${timeDisplay}초 만에 맞췄어요!`
                            : `${cubeSize}×${cubeSize} 큐브를 완성했어요!`
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
                    </div>
                </div>

                {showLeaderboard && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/90">
                        <div className="bg-gradient-to-b from-[#1a3a4a] to-[#0f2937] p-6 rounded-xl w-80 relative border border-cyan-500/20">
                            <button onClick={() => setShowLeaderboard(false)} className="absolute top-2 right-3 text-xl font-bold text-cyan-300">×</button>
                            <h2 className="text-2xl font-bold mb-4 text-cyan-100">기록</h2>
                            {leaderboard.length === 0 ? (
                                <p className="text-cyan-400/60">기록이 없습니다.</p>
                            ) : (
                                <ul className="space-y-2">
                                    {leaderboard.map((entry, i) => (
                                        <li key={i} className="flex justify-between border-b border-cyan-500/20 pb-1 text-sm text-cyan-200">
                                            <span>{i + 1}. {new Date(entry.date).toLocaleDateString()}</span>
                                            <span className="font-mono">{entry.time.toFixed(2)}초</span>
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
                            <span className="mr-2">🎲</span>루빅스 큐브
                        </h1>
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="text-xl sm:text-2xl px-1"
                        >
                            {showSettings ? '✕' : '⚙️'}
                        </button>
                    </div>

                    {/* Quick Buttons */}
                    <div className="flex border-t border-cyan-500/20">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="flex-1 py-3 sm:py-4 text-center text-cyan-300 active:bg-cyan-500/10 transition border-r border-cyan-500/20"
                            >
                                <span className="text-xl sm:text-2xl">←</span>
                            </button>
                        )}
                        <button
                            onClick={toggleOrbitLock}
                            className={`flex-1 py-3 sm:py-4 text-center transition border-r border-cyan-500/20 ${orbitLocked ? 'bg-red-600/80 text-white' : 'text-cyan-300 active:bg-cyan-500/10'
                                }`}
                        >
                            <span className="text-xl sm:text-2xl">{orbitLocked ? '🔒' : '🌐'}</span>
                        </button>
                        <button
                            onClick={toggleCubeLock}
                            className={`flex-1 py-3 sm:py-4 text-center transition border-r border-cyan-500/20 ${cubeLocked ? 'bg-red-600/80 text-white' : 'text-cyan-300 active:bg-cyan-500/10'
                                }`}
                        >
                            <span className="text-xl sm:text-2xl">{cubeLocked ? '🔒' : '🎲'}</span>
                        </button>
                        <button
                            onClick={requestViewReset}
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
                                onClick={() => { scramble(); setShowSettings(false); }}
                                className="w-full text-left text-sm text-cyan-300 active:text-cyan-100 py-1"
                            >
                                🎮 새 게임
                            </button>
                            {/* Cube Size */}
                            <div>
                                <div className="text-xs text-cyan-400/60 mb-1.5">크기</div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCubeSize(2)}
                                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${cubeSize === 2 ? 'bg-cyan-500 text-white' : 'bg-cyan-900/50 text-cyan-300'
                                            }`}
                                    >
                                        2×2
                                    </button>
                                    <button
                                        onClick={() => setCubeSize(3)}
                                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition ${cubeSize === 3 ? 'bg-cyan-500 text-white' : 'bg-cyan-900/50 text-cyan-300'
                                            }`}
                                    >
                                        3×3
                                    </button>
                                </div>
                            </div>

                            {/* Difficulty */}
                            <div>
                                <div className="text-xs text-cyan-400/60 mb-1.5">난이도</div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setDifficulty('easy')}
                                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${difficulty === 'easy' ? 'bg-green-500 text-white' : 'bg-cyan-900/50 text-cyan-300'
                                            }`}
                                    >
                                        쉬움
                                    </button>
                                    <button
                                        onClick={() => setDifficulty('medium')}
                                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${difficulty === 'medium' ? 'bg-yellow-500 text-black' : 'bg-cyan-900/50 text-cyan-300'
                                            }`}
                                    >
                                        보통
                                    </button>
                                    <button
                                        onClick={() => setDifficulty('hard')}
                                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${difficulty === 'hard' ? 'bg-red-500 text-white' : 'bg-cyan-900/50 text-cyan-300'
                                            }`}
                                    >
                                        어려움
                                    </button>
                                </div>
                            </div>

                            {/* Leaderboard */}
                            <button
                                onClick={() => { setShowLeaderboard(!showLeaderboard); setShowSettings(false); }}
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
                        <div className="text-xl sm:text-2xl font-mono font-bold text-cyan-100">{moveCount}</div>
                    </div>
                </div>
            </div>

            {/* Leaderboard Modal */}
            {showLeaderboard && (
                <div className="absolute top-20 left-6 pointer-events-auto bg-gradient-to-b from-[#1a3a4a] to-[#0f2937] p-4 rounded-xl w-64 shadow-xl z-50 border border-cyan-500/20">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-cyan-100">기록</h2>
                        <button onClick={() => setShowLeaderboard(false)} className="text-cyan-400/60 hover:text-cyan-100 text-xl font-bold">×</button>
                    </div>
                    {leaderboard.length === 0 ? (
                        <p className="text-cyan-400/60 text-sm">기록이 없습니다.</p>
                    ) : (
                        <ul className="space-y-1">
                            {leaderboard.map((entry, i) => (
                                <li key={i} className="flex justify-between border-b border-cyan-500/20 pb-1 text-sm text-cyan-200">
                                    <span>{i + 1}. {entry.time.toFixed(2)}초</span>
                                    <span className="text-cyan-400/60 text-xs">{new Date(entry.date).toLocaleDateString()}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {/* Bottom - Info */}
            <div className="flex flex-col items-center gap-2 pointer-events-auto mb-4">
                <div className="flex items-center gap-2 text-cyan-300/70 text-xs">
                    <span className="bg-cyan-500/10 px-2 py-0.5 rounded-full font-bold border border-cyan-500/20">{cubeSize}×{cubeSize}</span>
                    <span>•</span>
                    <span>{difficulty === 'easy' ? '쉬움' : difficulty === 'medium' ? '보통' : '어려움'}</span>
                </div>
            </div>

            <div className="absolute bottom-3 left-4 sm:bottom-4 sm:left-6 text-cyan-400/50 text-xs sm:text-sm">
                🎯 모든 면의 색상을 맞추세요 • 드래그로 회전
            </div>
        </div>
    );
};
