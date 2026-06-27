import { create } from 'zustand';

export type PieceType = 'center' | 'edge' | 'corner';
export type AppMode = 'friend' | 'customize' | 'play';
export type CubexMood = 'curious' | 'happy' | 'excited' | 'sleepy';
export type CubexAction = 'idle' | 'wave' | 'jump' | 'spin' | 'thinking' | 'talking';
export type CubeMove = 'U' | "U'" | 'D' | "D'" | 'R' | "R'" | 'L' | "L'" | 'F' | "F'" | 'B' | "B'";
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
    rotation: [number, number, number];
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
                    rotation: [0, 0, 0]
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
    activeGuide: GuideName;
    palette: CubePalette;
    toggleViewMode: () => void;
    setAppMode: (mode: AppMode) => void;
    setMood: (mood: CubexMood) => void;
    setAction: (action: CubexAction) => void;
    speakToCubex: (text: string) => void;
    applyMove: (move: CubeMove) => void;
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

const rotateEuler = (rotation: [number, number, number], axis: 'x' | 'y' | 'z', turns: number): [number, number, number] => {
    return [
        rotation[0] + (axis === 'x' ? turns * Math.PI / 2 : 0),
        rotation[1] + (axis === 'y' ? turns * Math.PI / 2 : 0),
        rotation[2] + (axis === 'z' ? turns * Math.PI / 2 : 0),
    ];
};

const moveDefinitions: Record<CubeMove, { axis: 'x' | 'y' | 'z'; layer: number; turns: number }> = {
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
};

const applyMoveToPieces = (pieces: Piece[], move: CubeMove) => {
    const definition = moveDefinitions[move];

    return pieces.map((piece) => {
        const axisIndex = definition.axis === 'x' ? 0 : definition.axis === 'y' ? 1 : 2;

        if (piece.currentPosition[axisIndex] !== definition.layer) {
            return piece;
        }

        return {
            ...piece,
            currentPosition: rotatePosition(piece.currentPosition, definition.axis, definition.turns),
            rotation: rotateEuler(piece.rotation, definition.axis, definition.turns),
        };
    });
};

const allMoves = Object.keys(moveDefinitions) as CubeMove[];

export const useCubeStore = create<CubeState>()((set) => ({
    pieces: generateInitialCube(),
    viewMode: 'fixed',
    appMode: 'friend',
    mood: 'curious',
    action: 'idle',
    message: "Hi, I'm Cubex. I am learning how to feel alive.",
    dialogue: 'Say something to Cubex.',
    moveHistory: [],
    activeGuide: 'CFOP / Fridrich',
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
        pieces: applyMoveToPieces(state.pieces, move),
        moveHistory: [...state.moveHistory, move].slice(-40),
        message: `${move} applied.`,
        dialogue: `Move ${move}. Keep going or use a guide.`,
    })),
    scrambleCube: () => set((state) => {
        const scramble = Array.from({ length: 20 }, () => allMoves[Math.floor(Math.random() * allMoves.length)]);
        const scrambledPieces = scramble.reduce((nextPieces, move) => applyMoveToPieces(nextPieces, move), state.pieces);

        return {
            pieces: scrambledPieces,
            moveHistory: [...state.moveHistory, ...scramble].slice(-40),
            message: 'Scramble applied.',
            dialogue: scramble.join(' '),
        };
    }),
    resetCube: () => set(() => ({
        pieces: generateInitialCube(),
        moveHistory: [],
        message: 'Cube reset.',
        dialogue: 'Solved state restored.',
    })),
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
