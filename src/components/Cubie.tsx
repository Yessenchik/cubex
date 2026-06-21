import type { Piece } from '../store/useCubeStore';
import * as THREE from 'three';
import { useMemo } from 'react';

interface CubieProps {
    piece: Piece;
}

// The exact order Three.js applies materials to a BoxGeometry:
// [Right, Left, Top, Bottom, Front, Back]
const COLORS = {
    right: '#B71234',
    left: '#FF5800',
    top: '#FFFFFF',
    bottom: '#FFD500',
    front: '#009B48',
    back: '#0046AD',
    inside: '#1A1A1A'
};

export function Cubie({ piece }: CubieProps) {
    const [x, y, z] = piece.initialPosition;

    // We use useMemo so we don't recalculate the materials 60 times a second
    const materials = useMemo(() => {
        return [
            // 0: Right (only red if it's on the rightmost slice)
            new THREE.MeshStandardMaterial({ color: x === 1 ? COLORS.right : COLORS.inside }),
            // 1: Left
            new THREE.MeshStandardMaterial({ color: x === -1 ? COLORS.left : COLORS.inside }),
            // 2: Top
            new THREE.MeshStandardMaterial({ color: y === 1 ? COLORS.top : COLORS.inside }),
            // 3: Bottom
            new THREE.MeshStandardMaterial({ color: y === -1 ? COLORS.bottom : COLORS.inside }),
            // 4: Front
            new THREE.MeshStandardMaterial({ color: z === 1 ? COLORS.front : COLORS.inside }),
            // 5: Back
            new THREE.MeshStandardMaterial({ color: z === -1 ? COLORS.back : COLORS.inside }),
        ];
    }, [x, y, z]);

    return (
        <mesh
            position={piece.currentPosition}
            rotation={piece.rotation}
            material={materials}
        >
            {/* slightly smaller than 1 to create the classic grid gaps */}
            <boxGeometry args={[0.95, 0.95, 0.95]} />
        </mesh>
    );
}
