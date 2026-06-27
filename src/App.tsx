import { useEffect, useRef, useState } from 'react';
import { ControlPanel } from './components/ControlPanel';
import { CubexLoader } from './components/CubexLoader';
import { CubexScene } from './components/CubexScene';

function AppShell() {
    const [sceneReady, setSceneReady] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const loaderStartedAt = useRef(window.performance.now());

    useEffect(() => {
        if (!sceneReady) return;

        const minimumLoaderTime = 1700;
        const elapsed = window.performance.now() - loaderStartedAt.current;
        const remainingTime = Math.max(0, minimumLoaderTime - elapsed);
        const loaderTimer = window.setTimeout(() => {
            setIsLoading(false);
        }, remainingTime);

        return () => window.clearTimeout(loaderTimer);
    }, [sceneReady]);

    return (
        <main className="app">
            <CubexScene onReady={() => setSceneReady(true)} />
            <ControlPanel />
            {isLoading && <CubexLoader />}
        </main>
    );
}

export default function App() {
    return <AppShell />;
}
