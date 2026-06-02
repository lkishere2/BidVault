import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

interface NotificationProps {
    message: string;
    onClose: () => void;
    duration?: number;
}

export const SuccessNotification = ({ message, onClose, duration = 3000 }: NotificationProps) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onClose, 300);
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                background: '#fff',
                border: '1px solid #bbf7d0',
                borderLeft: '4px solid #16a34a',
                borderRadius: '10px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                minWidth: '280px',
                maxWidth: '380px',
                transition: 'opacity 0.3s ease, transform 0.3s ease',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(8px)',
            }}
        >
            <CheckCircle size={18} color="#16a34a" strokeWidth={2} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '14px', fontWeight: 500, color: '#15803d', flex: 1 }}>{message}</span>
            <button
                onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#86efac' }}
            >
                <X size={14} strokeWidth={2} />
            </button>
        </div>
    );
};

export const FailedNotification = ({ message, onClose, duration = 4000 }: NotificationProps) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onClose, 300);
        }, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div
            style={{
                position: 'fixed',
                bottom: '24px',
                right: '24px',
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px 16px',
                background: '#fff',
                border: '1px solid #fecaca',
                borderLeft: '4px solid #dc2626',
                borderRadius: '10px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                minWidth: '280px',
                maxWidth: '380px',
                transition: 'opacity 0.3s ease, transform 0.3s ease',
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(8px)',
            }}
        >
            <XCircle size={18} color="#dc2626" strokeWidth={2} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: '14px', fontWeight: 500, color: '#b91c1c', flex: 1 }}>{message}</span>
            <button
                onClick={() => { setVisible(false); setTimeout(onClose, 300); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#fca5a5' }}
            >
                <X size={14} strokeWidth={2} />
            </button>
        </div>
    );
};