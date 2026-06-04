import React, { useState } from 'react';
import { Shield } from 'lucide-react';
import { userApi } from '../../../api/userApi';
import type { UserResponse } from '../../../types/user';
import { UserGrid } from './UserGrid';
import { UserInfoModal } from './UserInfoModal';

const theme = {
    gold: '#F5C518',
    black: '#0D0D0D',
    white: '#FFFFFF',
    goldDark: '#D4A900',
} as const;

export const UserControlPage: React.FC = () => {
    const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const savedUser = localStorage.getItem('bidvault_user');
    const currentUser = savedUser ? JSON.parse(savedUser) : null;
    const currentAdminId = currentUser ? Number(currentUser.id) : -1;

    const handleRoleUpdate = async (user: UserResponse, newRole: string) => {
        try {
            await userApi.updateRole(user.id, newRole);
            setRefreshTrigger(t => t + 1);
            setNotification({ type: 'success', message: `${user.username} is now ${newRole}.` });
            setTimeout(() => setNotification(null), 3000);
            setSelectedUser({ ...user, role: newRole });
        } catch {
            setNotification({ type: 'error', message: `Failed to update role for ${user.username}.` });
            setTimeout(() => setNotification(null), 3000);
        }
    };

    const handleDelete = async (user: UserResponse) => {
        try {
            await userApi.deleteUser(user.id);
            setSelectedUser(null);
            setRefreshTrigger(t => t + 1);
            setNotification({ type: 'success', message: `${user.username} has been deleted.` });
            setTimeout(() => setNotification(null), 3000);
        } catch {
            setNotification({ type: 'error', message: `Failed to delete ${user.username}.` });
            setTimeout(() => setNotification(null), 3000);
        }
    };

    return (
        <div style={{ padding: '32px', background: '#f9fafb', minHeight: '100vh', fontFamily: 'inherit' }}>
            {/* Page header */}
            <div style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${theme.gold}15`, border: `1px solid ${theme.gold}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Shield size={16} color={theme.gold} />
                    </div>
                    <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: theme.black, letterSpacing: '-0.02em' }}>
                        User Control
                    </h1>
                </div>
                <p style={{ margin: 0, fontSize: '14px', color: '#4b5563' }}>
                    Manage registered users — view details or remove accounts.
                </p>
            </div>

            {/* Grid */}
            <UserGrid
                onView={setSelectedUser}
                onDelete={setSelectedUser}
                refreshTrigger={refreshTrigger}
            />

            {/* User info modal */}
            {selectedUser && (
                <UserInfoModal
                    user={selectedUser}
                    currentAdminId={currentAdminId}
                    onClose={() => setSelectedUser(null)}
                    onDelete={handleDelete}
                    onRoleUpdate={handleRoleUpdate}
                />
            )}

            {/* Inline toast notification */}
            {notification && (
                <div style={{
                    position: 'fixed', bottom: '24px', right: '24px', zIndex: 2000,
                    padding: '12px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: 600,
                    background: notification.type === 'success' ? '#052e16' : '#1a0505',
                    color: notification.type === 'success' ? '#4ade80' : '#ef4444',
                    border: `1px solid ${notification.type === 'success' ? '#166534' : '#7f1d1d'}`,
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                    animation: 'fadeSlideIn 0.25s ease',
                }}>
                    {notification.message}
                </div>
            )}
        </div>
    );
};

export default UserControlPage;