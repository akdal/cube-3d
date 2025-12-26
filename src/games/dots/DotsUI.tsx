import { useState } from 'react';
import { useDotsStore } from './useDotsStore';
import { useCelebration } from '../../components/Celebration';
import { useEffect, useRef } from 'react';

interface DotsUIProps {
    onBack: () => void;
}

const GRID_SIZE_OPTIONS = [3, 4, 5, 6];

export const DotsUI = ({ onBack }: DotsUIProps) => {
    const {
        gameStatus,
        scores,
        currentPlayer,
        winner,
        gridSize,
        initGame,
        setGridSize,
        leaderboard,
        requestViewReset,
    } = useDotsStore();

    const [showSettings, setShowSettings] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const { celebrate } = useCelebration();
    const celebratedRef = useRef(false);

    // Celebration effect
    useEffect(() => {
        if (gameStatus === 'FINISHED' && !celebratedRef.current) {
            celebratedRef.current = true;
            celebrate('stars');
        } else if (gameStatus !== 'FINISHED') {
            celebratedRef.current = false;
        }
    }, [gameStatus, celebrate]);

    // Delayed modal when finished
    useEffect(() => {
        if (gameStatus === 'FINISHED') {
            const timer = setTimeout(() => {
                setShowModal(true);
            }, 1200); // 1.2 second delay
            return () => clearTimeout(timer);
        } else {
            setShowModal(false);
        }
    }, [gameStatus]);

    // Finished screen
    if (showModal) {
        const winnerText = winner === 'draw'
            ? '무승부!'
            : winner === 1
                ? 'Player 1 승리!'
                : 'Player 2 승리!';

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
                    <div className="text-4xl mb-2">
                        {winner === 'draw' ? '🤝' : '🎉'}
                    </div>
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-300 mb-2">
                        {winnerText}
                    </h1>

                    <div className="bg-cyan-900/30 rounded-xl p-4 mb-4">
                        <div className="flex justify-center gap-8 text-sm">
                            <div>
                                <div className="text-cyan-400/60">Player 1</div>
                                <div className={`text-2xl font-mono font-bold ${winner === 1 ? 'text-yellow-300' : 'text-cyan-300'}`}>
                                    {scores.player1}
                                </div>
                            </div>
                            <div className="text-cyan-400/40 self-center">vs</div>
                            <div>
                                <div className="text-cyan-400/60">Player 2</div>
                                <div className={`text-2xl font-mono font-bold ${winner === 2 ? 'text-yellow-300' : 'text-pink-300'}`}>
                                    {scores.player2}
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => initGame()}
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
                                                    {entry.winner === 'draw' ? '무승부' : `P${entry.winner} 승`}
                                                </span>
                                                <span className="font-mono">
                                                    {entry.player1Score} : {entry.player2Score}
                                                </span>
                                                <span className="text-cyan-400/60">{entry.gridSize}×{entry.gridSize}</span>
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
                            <span className="mr-2">🔗</span>라인 커넥트
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
                            {/* Grid Size */}
                            <div>
                                <div className="text-xs text-cyan-400/60 mb-2">그리드 크기</div>
                                <div className="flex gap-2">
                                    {GRID_SIZE_OPTIONS.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setGridSize(size)}
                                            className={`px-3 py-1 rounded-lg text-sm font-bold transition ${
                                                gridSize === size
                                                    ? 'bg-cyan-500 text-white'
                                                    : 'bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30'
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

                {/* Right Panel - Scores */}
                <div className="flex gap-2 sm:gap-3">
                    <div className={`px-4 py-3 sm:px-5 sm:py-4 rounded-2xl text-white backdrop-blur-md border transition ${
                        currentPlayer === 1
                            ? 'bg-gradient-to-b from-cyan-500/40 to-cyan-600/40 border-cyan-400'
                            : 'bg-gradient-to-b from-[#1a3a4a]/90 to-[#0f2937]/90 border-cyan-500/20'
                    }`}>
                        <div className="text-xs sm:text-sm text-cyan-400/80 uppercase">P1</div>
                        <div className="text-lg sm:text-xl font-mono font-bold text-cyan-300">
                            {scores.player1}
                        </div>
                    </div>
                    <div className={`px-4 py-3 sm:px-5 sm:py-4 rounded-2xl text-white backdrop-blur-md border transition ${
                        currentPlayer === 2
                            ? 'bg-gradient-to-b from-pink-500/40 to-pink-600/40 border-pink-400'
                            : 'bg-gradient-to-b from-[#1a3a4a]/90 to-[#0f2937]/90 border-cyan-500/20'
                    }`}>
                        <div className="text-xs sm:text-sm text-pink-400/80 uppercase">P2</div>
                        <div className="text-lg sm:text-xl font-mono font-bold text-pink-300">
                            {scores.player2}
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
                                        <span>
                                            {entry.winner === 'draw' ? '무승부' : `P${entry.winner} 승`}
                                        </span>
                                        <span className="font-mono">
                                            {entry.player1Score} : {entry.player2Score}
                                        </span>
                                        <span className="text-cyan-400/60">{entry.gridSize}×{entry.gridSize}</span>
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

            {/* Bottom - Current Turn & Info */}
            <div className="flex flex-col items-center gap-2 pointer-events-auto mb-4">
                {gameStatus === 'PLAYING' && (
                    <div className={`px-4 py-2 rounded-full font-bold text-sm ${
                        currentPlayer === 1
                            ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400'
                            : 'bg-pink-500/30 text-pink-300 border border-pink-400'
                    }`}>
                        Player {currentPlayer} 차례
                    </div>
                )}
            </div>

            <div className="absolute bottom-3 left-4 sm:bottom-4 sm:left-6 text-cyan-400/50 text-xs sm:text-sm">
                🎯 선을 클릭하여 연결하고 박스를 완성하세요
            </div>
        </div>
    );
};
