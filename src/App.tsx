import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, PresentationControls } from '@react-three/drei'

export default function App() {
  return (
      <Canvas camera={{ position: [4, 4, 5], fov: 45 }}>
        {/* Базовое освещение */}
        <ambientLight intensity={0.7} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <Environment preset="city" />

        {/* Обертка для вращения модели мышью/свайпами */}
        <PresentationControls
            global
            cursor
            snap={false}
            speed={1.5}
            rotation={[0, 0, 0]}
        >
          <Suspense fallback={null}>
            {/* Здесь позже появится компонент <CubeModel /> */}
            <mesh>
              {/* Временный кубик-заглушка, чтобы убедиться, что 3D работает */}
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="hotpink" />
            </mesh>
          </Suspense>
        </PresentationControls>
      </Canvas>
  )
}
