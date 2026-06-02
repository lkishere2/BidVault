import React, { useEffect, useState, useRef } from 'react';
import { Search, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { userApi } from '../../../api/userApi';
import type { UserResponse } from '../../../types/user';
import { UserCard } from './User';
import { UserControlLoading } from './UserControlLoading';

const theme = {
    gold: '#F5C518',
    black: '#0D0D0D',
    white: '#FFFFFF',
    goldDark: '#D4A900',
} as const;

interface UserGridProps {
    onView: (user: UserResponse) => void;
    onDelete: (user: UserResponse) => void;
    refreshTrigger?: number;
}

const PAGE_SIZE = 20;

export const UserGrid: React.FC<UserGridProps> = ({ onView, onDelete, refreshTrigger }) => {
    const [users, setUsers] = useState<UserResponse[]>([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [debouncedSearch, setDebouncedSearch] = useState('');

    // Debounce search
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(0);
        }, 350);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [search]);

    // Fetch — effect body stays async-free; fetch is called inside
    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setIsLoading(true);
            try {
                const res = debouncedSearch
                    ? await userApi.searchUsers(debouncedSearch, page, PAGE_SIZE)
                    : await userApi.getAllUsers(page, PAGE_SIZE);
                if (cancelled) return;
                const data = res.data;
                setUsers(data.items || data.content || []);
                setTotalPages(data.totalPages ?? 0);
                setTotalElements(data.totalElements ?? 0);
            } catch (err) {
                console.error('Failed to fetch users:', err);
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };
        load();
        return () => { cancelled = true; };
    }, [debouncedSearch, page, refreshTrigger]);

    if (isLoading && users.length === 0) return <UserControlLoading />;

    return (
        <div>
            {/* Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', flex: '1', maxWidth: '400px' }}>
                    <Search size={15} color="#4b5563" style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input
                        type="text"
                        placeholder="Search by username…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{
                            width: '100%', padding: '10px 12px 10px 38px',
                            background: '#ffffff', border: '1px solid #e5e7eb',
                            borderRadius: '8px', color: '#1f2937', fontSize: '14px',
                            outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
                        }}
                        onFocus={e => (e.target.style.borderColor = theme.gold + '60')}
                        onBlur={e => (e.target.style.borderColor = '#2a2a2a')}
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280', fontSize: '13px', whiteSpace: 'nowrap' }}>
                    <Users size={14} />
                    <span><strong style={{ color: '#1f2937' }}>{totalElements}</strong> users</span>
                </div>
            </div>

            {/* Grid */}
            {users.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 0', color: '#4b5563' }}>
                    <Users size={40} style={{ marginBottom: '12px', opacity: 0.4 }} />
                    <p style={{ margin: 0, fontSize: '15px' }}>No users found</p>
                </div>
            ) : (
                <div style={{ opacity: isLoading ? 0.5 : 1, transition: 'opacity 0.2s', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                    {users.map((user, i) => (
                        <UserCard key={user.id} user={user} onView={onView} onDelete={onDelete} index={i} />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
                    <button
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #2a2a2a', background: 'transparent', color: page === 0 ? '#2a2a2a' : '#6b7280', cursor: page === 0 ? 'not-allowed' : 'pointer' }}
                    >
                        <ChevronLeft size={16} />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i)
                        .filter(i => Math.abs(i - page) <= 2)
                        .map(i => (
                            <button
                                key={i}
                                onClick={() => setPage(i)}
                                style={{ width: '36px', height: '36px', borderRadius: '8px', border: i === page ? 'none' : '1px solid #2a2a2a', background: i === page ? theme.gold : 'transparent', color: i === page ? theme.black : '#6b7280', fontWeight: i === page ? 700 : 400, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}
                            >
                                {i + 1}
                            </button>
                        ))}
                    <button
                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={page >= totalPages - 1}
                        style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '8px', border: '1px solid #2a2a2a', background: 'transparent', color: page >= totalPages - 1 ? '#2a2a2a' : '#6b7280', cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer' }}
                    >
                        <ChevronRight size={16} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserGrid;