import React, { useState, useRef } from 'react';
import { productApi } from '../../../../api/productApi';
import type { ProductRequest, Tag } from '../../../../types/product';

interface AddItemSectionProps {
    onClose: () => void;
    onSuccess: () => void;
}

const AVAILABLE_TAGS: Tag[] = [
    'ELECTRONICS', 'FOOD', 'COLLECTIBLES', 'FASHION', 'JEWELRY',
    'ART', 'VEHICLES', 'SPORTS', 'GARDENING', 'GAMES', 'ONLINE_ITEM', 'OTHERS'
];

export const AddItemSection: React.FC<AddItemSectionProps> = ({ onClose, onSuccess }) => {
    const [productName, setProductName] = useState('');
    const [description, setDescription] = useState('');
    const [quantity, setQuantity] = useState<number>(1);
    const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const toggleTag = (tag: Tag) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        } else {
            setImageFile(null);
            setImagePreview(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            let finalImageUrl = undefined;

            if (imageFile) {
                const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
                const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

                if (!cloudName) throw new Error('Missing VITE_CLOUDINARY_CLOUD_NAME in .env');
                if (!uploadPreset) throw new Error('Missing VITE_CLOUDINARY_UPLOAD_PRESET in .env');

                const formData = new FormData();
                formData.append('file', imageFile);
                formData.append('upload_preset', uploadPreset);

                const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                    method: 'POST',
                    body: formData,
                });

                if (!uploadRes.ok) {
                    const errData = await uploadRes.json();
                    throw new Error(errData.error?.message || 'Failed to upload image to Cloudinary.');
                }

                const uploadJson = await uploadRes.json();
                finalImageUrl = uploadJson.secure_url;
            }

            const payload: ProductRequest = {
                productName,
                description: description.trim() || undefined,
                quantity,
                productImageUrl: finalImageUrl,
                tags: selectedTags.length > 0 ? selectedTags : undefined
            };

            await productApi.addProduct(payload);
            onSuccess();
        } catch (err: unknown) {
            const errorResponse = err as { response?: { data?: { message?: string } }; message?: string };
            setError(errorResponse.response?.data?.message || errorResponse.message || 'Failed to add item. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(3px)' }}>
            <div style={{ background: '#ffffff', padding: '32px', borderRadius: '12px', width: '90%', maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto', position: 'relative', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '24px', right: '24px', border: 'none', background: 'transparent', fontSize: '24px', color: '#9ca3af', cursor: 'pointer', outline: 'none' }}>✕</button>

                <h2 style={{ margin: '0 0 24px 0', fontSize: '22px', fontWeight: '700', color: '#1f2937' }}>Add New Item</h2>

                {error && (
                    <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontSize: '14px', wordBreak: 'break-word' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Item Name *</label>
                        <input
                            type="text"
                            required
                            value={productName}
                            onChange={(e) => setProductName(e.target.value)}
                            style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '15px', outline: 'none' }}
                            placeholder="e.g., Vintage Rolex Watch"
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Quantity *</label>
                        <input
                            type="number"
                            required
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '15px', outline: 'none' }}
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Item Image</label>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#f9fafb', cursor: 'pointer', fontSize: '14px', color: '#374151', fontWeight: '500' }}
                            >
                                Choose File
                            </button>
                            <span style={{ fontSize: '14px', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                                {imageFile ? imageFile.name : 'No file chosen'}
                            </span>
                        </div>
                        {imagePreview && (
                            <img
                                src={imagePreview}
                                alt="Preview"
                                style={{ marginTop: '8px', width: '100px', height: '100px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #e5e7eb' }}
                            />
                        )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Tags</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {AVAILABLE_TAGS.map(tag => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => toggleTag(tag)}
                                    style={{
                                        padding: '6px 12px',
                                        borderRadius: '100px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        border: selectedTags.includes(tag) ? '1px solid #F5C518' : '1px solid #e5e7eb',
                                        background: selectedTags.includes(tag) ? '#fefce8' : '#f9fafb',
                                        color: selectedTags.includes(tag) ? '#a16207' : '#6b7280',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {tag.replace('_', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '15px', outline: 'none', resize: 'vertical' }}
                            placeholder="Describe your item..."
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#ffffff', color: '#374151', fontWeight: '600', cursor: 'pointer' }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{ padding: '10px 24px', borderRadius: '8px', border: 'none', background: '#F5C518', color: '#0D0D0D', fontWeight: '700', cursor: isLoading ? 'not-allowed' : 'pointer', opacity: isLoading ? 0.7 : 1 }}
                        >
                            {isLoading ? 'Saving...' : 'Add Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddItemSection;