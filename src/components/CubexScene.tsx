import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Environment } from '@react-three/drei';
import { RubiksCube } from './RubiksCube';
import { SceneReadySignal } from './SceneReadySignal';

interface CubexSceneProps {
    onReady: () => void;
}

export function CubexScene({ onReady }: CubexSceneProps) {
    return (
        <section className="scene" aria-label="Cubex 3D scene">
            <Canvas camera={{ position: [5.2, 4.4, 7.2], fov: 42 }}>
                <color attach="background" args={['#F5F7FB']} />
                <ambientLight intensity={0.72} />
                <directionalLight position={[6, 8, 6]} intensity={1.9} />
                <directionalLight position={[-5, 3, -4]} intensity={0.55} />
                <Environment preset="city" />
                <Suspense fallback={null}>
                    <RubiksCube />
                    <ContactShadows position={[0, -2.35, 0]} opacity={0.26} scale={7} blur={2.4} />
                    <SceneReadySignal onReady={onReady} />
                </Suspense>
            </Canvas>
        </section>
    );
}
