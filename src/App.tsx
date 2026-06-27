import { Suspense, useState, type FormEvent } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Environment } from '@react-three/drei';
import { RubiksCube } from './components/RubiksCube';
import {
    cubePresets,
    type AppMode,
    type CubexAction,
    type CubeMove,
    type CubexMood,
    type FaceName,
    type GuideName,
    useCubeStore
} from './store/useCubeStore';

const modes: AppMode[] = ['friend', 'customize', 'play'];
const friendActions: CubexAction[] = ['wave', 'jump', 'spin', 'thinking', 'talking', 'idle'];
const moods: CubexMood[] = ['curious', 'happy', 'excited', 'sleepy'];
const faces: FaceName[] = ['top', 'front', 'right', 'left', 'back', 'bottom'];
const moves: CubeMove[] = ['U', "U'", 'D', "D'", 'R', "R'", 'L', "L'", 'F', "F'", 'B', "B'"];

const guides = [
    {
        name: 'CFOP / Fridrich',
        detail: 'Cross, F2L, OLL, PLL. The main speedcubing path.',
        steps: ['Build cross', 'Pair F2L slots', 'Orient last layer', 'Permute last layer'],
        sample: "R U R' U'"
    },
    {
        name: 'ZBLL',
        detail: 'Last-layer cases after edge orientation. Powerful, advanced, huge set.',
        steps: ['Confirm edges are oriented', 'Recognize corner permutation', 'Apply matching ZBLL case'],
        sample: "R U R' U R U2 R'"
    },
    {
        name: 'OLL',
        detail: 'Orient the last layer first, then finish with PLL.',
        steps: ['Make yellow cross', 'Orient corners', 'Keep last-layer pieces in place for PLL'],
        sample: "F R U R' U' F'"
    },
    {
        name: 'PLL',
        detail: 'Permute last-layer pieces after all yellow stickers face up.',
        steps: ['Recognize permutation', 'Align solved block', 'Execute PLL and adjust U face'],
        sample: "R U' R U R U R U' R' U' R2"
    },
] satisfies Array<{ name: GuideName; detail: string; steps: string[]; sample: string }>;

function AppShell() {
    const appMode = useCubeStore((state) => state.appMode);
    const viewMode = useCubeStore((state) => state.viewMode);
    const mood = useCubeStore((state) => state.mood);
    const message = useCubeStore((state) => state.message);
    const dialogue = useCubeStore((state) => state.dialogue);
    const moveHistory = useCubeStore((state) => state.moveHistory);
    const activeGuide = useCubeStore((state) => state.activeGuide);
    const isMixing = useCubeStore((state) => state.isMixing);
    const palette = useCubeStore((state) => state.palette);
    const setAppMode = useCubeStore((state) => state.setAppMode);
    const toggleViewMode = useCubeStore((state) => state.toggleViewMode);
    const setAction = useCubeStore((state) => state.setAction);
    const setMood = useCubeStore((state) => state.setMood);
    const speakToCubex = useCubeStore((state) => state.speakToCubex);
    const applyMove = useCubeStore((state) => state.applyMove);
    const scrambleCube = useCubeStore((state) => state.scrambleCube);
    const resetCube = useCubeStore((state) => state.resetCube);
    const setActiveGuide = useCubeStore((state) => state.setActiveGuide);
    const setFaceColor = useCubeStore((state) => state.setFaceColor);
    const applyPreset = useCubeStore((state) => state.applyPreset);
    const [chatText, setChatText] = useState('');
    const selectedGuide = guides.find((guide) => guide.name === activeGuide) ?? guides[0];

    const handleChatSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!chatText.trim()) return;

        speakToCubex(chatText);
        setChatText('');
    };

    return (
        <main className="app">
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
                    </Suspense>
                </Canvas>
            </section>

            <aside className="panel" aria-label="Cubex controls">
                <div className="brand">
                    <span className="brand-mark">CX</span>
                    <div>
                        <h1>Cubex</h1>
                        <p>{appMode === 'play' ? 'cube trainer' : 'your cube friend'}</p>
                    </div>
                </div>

                <div className="speech">
                    <span className={`mood-dot mood-${mood}`} />
                    <p>{message}</p>
                </div>

                <div className="segmented" aria-label="Cubex mode">
                    {modes.map((mode) => (
                        <button
                            key={mode}
                            className={appMode === mode ? 'active' : ''}
                            onClick={() => setAppMode(mode)}
                        >
                            {mode}
                        </button>
                    ))}
                </div>

                {appMode === 'play' && (
                    <>
                        <div className="trainer-card">
                            <div className="group-title">
                                <span>Trainer</span>
                                <button className="ghost-button" onClick={toggleViewMode}>
                                    {viewMode}
                                </button>
                            </div>

                            <div className="primary-actions">
                                <button onClick={scrambleCube} disabled={isMixing}>
                                    {isMixing ? 'Mixing...' : 'Mix cube'}
                                </button>
                                <button onClick={resetCube}>Solved state</button>
                            </div>

                            <p className="hint-line">Drag a cube layer with the mouse, or tap a move below.</p>

                            <div className="move-grid">
                                {moves.map((move) => (
                                    <button key={move} onClick={() => applyMove(move)}>
                                        {move}
                                    </button>
                                ))}
                            </div>

                            <div className="history-block">
                                <span>History</span>
                                <p>{moveHistory.length ? moveHistory.join(' ') : 'No moves yet'}</p>
                            </div>
                        </div>

                        <div className="trainer-card">
                            <div className="group-title">
                                <span>Solving Guide</span>
                            </div>
                            <div className="guide-tabs">
                                {guides.map((guide) => (
                                    <button
                                        key={guide.name}
                                        className={activeGuide === guide.name ? 'active' : ''}
                                        onClick={() => setActiveGuide(guide.name)}
                                    >
                                        {guide.name.replace(' / Fridrich', '')}
                                    </button>
                                ))}
                            </div>
                            <article className="guide-card guide-card-active">
                                <h2>{selectedGuide.name}</h2>
                                <p>{selectedGuide.detail}</p>
                                <ol>
                                    {selectedGuide.steps.map((step) => (
                                        <li key={step}>{step}</li>
                                    ))}
                                </ol>
                                <code>{selectedGuide.sample}</code>
                            </article>
                        </div>
                    </>
                )}

                {appMode !== 'play' && (
                    <>
                        <div className="control-group">
                            <div className="group-title">
                                <span>Friend Chat</span>
                                <span className="state-pill">fixed pose</span>
                            </div>
                            <form className="chat-form" onSubmit={handleChatSubmit}>
                                <input
                                    value={chatText}
                                    onChange={(event) => setChatText(event.target.value)}
                                    placeholder="Talk to Cubex..."
                                />
                                <button type="submit">Send</button>
                            </form>
                            <p className="dialogue-line">{dialogue}</p>
                        </div>

                        <div className="control-group">
                            <div className="group-title">
                                <span>Toy Actions</span>
                            </div>
                            <div className="button-grid">
                                {friendActions.map((action) => (
                                    <button key={action} onClick={() => setAction(action)}>
                                        {action}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="control-group">
                            <div className="group-title">
                                <span>Mood</span>
                            </div>
                            <div className="button-grid">
                                {moods.map((nextMood) => (
                                    <button
                                        key={nextMood}
                                        className={mood === nextMood ? 'selected' : ''}
                                        onClick={() => setMood(nextMood)}
                                    >
                                        {nextMood}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {appMode !== 'play' && <div className="control-group">
                    <div className="group-title">
                        <span>Style</span>
                    </div>
                    <div className="preset-row">
                        {Object.keys(cubePresets).map((preset) => (
                            <button key={preset} onClick={() => applyPreset(preset as keyof typeof cubePresets)}>
                                {preset}
                            </button>
                        ))}
                    </div>
                    <div className="swatch-list">
                        {faces.map((face) => (
                            <label key={face} className="swatch-control">
                                <span>{face}</span>
                                <input
                                    type="color"
                                    value={palette[face]}
                                    onChange={(event) => setFaceColor(face, event.target.value)}
                                />
                            </label>
                        ))}
                    </div>
                </div>}
            </aside>
        </main>
    );
}

export default function App() {
    return <AppShell />;
}
