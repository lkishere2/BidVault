import { useEffect, useRef } from 'react';
import Footer from '../../../components/footer/Footer';
import Welcome from './Welcome';
import AuctionPreview from './AuctionPreview';

export default function HomePage() {
    const headerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }

        window.scrollTo(0, 0);
        document.body.style.overflow = 'hidden';

        const header = headerRef.current;
        if (header) {
            header.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            requestAnimationFrame(() => {
                setTimeout(() => {
                    header.style.opacity = '1';
                    header.style.transform = 'translateY(0)';
                }, 100);
            });
        }

        const unlockScroll = setTimeout(() => {
            document.body.style.overflow = 'unset';
        }, 2000);

        return () => {
            clearTimeout(unlockScroll);
            document.body.style.overflow = 'unset';
        };
    }, []);

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <main className="flex-1">
                <Welcome />
                <AuctionPreview />
            </main>
            <Footer />
        </div>
    );
}