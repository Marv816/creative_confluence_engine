import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, ShoppingCart } from "lucide-react";
import Button from 'components/ui/Button';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  // Mock user state - replace with actual auth context
  const user = null;

  const navigation = [
    { name: "Home", href: "/" },
    { name: "Artists", href: "/artists" },
    { name: "Store", href: "/store" },
    { name: "Blog", href: "/blog" },
    { name: "AI Tools", href: "/ai-tools" },
    { name: "Collaborations", href: "/collaborations" },
  ];

  return (
    <header className="fixed w-full top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-black text-white">
              Blacc<span className="text-cyan-500">Top</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navigation?.map((item) => (
              <Link
                key={item?.name}
                to={item?.href}
                className="text-gray-300 hover:text-white transition-colors font-medium"
              >
                {item?.name}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="hidden lg:flex items-center gap-4">
            {user ? (
              <>
                <Button variant="ghost" size="icon" className="text-white">
                  <ShoppingCart className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-white">
                  <User className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="text-white">
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="text-white">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-cyan-500 text-black hover:bg-cyan-400">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-white/10">
            <div className="flex flex-col gap-4">
              {navigation?.map((item) => (
                <Link
                  key={item?.name}
                  to={item?.href}
                  className="text-gray-300 hover:text-white transition-colors font-medium px-4 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item?.name}
                </Link>
              ))}
              <div className="flex flex-col gap-2 px-4 pt-4 border-t border-white/10">
                {!user && (
                  <>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full text-white">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full bg-cyan-500 text-black hover:bg-cyan-400">
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}