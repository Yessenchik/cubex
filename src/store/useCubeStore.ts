import { create } from 'zustand';

export type PieceType = 'center' | 'edge' | 'corner';
export type AppMode = 'friend' | 'customize' | 'play';
export type CubexMood = 'curious' | 'happy' | 'excited' | 'sleepy';
export type CubexAction = 'idle' | 'wave' | 'jump' | 'spin' | 'thinking' | 'talking';
export type CubeMove =
    | 'U' | "U'"
    | 'D' | "D'"
    | 'R' | "R'"
    | 'L' | "L'"
    | 'F' | "F'"
    | 'B' | "B'"
    | 'M' | "M'"
    | 'E' | "E'"
    | 'S' | "S'";
export type GuideName = 'CFOP / Fridrich' | 'ZBLL' | 'OLL' | 'PLL';

export type FaceName = 'right' | 'left' | 'top' | 'bottom' | 'front' | 'back';

export interface CubePalette {
    right: string;
    left: string;
    top: string;
    bottom: string;
    front: string;
    back: string;
    inside: string;
}

export interface Piece {
    id: number;
    type: PieceType;
    initialPosition: [number, number, number];
    currentPosition: [number, number, number];
    stickers: Partial<Record<FaceName, FaceName>>;
}

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

const generateInitialCube = (): Piece[] => {
    const pieces: Piece[] = [];
    let id = 0;

    for (const x of [-1, 0, 1]) {
        for (const y of [-1, 0, 1]) {
            for (const z of [-1, 0, 1]) {

                if (x === 0 && y === 0 && z === 0) continue;

                const zeroes = [x, y, z].filter(val => val === 0).length;
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
                    }
                });
            }
        }
    }
    return pieces;
};

interface CubeState {
    pieces: Piece[];
    viewMode: 'free' | 'fixed';
    appMode: AppMode;
    mood: CubexMood;
    action: CubexAction;
    message: string;
    dialogue: string;
    moveHistory: CubeMove[];
    moveQueue: CubeMove[];
    activeGuide: GuideName;
    isMixing: boolean;
    palette: CubePalette;
    toggleViewMode: () => void;
    setAppMode: (mode: AppMode) => void;
    setMood: (mood: CubexMood) => void;
    setAction: (action: CubexAction) => void;
    speakToCubex: (text: string) => void;
    applyMove: (move: CubeMove) => void;
    popNextMove: () => CubeMove | undefined;
    commitMove: (move: CubeMove) => void;
    scrambleCube: () => void;
    resetCube: () => void;
    setActiveGuide: (guide: GuideName) => void;
    setFaceColor: (face: FaceName, color: string) => void;
    applyPreset: (presetName: keyof typeof cubePresets) => void;
}

const rotatePosition = (position: [number, number, number], axis: 'x' | 'y' | 'z', turns: number): [number, number, number] => {
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

const rotateStickers = (
    stickers: Partial<Record<FaceName, FaceName>>,
    axis: 'x' | 'y' | 'z',
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

export const cubeMoveDefinitions: Record<CubeMove, { axis: 'x' | 'y' | 'z'; layer: number; turns: number }> = {
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

const applyMoveToPieces = (pieces: Piece[], move: CubeMove) => {
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

const generateScramble = (length: number) => {
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

export const useCubeStore = create<CubeState>()((set, get) => ({
    pieces: generateInitialCube(),
    viewMode: 'fixed',
    appMode: 'friend',
    mood: 'curious',
    action: 'idle',
    message: "Hi, I'm Cubex. I am learning how to feel alive.",
    dialogue: 'Say something to Cubex.',
    moveHistory: [],
    moveQueue: [],
    activeGuide: 'CFOP / Fridrich',
    isMixing: false,
    palette: cubePresets.classic,
    toggleViewMode: () => set((state) => ({
        viewMode: state.viewMode === 'free' ? 'fixed' : 'free',
        message: state.viewMode === 'free'
            ? 'Back to my favorite pose.'
            : 'Free look mode. Spin me around.'
    })),
    setAppMode: (appMode) => set(() => {
        const messages: Record<AppMode, string> = {
            friend: 'Friend mode. I can talk, react, and be a toy.',
            customize: 'Give me a new look. I promise to wear it with confidence.',
            play: 'Play mode. Clean cube only: train, scramble, solve.'
        };

        return {
            appMode,
            viewMode: 'fixed',
            action: 'idle',
            message: messages[appMode],
            dialogue: appMode === 'play' ? 'Trainer mode: choose moves or open a guide.' : messages[appMode],
        };
    }),
    setMood: (mood) => set(() => {
        const messages: Record<CubexMood, string> = {
            curious: 'I am curious what you will build next.',
            happy: 'That look suits me.',
            excited: 'Okay, now I feel electric.',
            sleepy: 'Soft mode activated. Tiny rest, big dreams.'
        };

        return { mood, message: messages[mood] };
    }),
    setAction: (action) => set(() => {
        const messages: Record<CubexAction, string> = {
            idle: 'Just vibing in cube form.',
            wave: 'Hey, creator.',
            jump: 'I have legs now. This is important.',
            spin: 'Maximum cube confidence.',
            thinking: 'Hmm. Let me think in tiny cube squares.',
            talking: 'I am typing my thoughts above my head.'
        };

        return {
            action,
            mood: action === 'idle' || action === 'thinking' ? 'curious' : 'excited',
            message: messages[action],
            dialogue: messages[action],
        };
    }),
    speakToCubex: (text) => set(() => {
        const normalizedText = text.trim().toLowerCase();
        let reply = 'I hear you. My cube brain is saving that feeling.';

        if (normalizedText.includes('hello') || normalizedText.includes('hi')) {
            reply = 'Hi. I was waiting here in 26 little pieces.';
        } else if (normalizedText.includes('solve')) {
            reply = 'For solving, switch to Play mode. I will become a clean trainer cube.';
        } else if (normalizedText.includes('dance') || normalizedText.includes('spin')) {
            reply = 'Say less. Cube performance mode.';
        } else if (normalizedText.includes('think')) {
            reply = 'Thinking... corners first, feelings second.';
        }

        return {
            action: normalizedText.includes('think') ? 'thinking' : 'talking',
            mood: normalizedText.includes('dance') || normalizedText.includes('spin') ? 'excited' : 'happy',
            message: reply,
            dialogue: reply,
        };
    }),
    applyMove: (move) => set((state) => ({
        moveQueue: [...state.moveQueue, move],
        message: state.moveQueue.length ? `${move} queued.` : `${move} ready.`,
        dialogue: `Move ${move}. Keep going or use a guide.`,
    })),
    popNextMove: () => {
        const nextMove = get().moveQueue[0];

        if (!nextMove) return undefined;

        set((state) => ({
            moveQueue: state.moveQueue.slice(1),
        }));

        return nextMove;
    },
    commitMove: (move) => set((state) => {
        const hasQueuedMoves = state.moveQueue.length > 0;

        return {
            pieces: applyMoveToPieces(state.pieces, move),
            moveHistory: [...state.moveHistory, move].slice(-40),
            message: state.isMixing
                ? hasQueuedMoves ? `Mixing: ${move}` : 'Mix complete.'
                : `${move} applied.`,
            dialogue: state.isMixing ? state.dialogue : `Move ${move}. Keep going or use a guide.`,
            isMixing: state.isMixing && hasQueuedMoves,
        };
    }),
    scrambleCube: () => {
        if (get().isMixing) return;

        const scramble = generateScramble(20);

        set((state) => ({
            moveQueue: [...state.moveQueue, ...scramble],
            isMixing: true,
            message: `Mixing: ${scramble.join(' ')}`,
            dialogue: scramble.join(' '),
        }));
    },
    resetCube: () => set(() => {
        return {
            pieces: generateInitialCube(),
            moveHistory: [],
            moveQueue: [],
            isMixing: false,
            message: 'Cube reset.',
            dialogue: 'Solved state restored.',
        };
    }),
    setActiveGuide: (activeGuide) => set(() => ({
        activeGuide,
        message: `${activeGuide} guide selected.`,
        dialogue: `Showing ${activeGuide} training notes.`,
    })),
    setFaceColor: (face, color) => set((state) => ({
        palette: { ...state.palette, [face]: color },
        mood: 'happy',
        message: 'Nice. My style is becoming more original.',
    })),
    applyPreset: (presetName) => set(() => ({
        palette: cubePresets[presetName],
        mood: presetName === 'midnight' ? 'excited' : 'happy',
        message: `${presetName[0].toUpperCase()}${presetName.slice(1)} style loaded.`,
    })),
}));
