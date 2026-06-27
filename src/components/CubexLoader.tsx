const stickers = ['top', 'front', 'right', 'left', 'bottom', 'back', 'front', 'right', 'top'];

export function CubexLoader() {
    return (
        <div className="loader-screen" role="status" aria-live="polite" aria-label="Loading Cubex">
            <div className="loader-card">
                <div className="loader-mini-cube" aria-hidden="true">
                    {stickers.map((sticker, index) => (
                        <span key={`${sticker}-${index}`} className={`loader-sticker loader-sticker-${sticker}`} />
                    ))}
                </div>
                <div className="loader-copy">
                    <strong>Cubex</strong>
                    <span>mixing tiny stickers...</span>
                </div>
            </div>
        </div>
    );
}
