import { useEffect } from 'react';
import Welcome from './Welcome';
import GuideSection from './GuideSection';
import PreviewSection from './PreviewSection';
import UserSection from './UserSection';
import CreatorSection from './CreatorSection';
import MessageButton from './feedback/MessageButton';

export default function HomePage() {
    useEffect(() => {
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <main className="flex-1">
                <Welcome />
                <GuideSection />
                <PreviewSection />
                <UserSection />
                <CreatorSection />
            </main>
            <MessageButton />
        </div>
    );
}