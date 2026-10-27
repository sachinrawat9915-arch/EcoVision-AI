import Link from 'next/link'
import { ArrowUpRight, Leaf } from 'lucide-react'

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-top">
        <div>
          <Link className="brand" href="/" aria-label="EcoVision AI home">
            <span className="brand-mark"><Leaf size={18} strokeWidth={2.2} /></span>
            <span>EcoVision<span className="brand-light"> AI</span></span>
          </Link>
          <p className="footer-note">Small decisions. A lighter footprint.</p>
        </div>
        <Link className="footer-action" href="/scan">Make a more informed choice <ArrowUpRight size={16} /></Link>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} EcoVision AI</span>
        <span>Built for a more circular future.</span>
      </div>
    </footer>
  )
}
