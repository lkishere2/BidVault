import React from 'react';

export const UserAuctionGridLoading: React.FC = () => {
    const skeletonStyle: React.CSSProperties = {
        background: '#e5e7eb',
        borderRadius: '4px',
        animation: 'pulse 1.5s infinite ease-in-out'
    };

    return (
        <>
            <style>{`
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }
            `}</style>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '24px' }}>
                {Array.from({ length: 4 }).map((_, index) => (
                    <div
                        key={index}
                        style={{
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            padding: '16px',
                            background: '#ffffff',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                        }}
                    >
                        <div style={{ ...skeletonStyle, width: '100%', height: '160px', borderRadius: '6px' }} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ ...skeletonStyle, width: '75%', height: '18px' }} />
                            <div style={{ ...skeletonStyle, width: '55%', height: '16px' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', paddingTop: '4px' }}>
                            <div style={{ ...skeletonStyle, width: '68px', height: '22px', borderRadius: '4px' }} />
                            <div style={{ ...skeletonStyle, width: '48px', height: '14px' }} />
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default UserAuctionGridLoading;