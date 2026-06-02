import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userApi } from '../../../api/userApi';
import UserInfo from '../user/overview/UserInfo';
import UserAuctionGrid from '../user/overview/UserAuctionGrid';

export const ProfilePage: React.FC = () => {
    const { user_id } = useParams<{ user_id: string }>();
    const navigate = useNavigate();
    const targetUserId = Number(user_id);

    const [myId, setMyId] = useState<number | undefined>(undefined);

    useEffect(() => {
        userApi.getInfo()
            .then(res => setMyId(res.data.id))
            .catch(err => console.error(err));
    }, []);

    return (
        <div style={{ padding: '40px max(20px, calc((100% - 1200px) / 2))', background: '#f9fafb', minHeight: '100vh' }}>
            <button
                onClick={() => navigate('/community')}
                style={{
                    background: 'none',
                    border: 'none',
                    color: '#4b5563',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '24px',
                    padding: 0
                }}
            >
                ← Back to Community
            </button>

            <UserInfo userId={targetUserId} currentUserId={myId} />

            <UserAuctionGrid userId={targetUserId} isMe={myId === targetUserId} />
        </div>
    );
};

export default ProfilePage;