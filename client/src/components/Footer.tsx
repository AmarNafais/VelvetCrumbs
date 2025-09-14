import { Link } from "wouter";
import { Facebook, Instagram, Phone, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-foreground text-background py-16" data-testid="footer-main">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="lg:col-span-2" data-testid="section-brand">
            <div className="text-2xl font-bold text-primary mb-4">Velvet Crumbs</div>
            <p className="text-gray-300 leading-relaxed mb-6 max-w-md">
              Handcrafted delights for every occasion. At Velvet Crumbs, we believe that every celebration 
              deserves a touch of homemade charm. Made with love and the finest ingredients.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-gray-300 hover:text-white hover:bg-primary transition-colors"
                data-testid="link-facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center text-gray-300 hover:text-white hover:bg-primary transition-colors"
                data-testid="link-instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div data-testid="section-links">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors" data-testid="link-footer-home">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-white transition-colors" data-testid="link-footer-about">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-300 hover:text-white transition-colors" data-testid="link-footer-products">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-white transition-colors" data-testid="link-footer-contact">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div data-testid="section-contact">
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <Phone className="text-primary mr-3 mt-1 h-4 w-4" />
                <div>
                  <p className="text-gray-300">+94 76 059 9559</p>
                  <p className="text-gray-400 text-sm">Call for orders</p>
                </div>
              </div>
              <div className="flex items-start">
                <Mail className="text-primary mr-3 mt-1 h-4 w-4" />
                <div>
                  <p className="text-gray-300">info@velvetcrumbs.lk</p>
                  <p className="text-gray-400 text-sm">Email us anytime</p>
                </div>
              </div>
              <div className="flex items-start">
                <MapPin className="text-primary mr-3 mt-1 h-4 w-4" />
                <div>
                  <p className="text-gray-300">Colombo, Sri Lanka</p>
                  <p className="text-gray-400 text-sm">Island-wide delivery</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8 text-center">
          <p className="text-gray-400">Copyright 2024 © Velvet Crumbs. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
