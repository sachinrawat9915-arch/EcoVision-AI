export const MODEL_BASE_PATH = '/models/teachable-machine/'
const MODEL_VERSION = '08ae891c5ee7'

export type Prediction = {
  className: string
  probability: number
}

export class ModelUnavailableError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ModelUnavailableError'
  }
}

type TensorFlow = typeof import('@tensorflow/tfjs')
type TensorFlowModel = import('@tensorflow/tfjs').LayersModel
type ClassifierInput = HTMLImageElement | HTMLVideoElement | HTMLCanvasElement

type LoadedModel = {
  tf: TensorFlow
  model: TensorFlowModel
  labels: string[]
}

let modelPromise: Promise<LoadedModel> | null = null

async function loadModel(): Promise<LoadedModel> {
  if (!modelPromise) {
    modelPromise = (async () => {
      const modelUrl = `${MODEL_BASE_PATH}model.json?v=${MODEL_VERSION}`
      const metadataUrl = `${MODEL_BASE_PATH}metadata.json?v=${MODEL_VERSION}`
      const modelResponse = await fetch(modelUrl, { method: 'HEAD' })

      if (!modelResponse.ok) {
        throw new ModelUnavailableError(
          'The model files are not in place yet. Add your Teachable Machine export to public/models/teachable-machine/ and include model.json, metadata.json, and the weights file.',
        )
      }

      const [tf, metadataResponse] = await Promise.all([
        import('@tensorflow/tfjs'),
        fetch(metadataUrl),
      ])
      await tf.ready()

      if (!metadataResponse.ok) {
        throw new ModelUnavailableError(
          'The model metadata is missing. Add metadata.json from your Teachable Machine export alongside model.json.',
        )
      }

      const metadata: unknown = await metadataResponse.json()
      const labels = typeof metadata === 'object' && metadata !== null && 'labels' in metadata && Array.isArray(metadata.labels)
        ? metadata.labels.filter((label): label is string => typeof label === 'string')
        : []

      if (labels.length === 0) {
        throw new ModelUnavailableError('No class labels were found in metadata.json. Check that it is part of the Teachable Machine export.')
      }

      try {
        const model = await tf.loadLayersModel(modelUrl)
        return { tf, model, labels }
      } catch {
        throw new ModelUnavailableError(
          'EcoVision could not load this model. Check that model.json and its referenced weights file are both present in public/models/teachable-machine/.',
        )
      }
    })().catch((error: unknown) => {
      modelPromise = null
      if (error instanceof ModelUnavailableError) throw error
      throw new ModelUnavailableError(
        'The AI model could not be initialized in this browser. Check your connection and try again.',
      )
    })
  }

  return modelPromise
}

export async function classifyWaste(input: ClassifierInput): Promise<Prediction[]> {
  const { tf, model, labels } = await loadModel()
  const inputShape = model.inputs[0]?.shape
  const height = typeof inputShape?.[1] === 'number' ? inputShape[1] : 224
  const width = typeof inputShape?.[2] === 'number' ? inputShape[2] : 224
  const inputTensor = tf.tidy(() =>
    tf.browser.fromPixels(input, 3).resizeBilinear([height, width]).toFloat().div(127.5).sub(1).expandDims(0),
  )
  let output: import('@tensorflow/tfjs').Tensor | import('@tensorflow/tfjs').Tensor[] | null = null

  try {
    output = model.predict(inputTensor)
    const outputTensor = Array.isArray(output) ? output[0] : output
    if (!outputTensor) throw new Error('The model returned no output. Please try another image.')
    const values = Array.from(await outputTensor.data())
    const sum = values.reduce((total, value) => total + value, 0)
    const probabilities = sum > 0.9 && sum < 1.1
      ? values
      : (() => {
          const max = Math.max(...values)
          const exponents = values.map((value) => Math.exp(value - max))
          const total = exponents.reduce((total, value) => total + value, 0)
          return exponents.map((value) => value / total)
        })()

    return probabilities
      .map((probability, index) => ({ className: labels[index] ?? `Class ${index + 1}`, probability }))
      .sort((a, b) => b.probability - a.probability)
  } finally {
    inputTensor.dispose()
    if (Array.isArray(output)) output.forEach((tensor) => tensor.dispose())
    else output?.dispose()
  }
}
