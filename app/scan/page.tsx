import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { ScannerWorkspace } from '@/components/scanner-workspace'

export const metadata = {
  title: 'AI waste scanner',
  description: 'Scan an item with EcoVision AI to get a material classification and practical sorting guidance.',
}

export default function ScannerPage() {
  return (
    <main className="scanner-page">
      <SiteHeader current="scanner" />
      <section className="scanner-main">
        <div className="container">
          <div className="scanner-heading">
            <div>
              <div className="eyebrow"><span className="status-dot" /> Your smarter sorting companion</div>
              <h1>Give that item<br />a second look.</h1>
              <p>Upload a photo or use your webcam. EcoVision will identify its material and offer useful next steps.</p>
            </div>
            <div className="scanner-status"><span className="status-dot" /> Model files connected</div>
          </div>
          <ScannerWorkspace />
          <div className="scanner-footnote"><CircleHelpIcon /> AI classifications are a helpful guide, not a substitute for local recycling rules.</div>
        </div>
      </section>
      <SiteFooter />
    </main>
  )
}

function CircleHelpIcon() {
  return <span aria-hidden="true" className="footnote-info">i</span>
}
