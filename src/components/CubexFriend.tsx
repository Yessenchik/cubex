import { useEffect, useState } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

function CubexEye({ x, blink, lookX, lookY }: { x: number; blink: number; lookX: number; lookY: number }) {
    const eyeOpen = Math.max(0.035, 0.13 * blink);
    const pupilVisible = eyeOpen > 0.06;
    const pupilX = THREE.MathUtils.clamp(lookX, -1, 1) * 0.025;
    const pupilY = THREE.MathUtils.clamp(lookY, -1, 1) * 0.02;

    return (
        <group position={[x, 0.22, 0.012]}>
            <mesh position={[0, 0, -0.004]} scale={[0.145, eyeOpen + 0.018, 0.007]}>
                <sphereGeometry args={[1, 32, 16]} />
                <meshStandardMaterial color="#0F172A" roughness={0.34} />
            </mesh>

            <mesh position={[0, 0, 0.012]} scale={[0.12, eyeOpen, 0.016]}>
                <sphereGeometry args={[1, 32, 16]} />
                <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
            </mesh>

            {pupilVisible ? (
                <>
                    <mesh position={[pupilX, pupilY - 0.002, 0.034]} scale={[0.038, eyeOpen * 0.42, 0.009]}>
                        <sphereGeometry args={[1, 24, 12]} />
                        <meshStandardMaterial color="#0F172A" roughness={0.2} />
                    </mesh>
                    <mesh position={[pupilX - 0.01, pupilY + 0.02, 0.042]} scale={[0.008, 0.008, 0.004]}>
                        <sphereGeometry args={[1, 12, 8]} />
                        <meshStandardMaterial color="#FFFFFF" roughness={0.1} />
                    </mesh>
                </>
            ) : (
                <mesh position={[0, 0, 0.034]} scale={[0.14, 0.012, 0.006]}>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial color="#0F172A" roughness={0.24} />
                </mesh>
            )}
        </group>
    );
}

export function CubexFace({
    blink,
    smile,
    lookX = 0,
    lookY = 0,
}: {
    blink: number;
    smile: number;
    lookX?: number;
    lookY?: number;
}) {
    const mouthWidth = 0.38 + smile * 0.08;

    return (
        <group position={[0, 0.36, 1.49]}>
            <CubexEye x={-0.32} blink={blink} lookX={lookX} lookY={lookY} />
            <CubexEye x={0.32} blink={blink} lookX={lookX} lookY={lookY} />
            <mesh position={[0, -0.12, 0]}>
                <boxGeometry args={[mouthWidth, 0.055, 0.035]} />
                <meshStandardMaterial color="#0F172A" roughness={0.25} />
            </mesh>
        </group>
    );
}

export function CubexLimbs({
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

export function CubexDialogue({
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
