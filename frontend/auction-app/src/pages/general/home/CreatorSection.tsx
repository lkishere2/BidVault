import { useState, useEffect, useRef } from 'react';
import CreatorItem from './CreatorItem';

export interface Creator {
    id: string;
    name: string;
    avatar: string;
    role: string;
    specialty: string;
    auctions: number;
    totalSold: number;
    since: number;
    bio: string;
    badge: string;
}

const CREATORS: Creator[] = [
    {
        id: '1',
        name: 'Eleanor Voss',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
        role: 'Fine Watches Curator',
        specialty: 'Patek Philippe · A. Lange · Independent',
        auctions: 142,
        totalSold: 4800000,
        since: 2019,
        bio: 'Eleanor spent a decade at Christie\'s watches department before joining as our lead horological curator. Her eye for undervalued references has returned collectors an average of 34% above estimate.',
        badge: '👑',
    },
    {
        id: '2',
        name: 'Marcus Hale',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
        role: 'Collector Cars Specialist',
        specialty: 'Ferrari · Porsche · Pre-War Classics',
        auctions: 89,
        totalSold: 12300000,
        since: 2020,
        bio: 'Marcus has authenticated and sold some of the rarest metal on four wheels. A former Le Mans correspondent, he knows racing provenance better than anyone on the platform.',
        badge: '🏎',
    },
    {
        id: '3',
        name: 'Irina Sorel',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=300',
        role: 'Fine Art & Jewels Director',
        specialty: 'Post-War · Contemporary · High Jewellery',
        auctions: 210,
        totalSold: 9100000,
        since: 2018,
        bio: 'Irina\'s background at Sotheby\'s Paris brought an uncompromising standard for provenance and attribution. She personally verifies every lot under her category before it goes live.',
        badge: '💎',
    },
    {
        id: '4',
        name: 'David Kwon',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
        role: 'Wine & Spirits Head',
        specialty: 'Bordeaux First-Growths · Single Malt · Rare Spirits',
        auctions: 67,
        totalSold: 2600000,
        since: 2021,
        bio: 'A Master of Wine candidate with a cellar spanning four decades of Pétrus, David brings rigorous condition assessment and storage history to every bottle that passes through his hands.',
        badge: '🍷',
    },
];

// Animate number count-up
function useCountUp(target: number, active: boolean) {
    const [val, setVal] = useState(0);
    const raf = useRef<number>(0);
    useEffect(() => {
        cancelAnimationFrame(raf.current);
        if (!active) {
            // Defer reset into RAF to avoid calling setState synchronously in effect body
            raf.current = requestAnimationFrame(() => setVal(0));
            return () => cancelAnimationFrame(raf.current);
        }
        let start: number | null = null;
        const duration = 700;
        const step = (ts: number) => {
            if (!start) start = ts;
            const p = Math.min((ts - start) / duration, 1);
            const e = 1 - Math.pow(1 - p, 3);
            setVal(Math.floor(e * target));
            if (p < 1) raf.current = requestAnimationFrame(step);
        };
        raf.current = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf.current);
    }, [target, active]);
    return val;
}

function InfoPanel({ creator, visible }: { creator: Creator; visible: boolean }) {
    const auctions = useCountUp(creator.auctions, visible);
    const sold = useCountUp(creator.totalSold, visible);

    return (
        <div
            className="flex-1 min-w-0 transition-all duration-500"
            style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateX(0)' : 'translateX(16px)',
            }}
        >
            {/* Badge + role */}
            <div className="flex items-center gap-3 mb-5">
                <span className="text-[28px] leading-none">{creator.badge}</span>
                <div>
                    <p className="text-[10px] font-extrabold tracking-[.14em] uppercase mb-0.5" style={{ color: '#F5C518' }}>
                        {creator.role}
                    </p>
                    <p className="text-[11px] font-medium" style={{ color: '#a3a39e' }}>
                        {creator.specialty}
                    </p>
                </div>
            </div>

            {/* Name */}
            <h3
                className="text-[clamp(26px,3vw,40px)] font-black text-[#0D0D0D] leading-[1.05] mb-4"
                style={{ fontFamily: "'Playfair Display', serif" }}
            >
                {creator.name}
            </h3>

            {/* Bio */}
            <p className="text-[14px] leading-[1.8] mb-7 max-w-[460px]" style={{ color: '#6b6b63' }}>
                {creator.bio}
            </p>

            {/* Stats row */}
            <div className="flex gap-8 mb-8">
                <div>
                    <p
                        className="text-[clamp(22px,2.5vw,32px)] font-black tabular-nums leading-none mb-1"
                        style={{ fontFamily: "'Playfair Display', serif", color: '#0D0D0D' }}
                    >
                        {auctions}<span style={{ color: '#F5C518' }}>+</span>
                    </p>
                    <p className="text-[10px] font-bold tracking-[.12em] uppercase" style={{ color: '#a3a39e' }}>
                        Auctions run
                    </p>
                </div>
                <div
                    className="self-stretch"
                    style={{ width: '1px', background: 'rgba(0,0,0,0.08)' }}
                />
                <div>
                    <p
                        className="text-[clamp(22px,2.5vw,32px)] font-black tabular-nums leading-none mb-1"
                        style={{ fontFamily: "'Playfair Display', serif", color: '#0D0D0D' }}
                    >
                        ${(sold / 1000000).toFixed(1)}<span style={{ color: '#F5C518' }}>M</span>
                    </p>
                    <p className="text-[10px] font-bold tracking-[.12em] uppercase" style={{ color: '#a3a39e' }}>
                        Total sold
                    </p>
                </div>
                <div
                    className="self-stretch"
                    style={{ width: '1px', background: 'rgba(0,0,0,0.08)' }}
                />
                <div>
                    <p
                        className="text-[clamp(22px,2.5vw,32px)] font-black tabular-nums leading-none mb-1"
                        style={{ fontFamily: "'Playfair Display', serif", color: '#0D0D0D' }}
                    >
                        {creator.since}<span style={{ color: '#F5C518' }}></span>
                    </p>
                    <p className="text-[10px] font-bold tracking-[.12em] uppercase" style={{ color: '#a3a39e' }}>
                        Member since
                    </p>
                </div>
            </div>

            <a
                href="#"
                className="inline-flex items-center gap-2 text-[12px] font-extrabold tracking-[.08em] uppercase text-[#0D0D0D] border-b-2 border-[#F5C518] pb-0.5 no-underline transition hover:text-[#F5C518]"
            >
                View all lots →
            </a>
        </div>
    );
}

export default function CreatorSection() {
    const [active, setActive] = useState(0);
    const [visible, setVisible] = useState(true);

    const select = (i: number) => {
        if (i === active) return;
        setVisible(false);
        setTimeout(() => {
            setActive(i);
            setVisible(true);
        }, 220);
    };

    return (
        <section
            id="sec-creators"
            className="px-[7vw] py-20"
            style={{ background: '#ffffff' }}
        >
            {/* Header */}
            <p className="text-[11px] font-bold tracking-[.16em] uppercase text-[#F5C518] mb-3">
                Expert curators
            </p>
            <h2
                className="text-[clamp(26px,3.2vw,42px)] font-black text-[#0D0D0D] mb-12"
                style={{ fontFamily: "'Playfair Display', serif" }}
            >
                The people behind the lots
            </h2>

            {/* Layout: circles left | info right */}
            <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-start">

                {/* Left — circle stack */}
                <div className="flex lg:flex-col gap-6 lg:gap-8 items-center lg:items-start flex-shrink-0 lg:pt-2">
                    {CREATORS.map((c, i) => (
                        <CreatorItem
                            key={c.id}
                            creator={c}
                            isActive={i === active}
                            onClick={() => select(i)}
                        />
                    ))}
                </div>

                {/* Right — info panel */}
                <div
                    className="flex-1 rounded-2xl px-10 py-10 min-h-[280px]"
                    style={{
                        background: '#fff',
                        border: '1px solid rgba(0,0,0,0.07)',
                        boxShadow: '0 2px 20px rgba(0,0,0,0.05)',
                    }}
                >
                    <InfoPanel creator={CREATORS[active]} visible={visible} />
                </div>
            </div>
        </section>
    );
}