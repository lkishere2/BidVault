import { useEffect, useRef } from 'react';
import Globe from './Globe';

export default function Welcome() {
    const titleRef = useRef<HTMLHeadingElement>(null);
    const eyebrowRef = useRef<HTMLParagraphElement>(null);

    useEffect(() => {
        // Trigger fade-in after mount
        const eyebrow = eyebrowRef.current;
        const title = titleRef.current;
        if (!eyebrow || !title) return;

        eyebrow.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
        title.style.transition = 'opacity 1s ease, transform 1s ease';

        requestAnimationFrame(() => {
            setTimeout(() => {
                eyebrow.style.opacity = '1';
                eyebrow.style.transform = 'translateY(0)';
            }, 100);
            setTimeout(() => {
                title.style.opacity = '1';
                title.style.transform = 'translateY(0)';
            }, 350);
        });
    }, []);

    return (
        <section
            style={{
                position: 'relative',
                width: '100%',
                overflow: 'hidden',
                background: '#fff',
                // Height is just the hero area above the auction section
                minHeight: '520px',
            }}
        >
            {/* Centered text block */}
            <div
                style={{
                    position: 'relative',
                    zIndex: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    paddingTop: '72px',
                    textAlign: 'center',
                }}
            >
                <p
                    ref={eyebrowRef}
                    style={{
                        fontSize: '11px',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        color: '#F5C518',
                        marginBottom: '14px',
                        opacity: 0,
                        transform: 'translateY(10px)',
                    }}
                >
                    Live bidding platform
                </p>

                <h1
                    ref={titleRef}
                    style={{
                        fontSize: '36px',
                        fontWeight: 700,
                        color: '#0D0D0D',
                        lineHeight: 1.2,
                        letterSpacing: '-0.03em',
                        maxWidth: '560px',
                        margin: '0 auto',
                        opacity: 0,
                        transform: 'translateY(14px)',
                    }}
                >
                    Welcome to our bidding website where{' '}
                    <span style={{ color: '#F5C518' }}>every bid counts</span>
                </h1>
            </div>

            {/* Globe — pushed down so only the top half is visible */}
            <div
                style={{
                    position: 'absolute',
                    bottom: '-310px',       // hides the bottom half of the 600px canvas
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 1,
                    pointerEvents: 'auto',
                }}
            >
                <Globe />
            </div>
        </section>
    );
}