// src/pages/home/HomePage.tsx
import { Header } from '../../../components/header';
import Footer from '../../../components/footer/Footer';
import Welcome from './Welcome';
import AuctionPreview from './AuctionPreview'; // <-- Import the new preview section

export default function HomePage() {
    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Header isLoggedIn={false} />
            <main className="flex-1">
                <Welcome />
                <AuctionPreview /> {/* <-- Renders cleanly right under the Globe canvas boundary */}
            </main>
            <Footer />
        </div>
    );
}