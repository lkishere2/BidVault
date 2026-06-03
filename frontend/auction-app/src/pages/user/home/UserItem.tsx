import type { TopUser } from './UserSection';
import { useNavigate } from 'react-router-dom';

interface UserItemProps {
    user: TopUser;
    rank: number;
}

export default function UserItem({ user, rank }: UserItemProps) {
    const navigate = useNavigate();

    return (
        <div onClick={() => navigate(`/profile/${user.id}`)} className="group flex flex-col items-center text-center cursor-pointer">
            {/* Avatar */}
            <div className="relative mb-3 sm:mb-4">
                {/* Ring is done via outline so no invalid CSS prop is needed */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 xl:w-16 xl:h-16 rounded-full overflow-hidden transition-all duration-300 group-hover:[outline:2px_solid_#F5C518] group-hover:[outline-offset:3px]">
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
                    className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[8px] sm:text-[9px] font-black"
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
                className="text-[11px] sm:text-[12px] xl:text-[13px] font-bold text-[#0D0D0D] leading-tight mb-1 transition-colors duration-200 group-hover:text-[#c9a20f]"
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