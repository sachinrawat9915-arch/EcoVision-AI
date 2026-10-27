'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Barcode,
  Check,
  CircleHelp,
  Leaf,
  Recycle,
  ScanLine,
  Sparkles,
  Trees,
  Upload,
  Waves,
} from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'

const featureCards = [
  {
    number: '01',
    icon: ScanLine,
    title: 'Smart classification',
    copy: 'A quick photo helps identify what an item is made of, so you can sort with more confidence.',
    tone: 'mint',
  },
  {
    number: '02',
    icon: Recycle,
    title: 'Clear next steps',
    copy: 'Get practical disposal guidance and recycling tips for the material in front of you.',
    tone: 'lime',
  },
  {
    number: '03',
    icon: Trees,
    title: 'Better daily habits',
    copy: 'Turn small, everyday choices into a more thoughtful approach to the things we use.',
    tone: 'sage',
  },
]

const steps = [
  { number: '01', icon: Upload, title: 'Add an item', copy: 'Take a photo or upload an image of something you want to sort.' },
  { number: '02', icon: Sparkles, title: 'Let AI take a look', copy: 'Our image model checks the item and estimates its material category.' },
  { number: '03', icon: Leaf, title: 'Choose what comes next', copy: 'Use clear, local-aware guidance to make a more informed decision.' },
]

const floaters = [
  { className: 'float-chip chip-paper', icon: Barcode, title: 'Paper', sub: 'Cardboard & more' },
  { className: 'float-chip chip-glass', icon: Waves, title: 'Glass', sub: 'Clear guidance' },
  { className: 'float-chip chip-organic', icon: Leaf, title: 'Organic', sub: 'Return to earth' },
]

export default function HomePage() {
  return (
    <main className="home-page">
      <SiteHeader />
      <section className="hero-section">
        <div className="hero-glow" aria-hidden="true" />
        <div className="container hero-grid">
          <motion.div
            className="hero-copy"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
          >
            <div className="eyebrow"><span className="status-dot" /> A clearer way to sort</div>
            <h1>Waste less.<br /><span>Live smarter</span> with AI.</h1>
            <p className="hero-subtitle">A little more clarity can make a big difference. Identify everyday waste and find a better next step with AI-powered guidance.</p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/scan">Start scanning <ArrowUpRight size={17} /></Link>
              <a className="button button-quiet" href="#features">Explore features <ArrowDown size={16} /></a>
            </div>
            <div className="hero-proof">
              <span className="proof-icons"><span><Leaf size={14} /></span><span><Recycle size={14} /></span><span><Waves size={14} /></span></span>
              <span>Make your next sort a smarter one</span>
            </div>
          </motion.div>

          <motion.div
            className="hero-art-wrap"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.12, ease: 'easeOut' }}
          >
            <div className="art-grid" aria-hidden="true" />
            <div className="orbit orbit-one" aria-hidden="true" />
            <div className="orbit orbit-two" aria-hidden="true" />
            <motion.div className="eco-orb" animate={{ y: [0, -9, 0], rotate: [0, 2, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}>
              <div className="orb-inner">
                <div className="orb-leaf leaf-a"><Leaf size={85} strokeWidth={1.1} /></div>
                <div className="orb-leaf leaf-b"><Leaf size={46} strokeWidth={1.2} /></div>
                <div className="orb-core"><ScanLine size={24} /></div>
                <span className="orb-label">A better way forward</span>
              </div>
            </motion.div>
            {floaters.map((item, index) => {
              const Icon = item.icon
              return (
                <motion.div
                  className={item.className}
                  key={item.title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + index * 0.12, duration: 0.5 }}
                >
                  <span className="floater-icon"><Icon size={17} /></span>
                  <span><strong>{item.title}</strong><small>{item.sub}</small></span>
                </motion.div>
              )
            })}
            <div className="art-caption"><span className="caption-line" /> MATERIAL INTELLIGENCE <span className="caption-serial">EV—01</span></div>
          </motion.div>
        </div>
        <div className="container hero-bottom"><span>DESIGNED FOR EVERYDAY IMPACT</span><span className="scroll-cue">SCROLL TO EXPLORE <ArrowDown size={12} /></span></div>
      </section>

      <section className="feature-section section-pad" id="features">
        <div className="container">
          <div className="section-heading">
            <div><div className="eyebrow">A little clarity goes a long way</div><h2>Make the everyday<br /><span>count for more.</span></h2></div>
            <p>Sorting shouldn&apos;t feel like a guessing game. EcoVision gives you useful, simple guidance when you need it.</p>
          </div>
          <div className="feature-grid">
            {featureCards.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.article
                  className={`feature-card feature-${feature.tone}`}
                  key={feature.number}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.5, delay: index * 0.09 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="feature-card-top"><span>{feature.number} / 03</span><ArrowUpRight size={16} /></div>
                  <div className="feature-icon"><Icon size={22} strokeWidth={1.7} /></div>
                  <h3>{feature.title}</h3><p>{feature.copy}</p>
                </motion.article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="how-section section-pad" id="how-it-works">
        <div className="container how-container">
          <div className="how-intro">
            <div className="eyebrow"><span className="status-dot" /> Simple by design</div>
            <h2>From item<br />to insight in<br /><span>three steps.</span></h2>
            <p>No complicated sorting charts. Just a useful starting point for making your next choice.</p>
            <Link className="text-link" href="/scan">Try the AI scanner <ArrowRight size={16} /></Link>
          </div>
          <div className="steps-list">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <motion.div
                  className="step-row"
                  key={step.number}
                  initial={{ opacity: 0, x: 18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ duration: 0.45, delay: index * 0.1 }}
                >
                  <div className="step-index"><span>{step.number}</span><div className="step-line" /></div>
                  <div className="step-icon"><Icon size={20} strokeWidth={1.7} /></div>
                  <div className="step-copy"><h3>{step.title}</h3><p>{step.copy}</p></div>
                  <ArrowUpRight className="step-arrow" size={17} />
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="impact-section" id="about">
        <div className="container impact-panel">
          <div className="impact-copy">
            <div className="eyebrow"><CircleHelp size={14} /> Growing with every scan</div>
            <h2>Impact, measured<br />with <span>integrity.</span></h2>
            <p>We believe sustainability data should be transparent. Live community metrics will appear here when a verified data source is connected.</p>
            <span className="data-note"><span className="status-dot muted-dot" /> Data connection pending</span>
          </div>
          <div className="impact-metrics" aria-label="Impact metrics placeholders">
            <div className="metric-card"><span className="metric-value">—</span><span className="metric-title">Items classified</span><span className="metric-label">Awaiting live data</span></div>
            <div className="metric-card"><span className="metric-value">—</span><span className="metric-title">Materials identified</span><span className="metric-label">Awaiting live data</span></div>
            <div className="metric-card"><span className="metric-value">—</span><span className="metric-title">Community impact</span><span className="metric-label">Awaiting live data</span></div>
          </div>
          <div className="impact-decoration" aria-hidden="true"><div /><div /><div /></div>
        </div>
      </section>

      <section className="closing-section">
        <div className="container closing-inner">
          <div className="closing-mark"><Check size={19} /></div>
          <p>It starts with one item.</p>
          <h2>Let&apos;s make it a<br /><span>better choice.</span></h2>
          <Link className="button button-primary" href="/scan">Scan something now <ArrowUpRight size={17} /></Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}
