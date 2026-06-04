import { useState, useEffect } from 'react';
import PreviewItem from './PreviewItem';
import { auctionApi } from '../../../api/auctionApi';
import LoginNotification from './LoginNotification';
import { useNavigate } from 'react-router-dom';

export interface AuctionLot {
    id: string;
    category: string;
    title: string;
    currentBid: number;
    timeLeft: string;
    image: string;
}

function formatTimeLeft(endTimeStr: string) {
    const ms = new Date(endTimeStr).getTime() - Date.now();
    if (ms <= 0) return 'Ended';
    const hours = Math.floor(ms / 3600000);
    const mins = Math.floor((ms % 3600000) / 60000);
    return `${hours}h ${mins}m`;
}

export default function PreviewSection() {
    const [auctions, setAuctions] = useState<AuctionLot[]>([]);
    const [showLoginNotif, setShowLoginNotif] = useState(false);
    const navigate = useNavigate();

    const handleIntercept = (path: string) => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setShowLoginNotif(true);
        } else {
            navigate(path);
        }
    };

    useEffect(() => {
        auctionApi.getTopAuctions().then(res => {
            const mapped = res.data.map(a => ({
                id: String(a.id),
                category: a.productTags && a.productTags.length > 0 ? a.productTags[0] : 'Various',
                title: a.productName,
                currentBid: parseFloat(a.currentPrice),
                timeLeft: formatTimeLeft(a.endTime),
                image: a.productImageUrl || 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&q=80&w=600'
            }));
            setAuctions(mapped);
        }).catch(err => console.error(err));
    }, []);
    // Split 10 items into a 5+5 layout on large screens:
    //   row 1 → 5 cards  (indices 0–4)
    //   row 2 → 5 cards  (indices 5–9)
    // On smaller screens the grid collapses naturally:
    //   xl  → 5 cols (5+5)
    //   lg  → 4 cols (4+4+2)  ← "4-3" style uneven last row
    //   md  → 3 cols
    //   sm  → 2 cols
    //   xs  → 1 col

    return (
        <section id="sec-preview" className="px-[7vw] py-24 relative overflow-hidden" style={{ background: '#ffffff' }}>
            <div 
                className="absolute inset-0 z-0 opacity-[0.04] pointer-events-none"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1577720580479-7d839d829c73?q=80&w=2000&auto=format&fit=crop")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed',
                    mixBlendMode: 'luminosity'
                }}
            />
            <div className="relative z-10 w-full">
            <div className="flex items-end justify-between mb-12 flex-wrap gap-4">
                <div>
                    <p className="text-[11px] font-bold tracking-[.16em] uppercase text-[#F5C518] mb-2.5">
                        Live right now
                    </p>
                    <h2
                        className="text-[clamp(28px,3.5vw,44px)] font-black text-[#0D0D0D]"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                        Top Auctions
                    </h2>
                </div>
                <a
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        handleIntercept('/auctions/hub');
                    }}
                    className="text-[12px] font-bold tracking-[.08em] uppercase text-[#F5C518] border-b border-[#F5C518]/40 pb-1 no-underline transition hover:opacity-70"
                >
                    View all →
                </a>
            </div>

            {/*
                Responsive column counts
                  2xl / xl  → 5  cols  (10 items = 5 + 5)
                  lg        → 4  cols  (10 items = 4 + 4 + 2 — intentionally asymmetric last row)
                  md        → 3  cols  (10 items = 3 + 3 + 3 + 1)
                  sm        → 2  cols  (10 items = 2 × 5)
                  default   → 1  col
            */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                {auctions.map(item => (
                    <PreviewItem key={item.id} item={item} onClick={() => handleIntercept(`/auctions/hub/${item.id}`)} />
                ))}
            </div>

            <LoginNotification isOpen={showLoginNotif} onClose={() => setShowLoginNotif(false)} />
            </div>
        </section>
    );
}