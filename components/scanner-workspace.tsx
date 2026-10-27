'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertTriangle,
  ArrowRight,
  Check,
  FileImage,
  ImagePlus,
  Info,
  Leaf,
  LoaderCircle,
  Recycle,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Upload,
  Video,
  X,
} from 'lucide-react'
import { classifyWaste, ModelUnavailableError, type Prediction } from '@/lib/classifier'

type Mode = 'upload' | 'camera'
type ClassificationResult = Prediction & { disposal: string; recommendation: string; category: string }

function getGuidance(label: string) {
  const category = label.toLowerCase()
  if (/(battery|batteries)/.test(category)) return { category: 'Battery', disposal: 'Do not put batteries in household recycling or general waste. Keep terminals protected and take them to a designated battery collection point.', recommendation: 'If the battery is damaged or leaking, avoid handling it directly and check your local hazardous-waste guidance.' }
  if (/(electronic|e-waste|phone|computer|device)/.test(category)) return { category: 'Electronic waste', disposal: 'Small electronics are usually collected separately from curbside recycling. Look for a local e-waste drop-off or retailer take-back program.', recommendation: 'Remove personal data and any removable battery before recycling when it is safe to do so.' }
  if (/(plastic|pet|hdpe)/.test(category)) return { category: 'Plastic', disposal: 'Check your local program for accepted resin types. Empty and rinse the container, and keep it loose rather than bagged unless your service says otherwise.', recommendation: 'A clear number does not guarantee local acceptance. Your local collection rules take priority.' }
  if (/(paper|cardboard|carton)/.test(category)) return { category: 'Paper & cardboard', disposal: 'Keep paper and cardboard dry and clean. Flatten boxes and remove non-paper packing materials before placing them in collection.', recommendation: 'Greasy or food-soiled paper may not be accepted with clean paper recycling; compost it only where permitted.' }
  if (/(glasses|eyewear|spectacles)/.test(category)) return { category: 'Eyewear', disposal: 'If the glasses are still usable, consider donating or repairing them. Broken eyewear may need to go in general waste unless a local optical retailer offers take-back.', recommendation: 'Separate lenses and frames only if your local reuse or recycling program asks you to.' }
  if (/(textile|fabric|clothing|clothes|shoe)/.test(category)) return { category: /shoe/.test(category) ? 'Shoes' : 'Clothing', disposal: 'If the item is wearable, consider repair, reuse, or donation first. Worn-out textiles and shoes may have a separate take-back program in your area.', recommendation: 'Keep items dry and confirm accepted condition requirements before donating.' }
  if (/(glass|jar|bottle)/.test(category)) return { category: 'Glass', disposal: 'Empty glass containers and check local collection rules. Some services accept glass curbside; others use dedicated drop-off points.', recommendation: 'Do not include broken glass in curbside recycling unless your local provider specifically allows it.' }
  if (/(metal|aluminum|aluminium|steel|can)/.test(category)) return { category: 'Metal', disposal: 'Empty metal cans and containers and check what your local program accepts. Keep loose items out of plastic bags.', recommendation: 'For sharp edges, make the item safe to handle before setting it out for collection.' }
  if (/(organic|food|compost|garden)/.test(category)) return { category: 'Organic material', disposal: 'Food and garden waste can be composted where a home or municipal program accepts it. Keep out packaging and non-compostable items.', recommendation: 'Accepted materials vary between compost programs, so check the list provided by your local service.' }
  if (/(trash|general waste|residual)/.test(category)) return { category: 'General waste', disposal: 'This item was classified as general waste. Check whether any part can be reused or separated, then follow your local residual-waste collection rules.', recommendation: 'Do not place uncertain or hazardous items in general waste without checking local disposal guidance.' }
  return { category: label, disposal: 'Use this classification as a starting point, then check your local waste provider for accepted materials and collection options.', recommendation: 'Clean, separate, and prepare the item according to the rules in your area.' }
}

export function ScannerWorkspace() {
  const [mode, setMode] = useState<Mode>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [isImageReady, setIsImageReady] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<ClassificationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    setIsImageReady(false)
    if (!file) {
      setImageUrl(null)
      return
    }
    const url = URL.createObjectURL(file)
    setImageUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  useEffect(() => {
    if (cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream
      void videoRef.current.play().catch(() => setCameraError('Camera preview could not start. Check browser permissions and try again.'))
    }
    return () => cameraStream?.getTracks().forEach((track) => track.stop())
  }, [cameraStream])

  const stopCamera = useCallback(() => {
    setCameraStream((stream) => {
      stream?.getTracks().forEach((track) => track.stop())
      return null
    })
  }, [])

  const changeMode = useCallback((nextMode: Mode) => {
    setMode(nextMode)
    setError(null)
    setCameraError(null)
    setResult(null)
    if (nextMode !== 'camera') stopCamera()
  }, [stopCamera])

  const handleFile = (selected: File | undefined) => {
    if (!selected) return
    setError(null)
    setResult(null)
    setCameraError(null)
    if (!selected.type.startsWith('image/')) {
      setError('Choose an image file such as JPEG, PNG, or WebP.')
      return
    }
    if (selected.size > 10 * 1024 * 1024) {
      setError('This image is larger than 10 MB. Choose a smaller image to continue.')
      return
    }
    setFile(selected)
  }

  const enableCamera = async () => {
    setCameraError(null)
    setError(null)
    setResult(null)
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('This browser does not support webcam access. Try uploading an image instead.')
      return
    }
    try {
      stopCamera()
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false })
      setCameraStream(stream)
    } catch (cause) {
      const name = cause instanceof DOMException ? cause.name : ''
      setCameraError(name === 'NotAllowedError'
        ? 'Camera access was blocked. Allow camera permission in your browser settings, or use image upload instead.'
        : 'We could not access a camera. Check that it is connected and try again, or upload an image.')
    }
  }

  const scan = async () => {
    setError(null)
    setResult(null)
    let input: HTMLImageElement | HTMLVideoElement | null = null
    if (mode === 'upload') {
      if (!file || !imageRef.current || !isImageReady || imageRef.current.naturalWidth === 0) {
        setError('Wait for a valid image preview before starting a scan.')
        return
      }
      input = imageRef.current
    } else {
      if (!cameraStream || !videoRef.current || videoRef.current.readyState < 2) {
        setError('Enable the camera and wait for the preview before scanning.')
        return
      }
      input = videoRef.current
    }

    setIsLoading(true)
    try {
      const predictions = await classifyWaste(input)
      const topPrediction = predictions[0]
      if (!topPrediction) throw new Error('The model did not return a result. Try another image with the item clearly visible.')
      const guidance = getGuidance(topPrediction.className)
      setResult({ ...topPrediction, ...guidance })
    } catch (cause) {
      setError(cause instanceof ModelUnavailableError
        ? cause.message
        : cause instanceof Error ? cause.message : 'Something went wrong while analyzing this item. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div className="scanner-layout" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
      <section className="scanner-card" aria-label="Waste image scanner">
        <div className="scanner-card-header">
          <div className="scanner-card-title"><ScanLine size={16} /> Item scanner</div>
          <span className="card-kicker">IMAGE INPUT</span>
        </div>
        <div className="mode-tabs" role="tablist" aria-label="Choose scan method">
          <button className={`mode-tab ${mode === 'upload' ? 'active' : ''}`} role="tab" aria-selected={mode === 'upload'} type="button" onClick={() => changeMode('upload')}><ImagePlus size={15} /> Upload image</button>
          <button className={`mode-tab ${mode === 'camera' ? 'active' : ''}`} role="tab" aria-selected={mode === 'camera'} type="button" onClick={() => changeMode('camera')}><Video size={15} /> Use webcam</button>
        </div>

        <div className={`preview-area ${imageUrl || cameraStream ? 'has-preview' : ''}`}>
          {mode === 'upload' && imageUrl && (
            <>
              <img
                ref={imageRef}
                className="preview-image"
                src={imageUrl}
                alt={`Selected waste item: ${file?.name ?? 'uploaded image'}`}
                onLoad={() => setIsImageReady(true)}
                onError={() => {
                  setIsImageReady(false)
                  setError('This file could not be opened as an image. Choose a valid JPEG, PNG, or WebP.')
                }}
              />
              <div className="preview-corner"><span className="status-dot" /> {isImageReady ? 'IMAGE READY' : 'LOADING IMAGE'}</div>
              <div className="preview-frame" aria-hidden="true"><i className="frame-corner frame-tl" /><i className="frame-corner frame-tr" /><i className="frame-corner frame-bl" /><i className="frame-corner frame-br" /></div>
              {isLoading && <div className="scan-beam" aria-hidden="true" />}
            </>
          )}
          {mode === 'camera' && cameraStream && (
            <>
              <video ref={videoRef} className="preview-video" autoPlay playsInline muted aria-label="Live camera preview" />
              <div className="preview-corner"><span className="status-dot" /> LIVE CAMERA</div>
              <div className="preview-frame" aria-hidden="true"><i className="frame-corner frame-tl" /><i className="frame-corner frame-tr" /><i className="frame-corner frame-bl" /><i className="frame-corner frame-br" /></div>
              {isLoading && <div className="scan-beam" aria-hidden="true" />}
            </>
          )}
          {mode === 'upload' && !imageUrl && (
            <button className="preview-placeholder upload-prompt" type="button" onClick={() => fileInputRef.current?.click()}>
              <span className="upload-icon"><Upload size={22} /></span>
              <h2>Drop an image to get started</h2>
              <p>Or browse your files to add a clear photo of one item.</p>
              <span className="button button-quiet camera-button">Choose an image <ArrowRight size={14} /></span>
            </button>
          )}
          {mode === 'camera' && !cameraStream && (
            <div className="preview-placeholder">
              <span className="upload-icon"><Video size={22} /></span>
              <h2>Your camera, when you&apos;re ready</h2>
              <p>Enable your webcam to scan an item in front of you.</p>
              <button className="button button-quiet camera-button" type="button" onClick={enableCamera}>Enable camera <ArrowRight size={14} /></button>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          className="sr-only"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          aria-label="Choose an image to classify"
          onChange={(event) => handleFile(event.target.files?.[0])}
        />

        {mode === 'camera' && cameraStream && (
          <div className="camera-actions"><button className="camera-stop" type="button" onClick={stopCamera}><X size={14} /> Stop camera</button></div>
        )}

        <div className="scanner-controls">
          <div className="file-note"><FileImage size={14} /> {file?.name ?? 'JPEG, PNG, or WebP · Up to 10 MB'}</div>
          {mode === 'upload' && imageUrl && <button className="replace-image" type="button" onClick={() => fileInputRef.current?.click()}>Replace</button>}
          <button className="button button-primary scan-button" type="button" onClick={scan} disabled={isLoading || (mode === 'upload' ? !file || !isImageReady : !cameraStream)}>
            {isLoading ? <><span className="spinner" /> Analyzing</> : <>Scan item <Sparkles size={15} /> </>}
          </button>
        </div>
        {cameraError && <div className="error-panel" role="alert"><AlertTriangle size={16} /><p>{cameraError}</p></div>}
        {error && <div className="error-panel" role="alert"><AlertTriangle size={16} /><p>{error}</p></div>}
        <AnimatePresence>
          {error && error.includes('model files are not in place') && (
            <motion.div className="model-notice" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Info size={15} /><p>Place <code>model.json</code>, <code>metadata.json</code>, and the referenced weights file in <code>public/models/teachable-machine/</code>.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <section className="scanner-card result-card" aria-live="polite" aria-label="AI classification results">
        <div className="scanner-card-header">
          <div className="scanner-card-title"><Sparkles size={16} /> Classification</div>
          <span className="card-kicker">AI RESULTS</span>
        </div>
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="loading" className="result-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="result-symbol"><LoaderCircle size={26} className="loading-icon" /></div>
              <h2>Taking a closer look</h2>
              <p>The model is analyzing the image and preparing your sorting guidance.</p>
              <div className="loading-track"><span /></div>
            </motion.div>
          ) : result ? (
            <motion.div key="result" className="result-content" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }} transition={{ duration: .35 }}>
              <div className="result-status"><Check size={13} /> Item identified</div>
              <h2 className="result-category">{result.category}</h2>
              <p className="result-description">The model identified this item as <strong>{result.className}</strong>.</p>
              <div className="confidence-top"><span>Model confidence</span><strong>{Math.round(result.probability * 100)}%</strong></div>
              <div className="confidence-track" role="progressbar" aria-label="Model confidence" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(result.probability * 100)}><motion.div className="confidence-fill" initial={{ width: 0 }} animate={{ width: `${Math.round(result.probability * 100)}%` }} transition={{ duration: .8, ease: 'easeOut' }} /></div>
              <div className="guidance-block"><div className="guidance-title"><Recycle size={15} /> Disposal guidance</div><p>{result.disposal}</p></div>
              <div className="guidance-block"><div className="guidance-title"><Leaf size={15} /> A more sustainable next step</div><p>{result.recommendation}</p></div>
              <div className="guidance-note">Sorting rules vary by location. Always confirm with your local waste service.</div>
            </motion.div>
          ) : (
            <motion.div key="empty" className="result-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="result-symbol"><Sparkles size={25} /></div>
              <h2>Your results will appear here</h2>
              <p>Add a photo or use your webcam, then scan to see an AI classification and tailored sorting tips.</p>
              <div className="result-hint"><ShieldCheck size={15} /><span>Images are analyzed in your browser and are not uploaded to a server.</span></div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </motion.div>
  )
}
