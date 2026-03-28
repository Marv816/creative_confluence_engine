import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Youtube } from "lucide-react";

export default function Footer() {
  const footerLinks = {
    product: [
      { name: "Features", href: "#" },
      { name: "Pricing", href: "#" },
      { name: "Store", href: "/store" },
      { name: "AI Tools", href: "/ai-tools" },
    ],
    company: [
      { name: "About", href: "#" },
      { name: "Blog", href: "#" },
      { name: "Careers", href: "#" },
      { name: "Contact", href: "#" },
    ],
    resources: [
      { name: "Community", href: "/community" },
      { name: "Support", href: "#" },
      { name: "Documentation", href: "#" },
      { name: "Terms", href: "#" },
    ],
  };

  const socialLinks = [
    { name: "Facebook", icon: Facebook, href: "#" },
    { name: "Twitter", icon: Twitter, href: "#" },
    { name: "Instagram", icon: Instagram, href: "#" },
    { name: "YouTube", icon: Youtube, href: "#" },
  ];

  return (
    <footer className="bg-black border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-block mb-4">
              <span className="text-2xl font-black text-white">
                Blacc<span className="text-cyan-500">Top</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm mb-6">
              Where music meets culture. A creative hub for artists, producers, and writers.
            </p>
            <div className="flex gap-4">
              {socialLinks?.map((social) => (
                <a
                  key={social?.name}
                  href={social?.href}
                  className="text-gray-400 hover:text-cyan-500 transition-colors"
                  aria-label={social?.name}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h3 className="text-white font-bold mb-4">Product</h3>
            <ul className="space-y-2">
              {footerLinks?.product?.map((link) => (
                <li key={link?.name}>
                  <Link
                    to={link?.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link?.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks?.company?.map((link) => (
                <li key={link?.name}>
                  <Link
                    to={link?.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link?.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks?.resources?.map((link) => (
                <li key={link?.name}>
                  <Link
                    to={link?.href}
                    className="text-gray-400 hover:text-white transition-colors text-sm"
                  >
                    {link?.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <h3 className="text-white font-bold mb-2">Stay Updated</h3>
              <p className="text-gray-400 text-sm">
                Get the latest music, beats, and creative tools delivered to your inbox.
              </p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-2 bg-white/5 border border-white/10 rounded-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-cyan-500 flex-1 md:w-64"
              />
              <button className="px-6 py-2 bg-cyan-500 text-black font-bold rounded-sm hover:bg-cyan-400 transition-colors whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
          <p>&copy; {new Date()?.getFullYear()} Lyrical Metaverse by BlackTop Entertainment. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="#" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link to="#" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}