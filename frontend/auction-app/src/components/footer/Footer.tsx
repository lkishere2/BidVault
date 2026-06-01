import { useNavigate } from 'react-router-dom';
import { Gavel } from 'lucide-react';

const PLATFORM_LINKS = [
    { label: 'Home', to: '/' },
    { label: 'Market', to: '/market' },
    { label: 'Explore', to: '/explore' },
    { label: 'Live auctions', to: '/market?filter=live' },
];
const SUPPORT_LINKS = [
    { label: 'Help center', to: '/support/help' },
    { label: 'Contact us', to: '/support/contact' },
    { label: 'Report an issue', to: '/support/report' },
    { label: 'Status', to: '/status' },
];
const LEGAL_LINKS = [
    { label: 'Terms of service', to: '/legal/terms' },
    { label: 'Privacy policy', to: '/legal/privacy' },
    { label: 'Cookie policy', to: '/legal/cookies' },
    { label: 'Seller agreement', to: '/legal/seller' },
];
const SOCIALS = [
    { label: 'X / Twitter', href: 'https://x.com', icon: 'twitter' },
    { label: 'Instagram', href: 'https://instagram.com', icon: 'instagram' },
    { label: 'Discord', href: 'https://discord.com', icon: 'discord' },
    { label: 'Facebook', href: 'https://facebook.com', icon: 'facebook' },
];

interface LinkColProps {
    title: string;
    links: { label: string; to: string }[];
    navigate: (to: string) => void;
}

function LinkCol({ title, links, navigate }: LinkColProps) {
    return (
        <div className="flex flex-col gap-0">
            <p className="text-[11px] font-bold tracking-[.10em] uppercase text-[#0D0D0D] mb-4">
                {title}
            </p>
            {links.map(l => (
                <button
                    key={l.to}
                    onClick={() => navigate(l.to)}
                    className="text-left text-[13px] text-[#666] mb-2.5 bg-transparent border-0 p-0 cursor-pointer font-[inherit] transition-colors hover:text-[#0D0D0D]"
                >
                    {l.label}
                </button>
            ))}
        </div>
    );
}

export default function Footer() {
    const navigate = useNavigate();

    return (
        <footer className="w-full bg-white border-t border-[#0D0D0D]">
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-6 flex flex-col gap-8">

                {/* Top grid — brand takes full width on xs, then collapses into columns */}
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-[1.5fr_1fr_1fr_1fr] gap-8">

                    {/* Brand — spans both columns on xs */}
                    <div className="col-span-2 sm:col-span-2 md:col-span-1 lg:col-span-1 flex flex-col gap-3">
                        <button
                            onClick={() => navigate('/')}
                            aria-label="BidMarket home"
                            className="flex items-center gap-2.5 bg-transparent border-0 cursor-pointer p-0 w-fit"
                        >
                            <div className="w-[30px] h-[30px] bg-[#0D0D0D] rounded-[8px] flex items-center justify-center flex-shrink-0">
                                <Gavel size={14} color="#F5C518" strokeWidth={2} aria-hidden />
                            </div>
                            <span className="text-[15px] font-bold text-[#0D0D0D] tracking-[-0.04em]">
                                BidMarket
                            </span>
                        </button>
                        <p className="text-[13px] text-[#888] leading-[1.65] max-w-[200px]">
                            The live auction platform for collectors, sellers, and serious bidders.
                        </p>
                    </div>

                    <LinkCol title="Platform" links={PLATFORM_LINKS} navigate={navigate} />
                    <LinkCol title="Support" links={SUPPORT_LINKS} navigate={navigate} />
                    <LinkCol title="Legal" links={LEGAL_LINKS} navigate={navigate} />
                </div>

                {/* Bottom bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#0D0D0D22] pt-5">
                    <span className="text-[12px] text-[#888] order-2 sm:order-1">
                        © {new Date().getFullYear()} BidMarket. All rights reserved.
                    </span>

                    {/* Socials */}
                    <div className="flex items-center gap-2 order-1 sm:order-2">
                        {SOCIALS.map(s => (
                            <a
                                key={s.label}
                                href={s.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={s.label}
                                className="w-[32px] h-[32px] rounded-[8px] border border-[#0D0D0D22] flex items-center justify-center text-[#888] text-[15px] no-underline transition-all hover:border-[#F5C518] hover:text-[#F5C518]"
                            >
                                <i className={`ti ti-brand-${s.icon}`} aria-hidden="true" />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}