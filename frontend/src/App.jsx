import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import DashboardPage from './pages/DashboardPage';

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-[#2b2b14]">
                <Header />
                <main className="container mx-auto px-4 py-8">
                    <Routes>
                        <Route path="/" element={<DashboardPage />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;

