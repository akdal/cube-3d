import { useEffect, useState, useRef } from 'react';
import { useColorStore, rgbToHex, DIFFICULTY_SETTINGS, type Difficulty } from './useColorStore';
import { useCelebration } from '../../components/Celebration';

const DIFFICULTY_LABELS: Record<Difficulty, { label: string; emoji: string; description: string }> = {
    easy: { label: '쉬움', emoji: '🟢', description: '4~5회 믹싱' },
    medium: { label: '보통', emoji: '🟡', description: '5~6회 믹싱' },
    hard: { label: '어려움', emoji: '🔴', description: '6~7회 믹싱' },
};

interface ColorUIProps {
    onBack: () => void;
}

export const ColorUI = ({ onBack }: ColorUIProps) => {
    const {
        gameStatus,
        startTime,
        moveCount,
        level,
        accuracy,
        targetColor,
        currentColor,
        difficulty,
        minMoves,
        initGame,
        resetMix,
        nextLevel,
        setDifficulty,
        leaderboard,
        hintCount,
        hintColorIndex,
        showHint,
        requestViewReset,
    } = useColorStore();

    const [showSettings, setShowSettings] = useState(false);
    const [showDifficulty, setShowDifficulty] = useState(false);
    const [isResultMinimized, setIsResultMinimized] = useState(false);
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const [now, setNow] = useState(() => Date.now());
    const [hideTimer, setHideTimer] = useState(false);
    const { celebrate } = useCelebration();
    const celebratedRef = useRef(false);

    // Celebration effect when solved
    useEffect(() => {
        if (gameStatus === 'SOLVED' && !celebratedRef.current) {
            celebratedRef.current = true;
            celebrate(accuracy === 100 ? 'stars' : 'default');
        } else if (gameStatus !== 'SOLVED') {
            celebratedRef.current = false;
        }
    }, [gameStatus, celebrate, accuracy]);

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

    const targetHex = rgbToHex(targetColor);
    const currentHex = rgbToHex(currentColor);

    // Solved screen
    if (gameStatus === 'SOLVED') {
        const sameRecords = leaderboard.filter(e => e.level === level && e.difficulty === difficulty);
        const isNewRecord = sameRecords.length <= 1 ||
            (sameRecords.length > 1 && accuracy > sameRecords[1].accuracy);
        const isPerfectMoves = moveCount <= minMoves;

        // Minimized result badge
        if (isResultMinimized) {
            return (
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
                    <button
                        onClick={() => setIsResultMinimized(false)}
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-2xl shadow-lg border border-white/20 flex items-center gap-3 hover:scale-105 transition"
                    >
                        <span className="text-2xl">{isNewRecord ? '🏆' : '⭐'}</span>
                        <div className="text-left">
                            <div className="font-bold">{accuracy}% 완성!</div>
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

                    <div className="text-4xl mb-2">{isNewRecord ? '🏆' : accuracy === 100 ? '⭐' : '🎨'}</div>
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-blue-300 mb-2">
                        {isNewRecord ? '새로운 기록!' : accuracy === 100 ? '완벽해요!' : '잘했어요!'}
                    </h1>
                    <p className="text-lg text-cyan-200 mb-4">
                        {isPerfectMoves
                            ? `최단 경로로 완성! (${minMoves}회) ❄️`
                            : isNewRecord
                                ? `${accuracy}% 정확도로 색을 만들었어요!`
                                : accuracy === 100
                                    ? `완벽하게 같은 색을 만들었어요! ✨`
                                    : `${accuracy}% 일치하는 색을 만들었어요!`
                        }
                    </p>

                    {/* Color comparison */}
                    <div className="flex justify-center gap-6 mb-4">
                        <div className="text-center">
                            <div
                                className="w-16 h-16 rounded-xl mx-auto mb-1 shadow-lg border border-white/10"
                                style={{ backgroundColor: targetHex }}
                            />
                            <div className="text-xs text-cyan-400/60">목표</div>
                        </div>
                        <div className="flex items-center text-cyan-500/50">=</div>
                        <div className="text-center">
                            <div
                                className="w-16 h-16 rounded-xl mx-auto mb-1 shadow-lg border border-white/10"
                                style={{ backgroundColor: currentHex }}
                            />
                            <div className="text-xs text-cyan-400/60">결과</div>
                        </div>
                    </div>

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
                                <div className="text-cyan-400/60">정확도</div>
                                <div className="text-xl font-mono font-bold text-green-400">{accuracy}%</div>
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
                            onClick={() => nextLevel()}
                            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-lg rounded-full font-bold hover:from-cyan-400 hover:to-blue-400 transition shadow-lg"
                        >
                            ❄️ 다음 레벨
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
                            <span className="mr-2">🎨</span>컬러 믹스
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
                            className="flex-1 py-3 sm:py-4 text-center text-yellow-400 active:bg-cyan-500/10 transition font-bold text-sm"
                            title="새 게임"
                        >
                            NEW
                        </button>
                    </div>

                    {/* Settings */}
                    {showSettings && (
                        <div className="p-3 sm:p-4 border-t border-cyan-500/20 space-y-3">
                            {/* Difficulty */}
                            <button
                                onClick={() => {
                                    setShowDifficulty(!showDifficulty);
                                    setShowSettings(false);
                                }}
                                className="w-full text-left text-sm text-cyan-300 active:text-cyan-100 py-1"
                            >
                                🎯 난이도 ({DIFFICULTY_LABELS[difficulty].label})
                            </button>
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
                        <div className="text-xl sm:text-3xl font-mono font-bold text-yellow-300">
                            {hideTimer ? '---' : timeDisplay}
                        </div>
                    </div>
                    <div className="bg-gradient-to-b from-[#1a3a4a]/90 to-[#0f2937]/90 px-4 py-3 sm:px-5 sm:py-4 rounded-2xl text-white backdrop-blur-md border border-cyan-500/20">
                        <div className="text-xs sm:text-sm text-cyan-400/60 uppercase">정확도</div>
                        <div className={`text-xl sm:text-2xl font-mono font-bold ${
                            accuracy >= 95 ? 'text-green-400' : accuracy >= 70 ? 'text-yellow-300' : 'text-cyan-100'
                        }`}>
                            {accuracy}%
                        </div>
                    </div>
                </div>
            </div>

            {/* Difficulty Modal */}
            {showDifficulty && (
                <div className="absolute top-20 left-6 pointer-events-auto bg-gradient-to-b from-[#1a3a4a] to-[#0f2937] p-4 rounded-xl w-72 shadow-xl z-50 border border-cyan-500/20">
                    <div className="flex justify-between items-center mb-2">
                        <h2 className="text-xl font-bold text-cyan-100">난이도 선택</h2>
                        <button
                            onClick={() => setShowDifficulty(false)}
                            className="text-cyan-400/60 hover:text-cyan-100 text-xl font-bold leading-none"
                        >
                            ×
                        </button>
                    </div>
                    <p className="text-xs text-cyan-400/50 mb-3">각 난이도별 레벨은 무제한입니다 ∞</p>
                    <div className="space-y-2">
                        {(Object.keys(DIFFICULTY_LABELS) as Difficulty[]).map((diff) => {
                            const label = DIFFICULTY_LABELS[diff];
                            const settings = DIFFICULTY_SETTINGS[diff];
                            const isActive = difficulty === diff;
                            return (
                                <button
                                    key={diff}
                                    onClick={() => {
                                        setDifficulty(diff);
                                        setShowDifficulty(false);
                                    }}
                                    className={`w-full p-3 rounded-lg text-left transition ${
                                        isActive
                                            ? 'bg-cyan-500/30 border-2 border-cyan-400'
                                            : 'bg-cyan-500/10 border border-cyan-500/20 hover:bg-cyan-500/20'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span>{label.emoji}</span>
                                        <span className="font-bold text-cyan-100">{label.label}</span>
                                        {isActive && <span className="ml-auto text-xs text-cyan-400">선택됨</span>}
                                    </div>
                                    <div className="text-xs text-cyan-400/60 mt-1">
                                        {settings.numColors}가지 색상 • {label.description}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

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
                                            {i + 1}. {DIFFICULTY_LABELS[entry.difficulty]?.emoji || ''} 레벨{entry.level}
                                        </span>
                                        <span className="font-mono">
                                            {entry.accuracy}% - {entry.moves}회
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

            {/* Bottom - Info and action buttons */}
            <div className="flex flex-col items-center gap-3 pointer-events-auto mb-4">
                <div className="flex items-center gap-2 text-cyan-300/70 text-xs">
                    <span className="bg-cyan-500/10 px-2 py-0.5 rounded-full font-bold border border-cyan-500/20">
                        {DIFFICULTY_LABELS[difficulty].emoji} {DIFFICULTY_LABELS[difficulty].label} 레벨 {level}
                    </span>
                    <span>•</span>
                    <span>횟수: {moveCount}/{minMoves}</span>
                    {hintCount > 0 && (
                        <>
                            <span>•</span>
                            <span className="text-yellow-400">💡{hintCount}</span>
                        </>
                    )}
                </div>
                {/* Hint + Reset buttons */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={showHint}
                        disabled={hintColorIndex !== null}
                        className={`px-4 py-3 rounded-full shadow-lg transition ${
                            hintColorIndex !== null
                                ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-yellow-500 to-amber-500 text-white hover:from-yellow-400 hover:to-amber-400'
                        }`}
                        title="힌트"
                    >
                        <span className="text-xl">💡</span>
                    </button>
                    <button
                        onClick={() => resetMix()}
                        className="px-6 py-3 text-sm font-bold rounded-full shadow-lg transition bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400"
                    >
                        🔃 처음으로
                    </button>
                </div>
            </div>

            <div className="absolute bottom-3 left-4 sm:bottom-4 sm:left-6 text-cyan-400/50 text-xs sm:text-sm">
                🎯 색을 클릭하면 섞여요! (더블클릭 가능) • 목표: {minMoves}회 안에 95% 일치
            </div>
        </div>
    );
};
