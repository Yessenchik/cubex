// 1. Add useEffect to your React imports
import { useRef, useEffect } from 'react';
import { useCubeStore } from '../store/useCubeStore';
import { Cubie } from './Cubie';
import * as THREE from 'three';
import { useFrame, type ThreeEvent } from '@react-three/fiber';

export function RubiksCube() {
    const pieces = useCubeStore((state) => state.pieces);
    const viewMode = useCubeStore((state) => state.viewMode);

    const groupRef = useRef<THREE.Group>(null);

    // --- NEW: Define the Comfortable Default State ---
    // Math.PI / 6 = 30 degrees (looking down slightly)
    // -Math.PI / 4 = -45 degrees (looking at it from an angle)
    const defaultFixedEuler = new THREE.Euler(0, 0, 0);
    const defaultFixedQuaternion = new THREE.Quaternion().setFromEuler(defaultFixedEuler);

    // The quaternion the cube is actively trying to reach
    // We initialize it to the default fixed position so it starts looking good on load
    const targetQuaternion = useRef(new THREE.Quaternion().copy(defaultFixedQuaternion));

    // --- NEW: Transition Logic ---
    // Watch for changes to the viewMode toggle
    useEffect(() => {
        if (viewMode === 'fixed') {
            // Overwrite whatever random free-spin angle we were at
            // with the perfect isometric home angle.
            targetQuaternion.current.copy(defaultFixedQuaternion);
        }
    }, [viewMode]);

    // --- 1. SLICE DRAG LOGIC ---
    const dragStartInfo = useRef<{ point: THREE.Vector3; normal: THREE.Vector3 } | null>(null);

    const handlePiecePointerDown = (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        if (e.face?.normal) {
            dragStartInfo.current = {
                point: e.point.clone(),
                normal: e.face.normal.clone()
            };
        }
    };

    const handlePiecePointerUp = (e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        if (!dragStartInfo.current) return;

        const dragVector = new THREE.Vector3().subVectors(e.point.clone(), dragStartInfo.current.point);

        if (dragVector.length() > 0.2) {
            console.log("Piece Dragged! Normal:", dragStartInfo.current.normal.round());
            console.log("Drag Vector:", dragVector.normalize().round());
        }

        dragStartInfo.current = null;
    };

    // --- 2. GLOBAL ROTATION LOGIC (2 Modes) ---
    const isDraggingGlobal = useRef(false);
    const previousMouse = useRef({ x: 0, y: 0 });
    const startMouse = useRef({ x: 0, y: 0 });

    const handleBgPointerDown = (e: ThreeEvent<PointerEvent>) => {
        isDraggingGlobal.current = true;
        previousMouse.current = { x: e.clientX, y: e.clientY };
        startMouse.current = { x: e.clientX, y: e.clientY };
    };

    const handleBgPointerMove = (e: ThreeEvent<PointerEvent>) => {
        if (!isDraggingGlobal.current || viewMode !== 'free') return;

        const deltaX = e.clientX - previousMouse.current.x;
        const deltaY = e.clientY - previousMouse.current.y;

        const quaternionY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), deltaX * 0.005);
        const quaternionX = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), deltaY * 0.005);

        targetQuaternion.current.premultiply(quaternionX);
        targetQuaternion.current.premultiply(quaternionY);

        previousMouse.current = { x: e.clientX, y: e.clientY };
    };

    const handleBgPointerUp = (e: ThreeEvent<PointerEvent>) => {
        if (isDraggingGlobal.current && viewMode === 'fixed') {
            const deltaX = e.clientX - startMouse.current.x;
            const deltaY = e.clientY - startMouse.current.y;

            if (Math.abs(deltaX) > 50 || Math.abs(deltaY) > 50) {
                // We calculate world axes for snapping so it doesn't get confused by its own rotation
                const xAxis = new THREE.Vector3(1, 0, 0).applyQuaternion(targetQuaternion.current.clone().invert());
                const yAxis = new THREE.Vector3(0, 1, 0).applyQuaternion(targetQuaternion.current.clone().invert());

                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    const sign = Math.sign(deltaX);
                    const snapQ = new THREE.Quaternion().setFromAxisAngle(yAxis, sign * (Math.PI / 2));
                    targetQuaternion.current.multiply(snapQ);
                } else {
                    const sign = Math.sign(deltaY);
                    const snapQ = new THREE.Quaternion().setFromAxisAngle(xAxis, sign * (Math.PI / 2));
                    targetQuaternion.current.multiply(snapQ);
                }
            }
        }
        isDraggingGlobal.current = false;
    };

    // --- 3. THE ANIMATION LOOP ---
    useFrame(() => {
        if (groupRef.current) {
            // This will automatically handle the smooth transition to the Home Base!
            groupRef.current.quaternion.slerp(targetQuaternion.current, 0.1);
        }
    });

    return (
        <>
            <mesh
                scale={100}
                onPointerDown={handleBgPointerDown}
                onPointerUp={handleBgPointerUp}
                onPointerOut={handleBgPointerUp}
                onPointerMove={handleBgPointerMove}
            >
                <sphereGeometry />
                <meshBasicMaterial transparent opacity={0} side={THREE.BackSide} />
            </mesh>

            <group ref={groupRef}>
                <group
                    onPointerDown={handlePiecePointerDown}
                    onPointerUp={handlePiecePointerUp}
                >
                    {pieces.map((piece) => (
                        <Cubie key={piece.id} piece={piece} />
                    ))}
                </group>
            </group>
        </>
    );
}
