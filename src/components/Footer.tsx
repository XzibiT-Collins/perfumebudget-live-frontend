import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-white dark:bg-zinc-950 border-t border-[#E5E5E5] dark:border-zinc-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="text-xl font-serif font-bold tracking-tight mb-4 block dark:text-white">
              PERFUME<span className="font-sans font-light text-accent-dark">BUDGET</span>
            </Link>
            <p className="text-sm text-[#666666] dark:text-zinc-400 max-w-xs">
              Premium fragrances at budget-friendly prices. Discover your signature scent with our curated collection of luxury perfumes.
            </p>
          </div>
          
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-4 dark:text-zinc-300">Fragrances</h4>
            <ul className="space-y-2 text-sm text-[#666666] dark:text-zinc-400">
              <li><Link to="/products" className="hover:text-accent-dark">New Arrivals</Link></li>
              <li><Link to="/products" className="hover:text-accent-dark">Best Sellers</Link></li>
              <li><Link to="/products" className="hover:text-accent-dark">Sale</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-4 dark:text-zinc-300">Support</h4>
            <ul className="space-y-2 text-sm text-[#666666] dark:text-zinc-400">
              <li><Link to="/faq" className="hover:text-[#1A1A1A] dark:hover:text-white">Shipping & Returns</Link></li>
              <li><Link to="/contact" className="hover:text-[#1A1A1A] dark:hover:text-white">Contact Us</Link></li>
              <li><Link to="/faq" className="hover:text-[#1A1A1A] dark:hover:text-white">FAQ</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest mb-4 dark:text-zinc-300">Legal</h4>
            <ul className="space-y-2 text-sm text-[#666666] dark:text-zinc-400">
              <li><Link to="/privacy" className="hover:text-[#1A1A1A] dark:hover:text-white">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-[#1A1A1A] dark:hover:text-white">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-[#F5F5F5] dark:border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[#999999] dark:text-zinc-500">
            © {new Date().getFullYear()} Perfume Budget. All rights reserved.
          </p>
          <div className="flex gap-6">
            {/* Social icons could go here */}
          </div>
        </div>
      </div>
    </footer>
  );
};
