import Link from 'next/link';
import dynamic from 'next/dynamic';
const DynamicBackground = dynamic(() => import('@/components/parlexa/DynamicBackground').then(mod => mod.DynamicBackground), { ssr: false });

export async function Footer() {
  return (
    <footer className="bg-[#09090B] border-t border-white/10 relative overflow-hidden pt-12 sm:pt-16">
      <DynamicBackground type="footer" />
      <div className="relative z-10">
        {/* Top Section (Link Columns) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 max-w-7xl mx-auto px-4 sm:px-6">
          
          {/* Column 1: Platform */}
          <div>
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase mb-6">Platform</h4>
            <div className="flex flex-col gap-3">
              <Link href="/products" className="text-gray-400 text-sm hover:text-white transition-colors duration-200">Browse Agents</Link>
              <Link href="/bundles" className="text-gray-400 text-sm hover:text-white transition-colors duration-200">AI Bundles</Link>
              <Link href="/dashboard/vendor/listings/new" className="text-gray-400 text-sm hover:text-white transition-colors duration-200">Submit Tool</Link>
              <Link href="/ai-finder" className="text-gray-400 text-sm hover:text-white transition-colors duration-200">AI Finder</Link>
              <Link href="/compare" className="text-gray-400 text-sm hover:text-white transition-colors duration-200">Compare Tools</Link>
            </div>
          </div>

          {/* Column 2: Resources */}
          <div>
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase mb-6">Resources</h4>
            <div className="flex flex-col gap-3">
              <Link href="/blog" className="text-gray-400 text-sm hover:text-white transition-colors duration-200">Blog</Link>
              <Link href="/docs" className="text-gray-400 text-sm hover:text-white transition-colors duration-200">API Docs</Link>
              <Link href="/guides" className="text-gray-400 text-sm hover:text-white transition-colors duration-200">Guides</Link>
              <Link href="/help" className="text-gray-400 text-sm hover:text-white transition-colors duration-200">Help Center</Link>
            </div>
          </div>

          {/* Column 3: Company */}
          <div>
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase mb-6">Company</h4>
            <div className="flex flex-col gap-3">
              <Link href="/about" className="text-gray-400 text-sm hover:text-white transition-colors duration-200">About</Link>
              <Link href="/press" className="text-gray-400 text-sm hover:text-white transition-colors duration-200">Press & Media</Link>
              <Link href="/contact" className="text-gray-400 text-sm hover:text-white transition-colors duration-200">Contact</Link>
              <Link href="/careers" className="text-gray-400 text-sm hover:text-white transition-colors duration-200">Careers</Link>
            </div>
          </div>

          {/* Column 4: Legal */}
          <div>
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase mb-6">Legal</h4>
            <div className="flex flex-col gap-3">
              <Link href="/privacy-policy" className="text-gray-400 text-sm hover:text-white transition-colors duration-200">Privacy</Link>
              <Link href="/terms" className="text-gray-400 text-sm hover:text-white transition-colors duration-200">Terms</Link>
              <Link href="/refund-policy" className="text-gray-400 text-sm hover:text-white transition-colors duration-200">Refund Policy</Link>
            </div>
          </div>

          {/* Column 5: Follow Us */}
          <div>
            <h4 className="text-white text-sm font-semibold tracking-wider uppercase mb-6">Follow Us</h4>
            <div className="flex gap-4">
              <a href="https://twitter.com/parlexa" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors w-5 h-5">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a href="https://linkedin.com/company/parlexa" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors w-5 h-5">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="https://github.com/parlexa" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors w-5 h-5">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

        </div>

        {/* Middle Section (Divider & Copyright) */}
        <div className="border-t border-white/10 mt-12 pt-8 max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 relative z-20">
          <p className="text-gray-500 text-sm m-0">© 2026 Parlexa. All rights reserved.</p>
        </div>
      </div>

      {/* The Signature Element (Giant Watermark Text) */}
      <div className="w-full overflow-hidden flex justify-center mt-10 pointer-events-none select-none relative z-0">
        <span className="text-[15vw] leading-none font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white/[0.05] to-transparent">
          PARLEXA
        </span>
      </div>
    </footer>
  );
}
