import { Header } from '../../../components/header';
import Footer from '../../../components/footer/Footer';
import Welcome from './Welcome';

export default function HomePage() {
    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Header isLoggedIn={false} />
            <main className="flex-1">
                <Welcome />
            </main>
            <Footer />
        </div>
    );
}