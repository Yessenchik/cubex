import type { CubePalette, Piece } from '../store/useCubeStore';
import type { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { useMemo } from 'react';

interface CubieProps {
    piece: Piece;
    palette: CubePalette;
    onPointerDown?: (piece: Piece, event: ThreeEvent<PointerEvent>) => void;
    onPointerUp?: (piece: Piece, event: ThreeEvent<PointerEvent>) => void;
}

// The exact order Three.js applies materials to a BoxGeometry:
// [Right, Left, Top, Bottom, Front, Back]
export function Cubie({ piece, palette, onPointerDown, onPointerUp }: CubieProps) {
    const [x, y, z] = piece.initialPosition;

    const materials = useMemo(() => {
        return [
            new THREE.MeshStandardMaterial({ color: x === 1 ? palette.right : palette.inside, roughness: 0.42, metalness: 0.08 }),
            new THREE.MeshStandardMaterial({ color: x === -1 ? palette.left : palette.inside, roughness: 0.42, metalness: 0.08 }),
            new THREE.MeshStandardMaterial({ color: y === 1 ? palette.top : palette.inside, roughness: 0.36, metalness: 0.06 }),
            new THREE.MeshStandardMaterial({ color: y === -1 ? palette.bottom : palette.inside, roughness: 0.42, metalness: 0.08 }),
            new THREE.MeshStandardMaterial({ color: z === 1 ? palette.front : palette.inside, roughness: 0.42, metalness: 0.08 }),
            new THREE.MeshStandardMaterial({ color: z === -1 ? palette.back : palette.inside, roughness: 0.42, metalness: 0.08 }),
        ];
    }, [palette, x, y, z]);

    return (
        <mesh
            position={piece.currentPosition}
            rotation={piece.rotation}
            material={materials}
            onPointerDown={(event) => onPointerDown?.(piece, event)}
            onPointerUp={(event) => onPointerUp?.(piece, event)}
        >
            {/* slightly smaller than 1 to create the classic grid gaps */}
            <boxGeometry args={[0.95, 0.95, 0.95]} />
        </mesh>
    );
}
