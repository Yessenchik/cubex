import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';

export function SceneReadySignal({ onReady }: { onReady: () => void }) {
    const frameCountRef = useRef(0);
    const hasReportedReady = useRef(false);

    useFrame(() => {
        if (hasReportedReady.current) return;

        frameCountRef.current += 1;

        if (frameCountRef.current >= 3) {
            hasReportedReady.current = true;
            window.requestAnimationFrame(onReady);
        }
    });

    return null;
}
