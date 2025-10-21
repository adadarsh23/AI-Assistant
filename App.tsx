<<<<<<< HEAD
import React, { useState, useEffect } from 'react'
import ModeSwitcher from './components/ModeSwitcher'
import ChatView from './components/ChatView'
import ImageGeneratorView from './components/ImageGeneratorView'
import { WarningIcon } from './components/icons'
import { motion, AnimatePresence } from 'framer-motion'
type Mode = 'chat' | 'image'

const ApiKeyWarning = () => (
  <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', duration: 0.6 }}
      className="bg-red-900/50 border border-red-500/50 rounded-xl p-6 sm:p-8 max-w-md text-center shadow-xl"
    >
      <WarningIcon className="w-12 h-12 mx-auto text-red-400 mb-4" />
      <h2 className="text-2xl font-bold text-white mb-2">API Key Not Found</h2>
      <p className="text-red-300 leading-relaxed text-sm sm:text-base">
        The <code className="text-red-200">API_KEY</code> environment variable
        is missing. Please configure it to enable Gemini AI Studio features.
      </p>
    </motion.div>
  </div>
)

export default function App() {
  const [mode, setMode] = useState<Mode>('chat')
  const [isApiKeyMissing, setIsApiKeyMissing] = useState(false)

  useEffect(() => {
    if (!process.env.API_KEY) {
      setIsApiKeyMissing(true)
    }
  }, [])

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#0d0d15] via-[#111827] to-[#1a1a2e] text-white p-4 sm:p-6 md:p-8 font-sans transition-colors">
      <div className="relative w-full max-w-2xl flex flex-col items-center gap-6 rounded-2xl overflow-hidden shadow-2xl border border-white/10">
        {/* Animated Border */}
        <motion.div
          className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,#c084fc_0%,#60a5fa_50%,#c084fc_100%)] opacity-50 blur-xl"
        />

        {/* Inner Content */}
        <div className="relative w-full bg-black/80 backdrop-blur-2xl rounded-2xl p-6 sm:p-8 flex flex-col items-center gap-6">
          <AnimatePresence>
            {isApiKeyMissing && <ApiKeyWarning />}
          </AnimatePresence>

          {/* Header */}
          <div className="text-center space-y-3 relative z-10">
            {/* <motion.h1
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', duration: 1, bounce: 0.5 }}
              className="text-4xl sm:text-5xl font-bold tracking-wide relative"
            >
              <motion.span
                className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'linear',
                }}
                style={{
                  backgroundSize: '200% auto',
                }}
              >
                AI Assistant
              </motion.span>

              
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 blur-2xl opacity-30"
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </motion.h1> */}

            {/* <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-gray-300/80 text-sm sm:text-base font-light tracking-wide"
            >
              Create, Converse, and Captivate with AI{' '}
              <motion.span
                animate={{ rotate: [0, 14, -14, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="inline-block"
              >
                ✨
              </motion.span>
            </motion.p> */}
          </div>

          {/* Mode Switcher */}
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 blur-xl rounded-full" />
            <ModeSwitcher currentMode={mode} onModeChange={setMode} />
          </motion.div> */}

          {/* Content Area */}
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              className="w-full mt-4"
            >
              {mode === 'chat' ? <ChatView /> : <ImageGeneratorView />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
=======
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import ChatView from './components/ChatView';
import type { ChatViewHandles } from './components/ChatView';
import ImageGeneratorView from './components/ImageGeneratorView';
import PersonaSelector from './components/PersonaSelector';
import { CommandPalette } from './components/CommandPalette';
import type { CommandAction } from './components/CommandPalette';
import { OnboardingTour } from './components/OnboardingTour';
import type { TourStep } from './components/OnboardingTour';
import { WarningIcon, TrashIcon, DownloadIcon } from './components/icons';
import { PERSONAS } from './constants';
import type { Persona } from './types';


type Mode = 'chat' | 'image';

const ApiKeyWarning = () => (
  <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-red-900/50 border border-red-500/50 rounded-xl p-6 max-w-md text-center shadow-lg shadow-red-900/30">
      <WarningIcon className="w-12 h-12 mx-auto text-red-400 mb-3" />
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">API Key Not Found</h2>
      <p className="text-red-300 text-sm sm:text-base">
        The <code>API_KEY</code> environment variable is not set. Please ensure it is configured correctly to use the AI features of this studio.
      </p>
    </div>
  </div>
);

const LAST_PERSONA_ID_KEY = 'gemini-last-persona-id';
const ONBOARDING_KEY = 'gemini-onboarding-completed';

export default function App() {
  const [isApiKeyMissing, setIsApiKeyMissing] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isTourActive, setIsTourActive] = useState(false);
  const chatViewRef = useRef<ChatViewHandles>(null);

  const [selectedPersona, setSelectedPersona] = useState<Persona>(() => {
    const lastPersonaId = localStorage.getItem(LAST_PERSONA_ID_KEY);
    const persona = PERSONAS.find(p => p.id === lastPersonaId);
    return persona || PERSONAS[0];
  });

  useEffect(() => {
    if (!process.env.API_KEY) {
      setIsApiKeyMissing(true);
    }

    const hasCompletedOnboarding = localStorage.getItem(ONBOARDING_KEY);
    if (!hasCompletedOnboarding) {
        setIsTourActive(true);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsPaletteOpen(open => !open);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  const handlePersonaChange = (persona: Persona) => {
    setSelectedPersona(persona);
    localStorage.setItem(LAST_PERSONA_ID_KEY, persona.id);
  };

  const handleTourComplete = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setIsTourActive(false);
  };
  
  const isImageMode = selectedPersona.id === 'image-generator';

  const tourSteps: TourStep[] = [
    {
        selector: 'h1',
        title: "Welcome to AI Assistant!",
        content: "This quick tour will walk you through the key features. Let's get started!",
    },
    {
        selector: '#persona-selector',
        title: "Select a Persona",
        content: "Choose an AI assistant or the Image Generator from this menu. Each persona has a unique personality and purpose.",
    },
    {
        selector: isImageMode ? '#image-prompt-input' : '#chat-input',
        title: isImageMode ? "Describe Your Image" : "Chat with the AI",
        content: isImageMode ? "Type a detailed description of the image you want to create here." : "Type your message here to start a conversation with the selected AI persona.",
    },
    {
        selector: '#command-palette-hint',
        title: "Command Palette",
        content: "Press Ctrl+K (or Cmd+K) anywhere to quickly switch personas, clear your chat, and more.",
    }
  ];
  const commandActions: CommandAction[] = [
    ...PERSONAS.map(p => ({
      id: `persona-${p.id}`,
      name: `Switch to ${p.name}`,
      section: 'Personas',
      icon: (
        <span className="text-xs font-bold w-full h-full flex items-center justify-center bg-white/10 rounded-sm text-purple-300">
          {p.name.split(' ').map(word => word.charAt(0)).join('').toUpperCase()}
        </span>
      ),
      onExecute: () => {
        handlePersonaChange(p);
        setIsPaletteOpen(false);
      },
    })),
    {
      id: 'clear-chat',
      name: 'Clear Chat History',
      section: 'Actions',
      icon: <TrashIcon className="w-5 h-5" />,
      onExecute: () => {
        if (!isImageMode) {
          chatViewRef.current?.clearChat();
        }
        setIsPaletteOpen(false);
      },
    },
    {
      id: 'export-chat',
      name: 'Export Chat History',
      section: 'Actions',
      icon: <DownloadIcon className="w-5 h-5" />,
      onExecute: () => {
        if (!isImageMode) {
          chatViewRef.current?.exportChat();
        }
        setIsPaletteOpen(false);
      },
    },
  ];
  

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start bg-[#0b0b0f] text-gray-200 p-4 sm:p-6 md:p-8 font-sans">
      {/* Decorative gradient background glow */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-80 w-[36rem] bg-[radial-gradient(ellipse_at_center,rgba(88,28,135,0.15),transparent_60%)] blur-2xl" />
        <div className="absolute -bottom-40 left-1/3 h-80 w-[36rem] bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.12),transparent_60%)] blur-2xl" />
      </div>

      <div className="relative w-full max-w-3xl flex flex-col items-center p-[1.5px] sm:p-[2px] rounded-2xl">
        {/* Keep animated border for md+ to save battery on mobile */}
        <motion.div
          className="hidden md:block absolute -inset-1 rounded-2xl bg-[conic-gradient(from_90deg_at_50%_50%,#a78bfa_0%,#3730a3_50%,#a78bfa_100%)] opacity-70"
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        <div className="relative w-full rounded-2xl border border-white/10 bg-neutral-900/70 backdrop-blur-xl shadow-2xl shadow-black/40 p-4 sm:p-6 md:p-7">
          {isApiKeyMissing && <ApiKeyWarning />}

          <div className="text-center mb-5 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-wide">
              AI Assistant
            </h1>
            <p className="text-gray-400 mt-2 text-sm sm:text-base">
              Create, Converse, and Captivate with AI
            </p>
          </div>

          <div id="persona-selector-container" className="w-full flex justify-center mb-4 sm:mb-6">
            <PersonaSelector
              personas={PERSONAS}
              selectedPersona={selectedPersona}
              onPersonaChange={handlePersonaChange}
            />
          </div>

          <div id="command-palette-hint" className="w-full text-center text-[11px] sm:text-xs text-gray-500 mb-3 sm:mb-4 -mt-1">
            Pro-tip: Press <kbd className="px-1.5 py-0.5 border border-white/20 bg-white/10 rounded">Ctrl+K</kbd> to open the command palette.
          </div>

          <div className="w-full flex justify-center">
            {isImageMode ? <ImageGeneratorView /> : <ChatView ref={chatViewRef} selectedPersona={selectedPersona} />}
          </div>
        </div>
      </div>

      <CommandPalette isOpen={isPaletteOpen} setIsOpen={setIsPaletteOpen} actions={commandActions} />
      {isTourActive && <OnboardingTour steps={tourSteps} onComplete={handleTourComplete} />}
    </div>
  );
}
>>>>>>> 0c32aca (ai assistant)
