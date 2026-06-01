import PreviewItem from './PreviewItem';

export interface AuctionLot {
    id: string;
    category: string;
    title: string;
    currentBid: number;
    timeLeft: string;
    image: string;
}

const MOCK_AUCTIONS: AuctionLot[] = [
    { id: '1', category: 'Fine Watches', title: 'Rolex Submariner Date — Ref.126610LN', currentBid: 14200, timeLeft: '2h 15m', image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&q=80&w=600' },
    { id: '2', category: 'Luxury Cars', title: '2021 Porsche 911 GT3 — Manual Transmission', currentBid: 185000, timeLeft: '4h 45m', image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=600' },
    { id: '3', category: 'Handbags', title: 'Hermès Birkin 30 Black Togo — Gold Hardware', currentBid: 21500, timeLeft: '1h 30m', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600' },
    { id: '4', category: 'Fine Watches', title: 'Patek Philippe Nautilus Ref.5711/1A-010', currentBid: 78000, timeLeft: '6h 00m', image: 'https://images.unsplash.com/photo-1600003263720-95b45a4035d5?auto=format&fit=crop&q=80&w=600' },
    { id: '5', category: 'Luxury Cars', title: 'Ferrari 488 Spider 2019 — 12,400 Miles', currentBid: 245000, timeLeft: '9h 10m', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=600' },
    { id: '6', category: 'Fine Art', title: 'Banksy "Girl With Balloon" — Signed Print', currentBid: 420000, timeLeft: '11h 05m', image: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=600' },
    { id: '7', category: 'Handbags', title: 'Chanel Classic Flap — Caviar Medium, Black', currentBid: 9800, timeLeft: '3h 22m', image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&q=80&w=600' },
    { id: '8', category: 'Wine & Spirits', title: 'Château Pétrus 2000 — OWC 12 Bottles', currentBid: 32000, timeLeft: '5h 40m', image: 'https://images.unsplash.com/photo-1504707748692-419802cf939d?auto=format&fit=crop&q=80&w=600' },
    { id: '9', category: 'Fine Watches', title: 'A.Lange & Söhne Datograph Up/Down — Platinum', currentBid: 54000, timeLeft: '7h 55m', image: 'https://images.unsplash.com/photo-1623998021800-7ad8de2ab7e7?auto=format&fit=crop&q=80&w=600' },
    { id: '10', category: 'Luxury Cars', title: 'Lamborghini Huracán EVO Spyder 2022 — 5k Miles', currentBid: 310000, timeLeft: '14h 30m', image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&q=80&w=600' },
];

export default function PreviewSection() {
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
        <section id="sec-preview" className="px-[7vw] py-24 bg-neutral-50">
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
                {MOCK_AUCTIONS.map(item => (
                    <PreviewItem key={item.id} item={item} />
                ))}
            </div>
        </section>
    );
}