import React from 'react';
import type { ProductResponse } from '../../../../types/product';

interface UserItemInfoProps {
    product: ProductResponse;
    onClose: () => void;
}

export const UserItemInfo: React.FC<UserItemInfoProps> = ({ product, onClose }) => {
    const imageUrl = product.productImageUrl
        ? product.productImageUrl.startsWith('http')
            ? product.productImageUrl
            : `https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/${product.productImageUrl}`
        : 'https://placehold.co/600x400/f3f4f6/9ca3af?text=No+Image';

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
            <div style={{ background: '#ffffff', padding: '32px', borderRadius: '12px', width: '90%', maxWidth: '540px', maxHeight: '85vh', overflowY: 'auto', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', border: 'none', background: 'transparent', fontSize: '24px', color: '#9ca3af', cursor: 'pointer', outline: 'none' }}>✕</button>

                <h2 style={{ margin: '0 0 16px 0', fontSize: '22px', fontWeight: '700', color: '#1f2937', paddingRight: '24px' }}>{product.productName || 'Unnamed Item'}</h2>
                <img src={imageUrl} alt={product.productName || 'Item'} style={{ width: '100%', maxHeight: '260px', objectFit: 'cover', borderRadius: '8px', background: '#f3f4f6', marginBottom: '20px' }} />

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderBottom: product.description ? '1px solid #e5e7eb' : 'none', paddingBottom: '20px' }}>
                    {product.quantity !== undefined && (
                        <div><span style={{ color: '#6b7280', fontSize: '13px' }}>Quantity</span><div style={{ fontWeight: '600', color: '#1f2937', marginTop: '2px' }}>{product.quantity}</div></div>
                    )}
                </div>

                {product.description && (
                    <div style={{ paddingTop: '16px' }}>
                        <span style={{ color: '#6b7280', fontSize: '13px' }}>Description</span>
                        <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#4b5563', lineHeight: '1.5' }}>{product.description}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserItemInfo;