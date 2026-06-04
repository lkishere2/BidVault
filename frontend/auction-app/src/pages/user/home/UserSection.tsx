import { useState, useEffect } from 'react';
import UserItem from './UserItem';
import { userApi } from '../../../api/userApi';
import LoginNotification from './LoginNotification';
import { useNavigate } from 'react-router-dom';

export interface TopUser {
    id: string;
    name: string;
    avatar: string;
    followers: number;
}

export default function UserSection() {
    const [users, setUsers] = useState<TopUser[]>([]);
    const [showLoginNotif, setShowLoginNotif] = useState(false);
    const navigate = useNavigate();

    const handleIntercept = (path: string) => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setShowLoginNotif(true);
        } else {
            navigate(path);
        }
    };

    useEffect(() => {
        userApi.getTopUsers().then(res => {
            const mapped = res.data.map(u => ({
                id: String(u.id),
                name: u.username,
                avatar: u.profileImageUrl
                    ? u.profileImageUrl.startsWith('http')
                        ? u.profileImageUrl
                        : `https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/${u.profileImageUrl}`
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(u.username)}&background=F5C518&color=0D0D0D&size=128&font-weight=bold`,
                followers: u.followersCount || 0
            }));
            setUsers(mapped);
        }).catch(err => console.error(err));
    }, []);
    return (
        <section
            id="sec-users"
            className="px-[7vw] py-16"
            style={{ background: '#F7F6F3' }}
        >
            {/* Header */}
            <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
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
                    onClick={(e) => {
                        e.preventDefault();
                        handleIntercept('/community');
                    }}
                    className="text-[12px] font-bold tracking-[.08em] uppercase text-[#F5C518] border-b border-[#F5C518]/40 pb-1 no-underline transition hover:opacity-70"
                >
                    View all →
                </a>
            </div>

            {/*
                8 users in two rows:
                  sm+  → 4 cols  (2 rows of 4)
                  xs   → 2 cols  (4 rows of 2)
            */}
            <div className="group/grid grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-10">
                {users.map((user, i) => (
                    <UserItem key={user.id} user={user} rank={i + 1} onClick={() => handleIntercept(`/profile/${user.id}`)} />
                ))}
            </div>

            <LoginNotification isOpen={showLoginNotif} onClose={() => setShowLoginNotif(false)} />
        </section>
    );
}