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
            <div
                className="relative transition-all duration-700 ease-in-out"
                style={{
                    width: isActive ? '160px' : '80px',
                    height: isActive ? '160px' : '80px',
                }}
            >
                <div
                    className="absolute inset-0 rounded-full transition-all duration-700 ease-in-out"
                    style={{
                        boxShadow: isActive
                            ? '0 0 0 4px #F5C518, 0 16px 40px rgba(245,197,24,0.30)'
                            : '0 0 0 1.5px rgba(0,0,0,0.12)',
                        transform: isActive ? 'scale(1)' : 'scale(0.95)',
                    }}
                />
                <img
                    src={creator.avatar}
                    alt={creator.name}
                    className="w-full h-full rounded-full object-cover transition-all duration-700 ease-in-out"
                    style={{
                        filter: isActive ? 'none' : 'grayscale(20%) brightness(0.95)',
                        transform: isActive ? 'scale(1.02)' : 'scale(1)',
                    }}
                />
            </div>
            
            <span
                className="text-[13px] font-bold tracking-[.04em] transition-all duration-500 whitespace-nowrap absolute -bottom-7"
                style={{
                    fontFamily: "'Playfair Display', serif",
                    color: isActive ? '#0D0D0D' : '#a3a39e',
                    opacity: isActive ? 0 : 1,
                    pointerEvents: isActive ? 'none' : 'auto',
                }}
            >
                {creator.name.split(' ').pop()}
            </span>
        </button>
    );
}