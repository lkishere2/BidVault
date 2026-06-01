import React from 'react';

export const UserInfoLoading: React.FC = () => {
    const animationStyles = `
        @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
        }
    `;

    const skeletonStyle: React.CSSProperties = {
        background: '#e5e7eb',
        borderRadius: '4px',
        animation: 'pulse 1.5s infinite ease-in-out'
    };

    return (
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>

            <style>{animationStyles}</style>

            <div
                style={{
                    ...skeletonStyle,
                    width: '96px',
                    height: '96px',
                    borderRadius: '50%',
                    border: '2px solid #e5e7eb'
                }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ ...skeletonStyle, width: '180px', height: '28px', margin: '2px 0' }} />

                <div style={{ ...skeletonStyle, width: '140px', height: '14px', margin: '3px 0' }} />

                <div style={{ display: 'flex', gap: '20px', margin: '4px 0' }}>
                    <div style={{ ...skeletonStyle, width: '80px', height: '16px' }} />
                    <div style={{ ...skeletonStyle, width: '80px', height: '16px' }} />
                </div>
            </div>
        </div>
    );
};

export default UserInfoLoading;