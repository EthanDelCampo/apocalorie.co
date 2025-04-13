import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <header className="w-full bg-[#1a1a1a] border-b border-[#8B4513] shadow-lg">
            <nav className="max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between h-20">
                    {/* Left side: Text */}
                    <Link to="/" className="flex items-center">
                        <span className="text-2xl font-bold text-[#FFA500] font-mono tracking-wider">
                            apocalorie.co
                        </span>
                    </Link>

                    {/* Right side: Icon */}
                    <img src="/icon.png" alt="apocalorie.co" className="w-8 h-8" />
                </div>
            </nav>
        </header>
    );
};

export default Header;

