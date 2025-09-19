import { Link } from "wouter";
import { Facebook, Instagram, Phone, Mail, MapPin, ChevronLeft, ChevronRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border py-12" data-testid="footer-main">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Cooking Tips */}
          <div className="flex items-center space-x-4" data-testid="section-cooking-tips">
            <button className="p-2 hover:bg-muted rounded-full transition-colors" data-testid="button-tips-prev">
              <ChevronLeft className="h-5 w-5 text-primary" />
            </button>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground mb-1">Cooking Tips</h3>
              <p className="text-sm text-muted-foreground">Browse 112 Tips</p>
            </div>
            <button className="p-2 hover:bg-muted rounded-full transition-colors" data-testid="button-tips-next">
              <ChevronRight className="h-5 w-5 text-primary" />
            </button>
          </div>

          {/* Center Logo */}
          <div className="text-center" data-testid="section-brand">
            <div className="text-2xl font-bold mb-2 tracking-tight">
              <span className="text-primary">Velvet</span>
              <span className="text-accent-foreground ml-1">Crumbs</span>
            </div>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                data-testid="link-facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a 
                href="#" 
                className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                data-testid="link-instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Recipes */}
          <div className="flex items-center space-x-4" data-testid="section-recipes">
            <button className="p-2 hover:bg-muted rounded-full transition-colors" data-testid="button-recipes-prev">
              <ChevronLeft className="h-5 w-5 text-primary" />
            </button>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground mb-1">Recipes</h3>
              <p className="text-sm text-muted-foreground">91 recipes available</p>
            </div>
            <button className="p-2 hover:bg-muted rounded-full transition-colors" data-testid="button-recipes-next">
              <ChevronRight className="h-5 w-5 text-primary" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
