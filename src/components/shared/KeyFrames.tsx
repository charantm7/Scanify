export default function KeyFrames() {
    return (
        <>
            <div
                className="absolute rounded-full bg-accentlt opacity-50 z-[-1] pointer-events-none"
                style={{ width: 600, height: 600, top: -200, right: -100, filter: 'blur(80px)' }}
            />
            <div
                className="absolute rounded-full bg-accentlt opacity-50 z-[-1] pointer-events-none"
                style={{ width: 300, height: 300, bottom: 0, left: -80, filter: 'blur(80px)' }}
            />

            <style>{`
                @keyframes float {
                0%, 100% { transform: translate(0, 0) rotate(0deg); }
                33% { transform: translate(30px, -30px) rotate(120deg); }
                66% { transform: translate(-20px, 20px) rotate(240deg); }
                }
                @keyframes slideIn {
                from { transform: translateX(100px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
                }
                @keyframes fadeInUp {
                from { transform: translateY(30px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </>
    )
}