export type PieceType = 'center' | 'edge' | 'corner';
export type AppMode = 'friend' | 'customize' | 'play';
export type CubexMood = 'curious' | 'happy' | 'excited' | 'sleepy';
export type CubexAction =
    | 'idle'
    | 'wave'
    | 'jump'
    | 'spin'
    | 'spaceSpin'
    | 'backflip'
    | 'thinking'
    | 'talking';

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

export interface SolvingGuide {
    name: GuideName;
    detail: string;
    steps: string[];
    sample: string;
}
