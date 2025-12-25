import { useRef, useCallback, useEffect } from 'react';
import type { ThreeEvent } from '@react-three/fiber';
import { Vector3, Vector2, Camera, Matrix4 } from 'three';
import { useStore } from '../store/useStore';
import type { Axis } from '../utils/math';

interface DragState {
    startScreenPos: Vector2;
    cubieWorldPos: Vector3;
    faceNormal: Vector3;
    pointerId: number;
}

// Detect mobile/touch device
const isTouchDevice = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;

export const useCubeInteraction = () => {
    const { triggerRotation, animation, setIsDraggingCube, invertControls, cubeLocked, cubeSize } = useStore();
    const dragRef = useRef<DragState | null>(null);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            setIsDraggingCube(false);
        };
    }, [setIsDraggingCube]);

    const onPointerDown = useCallback((e: ThreeEvent<PointerEvent>, cubiePos: [number, number, number]) => {
        e.stopPropagation();

        if (cubeLocked) return;
        if (animation.isAnimating) return;
        if (!e.face) return;

        // Get world-space normal by transforming with object's world matrix
        const worldNormal = e.face.normal.clone();
        if (e.object.matrixWorld) {
            const normalMatrix = new Matrix4().extractRotation(e.object.matrixWorld);
            worldNormal.applyMatrix4(normalMatrix).normalize();
        }

        // Snap normal to nearest axis (handles floating point errors)
        const snappedNormal = snapToAxis(worldNormal);

        dragRef.current = {
            startScreenPos: new Vector2(e.clientX, e.clientY),
            cubieWorldPos: new Vector3(...cubiePos),
            faceNormal: snappedNormal,
            pointerId: e.pointerId,
        };

        setIsDraggingCube(true);

        // Capture pointer for reliable tracking
        try {
            (e.target as HTMLElement).setPointerCapture(e.pointerId);
        } catch {
            // Ignore capture errors on some mobile browsers
        }
    }, [animation.isAnimating, setIsDraggingCube, cubeLocked]);

    const onPointerMove = useCallback((e: ThreeEvent<PointerEvent>) => {
        if (!dragRef.current || animation.isAnimating) return;

        const { startScreenPos, cubieWorldPos, faceNormal } = dragRef.current;
        const currentPos = new Vector2(e.clientX, e.clientY);
        const delta = currentPos.clone().sub(startScreenPos);

        // Lower threshold for mobile
        const minDrag = isTouchDevice() ? 20 : 30;
        if (delta.length() < minDrag) return;

        // Get camera for screen-to-world projection
        const camera = e.camera;

        // Calculate rotation based on drag direction
        const rotation = calculateRotation(delta, cubieWorldPos, faceNormal, camera, cubeSize);

        if (rotation) {
            const finalDirection = invertControls ? rotation.direction : (rotation.direction * -1) as 1 | -1;
            triggerRotation(rotation.axis, rotation.layer, finalDirection);

            // Reset drag state
            dragRef.current = null;
            setIsDraggingCube(false);

            try {
                (e.target as HTMLElement).releasePointerCapture(e.pointerId);
            } catch {
                // Ignore
            }
        }
    }, [animation.isAnimating, triggerRotation, setIsDraggingCube, invertControls, cubeSize]);

    const onPointerUp = useCallback((e: ThreeEvent<PointerEvent>) => {
        if (dragRef.current) {
            dragRef.current = null;
            setIsDraggingCube(false);

            try {
                (e.target as HTMLElement).releasePointerCapture(e.pointerId);
            } catch {
                // Ignore
            }
        }
    }, [setIsDraggingCube]);

    return { onPointerDown, onPointerMove, onPointerUp };
};

/**
 * Snap a vector to the nearest cardinal axis
 */
function snapToAxis(v: Vector3): Vector3 {
    const ax = Math.abs(v.x);
    const ay = Math.abs(v.y);
    const az = Math.abs(v.z);

    if (ax > ay && ax > az) {
        return new Vector3(Math.sign(v.x), 0, 0);
    } else if (ay > ax && ay > az) {
        return new Vector3(0, Math.sign(v.y), 0);
    } else {
        return new Vector3(0, 0, Math.sign(v.z));
    }
}

/**
 * Calculate which rotation to perform based on drag direction
 */
function calculateRotation(
    screenDelta: Vector2,
    cubiePos: Vector3,
    faceNormal: Vector3,
    camera: Camera,
    cubeSize: 2 | 3
): { axis: Axis; layer: number; direction: 1 | -1 } | null {

    // Determine the two possible slide axes on this face
    // If normal is X, slide axes are Y and Z
    // If normal is Y, slide axes are X and Z
    // If normal is Z, slide axes are X and Y
    const slideAxes: { axis: Axis; worldDir: Vector3 }[] = [];

    if (Math.abs(faceNormal.x) > 0.5) {
        slideAxes.push({ axis: 'y', worldDir: new Vector3(0, 1, 0) });
        slideAxes.push({ axis: 'z', worldDir: new Vector3(0, 0, 1) });
    } else if (Math.abs(faceNormal.y) > 0.5) {
        slideAxes.push({ axis: 'x', worldDir: new Vector3(1, 0, 0) });
        slideAxes.push({ axis: 'z', worldDir: new Vector3(0, 0, 1) });
    } else {
        slideAxes.push({ axis: 'x', worldDir: new Vector3(1, 0, 0) });
        slideAxes.push({ axis: 'y', worldDir: new Vector3(0, 1, 0) });
    }

    // Project each slide axis to screen space to find which matches the drag
    const screenCenter = cubiePos.clone().project(camera);

    let bestMatch: { axis: Axis; worldDir: Vector3; signedDot: number } | null = null;
    let maxDot = 0;

    for (const slide of slideAxes) {
        const screenEnd = cubiePos.clone().add(slide.worldDir).project(camera);

        // Convert NDC to screen-like direction (flip Y)
        const screenDir = new Vector2(
            screenEnd.x - screenCenter.x,
            -(screenEnd.y - screenCenter.y) // Flip Y for screen coordinates
        ).normalize();

        const dragDir = screenDelta.clone().normalize();
        const dot = Math.abs(screenDir.dot(dragDir));

        if (dot > maxDot) {
            maxDot = dot;
            bestMatch = {
                axis: slide.axis,
                worldDir: slide.worldDir,
                signedDot: screenDir.dot(dragDir)
            };
        }
    }

    // Need a decent match (not diagonal)
    if (!bestMatch || maxDot < 0.5) return null;

    // Determine rotation axis using cross product: slideDir × faceNormal = rotationAxis
    const slideDir3D = bestMatch.worldDir.clone();
    if (bestMatch.signedDot < 0) slideDir3D.negate();

    const rotAxisVec = new Vector3().crossVectors(slideDir3D, faceNormal);

    // Determine which axis the rotation is around
    let rotAxis: Axis;
    let rotAxisSign: number;

    if (Math.abs(rotAxisVec.x) > Math.abs(rotAxisVec.y) && Math.abs(rotAxisVec.x) > Math.abs(rotAxisVec.z)) {
        rotAxis = 'x';
        rotAxisSign = Math.sign(rotAxisVec.x);
    } else if (Math.abs(rotAxisVec.y) > Math.abs(rotAxisVec.z)) {
        rotAxis = 'y';
        rotAxisSign = Math.sign(rotAxisVec.y);
    } else {
        rotAxis = 'z';
        rotAxisSign = Math.sign(rotAxisVec.z);
    }

    // Determine layer based on cube size
    const posValue = rotAxis === 'x' ? cubiePos.x :
                     rotAxis === 'y' ? cubiePos.y :
                     cubiePos.z;

    // For 2x2: snap to -0.5 or 0.5, for 3x3: round to -1, 0, or 1
    const layer = cubeSize === 2
        ? (posValue < 0 ? -0.5 : 0.5)
        : Math.round(posValue);

    // Direction based on cross product sign
    const direction = rotAxisSign > 0 ? 1 : -1;

    return { axis: rotAxis, layer, direction };
}
