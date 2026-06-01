import { useEffect, useRef, useState } from 'react';

interface StatItem {
    target: number;
    suffix: string;
    label: string;
    prefix?: string;
}

const STATS: StatItem[] = [
    { target: 1000, suffix: '+', label: 'Auctions Listed', prefix: '' },
    { target: 100, suffix: '+', label: 'Registered Users', prefix: '' },
    { target: 10000, suffix: '+', label: 'Bids Placed', prefix: '' },
];

function useCountUp(target: number, duration: number, started: boolean) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!started) return;
        let startTime: number | null = null;
        let raf: number;

        const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            // ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) raf = requestAnimationFrame(step);
        };

        raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
    }, [started, target, duration]);

    return count;
}

function StatBox({ stat, started }: { stat: StatItem; started: boolean }) {
    const count = useCountUp(stat.target, 1800, started);

    return (
        <div
            className="flex-1 flex flex-col items-center justify-center py-10 px-6 text-center"
            style={{ minWidth: 0 }}
        >
            <span
                className="font-black leading-none tabular-nums"
                style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 'clamp(40px, 5vw, 64px)',
                    color: '#0D0D0D',
                    letterSpacing: '-0.03em',
                }}
            >
                {count.toLocaleString()}
                <span style={{ color: '#F5C518' }}>{stat.suffix}</span>
            </span>
            <span
                className="mt-3 text-[11px] font-bold tracking-[.14em] uppercase"
                style={{ color: '#a3a39e' }}
            >
                {stat.label}
            </span>
        </div>
    );
}

export default function InfoBox() {
    const ref = useRef<HTMLDivElement>(null);
    const [started, setStarted] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setStarted(true); observer.disconnect(); } },
            { threshold: 0.3 }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    return (
        <div
            ref={ref}
            className="mx-[7vw] rounded-2xl overflow-hidden flex flex-col sm:flex-row"
            style={{
                background: '#fff',
                border: '1px solid rgba(0,0,0,0.08)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            }}
        >
            {STATS.map((stat, i) => (
                <div key={stat.label} className="flex-1 flex items-stretch" style={{ minWidth: 0 }}>
                    <StatBox stat={stat} started={started} />
                    {i < STATS.length - 1 && (
                        <div
                            className="hidden sm:block self-stretch"
                            style={{ width: '1px', background: 'rgba(0,0,0,0.07)', margin: '24px 0' }}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}