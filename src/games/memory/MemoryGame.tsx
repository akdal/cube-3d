import { useMemoryStore } from './useMemoryStore';
import { Card } from './Card';

export const MemoryGame = () => {
    const { cards, gridSize, flipCard, hintActive, hintCardIndices } = useMemoryStore();

    const cardSpacing = gridSize === 4 ? 1.1 : 0.9;

    // Calculate position for each card
    const getPosition = (index: number): [number, number, number] => {
        const row = Math.floor(index / gridSize);
        const col = index % gridSize;

        const x = (col - (gridSize - 1) / 2) * cardSpacing;
        const y = ((gridSize - 1) / 2 - row) * cardSpacing;

        return [x, y, 0];
    };

    return (
        <group>
            {/* Snowy background plane */}
            <mesh position={[0, 0, -0.3]} receiveShadow>
                <planeGeometry args={[gridSize * cardSpacing + 1, gridSize * cardSpacing + 1]} />
                <meshStandardMaterial
                    color="#0f2937"
                    metalness={0.1}
                    roughness={0.9}
                />
            </mesh>

            {/* Cards */}
            {cards.map((card, index) => (
                <Card
                    key={card.id}
                    icon={card.icon}
                    isFlipped={card.isFlipped}
                    isMatched={card.isMatched}
                    isEmpty={card.isEmpty}
                    isHint={hintActive && hintCardIndices.includes(index)}
                    position={getPosition(index)}
                    onClick={() => flipCard(index)}
                    gridSize={gridSize}
                />
            ))}

            {/* Decorative snowflakes in corners */}
            <group position={[0, 0, -0.2]}>
                {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([x, y], i) => (
                    <mesh
                        key={i}
                        position={[
                            x * (gridSize * cardSpacing / 2 + 0.3),
                            y * (gridSize * cardSpacing / 2 + 0.3),
                            0
                        ]}
                    >
                        <circleGeometry args={[0.15, 6]} />
                        <meshStandardMaterial
                            color="#3b82f6"
                            transparent
                            opacity={0.3}
                        />
                    </mesh>
                ))}
            </group>
        </group>
    );
};
