import { useEffect, useCallback } from 'react';
import { RoundedBox } from '@react-three/drei';
import { use2048Store } from './use2048Store';
import { Tile } from './Tile';
import { useResponsiveViewport } from '../../hooks/useResponsiveViewport';

const GRID_SIZE = 4;
const CELL_SIZE = 1.1;
const GRID_PADDING = 0.1;
const BOARD_SIZE = GRID_SIZE * CELL_SIZE + GRID_PADDING * 2;
const GRID_OFFSET = (GRID_SIZE - 1) * CELL_SIZE / 2;

export const Game2048 = () => {
    const { tiles, gameStatus, move, clearAnimationFlags } = use2048Store();
    const { gameScale } = useResponsiveViewport({
        veryNarrowScale: 0.55,
        narrowScale: 0.7,
        portraitScale: 0.85,
        landscapeScale: 1.0,
    });

    // Keyboard controls
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (gameStatus !== 'PLAYING') return;

        switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                e.preventDefault();
                move('up');
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                e.preventDefault();
                move('down');
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                e.preventDefault();
                move('left');
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                e.preventDefault();
                move('right');
                break;
        }
    }, [gameStatus, move]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Clear animation flags after a short delay
    useEffect(() => {
        const timeout = setTimeout(() => {
            clearAnimationFlags();
        }, 150);
        return () => clearTimeout(timeout);
    }, [tiles, clearAnimationFlags]);

    // Touch/swipe handling with scroll prevention
    useEffect(() => {
        let startX = 0;
        let startY = 0;
        let isSwiping = false;

        const handleTouchStart = (e: TouchEvent) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isSwiping = false;
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (gameStatus !== 'PLAYING') return;

            const diffX = e.touches[0].clientX - startX;
            const diffY = e.touches[0].clientY - startY;

            // If swiping more than 10px, prevent default scroll
            if (Math.abs(diffX) > 10 || Math.abs(diffY) > 10) {
                isSwiping = true;
                e.preventDefault();
            }
        };

        const handleTouchEnd = (e: TouchEvent) => {
            if (gameStatus !== 'PLAYING') return;

            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = endX - startX;
            const diffY = endY - startY;

            const minSwipe = 30; // Reduced for better responsiveness
            if (Math.abs(diffX) < minSwipe && Math.abs(diffY) < minSwipe) return;

            if (isSwiping) {
                e.preventDefault();
            }

            if (Math.abs(diffX) > Math.abs(diffY)) {
                move(diffX > 0 ? 'right' : 'left');
            } else {
                move(diffY > 0 ? 'down' : 'up');
            }
        };

        window.addEventListener('touchstart', handleTouchStart, { passive: true });
        window.addEventListener('touchmove', handleTouchMove, { passive: false });
        window.addEventListener('touchend', handleTouchEnd, { passive: false });

        return () => {
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [gameStatus, move]);

    return (
        <group scale={gameScale}>
            {/* Board base */}
            <RoundedBox
                args={[BOARD_SIZE, 0.15, BOARD_SIZE]}
                position={[0, -0.075, 0]}
                radius={0.1}
                smoothness={4}
            >
                <meshStandardMaterial
                    color="#1a3a4a"
                    metalness={0.2}
                    roughness={0.8}
                />
            </RoundedBox>

            {/* Grid cells (empty slots) */}
            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                const row = Math.floor(i / GRID_SIZE);
                const col = i % GRID_SIZE;
                return (
                    <RoundedBox
                        key={i}
                        args={[CELL_SIZE * 0.9, 0.08, CELL_SIZE * 0.9]}
                        position={[
                            col * CELL_SIZE - GRID_OFFSET,
                            0.04,
                            row * CELL_SIZE - GRID_OFFSET,
                        ]}
                        radius={0.06}
                        smoothness={4}
                    >
                        <meshStandardMaterial
                            color="#0f2937"
                            metalness={0.1}
                            roughness={0.9}
                            transparent
                            opacity={0.6}
                        />
                    </RoundedBox>
                );
            })}

            {/* Tiles */}
            {tiles.map((tile) => (
                <Tile
                    key={tile.id}
                    tile={tile}
                    cellSize={CELL_SIZE}
                    gridOffset={GRID_OFFSET}
                />
            ))}

            {/* Border glow */}
            <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[BOARD_SIZE / 2 - 0.05, BOARD_SIZE / 2 + 0.05, 4]} />
                <meshBasicMaterial color="#22d3ee" transparent opacity={0.15} />
            </mesh>
        </group>
    );
};
