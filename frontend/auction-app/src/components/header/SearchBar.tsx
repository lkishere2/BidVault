import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function SearchBar() {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        navigate(`/market?q=${encodeURIComponent(query.trim())}`);
    };

    return (
        <form
            onSubmit={handleSearch}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                width: '360px',
                height: '36px',
                padding: '0 16px',
                border: '1px solid #0D0D0D',
                borderRadius: '999px',
                background: '#FFFFFF',
            }}
        >
            <Search size={15} color="#0D0D0D" strokeWidth={2} aria-hidden />
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search auctions & users…"
                style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontSize: '13px',
                    color: '#0D0D0D',
                    fontFamily: 'inherit',
                }}
            />
        </form>
    );
}