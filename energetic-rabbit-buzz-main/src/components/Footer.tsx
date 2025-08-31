import { Github, Twitter, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-8">
        <div className="flex flex-col md:flex-row md:items-center gap-8">
          <div className="flex flex-col items-start">
            <h3 className="text-2xl font-black uppercase mb-2">KSHOPPER</h3>
            <p className="text-sm text-muted-foreground max-w-xs mb-2">
              Your trusted bridge to authentic Korean products. Connecting Malaysian customers with verified personal shoppers in Korea.
            </p>
          </div>
          <ul className="flex flex-col md:flex-row gap-4 text-base font-medium">
            <li><a href="#" className="hover:underline">About Us</a></li>
            <li><a href="#" className="hover:underline">FAQ</a></li>
            <li><a href="#" className="hover:underline">Shipping &amp; Returns</a></li>
            <li><a href="#" className="hover:underline">Contact</a></li>
          </ul>
        </div>
        <div className="flex gap-4 text-2xl">
          <a href="#" aria-label="Twitter"><Twitter /></a>
          <a href="#" aria-label="Instagram"><Instagram /></a>
          <a href="#" aria-label="Github"><Github /></a>
        </div>
      </div>
      <div className="mt-8 border-t border-muted pt-8 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} KShopper. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;