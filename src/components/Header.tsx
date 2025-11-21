import { ShoppingCart, Menu } from "lucide-react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="bg-gradient-coral px-6 py-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="text-2xl font-bold text-foreground">
            <span className="text-primary">S</span>
            <span>hop</span>
            <span className="text-primary">H</span>
            <span>ub</span>
          </div>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link to="/" className="text-foreground font-medium hover:text-primary transition-colors">
            Home
          </Link>
          <Link to="/" className="text-primary font-semibold">
            Shop
          </Link>
          <a href="#" className="text-foreground font-medium hover:text-primary transition-colors">
            Blog
          </a>
          <a href="#" className="text-foreground font-medium hover:text-primary transition-colors">
            Contact
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <div className="relative">
            <ShoppingCart className="w-6 h-6 text-foreground cursor-pointer hover:text-primary transition-colors" />
            <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              2
            </span>
          </div>
          <Menu className="w-6 h-6 text-foreground cursor-pointer md:hidden" />
        </div>
      </div>
    </header>
  );
};

export default Header;
