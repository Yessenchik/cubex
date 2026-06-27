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

function createLogoTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;

    const context = canvas.getContext('2d');

    if (!context) {
        return new THREE.CanvasTexture(canvas);
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#111827';
    context.beginPath();
    context.roundRect(72, 72, 368, 368, 96);
    context.fill();

    context.strokeStyle = '#7DD3FC';
    context.lineWidth = 18;
    context.stroke();

    context.fillStyle = '#F8FAFC';
    context.font = '800 138px Arial';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('CX', 256, 266);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;

    return texture;
}

const getLogoPosition = (position: [number, number, number]) => (
    position.map((coordinate) => coordinate * 1.014) as [number, number, number]
);

export function Cubie({ piece, palette, onPointerDown, onPointerUp }: CubieProps) {
    const { stickers } = piece;
    const logoTexture = useMemo(() => createLogoTexture(), []);
    const logoMaterial = useMemo(() => new THREE.MeshBasicMaterial({
        map: logoTexture,
        transparent: true,
        side: THREE.DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: -2,
    }), [logoTexture]);
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
                const showLogo = piece.type === 'center' && stickers[face] === 'top';

                return (
                    <group key={face}>
                        <mesh position={position} rotation={rotation} material={material}>
                            <planeGeometry args={[0.74, 0.74]} />
                        </mesh>

                        {showLogo && (
                            <mesh position={getLogoPosition(position)} rotation={rotation} material={logoMaterial}>
                                <planeGeometry args={[0.42, 0.42]} />
                            </mesh>
                        )}
                    </group>
                );
            })}
        </group>
    );
}
