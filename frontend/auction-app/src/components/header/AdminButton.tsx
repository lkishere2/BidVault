import { useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';

export default function AdminButton() {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate('/admin')}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                height: '44px',
                padding: '0 16px',
                background: '#0D0D0D',
                color: '#F5C518',
                border: 'none',
                borderRadius: '999px',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'opacity 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
        >
            <Shield size={16} strokeWidth={2.5} />
            Admin
        </button>
    );
}