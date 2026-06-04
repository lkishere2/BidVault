import React from 'react';

export const UserControlLoading: React.FC = () => (
    <>
        <style>{`
            @keyframes shimmer {
                0% { background-position: -800px 0; }
                100% { background-position: 800px 0; }
            }
            .shimmer {
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 800px 100%;
                animation: shimmer 1.5s infinite linear;
                border-radius: 6px;
            }
        `}</style>
        <div style={{ width: '100%' }}>
            {/* Toolbar Loading */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', gap: '16px', flexWrap: 'wrap' }}>
                <div className="shimmer" style={{ width: '100%', maxWidth: '400px', height: '42px', borderRadius: '8px' }} />
                <div className="shimmer" style={{ width: '80px', height: '18px' }} />
            </div>

            {/* Grid Loading */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', border: '1px solid #f3f4f6' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                            <div className="shimmer" style={{ width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0 }} />
                            <div style={{ flex: 1 }}>
                                <div className="shimmer" style={{ width: '65%', height: '14px', marginBottom: '8px' }} />
                                <div className="shimmer" style={{ width: '85%', height: '12px' }} />
                            </div>
                        </div>
                        <div className="shimmer" style={{ width: '45%', height: '12px', marginBottom: '14px' }} />
                        <div className="shimmer" style={{ width: '100%', height: '32px', borderRadius: '6px' }} />
                    </div>
                ))}
            </div>
        </div>
    </>
);

export default UserControlLoading;