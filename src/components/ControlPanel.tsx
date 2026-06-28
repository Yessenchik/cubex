import { useState, type FormEvent } from 'react';
import { appModes, editableFaces, friendActions, moods, playMoves, solvingGuides } from '../data/appData';
import { cubePresets, useCubeStore } from '../store/useCubeStore';

export function ControlPanel() {
    const appMode = useCubeStore((state) => state.appMode);
    const viewMode = useCubeStore((state) => state.viewMode);
    const mood = useCubeStore((state) => state.mood);
    const action = useCubeStore((state) => state.action);
    const message = useCubeStore((state) => state.message);
    const dialogue = useCubeStore((state) => state.dialogue);
    const moveHistory = useCubeStore((state) => state.moveHistory);
    const activeGuide = useCubeStore((state) => state.activeGuide);
    const isMixing = useCubeStore((state) => state.isMixing);
    const palette = useCubeStore((state) => state.palette);
    const setAppMode = useCubeStore((state) => state.setAppMode);
    const toggleViewMode = useCubeStore((state) => state.toggleViewMode);
    const setAction = useCubeStore((state) => state.setAction);
    const startBackflipAction = useCubeStore((state) => state.startBackflipAction);
    const setMood = useCubeStore((state) => state.setMood);
    const speakToCubex = useCubeStore((state) => state.speakToCubex);
    const applyMove = useCubeStore((state) => state.applyMove);
    const scrambleCube = useCubeStore((state) => state.scrambleCube);
    const resetCube = useCubeStore((state) => state.resetCube);
    const setActiveGuide = useCubeStore((state) => state.setActiveGuide);
    const setFaceColor = useCubeStore((state) => state.setFaceColor);
    const applyPreset = useCubeStore((state) => state.applyPreset);
    const [chatText, setChatText] = useState('');
    const selectedGuide = solvingGuides.find((guide) => guide.name === activeGuide) ?? solvingGuides[0];

    const handleChatSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!chatText.trim()) return;

        speakToCubex(chatText);
        setChatText('');
    };

    const handleToyAction = (nextAction: typeof friendActions[number]) => {
        if (nextAction === 'backflip') {
            startBackflipAction();
            return;
        }

        setAction(nextAction);
    };

    return (
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
                {appModes.map((mode) => (
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

                        <p className="hint-line">Drag a visible face to turn it, or tap a move below.</p>

                        <div className="move-grid">
                            {playMoves.map((move) => (
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
                            {solvingGuides.map((guide) => (
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
                            {friendActions.map((nextAction) => (
                                <button
                                    key={nextAction}
                                    className={action === nextAction ? 'selected' : ''}
                                    aria-pressed={action === nextAction}
                                    onClick={() => handleToyAction(nextAction)}
                                >
                                    {nextAction === 'backflip'
                                        ? 'Back Flip'
                                        : nextAction === 'spaceSpin'
                                            ? 'Space Spin'
                                            : nextAction}
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

                    <div className="control-group">
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
                            {editableFaces.map((face) => (
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
                    </div>
                </>
            )}
        </aside>
    );
}
