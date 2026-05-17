// src/pages/home/CardDesk.tsx
import { useState } from 'react';
import AuctionCard from './AuctionCard';
import type { AuctionItem } from './AuctionCard'; // Fixes the verbatimModuleSyntax error

interface CardDeckProps {
    items: AuctionItem[];
}

export default function CardDesk({ items }: CardDeckProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    };

    if (!items.length) return null;

    const totalItems = items.length;

    return (
        <div className="relative w-full max-w-6xl mx-auto h-[600px] flex items-center justify-between px-8 select-none">

            {/* UNIFIED 3D STAGE VIEWPORT CONTAINER */}
            <div
                className="absolute inset-0 w-full h-full"
                style={{
                    perspective: '1800px',
                    transformStyle: 'preserve-3d'
                }}
            >
                {items.map((item, index) => {
                    // Compute circular relative distance from current focus index
                    const relativeOffset = (index - currentIndex + totalItems) % totalItems;
                    const isCurrent = relativeOffset === 0;

                    // Declared with explicit types but no dead initial values.
                    // This satisfies both TypeScript and the ESLint no-useless-assignment rule.
                    let tx: number;
                    let ty: number;
                    let tz: number;
                    let rx: number;
                    let ry: number;
                    let scale: number;
                    let opacity: number;

                    if (isCurrent) {
                        // Spotlight position: Placed on the right side of the screen
                        tx = 260;
                        ty = 0;
                        tz = 50;
                        rx = 0;
                        ry = -5;
                        scale = 1.15;
                        opacity = 1;
                    } else {
                        // Standby Deck items (Ring formation on the left side)
                        const logicalIndex = relativeOffset - 1;
                        const totalStandby = totalItems - 1;

                        // Ring Angle Parameters mapping the "C" shape profile
                        const startAngle = -0.5;
                        const endAngle = 1.2;
                        const angle = startAngle + (logicalIndex / (totalStandby - 1 || 1)) * (endAngle - startAngle);

                        const radiusX = 140;
                        const radiusY = 170;

                        // Left Side anchor center point offset: -240px
                        tx = -240 - Math.cos(angle) * radiusX;
                        ty = -Math.sin(angle) * radiusY;

                        // Recede deeply down the Z-axis vector
                        tz = -logicalIndex * 110 - 50;

                        // Radial ring alignment angles
                        ry = angle * -28;
                        rx = logicalIndex * 8;
                        scale = 0.9;

                        // Fades away smoothly to dark space at the absolute back of the track
                        opacity = Math.max(0.04, 1 - (logicalIndex / totalStandby) * 0.9);
                    }

                    return (
                        <div
                            key={item.id}
                            className="absolute left-1/2 top-1/2 -ml-[140px] -mt-[200px]"
                            style={{
                                transform: `translate3d(${tx}px, ${ty}px, ${tz}px) rotateY(${ry}deg) rotateX(${rx}deg) scale(${scale})`,
                                opacity: opacity,
                                zIndex: isCurrent ? 50 : 30 - relativeOffset,
                                transformOrigin: 'center center',
                                backfaceVisibility: 'hidden',
                                transition: 'transform 0.85s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.85s ease-in-out, z-index 0.85s step-end',
                            }}
                        >
                            <div className={`rounded-xl transition-shadow duration-500 ${isCurrent ? 'shadow-2xl' : 'shadow-md'}`}>
                                <AuctionCard item={item} isCurrent={isCurrent} />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* NAV HANDLE POSITION X2: Previous Button */}
            <div className="z-50 relative ml-[34%]">
                <button
                    onClick={handlePrev}
                    className="w-12 h-12 rounded-full border border-neutral-200 bg-white hover:bg-[#0D0D0D] text-[#0D0D0D] hover:text-[#F5C518] transition-all flex items-center justify-center shadow-xl active:scale-90"
                    aria-label="Previous auction item"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>
            </div>

            {/* NAV HANDLE POSITION X1: Next Button */}
            <div className="z-50 relative pr-4">
                <button
                    onClick={handleNext}
                    className="w-12 h-12 rounded-full border border-neutral-200 bg-white hover:bg-[#0D0D0D] text-[#0D0D0D] hover:text-[#F5C518] transition-all flex items-center justify-center shadow-xl active:scale-90"
                    aria-label="Next auction item"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                </button>
            </div>

        </div>
    );
}