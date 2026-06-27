import * as THREE from 'three';
import { cubeMoveDefinitions } from '../store/cubeModel';
import type { CubeMove, Piece } from '../types/cube';

export type Axis = 'x' | 'y' | 'z';

const DRAG_THRESHOLD = 0.22;

const axisIndex: Record<Axis, 0 | 1 | 2> = {
    x: 0,
    y: 1,
    z: 2,
};

const dominantAxis = (vector: THREE.Vector3): Axis => {
    const absolute = {
        x: Math.abs(vector.x),
        y: Math.abs(vector.y),
        z: Math.abs(vector.z),
    };

    if (absolute.x >= absolute.y && absolute.x >= absolute.z) return 'x';
    if (absolute.y >= absolute.z) return 'y';
    return 'z';
};

const axisVector = (axis: Axis, sign: number) => {
    const vector = new THREE.Vector3();
    vector[axis] = sign;
    return vector;
};

const getMoveForLayerTurn = (axis: Axis, layer: number, turns: number): CubeMove | null => {
    const normalizedTurns = turns >= 0 ? 1 : -1;
    const match = Object.entries(cubeMoveDefinitions).find(([, definition]) => (
        definition.axis === axis
        && definition.layer === layer
        && definition.turns === normalizedTurns
    ));

    return match ? match[0] as CubeMove : null;
};

export const inferMoveFromDrag = (
    piece: Piece,
    startNormal: THREE.Vector3,
    startPoint: THREE.Vector3,
    endPoint: THREE.Vector3
): CubeMove | null => {
    const dragVector = endPoint.clone().sub(startPoint);
    const faceAxis = dominantAxis(startNormal);
    const faceSign = startNormal[faceAxis] >= 0 ? 1 : -1;

    dragVector[faceAxis] = 0;

    if (dragVector.length() < DRAG_THRESHOLD) {
        return null;
    }

    const dragAxis = dominantAxis(dragVector);
    const dragSign = dragVector[dragAxis] >= 0 ? 1 : -1;
    const turnVector = axisVector(faceAxis, faceSign).cross(axisVector(dragAxis, dragSign));
    const turnAxis = dominantAxis(turnVector);
    const turnSign = turnVector[turnAxis] >= 0 ? 1 : -1;
    const layer = piece.currentPosition[axisIndex[turnAxis]];

    return getMoveForLayerTurn(turnAxis, layer, turnSign);
};

export const getLayerCoordinate = (piece: Piece, axis: Axis) => piece.currentPosition[axisIndex[axis]];

export const easeTurn = (progress: number) => 1 - Math.pow(1 - progress, 3);
