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
                className={`relative transition-all duration-700 ease-in-out ${isActive ? 'w-40 h-40 md:w-56 md:h-56' : 'w-24 h-24 md:w-32 md:h-32'}`}
            >
                <div
                    className={`absolute inset-0 rounded-full transition-all duration-700 ease-in-out ${
                        isActive
                            ? 'shadow-[0_0_0_4px_#F5C518,0_16px_40px_rgba(245,197,24,0.30)] scale-100'
                            : 'shadow-[0_0_0_1.5px_rgba(0,0,0,0.12)] scale-95 group-hover:shadow-[0_0_0_3px_#F5C518,0_8px_20px_rgba(245,197,24,0.20)] group-hover:scale-[1.02]'
                    }`}
                />
                <img
                    src={creator.avatar}
                    alt={creator.name}
                    className={`w-full h-full rounded-full object-cover transition-all duration-700 ease-in-out ${
                        isActive
                            ? 'scale-[1.02]'
                            : 'grayscale-[20%] brightness-95 group-hover:grayscale-0 group-hover:brightness-100 group-hover:scale-[1.02]'
                    }`}
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