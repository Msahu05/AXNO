import { useNavigate } from "react-router-dom";
import { Instagram, Facebook, Mail, Phone, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  const navigate = useNavigate();

  return (
    <footer className="w-full bg-secondary text-secondary-foreground mt-auto border-t border-secondary-foreground/10">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 py-4 sm:py-5 lg:py-6">
        <div className="max-w-7xl mx-auto">
          {/* Main Content Grid */}
          {/* Mobile: 2 cols, Tablet: 3 cols, Desktop: 5 cols (single row) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-5 lg:gap-6 mb-3 sm:mb-4">
            {/* Brand Tagline */}
            <div>
              <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider mb-1">LOOKLYN</h2>
              <p className="text-xs text-secondary-foreground/70 uppercase tracking-wide">Own The Look</p>
            </div>

            {/* Connect Section */}
            <div>
              <h3 className="text-xs font-semibold mb-2 uppercase tracking-wider">Connect</h3>
              <div className="space-y-1">
                <a
                  href="mailto:looklynnn@gmail.com"
                  className="block text-xs text-secondary-foreground/80 hover:text-secondary-foreground hover:underline transition-colors"
                >
                  Email
                </a>
                <a
                  href="tel:+917016925325"
                  className="block text-xs text-secondary-foreground/80 hover:text-secondary-foreground transition-colors"
                >
                  Phone
                </a>
                <div className="flex items-center gap-2 mt-2">
                  <a
                    href="https://www.instagram.com/_looklyn_"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-80 transition-opacity"
                    aria-label="Instagram"
                    style={{ color: '#FF69B4' }}
                  >
                    <Instagram className="h-3.5 w-3.5" />
                  </a>
                  <a
                    href="https://www.facebook.com/looklyn"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-80 transition-opacity"
                    aria-label="Facebook"
                    style={{ color: '#1877F2' }}
                  >
                    <Facebook className="h-3.5 w-3.5" />
                  </a>
                  <a
                    href="https://wa.me/917016925325"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:opacity-80 transition-opacity"
                    aria-label="WhatsApp"
                    style={{ color: '#25D366' }}
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Products Section */}
            <div>
              <h3 className="text-xs font-semibold mb-2 uppercase tracking-wider">Products</h3>
              <ul className="space-y-1">
                <li>
                  <Link
                    to="/category/t-shirts"
                    className="text-xs text-secondary-foreground/80 hover:text-secondary-foreground hover:underline transition-colors block"
                  >
                    T-Shirts
                  </Link>
                </li>
                <li>
                  <Link
                    to="/category/hoodies"
                    className="text-xs text-secondary-foreground/80 hover:text-secondary-foreground hover:underline transition-colors block"
                  >
                    Hoodies
                  </Link>
                </li>
                <li>
                  <Link
                    to="/category/sweatshirts"
                    className="text-xs text-secondary-foreground/80 hover:text-secondary-foreground hover:underline transition-colors block"
                  >
                    Sweatshirts
                  </Link>
                </li>
              </ul>
            </div>

            {/* Category Section */}
            <div>
              <h3 className="text-xs font-semibold mb-2 uppercase tracking-wider">Category</h3>
              <ul className="space-y-1">
                <li>
                  <Link
                    to="/category/all?filter=men"
                    className="text-xs text-secondary-foreground/80 hover:text-secondary-foreground hover:underline transition-colors block"
                  >
                    Men
                  </Link>
                </li>
                <li>
                  <Link
                    to="/category/all?filter=women"
                    className="text-xs text-secondary-foreground/80 hover:text-secondary-foreground hover:underline transition-colors block"
                  >
                    Women
                  </Link>
                </li>
                <li>
                  <Link
                    to="/category/all?filter=unisex"
                    className="text-xs text-secondary-foreground/80 hover:text-secondary-foreground hover:underline transition-colors block"
                  >
                    Unisex
                  </Link>
                </li>
                <li>
                  <Link
                    to="/category/all?filter=top"
                    className="text-xs text-secondary-foreground/80 hover:text-secondary-foreground hover:underline transition-colors block"
                  >
                    Top Products
                  </Link>
                </li>
                <li>
                  <Link
                    to="/category/all?filter=hot"
                    className="text-xs text-secondary-foreground/80 hover:text-secondary-foreground hover:underline transition-colors block"
                  >
                    Hot
                  </Link>
                </li>
                <li>
                  <Link
                    to="/category/all?filter=new"
                    className="text-xs text-secondary-foreground/80 hover:text-secondary-foreground hover:underline transition-colors block"
                  >
                    New
                  </Link>
                </li>
                <li>
                  <Link
                    to="/category/all?filter=special"
                    className="text-xs text-secondary-foreground/80 hover:text-secondary-foreground hover:underline transition-colors block"
                  >
                    TLS
                  </Link>
                </li>
              </ul>
            </div>

            {/* Learn Section */}
            <div>
              <h3 className="text-xs font-semibold mb-2 uppercase tracking-wider">Learn</h3>
              <ul className="space-y-1">
                <li>
                  <Link
                    to="/blog"
                    className="text-xs text-secondary-foreground/80 hover:text-secondary-foreground hover:underline transition-colors block"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    to="/story"
                    className="text-xs text-secondary-foreground/80 hover:text-secondary-foreground hover:underline transition-colors block"
                  >
                    Our Story
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal Section */}
            <div>
              <h3 className="text-xs font-semibold mb-2 uppercase tracking-wider">Legal</h3>
              <ul className="space-y-1">
                <li>
                  <Link
                    to="/privacy-policy"
                    className="text-xs text-secondary-foreground/80 hover:text-secondary-foreground hover:underline transition-colors block"
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms"
                    className="text-xs text-secondary-foreground/80 hover:text-secondary-foreground hover:underline transition-colors block"
                  >
                    Terms
                  </Link>
                </li>
                <li>
                  <Link
                    to="/delivery"
                    className="text-xs text-secondary-foreground/80 hover:text-secondary-foreground hover:underline transition-colors block"
                  >
                    Delivery
                  </Link>
                </li>
                <li>
                  <Link
                    to="/refund"
                    className="text-xs text-secondary-foreground/80 hover:text-secondary-foreground hover:underline transition-colors block"
                  >
                    Refund
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-secondary-foreground/20 pt-3">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
              <p className="text-xs text-secondary-foreground/60">
                © {new Date().getFullYear()} Looklyn — Own The Look
              </p>
              <p className="text-xs text-secondary-foreground/60">
                All rights reserved
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

