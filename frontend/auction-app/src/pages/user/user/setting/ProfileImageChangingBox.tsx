import { useState, useRef } from 'react';
import { userApi } from '../../../../api/userApi';
import { SuccessNotification, FailedNotification } from './Notification';

export const ProfileImageChangingBox = ({ currentImage }: { currentImage?: string }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>(currentImage || '');
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) {
            setNotification({ type: 'error', message: 'Please select an image file first.' });
            return;
        }

        setLoading(true);
        try {
            const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
            const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

            if (!cloudName || !uploadPreset) {
                throw new Error('Missing Cloudinary configuration environment variables.');
            }

            const cloudinaryData = new FormData();
            cloudinaryData.append('file', selectedFile);
            cloudinaryData.append('upload_preset', uploadPreset);

            const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: 'POST',
                body: cloudinaryData,
            });

            if (!uploadRes.ok) {
                const errData = await uploadRes.json();
                throw new Error(errData.error?.message || 'Failed to upload image to Cloudinary.');
            }

            const uploadJson = await uploadRes.json();
            const finalImageUrl = uploadJson.secure_url;

            await userApi.updateProfileImage({ profileImageUrl: finalImageUrl });
            setNotification({ type: 'success', message: 'Profile image updated successfully!' });
            setSelectedFile(null);
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : 'Failed to update image.';
            setNotification({ type: 'error', message: msg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="p-4 border border-[#E8E8E8] rounded-lg mb-4 bg-white">
                <h3 className="font-semibold mb-4 text-[#0D0D0D]">Change Profile Image</h3>
                <div className="flex gap-4 items-center">
                    {preview ? (
                        <img src={preview} alt="Profile preview" className="w-16 h-16 rounded-full object-cover border border-[#E8E8E8]" />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-neutral-100 border border-[#E8E8E8]" />
                    )}
                    <div className="flex flex-1 gap-2 items-center">
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="border border-[#E8E8E8] rounded px-4 py-2 hover:bg-neutral-50 text-sm font-medium text-[#0D0D0D] transition-colors"
                        >
                            Browse File
                        </button>
                        {selectedFile && (
                            <span className="text-xs text-neutral-400 truncate max-w-[120px]">{selectedFile.name}</span>
                        )}
                        <button
                            type="submit"
                            disabled={loading || !selectedFile}
                            className="px-4 py-2 rounded text-sm font-medium text-white disabled:opacity-50 bg-[#0D0D0D] hover:opacity-85 transition-opacity ml-auto"
                        >
                            {loading ? 'Uploading...' : 'Upload Image'}
                        </button>
                    </div>
                </div>
            </form>
            {notification?.type === 'success' && (
                <SuccessNotification message={notification.message} onClose={() => setNotification(null)} />
            )}
            {notification?.type === 'error' && (
                <FailedNotification message={notification.message} onClose={() => setNotification(null)} />
            )}
        </>
    );
};