import Welcome from './Welcome';
import GuideSection from './GuideSection';
import PreviewSection from './PreviewSection';
import UserSection from './UserSection';
import CreatorSection from './CreatorSection';
import MessageButton from './feedback/MessageButton';

export default function HomePage() {
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