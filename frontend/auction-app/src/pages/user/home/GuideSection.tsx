import { useState, useRef } from 'react';

const STEPS = [
    {
        title: 'How to create an auction',
        desc: 'List your items by setting up a starting price, adding high-quality images, and defining the auction duration to attract bidders.',
    },
    {
        title: 'How to bid',
        desc: 'Browse active auctions and place your bids in real time. Set your maximum bid to let the system automatically bid for you.',
    },
    {
        title: 'How to follow other users to see more auctions',
        desc: 'Follow your favorite creators and curators to get notified whenever they launch new and exciting auctions.',
    },
];

type Direction = 'left' | 'right' | null;

export default function GuideSection() {
    const [cur, setCur] = useState(0);
    const [exiting, setExiting] = useState<Direction>(null);
    const [entering, setEntering] = useState<Direction>(null);
    const animating = useRef(false);

    const go = (next: number, dir: Direction) => {
        if (animating.current || next === cur) return;
        animating.current = true;
        setExiting(dir);
        setTimeout(() => {
            setCur(next);
            setExiting(null);
            setEntering(dir === 'left' ? 'right' : 'left');
            requestAnimationFrame(() => requestAnimationFrame(() => {
                setEntering(null);
                animating.current = false;
            }));
        }, 280);
    };

    const move = (dir: number) => {
        const next = cur + dir;
        if (next < 0 || next >= STEPS.length) return;
        go(next, dir > 0 ? 'left' : 'right');
    };

    const s = STEPS[cur];

    let cardClass = 'transition-all duration-280 ';
    if (exiting === 'left') cardClass += 'opacity-0 -translate-x-8';
    else if (exiting === 'right') cardClass += 'opacity-0 translate-x-8';
    else if (entering === 'right') cardClass += 'opacity-0 translate-x-8';
    else if (entering === 'left') cardClass += 'opacity-0 -translate-x-8';
    else cardClass += 'opacity-100 translate-x-0';

    return (
        <section
            id="sec-guide"
            className="flex flex-col justify-center px-[7vw] py-16"
            style={{ background: '#F7F6F3' }}
        >
            <p className="text-[11px] font-bold tracking-[.16em] uppercase text-[#F5C518] mb-3">
                How it works
            </p>
            <h2
                className="text-[clamp(26px,3.2vw,42px)] font-black text-[#0D0D0D] mb-10"
                style={{ fontFamily: "'Playfair Display', serif" }}
            >
                Your guide to BidVault
            </h2>

            {/* Stage */}
            <div className="flex items-center gap-5">
                <button
                    onClick={() => move(-1)}
                    disabled={cur === 0}
                    aria-label="Previous step"
                    className="flex-shrink-0 w-11 h-11 rounded-full border border-neutral-300 text-[#0D0D0D] text-base flex items-center justify-center transition hover:border-[#F5C518] hover:text-[#F5C518] disabled:opacity-20 disabled:cursor-default bg-white shadow-sm"
                >
                    ←
                </button>

                <div className="flex-1 overflow-hidden">
                    <div
                        className={`rounded-xl px-8 py-8 flex flex-row gap-10 items-center ${cardClass}`}
                        style={{
                            background: '#fff',
                            border: '1px solid rgba(0,0,0,0.07)',
                            boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
                        }}
                    >
                        {/* Left: number stacked */}
                        <div className="flex flex-col items-start gap-3 flex-shrink-0">
                            <span
                                className="leading-none font-black text-[56px]"
                                style={{ fontFamily: "'Playfair Display', serif", color: 'rgba(245,197,24,.2)' }}
                            >
                                0{cur + 1}
                            </span>
                        </div>

                        {/* Right: text */}
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-extrabold tracking-[.14em] uppercase mb-2" style={{ color: 'rgba(245,197,24,.9)' }}>
                                Step {cur + 1} of {STEPS.length}
                            </p>
                            <h3
                                className="text-[clamp(22px,2.4vw,34px)] font-black text-[#0D0D0D] mb-3 leading-[1.1]"
                                style={{ fontFamily: "'Playfair Display', serif" }}
                            >
                                {s.title}
                            </h3>
                            <p className="text-[14px] leading-[1.75] max-w-[520px]" style={{ color: '#6b6b63' }}>
                                {s.desc}
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => move(1)}
                    disabled={cur === STEPS.length - 1}
                    aria-label="Next step"
                    className="flex-shrink-0 w-11 h-11 rounded-full border border-neutral-300 text-[#0D0D0D] text-base flex items-center justify-center transition hover:border-[#F5C518] hover:text-[#F5C518] disabled:opacity-20 disabled:cursor-default bg-white shadow-sm"
                >
                    →
                </button>
            </div>

            {/* Footer: dots + counter */}
            <div className="flex items-center justify-between mt-7">
                <div className="flex items-center gap-2">
                    {STEPS.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => go(i, i > cur ? 'left' : 'right')}
                            aria-label={`Go to step ${i + 1}`}
                            style={{
                                height: '7px',
                                width: i === cur ? '24px' : '7px',
                                borderRadius: '100px',
                                background: i === cur ? '#F5C518' : 'rgba(0,0,0,0.15)',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'width .35s cubic-bezier(.34,1.56,.64,1), background .3s',
                                padding: 0,
                            }}
                        />
                    ))}
                </div>
                <span className="text-[11px] font-bold tracking-[.06em] text-neutral-400">
                    <span className="text-[#0D0D0D]">{cur + 1}</span> / {STEPS.length}
                </span>
            </div>
        </section>
    );
}