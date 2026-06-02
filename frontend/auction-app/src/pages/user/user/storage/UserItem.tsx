import React from 'react';
import type { ProductResponse } from '../../../../types/product';

interface UserItemProps {
    product: ProductResponse;
    onClick: () => void;
}

export const UserItem: React.FC<UserItemProps> = ({ product, onClick }) => {
    const imageUrl = product.productImageUrl
        ? product.productImageUrl.startsWith('http')
            ? product.productImageUrl
            : `https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/${product.productImageUrl}`
        : 'https://placehold.co/400x300/f3f4f6/9ca3af?text=No+Image';

    return (
        <div
            onClick={onClick}
            style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '16px',
                cursor: 'pointer',
                background: '#ffffff',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
            }}
        >
            <img
                src={imageUrl}
                alt={product.productName || 'Item'}
                style={{ width: '100%', height: '160px', objectFit: 'cover', borderRadius: '6px', background: '#f3f4f6' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1f2937', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {product.productName || 'Unnamed Item'}
                </h4>
                {product.quantity !== undefined && (
                    <p style={{ margin: 0, fontSize: '14px', color: '#4b5563' }}>
                        Quantity: <span style={{ fontWeight: '600', color: '#1f2937' }}>{product.quantity}</span>
                    </p>
                )}
            </div>
        </div>
    );
};

export default UserItem;