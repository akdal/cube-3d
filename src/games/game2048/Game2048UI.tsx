import { useState, useEffect, useRef } from 'react';
import { use2048Store } from './use2048Store';
import { useCelebration } from '../../components/Celebration';

interface Game2048UIProps {
    onBack: () => void;
}

export const Game2048UI = ({ onBack }: Game2048UIProps) => {
    const {
        gameStatus,
        score,
        bestScore,
        moveCount,
        tiles,
        initGame,
        continueGame,
        leaderboard,
    } = use2048Store();

    const [showSettings, setShowSettings] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const { celebrate } = useCelebration();
    const celebratedRef = useRef(false);

    const maxTile = tiles.reduce((max, t) => Math.max(max, t.value), 0);

    // Celebration effect
    useEffect(() => {
        if (gameStatus === 'WON' && !celebratedRef.current) {
            celebratedRef.current = true;
            celebrate('stars');
        } else if (gameStatus !== 'WON') {
            celebratedRef.current = false;
        }
    }, [gameStatus, celebrate]);

    // Won screen
    if (gameStatus === 'WON') {
        return (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-[#0a1628]/95 to-[#1a3a4a]/95 backdrop-blur-sm">
                <div className="bg-gradient-to-b from-[#1a3a4a] to-[#0f2937] p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full border border-cyan-500/20">
                    <div className="text-4xl mb-2">🎉</div>
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-300 mb-2">
                        2048 달성!
                    </h1>
                    <p className="text-lg text-cyan-200 mb-4">
                        축하해요! 2048 타일을 만들었어요!
                    </p>
                    <div className="bg-cyan-900/30 rounded-xl p-4 mb-4">
                        <div className="flex justify-center gap-6 text-sm">
                            <div>
                                <div className="text-cyan-400/60">점수</div>
                                <div className="text-xl font-mono font-bold text-yellow-300">{score}</div>
                            </div>
                            <div>
                                <div className="text-cyan-400/60">횟수</div>
                                <div className="text-xl font-mono font-bold text-cyan-100">{moveCount}회</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={continueGame}
                            className="px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-lg rounded-full font-bold hover:from-amber-400 hover:to-yellow-400 transition shadow-lg"
                        >
                            🚀 계속하기
                        </button>
                        <button
                            onClick={() => initGame()}
                            className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full font-bold hover:from-cyan-400 hover:to-blue-400 transition"
                        >
                            🎮 새 게임
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

    // Lost screen
    if (gameStatus === 'LOST') {
        return (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-[#0a1628]/95 to-[#1a3a4a]/95 backdrop-blur-sm">
                <div className="bg-gradient-to-b from-[#1a3a4a] to-[#0f2937] p-8 rounded-3xl shadow-2xl text-center max-w-sm w-full border border-cyan-500/20">
                    <div className="text-4xl mb-2">😅</div>
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-300 mb-2">
                        게임 오버
                    </h1>
                    <p className="text-lg text-cyan-200 mb-4">
                        더 이상 움직일 수 없어요
                    </p>
                    <div className="bg-cyan-900/30 rounded-xl p-4 mb-4">
                        <div className="flex justify-center gap-6 text-sm">
                            <div>
                                <div className="text-cyan-400/60">점수</div>
                                <div className="text-xl font-mono font-bold text-yellow-300">{score}</div>
                            </div>
                            <div>
                                <div className="text-cyan-400/60">최고 타일</div>
                                <div className="text-xl font-mono font-bold text-cyan-100">{maxTile}</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={() => initGame()}
                            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-lg rounded-full font-bold hover:from-cyan-400 hover:to-blue-400 transition shadow-lg"
                        >
                            🎮 다시 하기
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
                                            className="border-b border-cyan-500/20 pb-1 text-sm text-cyan-200"
                                        >
                                            <div className="flex justify-between">
                                                <span>{i + 1}. {entry.score}점</span>
                                                <span className="font-mono">최고 {entry.maxTile}</span>
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
                            <span className="mr-2">🎮</span>2048
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
                            onClick={() => initGame()}
                            className="flex-1 py-3 sm:py-4 text-center text-yellow-400 active:bg-cyan-500/10 transition font-bold text-sm"
                            title="새 게임"
                        >
                            NEW
                        </button>
                    </div>

                    {/* Settings */}
                    {showSettings && (
                        <div className="p-3 sm:p-4 border-t border-cyan-500/20 space-y-3">
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
                        <div className="text-xs sm:text-sm text-cyan-400/60 uppercase">점수</div>
                        <div className="text-xl sm:text-3xl font-mono font-bold text-yellow-300">
                            {score}
                        </div>
                    </div>
                    <div className="bg-gradient-to-b from-[#1a3a4a]/90 to-[#0f2937]/90 px-4 py-3 sm:px-5 sm:py-4 rounded-2xl text-white backdrop-blur-md border border-cyan-500/20">
                        <div className="text-xs sm:text-sm text-cyan-400/60 uppercase">최고</div>
                        <div className="text-xl sm:text-2xl font-mono font-bold text-cyan-100">
                            {bestScore}
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
                                    className="border-b border-cyan-500/20 pb-1 text-sm text-cyan-200"
                                >
                                    <div className="flex justify-between">
                                        <span>{i + 1}. {entry.score}점</span>
                                        <span className="font-mono text-cyan-400/60">최고 {entry.maxTile}</span>
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

            {/* Bottom - Info */}
            <div className="flex flex-col items-center gap-2 pointer-events-auto mb-4">
                <div className="flex items-center gap-2 text-cyan-300/70 text-xs">
                    <span className="bg-cyan-500/10 px-2 py-0.5 rounded-full font-bold border border-cyan-500/20">
                        최고 타일: {maxTile || 0}
                    </span>
                    <span>•</span>
                    <span>이동: {moveCount}회</span>
                </div>
            </div>

            <div className="absolute bottom-3 left-4 sm:bottom-4 sm:left-6 text-cyan-400/50 text-xs sm:text-sm">
                🎯 스와이프 또는 방향키로 타일을 밀어 2048을 만드세요
            </div>
        </div>
    );
};
