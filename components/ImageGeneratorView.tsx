import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateImage } from '../services/geminiService'
import { DownloadIcon, SparklesIcon, ImageIcon } from './icons'

/**
 * Custom hook to simulate progress over a given duration.
 * It smoothly animates from 0 to a specified hold point (e.g., 95%)
 * and can be manually completed to 100%.
 */
const useFakeProgress = (isProcessing: boolean, duration: number = 15000) => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!isProcessing) {
      // If we are not processing, ensure progress is either 0 or 100.
      if (progress > 0 && progress < 100) setProgress(100)
      return
    }

    setProgress(0)
    let animationFrameId: number
    const startTime = Date.now()

    const updateProgress = () => {
      const elapsedTime = Date.now() - startTime
      const calculatedProgress = (elapsedTime / duration) * 100
      setProgress(Math.min(95, calculatedProgress)) // Hold at 95%

      if (elapsedTime < duration) {
        animationFrameId = requestAnimationFrame(updateProgress)
      }
    }

    animationFrameId = requestAnimationFrame(updateProgress)

    return () => {
      cancelAnimationFrame(animationFrameId)
      if (isProcessing) setProgress(100) // Complete the bar if cancelled mid-process
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isProcessing, duration])

  const completeProgress = useCallback(() => {
    setProgress(100)
  }, [])

  return { progress, completeProgress }
}

const getLoadingMessage = (progress: number): string => {
  if (progress < 20) return 'Waking up the sleeping GPUs...'
  if (progress < 45) return 'Conjuring pixels from the digital ether...'
  if (progress < 75) return 'Painting with bolts of lightning...'
  if (progress < 95) return 'Reticulating splines with artistic flair...'
  return 'Adding the finishing touches...'
}

const ImageGeneratorView: React.FC = () => {
  const [prompt, setPrompt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const { progress, completeProgress } = useFakeProgress(isLoading)

  const loadingMessage = getLoadingMessage(progress)

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return
    setIsLoading(true)
    setError(null)
    setImageUrl(null)

    try {
      const url = await generateImage(prompt)
      completeProgress() // Jump to 100 on completion
      setImageUrl(url)
    } catch (e) {
      console.error(e)
      const errorMessage =
        e instanceof Error ? e.message : 'An unknown error occurred.'
      setError(`Failed to generate image: ${errorMessage}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    if (!imageUrl) return
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `gemini-image-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="w-full max-w-lg flex flex-col items-center gap-4 text-white">
      <p className="text-gray-400 text-center">
        Describe the image you want to create.
      </p>
      <div className="w-full p-3 rounded-lg bg-black/50 border border-white/10 flex flex-col gap-3">
        <textarea
          id="image-prompt-input"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A photorealistic image of a cat in a tiny wizard hat, on a pile of ancient books."
          className="w-full bg-transparent p-2 rounded-md border border-white/20 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all resize-none h-24 custom-scrollbar"
          rows={3}
          disabled={isLoading}
        />
        <button
          onClick={handleGenerate}
          disabled={isLoading || !prompt.trim()}
          className="w-full flex items-center justify-center gap-2 bg-gray-200 hover:bg-gray-300 text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold py-2 px-4 rounded-md"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
              <span>Generating...</span>
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5" />
              <span>Generate Image</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="text-red-400 bg-red-500/10 p-3 rounded-md w-full text-sm">
          {error}
        </div>
      )}

      <motion.div
        className="w-full aspect-square bg-black/50 border border-dashed rounded-lg flex items-center justify-center mt-4 overflow-hidden relative p-4"
        animate={{
          borderColor: isLoading
            ? [
                'rgba(255, 255, 255, 0.2)',
                'rgba(255, 255, 255, 0.6)',
                'rgba(255, 255, 255, 0.2)',
              ]
            : 'rgba(255, 255, 255, 0.2)',
        }}
        transition={{
          duration: 2.5,
          repeat: isLoading ? Infinity : 0,
          ease: 'easeInOut',
        }}
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-4 text-gray-400 text-center w-full">
            <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden border border-white/10">
              <motion.div
                className="bg-gray-300 h-full rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ ease: 'linear', duration: 0.2 }}
              />
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={loadingMessage}
                className="text-sm h-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
              >
                {loadingMessage}
              </motion.p>
            </AnimatePresence>
          </div>
        ) : imageUrl ? (
          <motion.div
            className="relative w-full h-full group"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <img
              src={imageUrl}
              alt="Generated by Gemini"
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-4 rounded-md"
              >
                <DownloadIcon className="w-5 h-5" />
                Download
              </button>
            </div>
          </motion.div>
        ) : (
          <div className="flex flex-col items-center text-gray-500 text-center p-4">
            <div className="w-16 h-16 mb-4 relative">
              <div className="absolute inset-0 bg-gray-500/10 rounded-full animate-pulse"></div>
              <ImageIcon className="w-16 h-16 text-gray-400/20" />
            </div>
            <p className="font-medium">Your generated image will appear here</p>
            <p className="text-xs text-gray-600 mt-1">
              Let your imagination run wild!
            </p>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default ImageGeneratorView
