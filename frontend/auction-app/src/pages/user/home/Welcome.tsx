import { useEffect, useRef } from 'react';
import InfoBox from './InfoBox';

export default function Welcome() {
    const eyebrowRef = useRef<HTMLParagraphElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const subRef = useRef<HTMLParagraphElement>(null);
    const ctaRef = useRef<HTMLDivElement>(null);
    const infoRef = useRef<HTMLDivElement>(null);
    const hintRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const animate = (el: HTMLElement | null, delay: number) => {
            if (!el) return;
            el.style.transition = 'opacity .8s ease, transform .8s ease';
            setTimeout(() => {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, delay);
        };

        animate(eyebrowRef.current, 200);
        animate(titleRef.current, 450);
        animate(subRef.current, 750);
        animate(ctaRef.current, 950);
        animate(infoRef.current, 1150);
        animate(hintRef.current, 1600);
    }, []);

    const scrollTo = (id: string) =>
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

    const hidden: React.CSSProperties = { opacity: 0, transform: 'translateY(20px)' };

    return (
        <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-white pb-24">

            <div className="px-[7vw]">
                <p
                    ref={eyebrowRef}
                    className="text-[11px] font-bold tracking-[.16em] uppercase text-[#F5C518] mt-[24px] mb-[24px]"
                    style={hidden}
                >
                    Premium bidding experience
                </p>

                <h1
                    ref={titleRef}
                    className="text-[clamp(48px,7vw,88px)] font-black leading-[1] tracking-[-0.03em] text-[#0D0D0D]"
                    style={{ ...hidden, fontFamily: "'Playfair Display', serif" }}
                >
                    Discover a world where<br />
                    <span className="text-[#F5C518]">every bid leads</span><br />
                    to excellence.
                </h1>

                <p
                    ref={subRef}
                    className="mt-7 text-base text-neutral-500 max-w-[480px] leading-[1.7]"
                    style={hidden}
                >
                    The world's most coveted items — fine watches, rare cars, luxury goods — live and ready for your next bid.
                </p>

                <div ref={ctaRef} className="mt-11 flex gap-4" style={hidden}>
                    <button
                        onClick={() => scrollTo('sec-preview')}
                        className="px-[34px] py-[14px] bg-[#0D0D0D] text-white text-[13px] font-extrabold tracking-[.07em] uppercase rounded-md transition hover:bg-[#F5C518] hover:text-[#0D0D0D] hover:-translate-y-px"
                    >
                        Browse auctions
                    </button>
                    <button
                        onClick={() => scrollTo('sec-guide')}
                        className="px-[34px] py-[14px] bg-transparent text-[#0D0D0D] text-[13px] font-bold tracking-[.07em] uppercase rounded-md border border-neutral-300 transition hover:border-[#F5C518] hover:text-[#F5C518]"
                    >
                        How it works
                    </button>
                </div>
            </div>

            {/* InfoBox sits below the buttons, full bleed within section padding */}
            <div ref={infoRef} className="mt-16" style={hidden}>
                <InfoBox />
            </div>

            <div
                ref={hintRef}
                className="absolute bottom-9 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                style={hidden}
            >
            </div>
        </section>
    );
}