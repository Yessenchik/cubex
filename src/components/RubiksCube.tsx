import { useEffect, useRef, useState } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { Cubie } from './Cubie';
import { CubexDialogue, CubexFace, CubexLimbs } from './CubexFriend';
import { cubeMoveDefinitions, type CubeMove, type Piece, useCubeStore } from '../store/useCubeStore';
import { easeTurn, getLayerCoordinate, inferMoveFromDrag, type Axis } from '../scene/cubeGestures';

const DEFAULT_FIXED_QUATERNION = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, 0));
const TURN_DURATION = 0.32;

interface ActiveLayerTurn {
    move: CubeMove;
    axis: Axis;
    turns: number;
    affectedIds: Set<number>;
    pieces: Piece[];
    elapsed: number;
    isCommitting?: boolean;
}

interface DragStartInfo {
    piece: Piece;
    point: THREE.Vector3;
    normal: THREE.Vector3;
}

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
    const popNextMove = useCubeStore((state) => state.popNextMove);
    const commitMove = useCubeStore((state) => state.commitMove);
    const isFriendMode = appMode !== 'play';

    const groupRef = useRef<THREE.Group>(null);
    const avatarRef = useRef<THREE.Group>(null);
    const animatedLayerRef = useRef<THREE.Group>(null);
    const friendRigRef = useRef<THREE.Group>(null);
    const leftArmRef = useRef<THREE.Group>(null);
    const rightArmRef = useRef<THREE.Group>(null);
    const leftLegRef = useRef<THREE.Group>(null);
    const rightLegRef = useRef<THREE.Group>(null);
    const targetQuaternion = useRef(new THREE.Quaternion().copy(DEFAULT_FIXED_QUATERNION));
    const friendPresenceRef = useRef(1);
    const previousAppModeRef = useRef(appMode);
    const piecesRef = useRef(pieces);
    const activeTurnRef = useRef<ActiveLayerTurn | null>(null);
    const [faceMotion, setFaceMotion] = useState({ blink: 1, smile: 0.5 });
    const [friendPresence, setFriendPresence] = useState(1);
    const [handoffBubble, setHandoffBubble] = useState<{ text: string; key: number } | null>(null);
    const [activeTurn, setActiveTurn] = useState<ActiveLayerTurn | null>(null);
    const staticPieces = activeTurn ? pieces.filter((piece) => !activeTurn.affectedIds.has(piece.id)) : pieces;
    const turningPieces = activeTurn?.pieces ?? [];

    useEffect(() => {
        piecesRef.current = pieces;
    }, [pieces]);

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

    const dragStartInfo = useRef<DragStartInfo | null>(null);

    const startQueuedMove = (move: CubeMove) => {
        const definition = cubeMoveDefinitions[move];
        const affectedPieces = piecesRef.current
            .filter((piece) => getLayerCoordinate(piece, definition.axis) === definition.layer)
            .map((piece) => ({
                ...piece,
                currentPosition: [...piece.currentPosition] as Piece['currentPosition'],
                initialPosition: [...piece.initialPosition] as Piece['initialPosition'],
                stickers: { ...piece.stickers },
            }));
        const affectedIds = new Set(affectedPieces.map((piece) => piece.id));

        const turn: ActiveLayerTurn = {
            move,
            axis: definition.axis,
            turns: definition.turns,
            affectedIds,
            pieces: affectedPieces,
            elapsed: 0,
        };

        activeTurnRef.current = turn;
        setActiveTurn(turn);

        if (animatedLayerRef.current) {
            animatedLayerRef.current.rotation.set(0, 0, 0);
        }
    };

    const getPointerNormal = (event: ThreeEvent<PointerEvent>) => {
        const normal = event.face?.normal.clone() ?? new THREE.Vector3(0, 1, 0);
        normal.transformDirection(event.object.matrixWorld).normalize();

        if (avatarRef.current) {
            const avatarQuaternion = avatarRef.current.getWorldQuaternion(new THREE.Quaternion()).invert();
            normal.applyQuaternion(avatarQuaternion).normalize();
        }

        return normal;
    };

    const getPointerPoint = (event: ThreeEvent<PointerEvent>) => {
        const point = event.point.clone();
        return avatarRef.current ? avatarRef.current.worldToLocal(point) : point;
    };

    const handlePiecePointerDown = (_piece: Piece, e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();

        if (isFriendMode) {
            setAction('wave');
        }

        dragStartInfo.current = {
            piece: _piece,
            point: getPointerPoint(e),
            normal: getPointerNormal(e),
        };
    };

    const handlePiecePointerUp = (_piece: Piece, e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        if (!dragStartInfo.current) return;

        if (appMode === 'play') {
            const move = inferMoveFromDrag(
                dragStartInfo.current.piece,
                dragStartInfo.current.normal,
                dragStartInfo.current.point,
                getPointerPoint(e)
            );

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

    useFrame(({ clock }, delta) => {
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

        if (!activeTurnRef.current) {
            const nextMove = popNextMove();

            if (nextMove) {
                startQueuedMove(nextMove);
            }
        }

        if (activeTurnRef.current && animatedLayerRef.current) {
            const turn = activeTurnRef.current;
            turn.elapsed += delta;
            const progress = Math.min(turn.elapsed / TURN_DURATION, 1);
            const angle = easeTurn(progress) * turn.turns * Math.PI / 2;

            animatedLayerRef.current.rotation.set(0, 0, 0);
            animatedLayerRef.current.rotation[turn.axis] = angle;

            if (progress >= 1 && !turn.isCommitting) {
                turn.isCommitting = true;
                animatedLayerRef.current.rotation.set(0, 0, 0);
                animatedLayerRef.current.rotation[turn.axis] = turn.turns * Math.PI / 2;
                commitMove(turn.move);

                window.requestAnimationFrame(() => {
                    if (animatedLayerRef.current) {
                        animatedLayerRef.current.rotation.set(0, 0, 0);
                    }

                    activeTurnRef.current = null;
                    setActiveTurn(null);
                });
            }
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
                        {staticPieces.map((piece) => (
                            <Cubie
                                key={piece.id}
                                piece={piece}
                                palette={palette}
                                onPointerDown={handlePiecePointerDown}
                                onPointerUp={handlePiecePointerUp}
                            />
                        ))}
                        {activeTurn && (
                            <group ref={animatedLayerRef}>
                                {turningPieces.map((piece) => (
                                    <Cubie
                                        key={piece.id}
                                        piece={piece}
                                        palette={palette}
                                        onPointerDown={handlePiecePointerDown}
                                        onPointerUp={handlePiecePointerUp}
                                    />
                                ))}
                            </group>
                        )}
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
