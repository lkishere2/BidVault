/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userApi } from '../../../api/userApi';
import type { UserResponse } from '../../../types/user';
import { LayoutGrid, List } from 'lucide-react';
import UserSearchBar from './UserSearchBar';
import UserItemGrid from './UserItemGrid';

const UserItemSkeleton: React.FC = () => {
    return (
        <div className="flex items-center gap-4 p-4 rounded-xl border border-neutral-200 bg-white animate-pulse">
            <div className="w-14 h-14 rounded-full bg-neutral-200" />
            <div className="flex flex-col gap-2 flex-1">
                <div className="w-3/5 h-4 bg-neutral-200 rounded" />
                <div className="w-2/5 h-3 bg-neutral-100 rounded" />
            </div>
        </div>
    );
};

export const CommunityPage: React.FC = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isGridView, setIsGridView] = useState(false);

    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            try {
                if (searchQuery.trim()) {
                    const res = await userApi.searchUsers(searchQuery, 0, 20);
                    const dataContent = (res.data as any).content || (res.data as any).items || [];
                    setUsers(dataContent);
                } else {
                    const res = await userApi.getAllUsers(0, 20);
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
        <div className="min-h-screen w-full bg-white py-10 px-4 sm:px-6 md:px-8 max-w-[1200px] mx-auto">
            <h1 className="text-[28px] font-black text-[#0D0D0D] mb-2 tracking-tight">Community</h1>
            <p className="text-[15px] font-medium text-neutral-500 mb-8">Discover and connect with other auctioneers.</p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="flex-1">
                    <UserSearchBar onSearch={(query) => setSearchQuery(query)} />
                </div>
                <div className="flex bg-white border border-neutral-200 rounded-lg p-1 self-start sm:self-auto h-[46px]">
                    <button
                        onClick={() => setIsGridView(false)}
                        className={`px-3 rounded-md flex items-center justify-center transition-colors ${!isGridView ? 'bg-neutral-100 text-[#0D0D0D] font-bold shadow-sm' : 'text-neutral-400 hover:text-[#0D0D0D]'}`}
                        aria-label="List View"
                    >
                        <List size={20} />
                    </button>
                    <button
                        onClick={() => setIsGridView(true)}
                        className={`px-3 rounded-md flex items-center justify-center transition-colors ${isGridView ? 'bg-neutral-100 text-[#0D0D0D] font-bold shadow-sm' : 'text-neutral-400 hover:text-[#0D0D0D]'}`}
                        aria-label="Grid View"
                    >
                        <LayoutGrid size={20} />
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className={`grid gap-4 w-full ${isGridView ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <UserItemSkeleton key={i} />
                    ))}
                </div>
            ) : (
                <UserItemGrid users={users} onUserClick={(id) => navigate(`/profile/${id}`)} isGridView={isGridView} />
            )}
        </div>
    );
};

export default CommunityPage;