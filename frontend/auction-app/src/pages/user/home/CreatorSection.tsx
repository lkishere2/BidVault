import { useState } from 'react';
import CreatorItem from './CreatorItem';

export interface Creator {
    id: string;
    name: string;
    avatar: string;
    role: string;
    specialty: string;
    auctions: number;
    totalSold: number;
    since: number;
    bio: string;
}

import img1 from '../../../assets/1.gif';
import img2 from '../../../assets/2.png';
import img3 from '../../../assets/3.jpg';
import img4 from '../../../assets/4.jpg';

const CREATORS: Creator[] = [
    {
        id: '1',
        name: 'Trần Vũ Duy Hưng',
        avatar: img1,
        role: 'System Architect',
        specialty: 'Main features, App deployment',
        auctions: 100,
        totalSold: 5000000,
        since: 2023,
        bio: 'Hưng implemented the main features of BidVault and manages the deployment of the application.',
    },
    {
        id: '2',
        name: 'Vũ Long Khánh',
        avatar: img2,
        role: 'System Architect',
        specialty: 'Database, Caching, Authentication',
        auctions: 120,
        totalSold: 4200000,
        since: 2023,
        bio: 'Khánh designed the core database architecture, caching layers, and the robust authentication system.',
    },
    {
        id: '3',
        name: 'Nguyễn Hoàng Lâm',
        avatar: img3,
        role: 'Tester, Desktop UI',
        specialty: 'Quality Assurance, JavaFX UI',
        auctions: 150,
        totalSold: 3000000,
        since: 2023,
        bio: 'Lâm ensures product reliability through rigorous testing and builds the JavaFX desktop interface.',
    },
    {
        id: '4',
        name: 'Đinh Thái Hữu Khánh',
        avatar: img4,
        role: 'Tester, Desktop UI',
        specialty: 'Quality Assurance, JavaFX UI',
        auctions: 110,
        totalSold: 3800000,
        since: 2023,
        bio: 'Khánh focuses on comprehensive software testing and developing the seamless desktop UI experience.',
    },
];

function InfoPanel({ creator }: { creator: Creator }) {
    return (
        <div className="flex-1 min-w-0">
            {/* Role */}
            <div className="flex items-center gap-3 mb-4">
                <div>
                    <p className="text-[12px] font-extrabold tracking-[.14em] uppercase mb-1" style={{ color: '#F5C518' }}>
                        {creator.role}
                    </p>
                    <p className="text-[14px] font-medium" style={{ color: '#a3a39e' }}>
                        {creator.specialty}
                    </p>
                </div>
            </div>

            {/* Name */}
            <h3
                className="text-[clamp(28px,3.5vw,48px)] font-black text-[#0D0D0D] leading-[1.05] mb-5"
                style={{ fontFamily: "'Playfair Display', serif" }}
            >
                {creator.name}
            </h3>

            {/* Bio */}
            <p className="text-[15px] leading-[1.7] max-w-[500px]" style={{ color: '#6b6b63' }}>
                {creator.bio}
            </p>
        </div>
    );
}

export default function CreatorSection() {
    const [active, setActive] = useState<number | null>(null);
    const [visible, setVisible] = useState(false);
    const [displayIndex, setDisplayIndex] = useState<number>(0);

    const select = (i: number) => {
        if (i === active) {
            // Deselect if clicking the active one
            setActive(null);
            setVisible(false);
            return;
        }
        
        setActive(i);
        if (active === null) {
            setDisplayIndex(i);
            setTimeout(() => setVisible(true), 50);
        } else {
            setVisible(false);
            setTimeout(() => {
                setDisplayIndex(i);
                setVisible(true);
            }, 300);
        }
    };

    return (
        <section
            id="sec-creators"
            className="px-[7vw] py-16 relative overflow-hidden"
            style={{ background: '#ffffff' }}
        >
            <div className="relative z-10 mb-4">
                <p className="text-[11px] font-bold tracking-[.16em] uppercase text-[#F5C518] mb-3">
                    Meet the Team
                </p>
                <h2
                    className="text-[clamp(26px,3.2vw,42px)] font-black text-[#0D0D0D] mb-4"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                >
                    The people behind BidVault
                </h2>
                <p className="text-[#a3a39e] mb-2 max-w-[500px] text-[15px]">
                    Click on a team member to see their responsibilities.
                </p>
            </div>
            
            <div className="relative w-full h-[450px]">
                {CREATORS.map((c, i) => {
                    const isScattered = active === null;
                    const isActive = active === i;
                    
                    let posStyle: React.CSSProperties = {};
                    if (isScattered) {
                        const scattered = [
                            { top: '20%', left: '15%' },
                            { top: '80%', left: '35%' },
                            { top: '30%', left: '65%' },
                            { top: '75%', left: '85%' },
                        ];
                        posStyle = scattered[i];
                    } else if (isActive) {
                        posStyle = { top: '50%', left: '20%' };
                    } else {
                        // Inactive items at the top right
                        const inactiveIndex = i < active ? i : i - 1;
                        posStyle = { top: '10%', left: `${60 + inactiveIndex * 15}%` };
                    }

                    return (
                        <div 
                            key={c.id} 
                            className="absolute transition-all duration-700 ease-in-out cursor-pointer" 
                            style={{ ...posStyle, transform: 'translate(-50%, -50%)', zIndex: isActive ? 20 : 10 }}
                        >
                            <CreatorItem
                                creator={c}
                                isActive={isActive}
                                onClick={() => select(i)}
                            />
                        </div>
                    );
                })}

                {/* Info Panel */}
                <div 
                    className="absolute transition-all duration-500 ease-in-out"
                    style={{
                        top: '55%',
                        left: '42%', 
                        opacity: active !== null && visible ? 1 : 0,
                        pointerEvents: active !== null ? 'auto' : 'none',
                        transform: active !== null && visible ? 'translateY(-50%)' : 'translateY(-40%)',
                        width: '55%',
                        maxWidth: '650px',
                        zIndex: 5
                    }}
                >
                    <InfoPanel creator={CREATORS[displayIndex]} />
                </div>
            </div>
        </section>
    );
}