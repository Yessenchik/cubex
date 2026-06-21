import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { RubiksCube } from './components/RubiksCube'
import { useCubeStore } from './store/useCubeStore' // Import the store

export default function App() {
    // Grab the mode and the toggle function from our store
    const viewMode = useCubeStore((state) => state.viewMode);
    const toggleViewMode = useCubeStore((state) => state.toggleViewMode);

    return (
        <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>

            {/* HTML Overlay UI */}
            <div style={{ position: 'absolute', top: 20, left: 20, zIndex: 10 }}>
                <button
                    onClick={toggleViewMode}
                    style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
                >
                    Current Mode: {viewMode.toUpperCase()}
                </button>
            </div>

            {/* 3D Canvas */}
            <Canvas camera={{ position: [5, 5, 6], fov: 45 }}>
                <ambientLight intensity={0.7} />
                <directionalLight position={[10, 10, 5]} intensity={1.5} />
                <Environment preset="city" />

                <Suspense fallback={null}>
                    <RubiksCube />
                </Suspense>
            </Canvas>
        </div>
    )
}
