import type { AppMode, CubeMove, CubexAction, CubexMood, FaceName, SolvingGuide } from '../types/cube';

export const appModes: AppMode[] = ['friend', 'customize', 'play'];
export const friendActions: CubexAction[] = ['wave', 'jump', 'spin', 'thinking', 'talking', 'idle'];
export const moods: CubexMood[] = ['curious', 'happy', 'excited', 'sleepy'];
export const editableFaces: FaceName[] = ['top', 'front', 'right', 'left', 'back', 'bottom'];

export const playMoves: CubeMove[] = [
    'U', "U'", 'D', "D'", 'R', "R'",
    'L', "L'", 'F', "F'", 'B', "B'",
    'M', "M'", 'E', "E'", 'S', "S'",
];

export const solvingGuides: SolvingGuide[] = [
    {
        name: 'CFOP / Fridrich',
        detail: 'Cross, F2L, OLL, PLL. The main speedcubing path.',
        steps: ['Build cross', 'Pair F2L slots', 'Orient last layer', 'Permute last layer'],
        sample: "R U R' U'",
    },
    {
        name: 'ZBLL',
        detail: 'Last-layer cases after edge orientation. Powerful, advanced, huge set.',
        steps: ['Confirm edges are oriented', 'Recognize corner permutation', 'Apply matching ZBLL case'],
        sample: "R U R' U R U2 R'",
    },
    {
        name: 'OLL',
        detail: 'Orient the last layer first, then finish with PLL.',
        steps: ['Make yellow cross', 'Orient corners', 'Keep last-layer pieces in place for PLL'],
        sample: "F R U R' U' F'",
    },
    {
        name: 'PLL',
        detail: 'Permute last-layer pieces after all yellow stickers face up.',
        steps: ['Recognize permutation', 'Align solved block', 'Execute PLL and adjust U face'],
        sample: "R U' R U R U R U' R' U' R2",
    },
];
