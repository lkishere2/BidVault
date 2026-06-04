import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ImageViewerModalProps {
    imageUrl: string;
    onClose: () => void;
}

export const ImageViewerModal: React.FC<ImageViewerModalProps> = ({ imageUrl, onClose }) => {
    // Close on escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    return (
        <div 
            onClick={onClose}
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 99999, // very high to be above other modals
                background: 'rgba(0, 0, 0, 0.85)',
                backdropFilter: 'blur(5px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'zoom-out',
                animation: 'imgViewerFadeIn 0.2s ease'
            }}
        >
            <style>{`
                @keyframes imgViewerFadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes imgViewerZoomIn {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
            
            {/* Close Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onClose();
                }}
                style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '44px',
                    height: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    zIndex: 2
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
            >
                <X size={24} />
            </button>

            {/* Image */}
            <img
                src={imageUrl}
                alt="Fullscreen View"
                onClick={(e) => e.stopPropagation()} // Prevent clicking image from closing modal
                style={{
                    maxWidth: '90vw',
                    maxHeight: '90vh',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    animation: 'imgViewerZoomIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    cursor: 'default',
                    zIndex: 1
                }}
            />
        </div>
    );
};

export default ImageViewerModal;
