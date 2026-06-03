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
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-neutral-200 rounded-xl bg-neutral-50 gap-4 transition-colors hover:bg-neutral-100/50">
                <div className="flex flex-col">
                    <h3 className="text-[15px] font-bold text-[#0D0D0D]">Profile Image</h3>
                    <p className="text-[13px] font-medium text-neutral-500">PNG, JPG or WEBP under 5MB.</p>
                </div>
                <div className="flex flex-wrap sm:flex-nowrap gap-4 items-center w-full sm:w-auto">
                    {preview ? (
                        <img src={preview} alt="Profile preview" className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm" />
                    ) : (
                        <div className="w-14 h-14 rounded-full bg-neutral-200 border-2 border-white shadow-sm" />
                    )}
                    <div className="flex gap-2 items-center flex-1 sm:flex-initial">
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
                            className="border border-neutral-300 rounded-lg px-4 py-2 hover:bg-neutral-100 text-[13px] font-bold text-[#0D0D0D] transition-colors bg-white shadow-sm whitespace-nowrap"
                        >
                            Browse
                        </button>
                        {selectedFile && (
                            <span className="text-[12px] font-bold text-neutral-400 truncate max-w-[100px]">{selectedFile.name}</span>
                        )}
                        <button
                            type="submit"
                            disabled={loading || !selectedFile}
                            className="px-6 py-2 rounded-lg text-[13px] font-bold text-white disabled:opacity-50 bg-[#0D0D0D] hover:bg-neutral-800 transition-colors shadow-md whitespace-nowrap"
                        >
                            {loading ? 'Saving...' : 'Save'}
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