import type { TopUser } from './UserSection';
import { useNavigate } from 'react-router-dom';

interface UserItemProps {
    user: TopUser;
    rank: number;
    onClick?: () => void;
}

export default function UserItem({ user, rank, onClick }: UserItemProps) {
    const navigate = useNavigate();

    return (
        <div onClick={() => onClick ? onClick() : navigate(`/profile/${user.id}`)} className="group flex flex-col items-center text-center cursor-pointer transition-all duration-500 ease-out group-hover/grid:opacity-40 group-hover/grid:scale-90 hover:!opacity-100 hover:!scale-110 hover:-translate-y-3">
            {/* Avatar */}
            <div className="relative mb-4 sm:mb-5">
                {/* Ring is done via outline so no invalid CSS prop is needed */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 xl:w-28 xl:h-28 rounded-full overflow-hidden transition-all duration-300 group-hover:[outline:2px_solid_#F5C518] group-hover:[outline-offset:3px]">
                    <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src =
                                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80';
                        }}
                        loading="lazy"
                    />
                </div>

                {/* Rank badge — scales with avatar */}
                <span
                    className="absolute bottom-0 right-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-[10px] sm:text-[11px] font-black"
                    style={{
                        background: rank <= 3 ? '#F5C518' : '#0D0D0D',
                        color: rank <= 3 ? '#0D0D0D' : '#fff',
                        border: '2px solid #F7F6F3',
                    }}
                >
                    {rank}
                </span>
            </div>

            {/* Name */}
            <p
                className="text-[13px] sm:text-[14px] xl:text-[15px] font-bold text-[#0D0D0D] leading-tight mb-1.5 transition-colors duration-200 group-hover:text-[#c9a20f]"
                style={{ fontFamily: "'Playfair Display', serif" }}
            >
                {user.name}
            </p>

            {/* Followers */}
            <p className="text-[9px] sm:text-[10px] font-bold tracking-[.08em] uppercase" style={{ color: '#a3a39e' }}>
                {user.followers >= 1000
                    ? `${(user.followers / 1000).toFixed(1)}k`
                    : user.followers}{' '}
                followers
            </p>
        </div>
    );
}