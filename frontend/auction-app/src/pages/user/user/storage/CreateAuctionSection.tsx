import React, { useState } from 'react';
import { X, Rocket } from 'lucide-react';
import { auctionApi } from '../../../../api/auctionApi';
import type { ProductResponse } from '../../../../types/product';
import { SuccessNotification, FailedNotification } from '../setting/Notification';

interface CreateAuctionSectionProps {
    product: ProductResponse;
    onClose: () => void;
    onSuccess: () => void;
}

export const CreateAuctionSection: React.FC<CreateAuctionSectionProps> = ({ product, onClose, onSuccess }) => {
    const [startingPrice, setStartingPrice] = useState('');
    const [quantity, setQuantity] = useState(product.quantity.toString());
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await auctionApi.createAuction({
                productId: product.id,
                quantity: Number(quantity),
                startingPrice: Number(startingPrice),
                startTime: new Date(startTime).toISOString(),
                endTime: new Date(endTime).toISOString(),
            });
            setNotification({ type: 'success', message: 'Auction created successfully!' });
            setTimeout(onSuccess, 1200);
        } catch {
            setNotification({ type: 'error', message: 'Failed to create auction. Please try again.' });
            setIsSubmitting(false);
        }
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '9px 12px',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        fontSize: '14px',
        outline: 'none',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
        color: '#1f2937',
    };

    const labelStyle: React.CSSProperties = {
        fontSize: '12px',
        fontWeight: 600,
        color: '#6b7280',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        display: 'block',
        marginBottom: '5px',
    };

    return (
        <>
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(3px)' }}>
                <div style={{ background: '#ffffff', padding: '32px', borderRadius: '12px', width: '90%', maxWidth: '440px', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>

                    <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', border: 'none', background: 'transparent', color: '#9ca3af', cursor: 'pointer', outline: 'none', display: 'flex', padding: 0 }}>
                        <X size={20} />
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        <Rocket size={18} color="#F5C518" strokeWidth={2.5} />
                        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#1f2937' }}>Launch Auction</h3>
                    </div>
                    <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#6b7280' }}>{product.productName}</p>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={labelStyle}>Starting Price</label>
                            <input
                                style={inputStyle}
                                type="number"
                                min="0"
                                step="any"
                                placeholder="0.00"
                                value={startingPrice}
                                onChange={(e) => setStartingPrice(e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <label style={labelStyle}>Quantity</label>
                            <input
                                style={inputStyle}
                                type="number"
                                min="1"
                                max={product.quantity}
                                value={quantity}
                                onChange={(e) => setQuantity(e.target.value)}
                                required
                            />
                            <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#9ca3af' }}>Available: {product.quantity}</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div>
                                <label style={labelStyle}>Start Time</label>
                                <input style={inputStyle} type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
                            </div>
                            <div>
                                <label style={labelStyle}>End Time</label>
                                <input style={inputStyle} type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
                            <button
                                type="button"
                                onClick={onClose}
                                style={{ flex: 1, padding: '10px 0', borderRadius: '6px', border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px' }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px 0', borderRadius: '6px', border: 'none', background: '#F5C518', color: '#0D0D0D', fontWeight: 700, cursor: isSubmitting ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontSize: '14px', opacity: isSubmitting ? 0.7 : 1 }}
                            >
                                <Rocket size={14} strokeWidth={2.5} />
                                {isSubmitting ? 'Creating...' : 'Create Auction'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            {notification?.type === 'success' && <SuccessNotification message={notification.message} onClose={() => setNotification(null)} />}
            {notification?.type === 'error' && <FailedNotification message={notification.message} onClose={() => setNotification(null)} />}
        </>
    );
};

export default CreateAuctionSection;