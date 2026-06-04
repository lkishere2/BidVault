import React, { useState } from 'react';

interface UserSearchBarProps {
    onSearch: (query: string) => void;
}

export const UserSearchBar: React.FC<UserSearchBarProps> = ({ onSearch }) => {
    const [query, setQuery] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(query);
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '12px', width: '100%', maxWidth: '600px', marginBottom: '24px' }}>
            <input
                type="text"
                placeholder="Search users by username..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    fontSize: '15px',
                    outline: 'none'
                }}
            />
            <button
                type="submit"
                style={{
                    padding: '12px 24px',
                    background: '#1f2937',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer'
                }}
            >
                Search
            </button>
        </form>
    );
};

export default UserSearchBar;