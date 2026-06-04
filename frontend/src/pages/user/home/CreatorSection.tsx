import { useState, useEffect } from 'react';
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
    github?: string;
    facebook?: string;
    facebookName?: string;
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
        github: 'https://github.com/2cpk-fin',
        facebook: 'https://www.facebook.com/vuduyhung.tran.7',
        facebookName: 'Tran Vu Duy Hung'
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
        github: 'https://github.com/lkishere2',
        facebook: 'https://www.facebook.com/long.khanh.108077',
        facebookName: 'Long Khanh'
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
        github: 'https://github.com/Water-nCoder',
        facebook: 'https://www.facebook.com/lam.nguyenhoang.56808995',
        facebookName: 'Nguyen Hoang Lam'
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
        github: 'https://github.com/khanhkaiser19',
        facebook: 'https://www.facebook.com/huuu.khanh',
        facebookName: 'Huu Khanh'
    },
];

const GithubIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
    </svg>
);

const FacebookIcon = () => (
    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
    </svg>
);

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
            <p className="text-[15px] leading-[1.7] max-w-[500px] mb-4" style={{ color: '#6b6b63' }}>
                {creator.bio}
            </p>

            {/* Socials */}
            <div className="flex flex-wrap gap-6">
                {creator.github && (
                    <a 
                        href={creator.github} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-[14px] font-bold text-[#0D0D0D] hover:text-[#F5C518] transition-colors duration-200 no-underline"
                    >
                        <GithubIcon />
                        <span>{creator.github.replace('https://github.com/', '')}</span>
                    </a>
                )}
                {creator.facebook && (
                    <a 
                        href={creator.facebook} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-[14px] font-bold text-[#0D0D0D] hover:text-[#1877F2] transition-colors duration-200 no-underline"
                    >
                        <FacebookIcon />
                        <span>{creator.facebookName || creator.facebook.split('facebook.com/')[1]}</span>
                    </a>
                )}
            </div>
        </div>
    );
}

export default function CreatorSection() {
    const [active, setActive] = useState<number | null>(null);
    const [visible, setVisible] = useState(false);
    const [displayIndex, setDisplayIndex] = useState<number>(0);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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

    const getPos = (i: number) => {
        if (active === null) {
            const scattered = isMobile ? [
                { top: '15%', left: '25%' },
                { top: '75%', left: '25%' },
                { top: '45%', left: '75%' },
                { top: '85%', left: '75%' },
            ] : [
                { top: '25%', left: '15%' },
                { top: '75%', left: '40%' },
                { top: '30%', left: '65%' },
                { top: '70%', left: '85%' },
            ];
            return scattered[i];
        } else if (active === i) {
            return isMobile ? { top: '15%', left: '50%' } : { top: '50%', left: '20%' };
        } else {
            const inactiveIndex = i < active ? i : i - 1;
            return isMobile 
                ? { top: '90%', left: `${25 + inactiveIndex * 25}%` } 
                : { top: '10%', left: `${60 + inactiveIndex * 15}%` };
        }
    };

    return (
        <section
            id="sec-creators"
            className="px-[7vw] py-16 relative overflow-hidden"
            style={{ background: '#ffffff' }}
        >
            <div 
                className="absolute inset-0 z-0 opacity-[0.08] pointer-events-none"
                style={{
                    backgroundImage: 'url("https://images.unsplash.com/photo-1589391886645-d51941baf7fb?q=80&w=2000&auto=format&fit=crop")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    mixBlendMode: 'luminosity'
                }}
            />
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
            
            <div className={`relative w-full ${isMobile ? 'h-[500px]' : 'h-[400px]'}`}>
                {CREATORS.map((c, i) => {
                    const isActive = active === i;
                    const posStyle = getPos(i);

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
                        top: active !== null && visible ? (isMobile ? '35%' : '50%') : (isMobile ? '30%' : '45%'),
                        left: isMobile ? '5%' : '42%',
                        width: isMobile ? '90%' : '55%',
                        maxWidth: '650px',
                        opacity: active !== null && visible ? 1 : 0,
                        pointerEvents: active !== null ? 'auto' : 'none',
                        transform: active !== null && visible ? (isMobile ? 'translateY(0)' : 'translateY(-50%)') : 'translateY(-40%)',
                        zIndex: 5
                    }}
                >
                    <InfoPanel creator={CREATORS[displayIndex]} />
                </div>
            </div>
        </section>
    );
}