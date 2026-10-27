'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ArrowUpRight, Leaf, Menu, X } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'

const links = [
  { label: 'Home', href: '/' },
  { label: 'AI scanner', href: '/scan' },
  { label: 'How it works', href: '/#how-it-works' },
  { label: 'About', href: '/#about' },
]

export function SiteHeader({ current = 'home' }: { current?: 'home' | 'scanner' }) {
  const [open, setOpen] = useState(false)

  return (
    <header className="site-header">
      <div className="container nav-shell">
        <Link className="brand" href="/" aria-label="EcoVision AI home">
          <span className="brand-mark"><Leaf size={18} strokeWidth={2.2} /></span>
          <span>EcoVision<span className="brand-light"> AI</span></span>
        </Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          {links.map((link) => (
            <Link
              className={(current === 'scanner' && link.href === '/scan') || (current === 'home' && link.href === '/') ? 'nav-link active' : 'nav-link'}
              href={link.href}
              key={link.label}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <Link className="button button-small button-primary nav-cta" href="/scan">
          Start scanning <ArrowUpRight size={15} />
        </Link>
        <button
          className="mobile-menu-button"
          type="button"
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav
            className="mobile-nav"
            aria-label="Mobile navigation"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {links.map((link) => (
              <Link href={link.href} key={link.label} onClick={() => setOpen(false)}>
                {link.label}
              </Link>
            ))}
            <Link className="button button-primary" href="/scan" onClick={() => setOpen(false)}>
              Open scanner <ArrowUpRight size={16} />
            </Link>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
