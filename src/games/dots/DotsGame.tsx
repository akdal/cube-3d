import { RoundedBox } from '@react-three/drei';
import { useDotsStore } from './useDotsStore';
import { Dot } from './Dot';
import { Line } from './Line';
import { Box } from './Box';
import { useResponsiveViewport } from '../../hooks/useResponsiveViewport';

export const DotsGame = () => {
    const gridSize = useDotsStore((s) => s.gridSize);
    const horizontalLines = useDotsStore((s) => s.horizontalLines);
    const verticalLines = useDotsStore((s) => s.verticalLines);
    const boxes = useDotsStore((s) => s.boxes);
    const newlyCompletedBoxes = useDotsStore((s) => s.newlyCompletedBoxes);
    const gameStatus = useDotsStore((s) => s.gameStatus);
    const drawLine = useDotsStore((s) => s.drawLine);

    const { gameScale } = useResponsiveViewport({
        veryNarrowScale: 0.5,
        narrowScale: 0.65,
        portraitScale: 0.8,
        landscapeScale: 1.0,
    });

    const cellSize = 1;
    const gridOffset = ((gridSize - 1) * cellSize) / 2;
    const boardSize = gridSize * cellSize;
    const isDisabled = gameStatus !== 'PLAYING';

    const isNewBox = (row: number, col: number) =>
        newlyCompletedBoxes.some((b) => b.row === row && b.col === col);

    return (
        <group scale={gameScale}>
            {/* Board base */}
            <RoundedBox
                args={[boardSize + 0.4, 0.1, boardSize + 0.4]}
                position={[0, -0.1, 0]}
                radius={0.05}
                smoothness={4}
            >
                <meshStandardMaterial
                    color="#1e293b"
                    metalness={0.1}
                    roughness={0.8}
                />
            </RoundedBox>

            {/* Grid background */}
            <RoundedBox
                args={[boardSize + 0.2, 0.05, boardSize + 0.2]}
                position={[0, -0.05, 0]}
                radius={0.03}
                smoothness={4}
            >
                <meshStandardMaterial
                    color="#0f172a"
                    metalness={0.05}
                    roughness={0.9}
                />
            </RoundedBox>

            {/* Dots (corners) */}
            {Array.from({ length: gridSize }, (_, row) =>
                Array.from({ length: gridSize }, (_, col) => (
                    <Dot
                        key={`dot-${row}-${col}`}
                        position={[
                            col * cellSize - gridOffset,
                            0.1,
                            row * cellSize - gridOffset,
                        ]}
                    />
                ))
            )}

            {/* Horizontal lines */}
            {horizontalLines.map((rowLines, row) =>
                rowLines.map((owner, col) => (
                    <Line
                        key={`h-${row}-${col}`}
                        position={[
                            col * cellSize - gridOffset + cellSize / 2,
                            0.05,
                            row * cellSize - gridOffset,
                        ]}
                        isHorizontal={true}
                        owner={owner}
                        onClick={() => drawLine('h', row, col)}
                        disabled={isDisabled}
                    />
                ))
            )}

            {/* Vertical lines */}
            {verticalLines.map((rowLines, row) =>
                rowLines.map((owner, col) => (
                    <Line
                        key={`v-${row}-${col}`}
                        position={[
                            col * cellSize - gridOffset,
                            0.05,
                            row * cellSize - gridOffset + cellSize / 2,
                        ]}
                        isHorizontal={false}
                        owner={owner}
                        onClick={() => drawLine('v', row, col)}
                        disabled={isDisabled}
                    />
                ))
            )}

            {/* Completed boxes */}
            {boxes.map((rowBoxes, row) =>
                rowBoxes.map((owner, col) =>
                    owner !== null ? (
                        <Box
                            key={`box-${row}-${col}`}
                            position={[
                                col * cellSize - gridOffset + cellSize / 2,
                                0.03,
                                row * cellSize - gridOffset + cellSize / 2,
                            ]}
                            owner={owner}
                            isNew={isNewBox(row, col)}
                        />
                    ) : null
                )
            )}
        </group>
    );
};
