import React, { useState } from 'react';
import { Pencil, Trash2, X, Check } from 'lucide-react';
import { productApi } from '../../../../api/productApi';
import type { ProductResponse, Tag } from '../../../../types/product';
import { SuccessNotification, FailedNotification } from '../setting/Notification';

interface UserItemInfoProps {
    product: ProductResponse;
    onClose: () => void;
    onUpdated: () => void;
    onDeleted: () => void;
}

const AVAILABLE_TAGS: Tag[] = [
    'ELECTRONICS', 'FOOD', 'COLLECTIBLES', 'FASHION', 'JEWELRY',
    'ART', 'VEHICLES', 'SPORTS', 'GARDENING', 'GAMES', 'ONLINE_ITEM', 'OTHERS'
];

export const UserItemInfo: React.FC<UserItemInfoProps> = ({ product, onClose, onUpdated, onDeleted }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const [editName, setEditName] = useState(product.productName);
    const [editDescription, setEditDescription] = useState(product.description || '');
    const [editQuantity, setEditQuantity] = useState(product.quantity);
    const [editTags, setEditTags] = useState<Tag[]>(product.tags || []);
    const [editImageUrl, setEditImageUrl] = useState(product.productImageUrl || '');
    const [imageUploading, setImageUploading] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setImageUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
                { method: 'POST', body: formData }
            );
            const data = await res.json();
            setEditImageUrl(data.secure_url);
        } catch {
            setNotification({ type: 'error', message: 'Failed to upload image.' });
        } finally {
            setImageUploading(false);
        }
    };

    const resolveImageUrl = (url: string) =>
        url
            ? url.startsWith('http')
                ? url
                : `https://res.cloudinary.com/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload/${url}`
            : 'https://placehold.co/600x400/f3f4f6/9ca3af?text=No+Image';

    const imageUrl = resolveImageUrl(isEditing ? editImageUrl : (product.productImageUrl || ''));

    const toggleTag = (tag: Tag) =>
        setEditTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

    const handleUpdate = async () => {
        setLoading(true);
        try {
            await productApi.editProduct(product.id, {
                productName: editName,
                description: editDescription || undefined,
                quantity: editQuantity,
                productImageUrl: editImageUrl.startsWith('http') ? editImageUrl : undefined,
                tags: editTags.length > 0 ? editTags : undefined,
            });
            setNotification({ type: 'success', message: 'Item updated successfully!' });
            setIsEditing(false);
            onUpdated();
        } catch {
            setNotification({ type: 'error', message: 'Failed to update item.' });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setLoading(true);
        try {
            await productApi.deleteProduct(product.id);
            onDeleted();
        } catch {
            setNotification({ type: 'error', message: 'This item is linked to an active auction and cannot be deleted.' });
            setIsDeleting(false);
        } finally {
            setLoading(false);
        }
    };

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '8px 10px',
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        fontSize: '14px',
        outline: 'none',
        fontFamily: 'inherit',
        boxSizing: 'border-box',
    };

    return (
        <>
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(2px)' }}>
                <div style={{ background: '#ffffff', padding: '32px', borderRadius: '12px', width: '90%', maxWidth: '540px', maxHeight: '85vh', overflowY: 'auto', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>

                    <button onClick={onClose} style={{ position: 'absolute', top: '20px', right: '20px', border: 'none', background: 'transparent', fontSize: '20px', color: '#9ca3af', cursor: 'pointer', outline: 'none', display: 'flex' }}>
                        <X size={20} />
                    </button>

                    {/* Image — clickable to change when editing */}
                    <div
                        style={{ position: 'relative', marginBottom: '20px', borderRadius: '8px', overflow: 'hidden', cursor: isEditing ? 'pointer' : 'default' }}
                        onClick={() => isEditing && fileInputRef.current?.click()}
                    >
                        <img
                            src={imageUrl}
                            alt={product.productName}
                            style={{ width: '100%', maxHeight: '240px', objectFit: 'cover', display: 'block', background: '#f3f4f6' }}
                        />
                        {isEditing && (
                            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                                {imageUploading ? (
                                    <span style={{ color: '#fff', fontSize: '14px', fontWeight: 600 }}>Uploading…</span>
                                ) : (
                                    <>
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>
                                        <span style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>Change Photo</span>
                                    </>
                                )}
                            </div>
                        )}
                        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
                    </div>

                    {isEditing ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '4px' }}>NAME</label>
                                <input style={inputStyle} value={editName} onChange={e => setEditName(e.target.value)} />
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '4px' }}>QUANTITY</label>
                                <input style={inputStyle} type="number" min="1" value={editQuantity} onChange={e => setEditQuantity(Number(e.target.value))} />
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '6px' }}>TAGS</label>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {AVAILABLE_TAGS.map(tag => (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => toggleTag(tag)}
                                            style={{
                                                padding: '4px 10px',
                                                borderRadius: '100px',
                                                fontSize: '11px',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                border: editTags.includes(tag) ? '1px solid #F5C518' : '1px solid #e5e7eb',
                                                background: editTags.includes(tag) ? '#fefce8' : '#f9fafb',
                                                color: editTags.includes(tag) ? '#a16207' : '#6b7280',
                                                fontFamily: 'inherit',
                                            }}
                                        >
                                            {tag.replace('_', ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', display: 'block', marginBottom: '4px' }}>DESCRIPTION</label>
                                <textarea
                                    style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
                                    value={editDescription}
                                    onChange={e => setEditDescription(e.target.value)}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    disabled={loading}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#0D0D0D', color: '#fff', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontSize: '14px', opacity: loading ? 0.6 : 1 }}
                                >
                                    <Check size={14} /> {loading ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </div>
                    ) : isDeleting ? (
                        <div style={{ textAlign: 'center', padding: '8px 0' }}>
                            <p style={{ fontSize: '16px', fontWeight: 600, color: '#1f2937', marginBottom: '6px' }}>Delete this item?</p>
                            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>This action cannot be undone.</p>
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                <button
                                    onClick={() => setIsDeleting(false)}
                                    style={{ padding: '8px 20px', borderRadius: '6px', border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={loading}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 20px', borderRadius: '6px', border: 'none', background: '#dc2626', color: '#fff', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', fontSize: '14px', opacity: loading ? 0.6 : 1 }}
                                >
                                    <Trash2 size={14} /> {loading ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h2 style={{ margin: '0 0 4px 0', fontSize: '22px', fontWeight: '700', color: '#1f2937', paddingRight: '24px' }}>{product.productName || 'Unnamed Item'}</h2>

                            {product.tags && product.tags.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', margin: '10px 0' }}>
                                    {product.tags.map(tag => (
                                        <span key={tag} style={{ padding: '3px 10px', borderRadius: '100px', fontSize: '11px', fontWeight: 600, background: '#fefce8', color: '#a16207', border: '1px solid #F5C518' }}>
                                            {tag.replace('_', ' ')}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderBottom: product.description ? '1px solid #e5e7eb' : 'none', paddingBottom: '16px', marginTop: '12px' }}>
                                {product.quantity !== undefined && (
                                    <div>
                                        <span style={{ color: '#6b7280', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quantity</span>
                                        <div style={{ fontWeight: '600', color: '#1f2937', marginTop: '2px' }}>{product.quantity}</div>
                                    </div>
                                )}
                            </div>

                            {product.description && (
                                <div style={{ paddingTop: '14px', marginBottom: '20px' }}>
                                    <span style={{ color: '#6b7280', fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</span>
                                    <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#4b5563', lineHeight: '1.6' }}>{product.description}</p>
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', flex: 1, justifyContent: 'center', padding: '9px 0', borderRadius: '6px', border: '1px solid #0D0D0D', background: '#fff', color: '#0D0D0D', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px', transition: 'background 0.15s' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = '#f9fafb')}
                                    onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                                >
                                    <Pencil size={14} /> Edit
                                </button>
                                <button
                                    onClick={() => setIsDeleting(true)}
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', flex: 1, justifyContent: 'center', padding: '9px 0', borderRadius: '6px', border: '1px solid #fecaca', background: '#fff', color: '#dc2626', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', fontSize: '14px', transition: 'background 0.15s' }}
                                    onMouseEnter={e => (e.currentTarget.style.background = '#fef2f2')}
                                    onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                                >
                                    <Trash2 size={14} /> Delete
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
            {notification?.type === 'success' && <SuccessNotification message={notification.message} onClose={() => setNotification(null)} />}
            {notification?.type === 'error' && <FailedNotification message={notification.message} onClose={() => setNotification(null)} />}
        </>
    );
};

export default UserItemInfo;