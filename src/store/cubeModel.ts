import type { CubeMove, CubePalette, FaceName, Piece, PieceType } from '../types/cube';

type Axis = 'x' | 'y' | 'z';

export const cubePresets: Record<string, CubePalette> = {
    classic: {
        right: '#D72638',
        left: '#FF8A00',
        top: '#F8FAFC',
        bottom: '#FFD166',
        front: '#00A86B',
        back: '#2F6BFF',
        inside: '#16181F',
    },
    midnight: {
        right: '#FF4D6D',
        left: '#F77F00',
        top: '#E6EDF7',
        bottom: '#FFE45E',
        front: '#4ADE80',
        back: '#38BDF8',
        inside: '#0A0D14',
    },
    candy: {
        right: '#FF6B9A',
        left: '#FFB86B',
        top: '#FFF9F0',
        bottom: '#FFE66D',
        front: '#79E7C7',
        back: '#8EA7FF',
        inside: '#23212B',
    },
};

export const cubeMoveDefinitions: Record<CubeMove, { axis: Axis; layer: number; turns: number }> = {
    U: { axis: 'y', layer: 1, turns: 1 },
    "U'": { axis: 'y', layer: 1, turns: -1 },
    D: { axis: 'y', layer: -1, turns: -1 },
    "D'": { axis: 'y', layer: -1, turns: 1 },
    R: { axis: 'x', layer: 1, turns: 1 },
    "R'": { axis: 'x', layer: 1, turns: -1 },
    L: { axis: 'x', layer: -1, turns: -1 },
    "L'": { axis: 'x', layer: -1, turns: 1 },
    F: { axis: 'z', layer: 1, turns: -1 },
    "F'": { axis: 'z', layer: 1, turns: 1 },
    B: { axis: 'z', layer: -1, turns: 1 },
    "B'": { axis: 'z', layer: -1, turns: -1 },
    M: { axis: 'x', layer: 0, turns: -1 },
    "M'": { axis: 'x', layer: 0, turns: 1 },
    E: { axis: 'y', layer: 0, turns: -1 },
    "E'": { axis: 'y', layer: 0, turns: 1 },
    S: { axis: 'z', layer: 0, turns: -1 },
    "S'": { axis: 'z', layer: 0, turns: 1 },
};

const faceVectors: Record<FaceName, [number, number, number]> = {
    right: [1, 0, 0],
    left: [-1, 0, 0],
    top: [0, 1, 0],
    bottom: [0, -1, 0],
    front: [0, 0, 1],
    back: [0, 0, -1],
};

const vectorToFace = ([x, y, z]: [number, number, number]): FaceName => {
    if (x === 1) return 'right';
    if (x === -1) return 'left';
    if (y === 1) return 'top';
    if (y === -1) return 'bottom';
    if (z === 1) return 'front';
    return 'back';
};

const rotatePosition = (position: [number, number, number], axis: Axis, turns: number): [number, number, number] => {
    const [x, y, z] = position;
    const normalizedTurns = ((turns % 4) + 4) % 4;

    if (normalizedTurns === 0) return position;

    if (axis === 'x') {
        return normalizedTurns === 1
            ? [x, -z, y]
            : normalizedTurns === 2
                ? [x, -y, -z]
                : [x, z, -y];
    }

    if (axis === 'y') {
        return normalizedTurns === 1
            ? [z, y, -x]
            : normalizedTurns === 2
                ? [-x, y, -z]
                : [-z, y, x];
    }

    return normalizedTurns === 1
        ? [-y, x, z]
        : normalizedTurns === 2
            ? [-x, -y, z]
            : [y, -x, z];
};

const rotateStickers = (
    stickers: Partial<Record<FaceName, FaceName>>,
    axis: Axis,
    turns: number
): Partial<Record<FaceName, FaceName>> => {
    const nextStickers: Partial<Record<FaceName, FaceName>> = {};

    Object.entries(stickers).forEach(([currentFace, originalFace]) => {
        if (!originalFace) return;

        const rotatedFace = vectorToFace(rotatePosition(faceVectors[currentFace as FaceName], axis, turns));
        nextStickers[rotatedFace] = originalFace;
    });

    return nextStickers;
};

export const generateInitialCube = (): Piece[] => {
    const pieces: Piece[] = [];
    let id = 0;

    for (const x of [-1, 0, 1]) {
        for (const y of [-1, 0, 1]) {
            for (const z of [-1, 0, 1]) {
                if (x === 0 && y === 0 && z === 0) continue;

                const zeroes = [x, y, z].filter((value) => value === 0).length;
                const type: PieceType = zeroes === 2 ? 'center' : zeroes === 1 ? 'edge' : 'corner';

                pieces.push({
                    id: id++,
                    type,
                    initialPosition: [x, y, z],
                    currentPosition: [x, y, z],
                    stickers: {
                        ...(x === 1 ? { right: 'right' as const } : {}),
                        ...(x === -1 ? { left: 'left' as const } : {}),
                        ...(y === 1 ? { top: 'top' as const } : {}),
                        ...(y === -1 ? { bottom: 'bottom' as const } : {}),
                        ...(z === 1 ? { front: 'front' as const } : {}),
                        ...(z === -1 ? { back: 'back' as const } : {}),
                    },
                });
            }
        }
    }

    return pieces;
};

export const applyMoveToPieces = (pieces: Piece[], move: CubeMove) => {
    const definition = cubeMoveDefinitions[move];

    return pieces.map((piece) => {
        const axisIndex = definition.axis === 'x' ? 0 : definition.axis === 'y' ? 1 : 2;

        if (piece.currentPosition[axisIndex] !== definition.layer) {
            return piece;
        }

        return {
            ...piece,
            currentPosition: rotatePosition(piece.currentPosition, definition.axis, definition.turns),
            stickers: rotateStickers(piece.stickers, definition.axis, definition.turns),
        };
    });
};

const scrambleMoves = (Object.keys(cubeMoveDefinitions) as CubeMove[])
    .filter((move) => cubeMoveDefinitions[move].layer !== 0);
const moveAxis = (move: CubeMove) => cubeMoveDefinitions[move].axis;

export const generateScramble = (length: number) => {
    const scramble: CubeMove[] = [];

    while (scramble.length < length) {
        const nextMove = scrambleMoves[Math.floor(Math.random() * scrambleMoves.length)];
        const previousMove = scramble[scramble.length - 1];

        if (previousMove && moveAxis(previousMove) === moveAxis(nextMove)) {
            continue;
        }

        scramble.push(nextMove);
    }

    return scramble;
};
