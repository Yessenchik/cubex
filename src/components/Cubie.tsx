import type { CubePalette, FaceName, Piece } from '../store/useCubeStore';
import { type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { useMemo } from 'react';

interface CubieProps {
    piece: Piece;
    palette: CubePalette;
    onPointerDown?: (piece: Piece, event: ThreeEvent<PointerEvent>) => void;
    onPointerUp?: (piece: Piece, event: ThreeEvent<PointerEvent>) => void;
}

const stickerFaces: Record<FaceName, { position: [number, number, number]; rotation: [number, number, number] }> = {
    right: { position: [0.486, 0, 0], rotation: [0, Math.PI / 2, 0] },
    left: { position: [-0.486, 0, 0], rotation: [0, -Math.PI / 2, 0] },
    top: { position: [0, 0.486, 0], rotation: [-Math.PI / 2, 0, 0] },
    bottom: { position: [0, -0.486, 0], rotation: [Math.PI / 2, 0, 0] },
    front: { position: [0, 0, 0.486], rotation: [0, 0, 0] },
    back: { position: [0, 0, -0.486], rotation: [0, Math.PI, 0] },
};

const faceOrder: FaceName[] = ['right', 'left', 'top', 'bottom', 'front', 'back'];

export function Cubie({ piece, palette, onPointerDown, onPointerUp }: CubieProps) {
    const { stickers } = piece;
    const bodyMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        color: palette.inside,
        roughness: 0.38,
        metalness: 0.08,
    }), [palette.inside]);

    const stickerMaterials = useMemo(() => {
        return faceOrder.reduce<Partial<Record<FaceName, THREE.MeshBasicMaterial>>>((materials, face) => {
            const stickerColor = stickers[face];

            if (stickerColor) {
                materials[face] = new THREE.MeshBasicMaterial({
                    color: palette[stickerColor],
                    side: THREE.DoubleSide,
                    polygonOffset: true,
                    polygonOffsetFactor: -1,
                });
            }

            return materials;
        }, {});
    }, [palette, stickers]);

    return (
        <group
            position={piece.currentPosition}
            onPointerDown={(event) => onPointerDown?.(piece, event)}
            onPointerUp={(event) => onPointerUp?.(piece, event)}
        >
            <mesh material={bodyMaterial}>
                <boxGeometry args={[0.96, 0.96, 0.96]} />
            </mesh>

            {faceOrder.map((face) => {
                const material = stickerMaterials[face];

                if (!material) return null;

                const { position, rotation } = stickerFaces[face];

                return (
                    <mesh key={face} position={position} rotation={rotation} material={material}>
                        <planeGeometry args={[0.74, 0.74]} />
                    </mesh>
                );
            })}
        </group>
    );
}
