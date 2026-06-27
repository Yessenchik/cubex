import { create } from 'zustand';
import { applyMoveToPieces, cubePresets, generateInitialCube, generateScramble } from './cubeModel';
import type {
    AppMode,
    CubeMove,
    CubePalette,
    CubexAction,
    CubexMood,
    FaceName,
    GuideName,
    Piece,
} from '../types/cube';

export { cubeMoveDefinitions, cubePresets } from './cubeModel';
export type {
    AppMode,
    CubeMove,
    CubePalette,
    CubexAction,
    CubexMood,
    FaceName,
    GuideName,
    Piece,
    PieceType,
} from '../types/cube';

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

const modeMessages: Record<AppMode, string> = {
    friend: 'Friend mode. I can talk, react, and be a toy.',
    customize: 'Give me a new look. I promise to wear it with confidence.',
    play: 'Play mode. Clean cube only: train, scramble, solve.',
};

const moodMessages: Record<CubexMood, string> = {
    curious: 'I am curious what you will build next.',
    happy: 'That look suits me.',
    excited: 'Okay, now I feel electric.',
    sleepy: 'Soft mode activated. Tiny rest, big dreams.',
};

const actionMessages: Record<CubexAction, string> = {
    idle: 'Just vibing in cube form.',
    wave: 'Hey, creator.',
    jump: 'I have legs now. This is important.',
    spin: 'Maximum cube confidence.',
    thinking: 'Hmm. Let me think in tiny cube squares.',
    talking: 'I am typing my thoughts above my head.',
};

const getCubexReply = (text: string) => {
    const normalizedText = text.trim().toLowerCase();

    if (normalizedText.includes('hello') || normalizedText.includes('hi')) {
        return 'Hi. I was waiting here in 26 little pieces.';
    }

    if (normalizedText.includes('solve')) {
        return 'For solving, switch to Play mode. I will become a clean trainer cube.';
    }

    if (normalizedText.includes('dance') || normalizedText.includes('spin')) {
        return 'Say less. Cube performance mode.';
    }

    if (normalizedText.includes('think')) {
        return 'Thinking... corners first, feelings second.';
    }

    return 'I hear you. My cube brain is saving that feeling.';
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
            : 'Free look mode. Spin me around.',
    })),
    setAppMode: (appMode) => set(() => ({
        appMode,
        viewMode: 'fixed',
        action: 'idle',
        message: modeMessages[appMode],
        dialogue: appMode === 'play' ? 'Trainer mode: choose moves or open a guide.' : modeMessages[appMode],
    })),
    setMood: (mood) => set(() => ({
        mood,
        message: moodMessages[mood],
    })),
    setAction: (action) => set(() => ({
        action,
        mood: action === 'idle' || action === 'thinking' ? 'curious' : 'excited',
        message: actionMessages[action],
        dialogue: actionMessages[action],
    })),
    speakToCubex: (text) => set(() => {
        const normalizedText = text.trim().toLowerCase();
        const reply = getCubexReply(text);

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
    resetCube: () => set(() => ({
        pieces: generateInitialCube(),
        moveHistory: [],
        moveQueue: [],
        isMixing: false,
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
