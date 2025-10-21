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
        <div className="bg-red-900/50 border border-red-500/50 rounded-lg p-6 max-w-md text-center">
            <WarningIcon className="w-12 h-12 mx-auto text-red-400 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">API Key Not Found</h2>
            <p className="text-red-300">
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
        title: "Welcome to Gemini AI Studio!",
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
    <div className="min-h-screen w-full flex flex-col items-center justify-start bg-transparent p-4 sm:p-6 md:p-8 font-sans">
      <div className="relative w-full max-w-3xl flex flex-col items-center p-[2px] rounded-2xl">
          <motion.div
              className="absolute -inset-1 rounded-2xl bg-[conic-gradient(from_90deg_at_50%_50%,#e2cbff_0%,#393bb2_50%,#e2cbff_100%)]"
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          />
          <div className="relative w-full bg-black/80 backdrop-blur-2xl rounded-2xl border border-white/10 p-4 sm:p-6 flex flex-col items-center">
              {isApiKeyMissing && <ApiKeyWarning />}
              
              <div className="text-center mb-6">
                  <h1 className="text-4xl font-bold text-white tracking-wider">Gemini AI Studio</h1>
                  <p className="text-gray-400 mt-2">Create, Converse, and Captivate with AI</p>
              </div>

              <div id="persona-selector-container" className="w-full flex justify-center mb-6">
                <PersonaSelector
                    personas={PERSONAS}
                    selectedPersona={selectedPersona}
                    onPersonaChange={handlePersonaChange}
                />
              </div>

               <div id="command-palette-hint" className="w-full text-center text-xs text-gray-500 mb-4 -mt-2">
                Pro-tip: Press <kbd className="px-1.5 py-0.5 border border-white/20 bg-white/10 rounded">Ctrl+K</kbd> to open the command palette.
              </div>
              
              <div className="w-full">
                  {isImageMode
                    ? <ImageGeneratorView />
                    : <ChatView ref={chatViewRef} selectedPersona={selectedPersona} />
                  }
              </div>
          </div>
      </div>
      <CommandPalette 
        isOpen={isPaletteOpen} 
        setIsOpen={setIsPaletteOpen} 
        actions={commandActions}
      />
      {isTourActive && <OnboardingTour steps={tourSteps} onComplete={handleTourComplete} />}
    </div>
  );
}