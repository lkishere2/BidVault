import React from 'react';
import type { UserResponse } from '../../../types/user';
import UserItem from './UserItem';

interface UserItemGridProps {
    users: UserResponse[];
    onUserClick: (userId: number) => void;
}

export const UserItemGrid: React.FC<UserItemGridProps> = ({ users, onUserClick }) => {
    if (users.length === 0) {
        return <p style={{ color: '#6b7280', fontSize: '14px' }}>No users found.</p>;
    }

    return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', width: '100%' }}>
            {users.map((user) => (
                <UserItem
                    key={user.id}
                    user={user}
                    onClick={() => onUserClick(user.id)}
                />
            ))}
        </div>
    );
};

export default UserItemGrid;