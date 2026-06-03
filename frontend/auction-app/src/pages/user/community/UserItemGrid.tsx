import React from 'react';
import type { UserResponse } from '../../../types/user';
import UserItem from './UserItem';

interface UserItemGridProps {
    users: UserResponse[];
    onUserClick: (userId: number) => void;
    isGridView?: boolean;
}

export const UserItemGrid: React.FC<UserItemGridProps> = ({ users, onUserClick, isGridView = false }) => {
    if (users.length === 0) {
        return <p className="text-neutral-500 text-[14px]">No users found.</p>;
    }

    return (
        <div className={`grid gap-4 w-full ${isGridView ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
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