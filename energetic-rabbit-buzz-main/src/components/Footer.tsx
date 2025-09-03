import { Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-gray-800 via-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Brand Section */}
          <div className="space-y-1">
            <h2 className="text-xl font-black uppercase tracking-tight">KSHOPPER</h2>
            <p className="text-gray-300 text-xs">
              Your trusted bridge to authentic Korean products. Connecting Malaysian customers with verified personal shoppers in Korea.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-1">
            <h3 className="text-base font-bold uppercase tracking-wide">Quick Links</h3>
            <ul className="space-y-0.5">
              <li>
                <Link to="/" className="text-gray-300 hover:text-red-400 hover:underline transition-all duration-300 text-xs">Home</Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-red-400 hover:underline transition-all duration-300 text-xs">About Us</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-1">
            <h3 className="text-base font-bold uppercase tracking-wide">Contact Us</h3>
            <ul className="space-y-1">
              <li className="flex items-start space-x-1.5">
                <MapPin size={14} className="mt-0.5 flex-shrink-0 text-red-400" />
                <span className="text-gray-300 text-xs">123 Shopping Street, Kuala Lumpur, Malaysia</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Phone size={14} className="text-red-400" />
                <span className="text-gray-300 text-xs">+60 123-456-789</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <Mail size={14} className="text-red-400" />
                <span className="text-gray-300 text-xs">support@kshopper.com</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;