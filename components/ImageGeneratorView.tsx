<<<<<<< HEAD
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { generateImage } from '../services/geminiService';
import { DownloadIcon, SparklesIcon, ImageIcon } from './icons';

const ImageGeneratorView: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true);
    setError(null);
    setImageUrl(null);

    try {
      const url = await generateImage(prompt);
      setImageUrl(url);
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
      setError(`Failed to generate image: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `gemini-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-black text-white p-6 overflow-hidden relative">
      {/* Subtle floating gradient rings */}
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-r from-sky-500/10 to-transparent blur-3xl"
        animate={{
          x: [0, 40, -30, 0],
          y: [0, -30, 30, 0],
          rotate: [0, 45, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full bg-gradient-to-r from-zinc-600/10 to-transparent blur-2xl"
        animate={{
          x: [0, -30, 20, 0],
          y: [0, 30, -40, 0],
          rotate: [0, -45, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        className="relative w-full max-w-xl flex flex-col items-center gap-6 p-8 rounded-2xl backdrop-blur-xl bg-white/5 border border-white/10 shadow-[0_0_60px_rgba(255,255,255,0.05)]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-semibold tracking-tight text-white">
          Gemini Image Generator
        </h1>
        <p className="text-gray-400 text-center text-sm">
          Type your vision. Let Gemini sketch it in light and shadow.
        </p>

        {/* Textarea Section */}
        <div className="w-full bg-white/10 rounded-xl border border-white/10 p-4 flex flex-col gap-3 shadow-inner">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A cinematic portrait of a samurai in fog."
            className="w-full bg-transparent text-white p-3 rounded-lg border border-white/20 focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all resize-none h-28 custom-scrollbar placeholder-gray-500"
            disabled={isLoading}
          />
          <motion.button
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.02 }}
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="w-full flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg border border-white/20 backdrop-blur-md"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <SparklesIcon className="w-5 h-5 text-white" />
                <span>Generate Image</span>
              </>
            )}
          </motion.button>
        </div>

        {error && (
          <div className="text-red-400 bg-red-500/10 border border-red-400/30 p-3 rounded-md w-full text-sm text-center">
            {error}
          </div>
        )}

        {/* Image Display Section */}
        <motion.div
          className="w-full h-96 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center overflow-hidden relative backdrop-blur-sm shadow-inner mt-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {isLoading ? (
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <div className="w-8 h-8 border-4 border-t-transparent border-white rounded-full animate-spin"></div>
              <p>Rendering your vision...</p>
            </div>
          ) : imageUrl ? (
            <motion.div
              className="relative w-full h-full group"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <img
                src={imageUrl}
                alt="Generated by Gemini"
                className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-4 rounded-md backdrop-blur-md transition-all border border-white/20"
                >
                  <DownloadIcon className="w-5 h-5" />
                  Download
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="flex flex-col items-center text-gray-500 text-center p-4">
              <div className="relative w-20 h-20 mb-3">
                <div className="absolute inset-0 bg-white/10 rounded-full animate-pulse"></div>
                <ImageIcon className="w-20 h-20 text-white/30" />
              </div>
              <p className="font-medium text-white/80">Your image will appear here</p>
              <p className="text-xs text-gray-500 mt-1">Monochrome magic awaits 🖤</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ImageGeneratorView;
=======
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { generateImage } from '../services/geminiService';
import { DownloadIcon, SparklesIcon, ImageIcon } from './icons';

const getLoadingMessage = (progress: number): string => {
    if (progress < 20) return "Waking up the sleeping GPUs...";
    if (progress < 45) return "Conjuring pixels from the digital ether...";
    if (progress < 75) return "Painting with bolts of lightning...";
    if (progress < 95) return "Reticulating splines with artistic flair...";
    return "Adding the finishing touches...";
};


const ImageGeneratorView: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [progress, setProgress] = useState(0);

    const loadingMessage = getLoadingMessage(progress);

    useEffect(() => {
        let animationFrameId: number;
        if (isLoading) {
            setProgress(0);
            const startTime = Date.now();
            const estimatedDuration = 15000; // 15 seconds for a full fake progress bar

            const updateProgress = () => {
                const elapsedTime = Date.now() - startTime;
                const calculatedProgress = (elapsedTime / estimatedDuration) * 100;
                
                // Hang at 95% until the actual operation is complete
                setProgress(Math.min(95, calculatedProgress));

                if (elapsedTime < estimatedDuration) {
                    animationFrameId = requestAnimationFrame(updateProgress);
                }
            };
            animationFrameId = requestAnimationFrame(updateProgress);
        }

        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, [isLoading]);

    const handleGenerate = async () => {
        if (!prompt.trim() || isLoading) return;
        setIsLoading(true);
        setError(null);
        setImageUrl(null);
        
        try {
            const url = await generateImage(prompt);
            setProgress(100); // Jump to 100 on completion
            setImageUrl(url);
        } catch (e) {
            console.error(e);
            const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
            setError(`Failed to generate image: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDownload = () => {
        if (!imageUrl) return;
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `gemini-image-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="w-full max-w-lg flex flex-col items-center gap-4 text-white">
            <p className="text-gray-400 text-center">Describe the image you want to create.</p>
            <div className="w-full p-3 rounded-lg bg-black/50 border border-white/10 flex flex-col gap-3">
                <textarea
                    id="image-prompt-input"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., A photorealistic image of a cat wearing a tiny wizard hat, sitting on a pile of ancient books."
                    className="w-full bg-transparent p-2 rounded-md border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none h-24 custom-scrollbar"
                    rows={3}
                    disabled={isLoading}
                />
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !prompt.trim()}
                    className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-md"
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
            
            {error && <div className="text-red-400 bg-red-500/10 p-3 rounded-md w-full text-sm">{error}</div>}
            
            <motion.div 
                className="w-full aspect-square bg-black/50 border border-dashed rounded-lg flex items-center justify-center mt-4 overflow-hidden relative p-4"
                animate={{
                    borderColor: isLoading 
                        ? ["rgba(255, 255, 255, 0.2)", "rgba(168, 85, 247, 0.7)", "rgba(255, 255, 255, 0.2)"]
                        : "rgba(255, 255, 255, 0.2)"
                }}
                transition={{
                    duration: 2.5,
                    repeat: isLoading ? Infinity : 0,
                    ease: "easeInOut"
                }}
            >
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center gap-4 text-gray-400 text-center w-full">
                        <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden border border-white/10">
                            <motion.div
                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full"
                                initial={{ width: '0%' }}
                                animate={{ width: `${progress}%` }}
                                transition={{ ease: "linear", duration: 0.2 }}
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
                     <motion.div className="relative w-full h-full group" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <img src={imageUrl} alt="Generated by Gemini" className="w-full h-full object-contain" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button onClick={handleDownload} className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-4 rounded-md">
                                <DownloadIcon className="w-5 h-5"/>
                                Download
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <div className="flex flex-col items-center text-gray-500 text-center p-4">
                      <div className="w-16 h-16 mb-4 relative">
                        <div className="absolute inset-0 bg-purple-500/10 rounded-full animate-pulse"></div>
                        <ImageIcon className="w-16 h-16 text-purple-400/30"/>
                      </div>
                      <p className="font-medium">Your generated image will appear here</p>
                      <p className="text-xs text-gray-600 mt-1">Let your imagination run wild!</p>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ImageGeneratorView;
>>>>>>> 0c32aca (ai assistant)
