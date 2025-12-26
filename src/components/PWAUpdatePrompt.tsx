import { useRegisterSW } from 'virtual:pwa-register/react';

export const PWAUpdatePrompt = () => {
    const {
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r) {
            console.log('SW Registered:', r);
        },
        onRegisterError(error) {
            console.log('SW registration error', error);
        },
    });

    const close = () => {
        setNeedRefresh(false);
    };

    if (!needRefresh) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-[9999] flex justify-center pointer-events-none">
            <div className="pointer-events-auto bg-gradient-to-r from-[#1a3a4a] to-[#0f2937] border border-cyan-500/30 rounded-2xl shadow-2xl p-4 max-w-sm w-full backdrop-blur-md animate-slide-up">
                <div className="flex items-center gap-3">
                    <div className="text-3xl">🎁</div>
                    <div className="flex-1">
                        <p className="text-cyan-100 font-bold text-sm">
                            "로하 퍼즐" 업데이트 됐어요!
                        </p>
                        <p className="text-cyan-400/70 text-xs mt-0.5">
                            새로운 기능이 추가됐어요
                        </p>
                    </div>
                </div>
                <div className="flex gap-2 mt-3">
                    <button
                        onClick={() => updateServiceWorker(true)}
                        className="flex-1 py-2 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-bold rounded-full hover:from-cyan-400 hover:to-blue-400 transition shadow-lg"
                    >
                        지금 업데이트
                    </button>
                    <button
                        onClick={close}
                        className="py-2 px-4 text-cyan-400/70 text-sm hover:text-cyan-300 transition"
                    >
                        나중에
                    </button>
                </div>
            </div>
        </div>
    );
};
