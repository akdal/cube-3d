import { useMemo } from 'react';
import { Vector3 } from 'three';
import { useHanoiStore } from './useHanoiStore';
import { Peg } from './Peg';
import { Disk } from './Disk';

const PEG_SPACING = 3.5;
const PEG_POSITIONS: [number, number, number][] = [
    [-PEG_SPACING, 0, 0],
    [0, 0, 0],
    [PEG_SPACING, 0, 0],
];

export const HanoiGame = () => {
    const {
        pegs,
        diskCount,
        selectedPeg,
        selectPeg,
        animating,
        animatingDisk,
        finishAnimation,
        hintActive,
        hintInfo,
    } = useHanoiStore();

    const pegHeight = useMemo(() => {
        // Height based on max possible disks
        return diskCount * 0.35 + 0.5;
    }, [diskCount]);

    const diskHeight = 0.3;
    const baseHeight = 0.15;

    // Calculate target position for animating disk
    const targetPosition = useMemo(() => {
        if (!animatingDisk) return undefined;

        const targetPegPos = PEG_POSITIONS[animatingDisk.to];
        const targetPeg = pegs[animatingDisk.to];
        const stackHeight = targetPeg.length * diskHeight;

        return new Vector3(
            targetPegPos[0],
            baseHeight + stackHeight + diskHeight / 2,
            targetPegPos[2]
        );
    }, [animatingDisk, pegs]);

    return (
        <group>
            {/* Pegs */}
            {PEG_POSITIONS.map((pos, index) => (
                <Peg
                    key={index}
                    position={pos}
                    height={pegHeight}
                    isSelected={selectedPeg === index}
                    isTarget={index === 2} // Rightmost peg is always white
                    isHintSource={hintActive && hintInfo?.fromPeg === index}
                    isHintTarget={hintActive && hintInfo?.toPeg === index}
                    onClick={(e) => {
                        e.stopPropagation();
                        selectPeg(index);
                    }}
                />
            ))}

            {/* Disks on each peg */}
            {pegs.map((peg, pegIndex) =>
                peg.map((diskSize, stackIndex) => {
                    const pegPos = PEG_POSITIONS[pegIndex];
                    const isAnimatingThisDisk =
                        animating &&
                        animatingDisk?.from === pegIndex &&
                        stackIndex === peg.length - 1;

                    // Skip rendering the animating disk in its original position
                    if (isAnimatingThisDisk) return null;

                    const position = new Vector3(
                        pegPos[0],
                        baseHeight + stackIndex * diskHeight + diskHeight / 2,
                        pegPos[2]
                    );

                    const isTopDisk = stackIndex === peg.length - 1;
                    const isSelected = selectedPeg === pegIndex && isTopDisk;
                    const isHintDisk = hintActive && hintInfo?.fromPeg === pegIndex &&
                                       hintInfo?.disk === diskSize && isTopDisk;

                    return (
                        <Disk
                            key={`${pegIndex}-${diskSize}`}
                            size={diskSize}
                            diskCount={diskCount}
                            position={position}
                            isSelected={isSelected}
                            isAnimating={false}
                            isHintDisk={isHintDisk}
                        />
                    );
                })
            )}

            {/* Animating disk */}
            {animating && animatingDisk && (
                <Disk
                    key="animating"
                    size={animatingDisk.disk}
                    diskCount={diskCount}
                    position={
                        new Vector3(
                            PEG_POSITIONS[animatingDisk.from][0],
                            baseHeight +
                                (pegs[animatingDisk.from].length) * diskHeight +
                                diskHeight / 2,
                            PEG_POSITIONS[animatingDisk.from][2]
                        )
                    }
                    isSelected={false}
                    isAnimating={true}
                    targetPosition={targetPosition}
                    onAnimationComplete={finishAnimation}
                />
            )}
        </group>
    );
};
