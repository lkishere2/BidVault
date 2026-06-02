/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../../../api/userApi';
import type { UserResponse } from '../../../types/user';
import UserSearchBar from './UserSearchBar';
import UserItemGrid from './UserItemGrid';

const UserItemSkeleton: React.FC = () => {
    const skeletonStyle: React.CSSProperties = {
        background: '#e5e7eb',
        borderRadius: '4px',
        animation: 'pulse 1.5s infinite ease-in-out'
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: '12px', border: '1px solid #e5e7eb', background: '#ffffff' }}>
            {/* Avatar Circle Skeleton */}
            <div style={{ ...skeletonStyle, width: '56px', height: '56px', borderRadius: '50%' }} />

            {/* Text Lines Skeletons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                <div style={{ ...skeletonStyle, width: '60%', height: '16px' }} />
                <div style={{ ...skeletonStyle, width: '40%', height: '12px' }} />
            </div>
        </div>
    );
};

export const CommunityPage: React.FC = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            try {
                if (searchQuery.trim()) {
                    const res = await userApi.searchUsers(searchQuery, 0, 20);
                    // Solution 2: Defensively check .content first, then fallback to .items
                    const dataContent = (res.data as any).content || (res.data as any).items || [];
                    setUsers(dataContent);
                } else {
                    const res = await userApi.getAllUsers(0, 20);
                    // Solution 2: Defensively check .content first, then fallback to .items
                    const dataContent = (res.data as any).content || (res.data as any).items || [];
                    setUsers(dataContent);
                }
            } catch (error) {
                console.error("Error fetching community users:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, [searchQuery]);

    return (
        <div style={{ padding: '40px max(20px, calc((100% - 1200px) / 2))', background: '#f9fafb', minHeight: '100vh' }}>
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }
            `}</style>
            <h1 style={{ margin: '0 0 8px 0', fontSize: '28px', fontWeight: '700', color: '#1f2937' }}>Community</h1>
            <p style={{ margin: '0 0 32px 0', color: '#4b5563', fontSize: '15px' }}>Discover and connect with other auctioneers.</p>

            <UserSearchBar onSearch={(query) => setSearchQuery(query)} />

            {isLoading ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', width: '100%' }}>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <UserItemSkeleton key={i} />
                    ))}
                </div>
            ) : (
                <UserItemGrid users={users} onUserClick={(id) => navigate(`/profile/${id}`)} />
            )}
        </div>
    );
};

export default CommunityPage;