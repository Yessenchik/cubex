import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { Cubie } from './Cubie';
import { type CubeMove, type Piece, useCubeStore } from '../store/useCubeStore';

const DEFAULT_FIXED_QUATERNION = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0));
const DRAG_THRESHOLD = 34;

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

function CubexLogo() {
    const logoTexture = useMemo(() => createLogoTexture(), []);

    return (
        <mesh position={[0, 1.486, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.62, 0.62]} />
            <meshStandardMaterial
                map={logoTexture}
                transparent
                roughness={0.32}
                metalness={0.05}
                polygonOffset
                polygonOffsetFactor={-1}
            />
        </mesh>
    );
}

function CubexFace({ blink, smile }: { blink: number; smile: number }) {
    const eyeHeight = Math.max(0.035, 0.16 * blink);
    const mouthWidth = 0.38 + smile * 0.08;

    return (
        <group position={[0, 0.36, 1.49]}>
            <mesh position={[-0.38, 0.22, 0]}>
                <boxGeometry args={[0.22, eyeHeight, 0.035]} />
                <meshStandardMaterial color="#0F172A" roughness={0.2} />
            </mesh>
            <mesh position={[0.38, 0.22, 0]}>
                <boxGeometry args={[0.22, eyeHeight, 0.035]} />
                <meshStandardMaterial color="#0F172A" roughness={0.2} />
            </mesh>
            <mesh position={[0, -0.12, 0]}>
                <boxGeometry args={[mouthWidth, 0.055, 0.035]} />
                <meshStandardMaterial color="#0F172A" roughness={0.25} />
            </mesh>
        </group>
    );
}

function CubexLimbs({
    leftArmRef,
    rightArmRef,
    leftLegRef,
    rightLegRef,
}: {
    leftArmRef: React.RefObject<THREE.Group | null>;
    rightArmRef: React.RefObject<THREE.Group | null>;
    leftLegRef: React.RefObject<THREE.Group | null>;
    rightLegRef: React.RefObject<THREE.Group | null>;
}) {
    const limbMaterial = <meshStandardMaterial color="#E8EEF8" roughness={0.5} metalness={0.02} />;
    const jointMaterial = <meshStandardMaterial color="#111827" roughness={0.36} metalness={0.08} />;

    return (
        <>
            <group ref={leftArmRef} position={[-1.75, 0.02, 1.04]} rotation={[0, 0, -0.35]}>
                <mesh rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.085, 0.105, 0.92, 18]} />
                    {limbMaterial}
                </mesh>
                <mesh position={[-0.48, 0, 0]}>
                    <sphereGeometry args={[0.14, 24, 16]} />
                    {jointMaterial}
                </mesh>
            </group>

            <group ref={rightArmRef} position={[1.75, 0.02, 1.04]} rotation={[0, 0, 0.35]}>
                <mesh rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.085, 0.105, 0.92, 18]} />
                    {limbMaterial}
                </mesh>
                <mesh position={[0.48, 0, 0]}>
                    <sphereGeometry args={[0.14, 24, 16]} />
                    {jointMaterial}
                </mesh>
            </group>

            <group ref={leftLegRef} position={[-0.56, -1.84, 0.96]}>
                <mesh>
                    <cylinderGeometry args={[0.105, 0.12, 0.72, 18]} />
                    {limbMaterial}
                </mesh>
                <mesh position={[0, -0.43, 0.09]} scale={[1.25, 0.48, 0.82]}>
                    <sphereGeometry args={[0.19, 24, 16]} />
                    {jointMaterial}
                </mesh>
            </group>

            <group ref={rightLegRef} position={[0.56, -1.84, 0.96]}>
                <mesh>
                    <cylinderGeometry args={[0.105, 0.12, 0.72, 18]} />
                    {limbMaterial}
                </mesh>
                <mesh position={[0, -0.43, 0.09]} scale={[1.25, 0.48, 0.82]}>
                    <sphereGeometry args={[0.19, 24, 16]} />
                    {jointMaterial}
                </mesh>
            </group>
        </>
    );
}

function CubexDialogue({
    text,
    isTyping,
    visible,
    variant = 'normal',
}: {
    text: string;
    isTyping: boolean;
    visible: boolean;
    variant?: 'normal' | 'handoff';
}) {
    const [typingState, setTypingState] = useState({ source: text, visibleText: text });
    const typedText = typingState.source === text ? typingState.visibleText : '';

    useEffect(() => {
        if (!visible) return;

        let index = 0;
        const typingId = window.setInterval(() => {
            index += 1;
            setTypingState({ source: text, visibleText: text.slice(0, index) });

            if (index >= text.length) {
                window.clearInterval(typingId);
            }
        }, 22);

        return () => window.clearInterval(typingId);
    }, [text, visible]);

    return (
        <Html position={[0, 2.2, 1.75]} center distanceFactor={7} style={{ width: '260px', pointerEvents: 'none' }}>
            <div className={`scene-dialogue scene-dialogue-${variant}`}>
                <span>{typedText || ' '}</span>
                {(isTyping || typedText.length < text.length) && <i />}
            </div>
        </Html>
    );
}

const inferMoveFromDrag = (
    piece: Piece,
    start: { x: number; y: number },
    end: { x: number; y: number }
): CubeMove | null => {
    const deltaX = end.x - start.x;
    const deltaY = end.y - start.y;

    if (Math.hypot(deltaX, deltaY) < DRAG_THRESHOLD) {
        return null;
    }

    const [x, y, z] = piece.currentPosition;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (y === 1) return deltaX > 0 ? 'U' : "U'";
        if (y === -1) return deltaX > 0 ? "D'" : 'D';
        if (z === 1) return deltaX > 0 ? 'U' : "U'";
        if (z === -1) return deltaX > 0 ? "U'" : 'U';
    }

    if (x === 1) return deltaY > 0 ? "R'" : 'R';
    if (x === -1) return deltaY > 0 ? 'L' : "L'";
    if (z === 1) return deltaY > 0 ? "F'" : 'F';
    if (z === -1) return deltaY > 0 ? 'B' : "B'";

    return null;
};

export function RubiksCube() {
    const pieces = useCubeStore((state) => state.pieces);
    const viewMode = useCubeStore((state) => state.viewMode);
    const appMode = useCubeStore((state) => state.appMode);
    const palette = useCubeStore((state) => state.palette);
    const mood = useCubeStore((state) => state.mood);
    const action = useCubeStore((state) => state.action);
    const dialogue = useCubeStore((state) => state.dialogue);
    const setAction = useCubeStore((state) => state.setAction);
    const applyMove = useCubeStore((state) => state.applyMove);
    const isFriendMode = appMode !== 'play';

    const groupRef = useRef<THREE.Group>(null);
    const avatarRef = useRef<THREE.Group>(null);
    const friendRigRef = useRef<THREE.Group>(null);
    const leftArmRef = useRef<THREE.Group>(null);
    const rightArmRef = useRef<THREE.Group>(null);
    const leftLegRef = useRef<THREE.Group>(null);
    const rightLegRef = useRef<THREE.Group>(null);
    const targetQuaternion = useRef(new THREE.Quaternion().copy(DEFAULT_FIXED_QUATERNION));
    const friendPresenceRef = useRef(1);
    const previousAppModeRef = useRef(appMode);
    const [faceMotion, setFaceMotion] = useState({ blink: 1, smile: 0.5 });
    const [friendPresence, setFriendPresence] = useState(1);
    const [handoffBubble, setHandoffBubble] = useState<{ text: string; key: number } | null>(null);

    useEffect(() => {
        const previousMode = previousAppModeRef.current;

        if (previousMode !== 'play' && appMode === 'play') {
            setHandoffBubble({
                text: 'Okay, toy mode off. I will become your clean trainer cube.',
                key: Date.now(),
            });

            const handoffTimer = window.setTimeout(() => {
                setHandoffBubble(null);
            }, 1500);

            previousAppModeRef.current = appMode;
            return () => window.clearTimeout(handoffTimer);
        }

        previousAppModeRef.current = appMode;
    }, [appMode]);

    useEffect(() => {
        if (viewMode === 'fixed' || isFriendMode) {
            targetQuaternion.current.copy(DEFAULT_FIXED_QUATERNION);
        }
    }, [isFriendMode, viewMode]);

    const dragStartInfo = useRef<{ piece: Piece; pointer: { x: number; y: number } } | null>(null);

    const handlePiecePointerDown = (piece: Piece, e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();

        if (isFriendMode) {
            setAction('wave');
        }

        dragStartInfo.current = {
            piece,
            pointer: { x: e.clientX, y: e.clientY },
        };
    };

    const handlePiecePointerUp = (_piece: Piece, e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        if (!dragStartInfo.current) return;

        if (appMode === 'play') {
            const move = inferMoveFromDrag(dragStartInfo.current.piece, dragStartInfo.current.pointer, {
                x: e.clientX,
                y: e.clientY,
            });

            if (move) {
                applyMove(move);
            }
        }

        dragStartInfo.current = null;
    };

    const isDraggingGlobal = useRef(false);
    const previousMouse = useRef({ x: 0, y: 0 });
    const startMouse = useRef({ x: 0, y: 0 });

    const handleBgPointerDown = (e: ThreeEvent<PointerEvent>) => {
        if (isFriendMode) return;

        isDraggingGlobal.current = true;
        previousMouse.current = { x: e.clientX, y: e.clientY };
        startMouse.current = { x: e.clientX, y: e.clientY };
    };

    const handleBgPointerMove = (e: ThreeEvent<PointerEvent>) => {
        if (!isDraggingGlobal.current || viewMode !== 'free' || isFriendMode) return;

        const deltaX = e.clientX - previousMouse.current.x;
        const deltaY = e.clientY - previousMouse.current.y;

        const quaternionY = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), deltaX * 0.005);
        const quaternionX = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), deltaY * 0.005);

        targetQuaternion.current.premultiply(quaternionX);
        targetQuaternion.current.premultiply(quaternionY);

        previousMouse.current = { x: e.clientX, y: e.clientY };
    };

    const handleBgPointerUp = (e: ThreeEvent<PointerEvent>) => {
        if (isDraggingGlobal.current && viewMode === 'fixed' && !isFriendMode) {
            const deltaX = e.clientX - startMouse.current.x;
            const deltaY = e.clientY - startMouse.current.y;

            if (Math.abs(deltaX) > 50 || Math.abs(deltaY) > 50) {
                const xAxis = new THREE.Vector3(1, 0, 0).applyQuaternion(targetQuaternion.current.clone().invert());
                const yAxis = new THREE.Vector3(0, 1, 0).applyQuaternion(targetQuaternion.current.clone().invert());

                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    const snapQ = new THREE.Quaternion().setFromAxisAngle(yAxis, Math.sign(deltaX) * (Math.PI / 2));
                    targetQuaternion.current.multiply(snapQ);
                } else {
                    const snapQ = new THREE.Quaternion().setFromAxisAngle(xAxis, Math.sign(deltaY) * (Math.PI / 2));
                    targetQuaternion.current.multiply(snapQ);
                }
            }
        }
        isDraggingGlobal.current = false;
    };

    useFrame(({ clock }) => {
        const elapsed = clock.getElapsedTime();
        const jump = action === 'jump' ? Math.max(0, Math.sin(elapsed * 7)) * 0.58 : 0;
        const spin = action === 'spin' ? Math.sin(elapsed * 2.8) * 0.55 : Math.sin(elapsed * 0.8) * 0.025;
        const wave = action === 'wave' ? Math.sin(elapsed * 7) * 0.85 : Math.sin(elapsed * 1.7) * 0.16;
        const footSwing = action === 'jump' ? Math.sin(elapsed * 7) * 0.35 : Math.sin(elapsed * 1.8) * 0.08;
        const nextPresence = THREE.MathUtils.lerp(friendPresenceRef.current, isFriendMode ? 1 : 0, 0.14);
        friendPresenceRef.current = nextPresence;

        if (Math.abs(nextPresence - friendPresence) > 0.02 || nextPresence < 0.02 || nextPresence > 0.98) {
            setFriendPresence(nextPresence);
        }

        if (groupRef.current) {
            groupRef.current.quaternion.slerp(targetQuaternion.current, 0.1);
        }

        if (avatarRef.current) {
            if (isFriendMode) {
                avatarRef.current.position.y = Math.sin(elapsed * 1.4) * 0.05 + jump;
                avatarRef.current.rotation.y = spin;
                avatarRef.current.scale.setScalar(1 + Math.sin(elapsed * 2) * 0.012);
            } else {
                avatarRef.current.position.y = 0;
                avatarRef.current.rotation.y = 0;
                avatarRef.current.scale.setScalar(1);
            }
        }

        if (friendRigRef.current) {
            const rigScale = Math.max(0.001, nextPresence);
            friendRigRef.current.scale.setScalar(rigScale);
            friendRigRef.current.visible = nextPresence > 0.015;
        }

        if (leftArmRef.current) {
            leftArmRef.current.rotation.z = -0.35 - wave * 0.35;
            leftArmRef.current.rotation.x = action === 'wave' ? Math.sin(elapsed * 9) * 0.18 : 0;
        }

        if (rightArmRef.current) {
            rightArmRef.current.rotation.z = 0.35 + wave;
            rightArmRef.current.rotation.x = action === 'wave' ? Math.cos(elapsed * 8) * 0.24 : 0;
        }

        if (leftLegRef.current) {
            leftLegRef.current.rotation.x = footSwing;
        }

        if (rightLegRef.current) {
            rightLegRef.current.rotation.x = -footSwing;
        }

        if (isFriendMode) {
            const blink = mood === 'sleepy' || action === 'thinking' ? 0.32 : 0.72 + Math.sin(elapsed * 3.2) * 0.28;
            const smile = action === 'talking' ? 0.92 : mood === 'excited' ? 1 : mood === 'happy' ? 0.75 : mood === 'sleepy' ? 0.25 : 0.5;
            setFaceMotion((previous) => {
                if (Math.abs(previous.blink - blink) < 0.025 && Math.abs(previous.smile - smile) < 0.025) {
                    return previous;
                }

                return { blink, smile };
            });
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
                <group ref={avatarRef}>
                    <group>
                        {pieces.map((piece) => (
                            <Cubie
                                key={piece.id}
                                piece={piece}
                                palette={palette}
                                onPointerDown={handlePiecePointerDown}
                                onPointerUp={handlePiecePointerUp}
                            />
                        ))}
                        <CubexLogo />
                    </group>

                    <group ref={friendRigRef}>
                        {friendPresence > 0.04 && (
                            <CubexDialogue
                                text={dialogue}
                                isTyping={action === 'thinking' || action === 'talking'}
                                visible={friendPresence > 0.04}
                            />
                        )}
                        {handoffBubble && (
                            <CubexDialogue
                                key={handoffBubble.key}
                                text={handoffBubble.text}
                                isTyping
                                visible
                                variant="handoff"
                            />
                        )}
                        <CubexFace blink={faceMotion.blink} smile={faceMotion.smile} />
                        <group position={[0, -0.05, 0]}>
                            <CubexLimbs
                                leftArmRef={leftArmRef}
                                rightArmRef={rightArmRef}
                                leftLegRef={leftLegRef}
                                rightLegRef={rightLegRef}
                            />
                        </group>
                    </group>
                </group>
            </group>
        </>
    );
}
