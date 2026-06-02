import { useState, useRef } from 'react';
import { userApi } from '../../../../api/userApi';
import { theme } from '../../../../components/constants/theme';

export const ProfileImageChangingBox = ({ currentImage }: { currentImage?: string }) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>(currentImage || '');
    const [loading, setLoading] = useState(false);
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
            alert('Please select an image file first.');
            return;
        }

        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('file', selectedFile);
            await userApi.updateProfileImage(formData as any);
            alert('Profile image updated successfully!');
        } catch (error) {
            console.error(error);
            alert('Failed to update image.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 border border-[#E8E8E8] rounded-lg mb-4 bg-white">
            <h3 className="font-semibold mb-4" style={{ color: theme.black }}>Change Profile Image</h3>
            <div className="flex gap-4 items-center">
                {preview ? (
                    <img src={preview} alt="Profile preview" className="w-16 h-16 rounded-full object-cover border border-[#E8E8E8]" />
                ) : (
                    <div className="w-16 h-16 rounded-full bg-neutral-100 border border-[#E8E8E8]"></div>
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
                        className="border border-[#E8E8E8] rounded px-4 py-2 hover:bg-neutral-50 text-sm font-medium"
                        style={{ color: theme.black }}
                    >
                        Browse File
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !selectedFile}
                        className="px-4 py-2 rounded text-sm font-medium text-white disabled:opacity-50"
                        style={{ backgroundColor: theme.black }}
                    >
                        {loading ? 'Uploading...' : 'Upload Image'}
                    </button>
                </div>
            </div>
        </form>
    );
};