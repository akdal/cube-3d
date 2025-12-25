import { Vector3 } from 'three';
import { usePuzzleStore } from './usePuzzleStore';
import { TileWithText } from './Tile';
import { useResponsiveViewport } from '../../hooks/useResponsiveViewport';

export const PuzzleGame = () => {
    const { tiles, gridSize, moveTile, hintActive, hintTileIndex } = usePuzzleStore();
    const { gameScale } = useResponsiveViewport({
        veryNarrowScale: 0.6,
        narrowScale: 0.75,
        portraitScale: 0.9,
        landscapeScale: 1.0,
    });

    const tileSize = 2.8 / gridSize;
    const boardSize = 3;

    // Calculate position for each tile
    const getPosition = (index: number): Vector3 => {
        const row = Math.floor(index / gridSize);
        const col = index % gridSize;

        const x = (col - (gridSize - 1) / 2) * tileSize;
        const y = ((gridSize - 1) / 2 - row) * tileSize;

        return new Vector3(x, y, 0);
    };

    // Board background
    const boardPadding = 0.15;

    return (
        <group scale={gameScale}>
            {/* Board background */}
            <mesh position={[0, 0, -0.2]} receiveShadow>
                <boxGeometry
                    args={[
                        boardSize + boardPadding,
                        boardSize + boardPadding,
                        0.2
                    ]}
                />
                <meshStandardMaterial
                    color="#2C3E50"
                    metalness={0.1}
                    roughness={0.8}
                />
            </mesh>

            {/* Tiles */}
            {tiles.map((tileNumber, index) => {
                if (tileNumber === 0) return null; // Empty space

                return (
                    <TileWithText
                        key={tileNumber}
                        number={tileNumber}
                        gridSize={gridSize}
                        targetPosition={getPosition(index)}
                        onClick={(e) => {
                            e.stopPropagation();
                            moveTile(index);
                        }}
                        isHint={hintActive && hintTileIndex === index}
                    />
                );
            })}
        </group>
    );
};
