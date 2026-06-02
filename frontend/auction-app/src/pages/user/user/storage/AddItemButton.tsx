import React from 'react';

interface AddItemButtonProps {
    onClick: () => void;
}

export const AddItemButton: React.FC<AddItemButtonProps> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            style={{
                background: '#F5C518',
                color: '#0D0D0D',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'background-color 0.2s',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#D4A900'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#F5C518'}
        >
            <span style={{ fontSize: '18px', lineHeight: '1' }}>+</span>
            Add Item
        </button>
    );
};

export default AddItemButton;