import type { Creator } from './CreatorSection';

interface CreatorItemProps {
    creator: Creator;
    isActive: boolean;
    onClick: () => void;
}

export default function CreatorItem({ creator, isActive, onClick }: CreatorItemProps) {
    return (
        <button
            onClick={onClick}
            aria-label={`Select ${creator.name}`}
            className="relative flex flex-col items-center gap-3 focus:outline-none group"
        >
            {/* Circle with morphing border + scale */}
            <div
                className="relative transition-all duration-500"
                style={{
                    width: isActive ? '88px' : '72px',
                    height: isActive ? '88px' : '72px',
                }}
            >
                {/* Gold ring that morphs — border-radius squircle effect via box-shadow */}
                <div
                    className="absolute inset-0 rounded-full transition-all duration-500"
                    style={{
                        boxShadow: isActive
                            ? '0 0 0 3px #F5C518, 0 8px 28px rgba(245,197,24,0.30)'
                            : '0 0 0 1.5px rgba(0,0,0,0.12)',
                        transform: isActive ? 'scale(1)' : 'scale(0.95)',
                    }}
                />
                <img
                    src={creator.avatar}
                    alt={creator.name}
                    className="w-full h-full rounded-full object-cover transition-all duration-500"
                    style={{
                        filter: isActive ? 'none' : 'grayscale(40%) brightness(0.92)',
                        transform: isActive ? 'scale(1.04)' : 'scale(1)',
                    }}
                    onError={(e) => {
                        (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80';
                    }}
                />

                {/* Active dot indicator */}
                <span
                    className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full transition-all duration-400"
                    style={{
                        background: '#F5C518',
                        opacity: isActive ? 1 : 0,
                        transform: isActive ? 'translateX(-50%) scale(1)' : 'translateX(-50%) scale(0)',
                    }}
                />
            </div>

            {/* Name */}
            <span
                className="text-[11px] font-bold tracking-[.04em] transition-all duration-300 whitespace-nowrap"
                style={{
                    fontFamily: "'Playfair Display', serif",
                    color: isActive ? '#0D0D0D' : '#a3a39e',
                }}
            >
                {creator.name.split(' ')[0]}
            </span>
        </button>
    );
}