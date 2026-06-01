import UserItem from './UserItem';

export interface TopUser {
    id: string;
    name: string;
    avatar: string;
    followers: number;
}

const MOCK_USERS: TopUser[] = [
    { id: '1', name: 'Eleanor Voss', followers: 48200, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150' },
    { id: '2', name: 'Marcus Hale', followers: 41800, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150' },
    { id: '3', name: 'Irina Sorel', followers: 37500, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150' },
    { id: '4', name: 'David Kwon', followers: 29300, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150' },
    { id: '5', name: 'Sylvia Crane', followers: 24700, avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150' },
    { id: '6', name: 'Theo Marchetti', followers: 19100, avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=150' },
    { id: '7', name: 'Nadia Osei', followers: 14600, avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&q=80&w=150' },
    { id: '8', name: 'Luca Ferreira', followers: 11200, avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150' },
];

export default function UserSection() {
    return (
        <section
            id="sec-users"
            className="px-[7vw] py-24"
            style={{ background: '#F7F6F3' }}
        >
            {/* Header */}
            <div className="flex items-end justify-between mb-14 flex-wrap gap-4">
                <div>
                    <p className="text-[11px] font-bold tracking-[.16em] uppercase text-[#F5C518] mb-2.5">
                        Community
                    </p>
                    <h2
                        className="text-[clamp(28px,3.5vw,44px)] font-black text-[#0D0D0D]"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                        Top Collectors
                    </h2>
                </div>
                <a
                    href="#"
                    className="text-[12px] font-bold tracking-[.08em] uppercase text-[#F5C518] border-b border-[#F5C518]/40 pb-1 no-underline transition hover:opacity-70"
                >
                    View all →
                </a>
            </div>

            {/*
                8 users in two rows:
                  xl+  → 8 cols  (1 row of 8)
                  lg   → 4 cols  (2 rows of 4)
                  sm   → 4 cols  (2 rows of 4)
                  xs   → 2 cols  (4 rows of 2)
            */}
            <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-x-6 gap-y-10">
                {MOCK_USERS.map((user, i) => (
                    <UserItem key={user.id} user={user} rank={i + 1} />
                ))}
            </div>

            {/* Divider accent */}
            <div className="mt-16 flex items-center gap-4">
                <div className="flex-1 h-px" style={{ background: 'rgba(0,0,0,0.07)' }} />
                <span
                    className="text-[10px] font-bold tracking-[.16em] uppercase"
                    style={{ color: '#c9a20f' }}
                >
                    Ranked by followers
                </span>
                <div className="flex-1 h-px" style={{ background: 'rgba(0,0,0,0.07)' }} />
            </div>
        </section>
    );
}