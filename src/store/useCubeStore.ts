import { create } from 'zustand';

export type PieceType = 'center' | 'edge' | 'corner';

export interface Piece {
    id: number;
    type: PieceType;
    initialPosition: [number, number, number];
    currentPosition: [number, number, number];
    rotation: [number, number, number];
}

const generateInitialCube = (): Piece[] => {
    const pieces: Piece[] = [];
    let id = 0;

    // Change 'let' to 'const' here:
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
    toggleViewMode: () => void;
}

export const useCubeStore = create<CubeState>()((set) => ({
    pieces: generateInitialCube(),
    viewMode: 'fixed', // Let's default to the clean, fixed mode
    toggleViewMode: () => set((state) => ({
        viewMode: state.viewMode === 'free' ? 'fixed' : 'free'
    })),
}));
