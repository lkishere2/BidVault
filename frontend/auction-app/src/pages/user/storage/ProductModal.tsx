import React, { useState, useEffect, useRef } from 'react';
import { X, UploadCloud, Image as ImageIcon, Loader2 } from 'lucide-react';
import type { ProductRequest, ProductResponse, Tag } from '../../../types/product';
import { ALL_TAGS } from './constants';

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: ProductRequest) => Promise<void>;
    editingProduct: ProductResponse | null;
}

export const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSave, editingProduct }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const [formData, setFormData] = useState<ProductRequest>({
        productName: '',
        description: '',
        quantity: 1,
        productImageUrl: '',
        tags: [],
    });

    useEffect(() => {
        if (editingProduct) {
            setFormData({
                productName: editingProduct.productName,
                description: editingProduct.description || '',
                quantity: editingProduct.quantity,
                productImageUrl: editingProduct.productImageUrl || '',
                tags: Array.isArray(editingProduct.tags) ? [...editingProduct.tags] : Array.from(editingProduct.tags || []),
            });
            setPreviewUrl(editingProduct.productImageUrl || null);
        } else {
            setFormData({ productName: '', description: '', quantity: 1, productImageUrl: '', tags: [] });
            setPreviewUrl(null);
        }
    }, [editingProduct, isOpen]);

    if (!isOpen) return null;

    const handleTagToggle = (tag: Tag) => {
        const currentTags = (formData.tags as Tag[]) || [];
        const newTags = currentTags.includes(tag)
            ? currentTags.filter((t) => t !== tag)
            : [...currentTags, tag];
        setFormData({ ...formData, tags: newTags });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const localPreview = URL.createObjectURL(file);
        setPreviewUrl(localPreview);
        setIsUploading(true);

        try {
            const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
            const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;
            const apiSecret = import.meta.env.VITE_CLOUDINARY_API_SECRET;

            const timestamp = Math.round((new Date()).getTime() / 1000).toString();
            const signatureString = `timestamp=${timestamp}${apiSecret}`;

            const encoder = new TextEncoder();
            const data = encoder.encode(signatureString);
            const hashBuffer = await crypto.subtle.digest('SHA-1', data);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

            const uploadData = new FormData();
            uploadData.append('file', file);
            uploadData.append('api_key', apiKey);
            uploadData.append('timestamp', timestamp);
            uploadData.append('signature', signature);

            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: 'POST',
                body: uploadData,
            });

            if (!response.ok) {
                const errData = await response.json();
                console.error('Upload error details:', errData);
                throw new Error('Cloud upload failed');
            }

            const dataResponse = await response.json();
            setFormData({ ...formData, productImageUrl: dataResponse.secure_url });

        } catch (error) {
            console.error(error);
            alert('Failed to upload image. Please try again.');
            setPreviewUrl(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isUploading) {
            alert("Please wait for the image to finish uploading.");
            return;
        }
        await onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0D0D0D]/40 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-6 py-5 border-b border-[#0D0D0D]/10 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-[#0D0D0D]">
                        {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-[#0D0D0D]/5 rounded-full transition-colors text-[#0D0D0D]/60">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex flex-col md:flex-row flex-grow overflow-hidden">
                    <div className="w-full md:w-2/5 border-b md:border-b-0 md:border-r border-[#0D0D0D]/10 bg-[#0D0D0D]/[0.02] p-6 flex flex-col items-center justify-center relative min-h-[250px]">
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            disabled={isUploading}
                        />

                        {previewUrl ? (
                            <div className={`relative w-full h-full flex flex-col items-center justify-center group ${isUploading ? 'cursor-wait' : 'cursor-pointer'}`} onClick={() => !isUploading && fileInputRef.current?.click()}>
                                <img
                                    src={previewUrl}
                                    alt="Product Preview"
                                    className={`w-full h-full object-contain max-h-[400px] rounded-xl transition-opacity ${isUploading ? 'opacity-50' : 'opacity-100'}`}
                                />

                                {isUploading ? (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="bg-white/90 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 font-medium text-sm">
                                            <Loader2 className="animate-spin text-[#F5C518]" size={18} />
                                            Uploading...
                                        </div>
                                    </div>
                                ) : (
                                    <div className="absolute inset-0 bg-[#0D0D0D]/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                                        <span className="text-white font-medium flex items-center gap-2">
                                            <UploadCloud size={20} /> Change Image
                                        </span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isUploading}
                                className="w-full h-full border-2 border-dashed border-[#0D0D0D]/20 rounded-2xl flex flex-col items-center justify-center gap-3 text-[#0D0D0D]/60 hover:bg-[#0D0D0D]/5 hover:border-[#0D0D0D]/40 transition-all"
                            >
                                <ImageIcon size={48} className="text-[#0D0D0D]/30" />
                                <span className="font-medium">Click to upload image</span>
                                <span className="text-xs">PNG, JPG, WEBP up to 5MB</span>
                            </button>
                        )}
                    </div>

                    <form id="product-form" onSubmit={handleSubmit} className="w-full md:w-3/5 p-6 overflow-y-auto flex flex-col gap-5">
                        <div>
                            <label className="block text-sm font-semibold text-[#0D0D0D] mb-2">Product Name *</label>
                            <input required type="text" value={formData.productName} onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                                className="w-full px-4 py-3 border border-[#0D0D0D]/10 rounded-2xl focus:border-[#F5C518] focus:ring-1 focus:ring-[#F5C518] outline-none text-[#0D0D0D]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-[#0D0D0D] mb-2">Quantity *</label>
                            <input required type="number" min="0" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                                className="w-full px-4 py-3 border border-[#0D0D0D]/10 rounded-2xl focus:border-[#F5C518] focus:ring-1 focus:ring-[#F5C518] outline-none text-[#0D0D0D]"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-[#0D0D0D] mb-2">Description</label>
                            <textarea rows={4} value={formData.description || ''} onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-3 border border-[#0D0D0D]/10 rounded-2xl focus:border-[#F5C518] focus:ring-1 focus:ring-[#F5C518] outline-none text-[#0D0D0D] resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-[#0D0D0D] mb-3">Tags</label>
                            <div className="flex flex-wrap gap-2">
                                {ALL_TAGS.map((tag) => {
                                    const isSelected = (formData.tags as Tag[])?.includes(tag);
                                    return (
                                        <button type="button" key={tag} onClick={() => handleTagToggle(tag)}
                                            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${isSelected ? 'bg-[#F5C518] border-[#F5C518] text-[#0D0D0D]' : 'bg-white border-[#0D0D0D]/10 text-[#0D0D0D]/70 hover:border-[#0D0D0D]/30'
                                                }`}
                                        >
                                            {tag.replace('_', ' ')}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </form>
                </div>

                <div className="px-6 py-5 border-t border-[#0D0D0D]/10 flex justify-end gap-3 bg-white">
                    <button type="button" onClick={onClose}
                        className="px-6 py-2.5 rounded-full border border-[#0D0D0D]/10 font-semibold text-[#0D0D0D] hover:bg-[#0D0D0D]/5 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="product-form"
                        disabled={isUploading}
                        className="px-6 py-2.5 rounded-full bg-[#F5C518] font-semibold text-[#0D0D0D] hover:bg-[#d9ae15] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isUploading ? 'Uploading...' : 'Save Product'}
                    </button>
                </div>
            </div>
        </div>
    );
};