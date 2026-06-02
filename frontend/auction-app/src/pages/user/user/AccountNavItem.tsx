import React from 'react';

interface AccountNavItemProps {
    label: string;
    isActive: boolean;
    onClick: () => void;
}

export const AccountNavItem: React.FC<AccountNavItemProps> = ({ label, isActive, onClick }) => {
    return (
        <button
            onClick={onClick}
            style={{
                width: '100%',
                padding: '12px 16px',
                textAlign: 'left',
                background: isActive ? '#f3f4f6' : 'transparent',
                color: isActive ? '#1f2937' : '#4b5563',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: isActive ? '600' : '500',
                transition: 'all 0.2s ease',
                outline: 'none'
            }}
        >
            {label}
        </button>
    );
};

export default AccountNavItem;