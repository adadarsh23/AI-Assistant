import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';
import { ChatIcon, ImageIcon } from './icons';

type Mode = 'chat' | 'image';

interface ModeSwitcherProps {
  currentMode: Mode;
  onModeChange: (mode: Mode) => void;
}

const modes: { id: Mode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'chat', label: 'Chat', icon: ChatIcon },
  { id: 'image', label: 'Image', icon: ImageIcon },
];

const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ currentMode, onModeChange }) => {
  return (
<<<<<<< HEAD
    <div className="flex items-center space-x-2 rounded-full bg-black/50 p-1.5 border border-white/10">
=======
    <div className="flex w-full justify-center border-b border-white/10">
>>>>>>> 0c32aca (ai assistant)
      {modes.map((mode) => (
        <button
          key={mode.id}
          onClick={() => onModeChange(mode.id)}
          className={cn(
<<<<<<< HEAD
            'relative flex items-center gap-2 w-full rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none',
            currentMode === mode.id ? 'text-white' : 'text-gray-400 hover:text-white'
          )}
        >
          {currentMode === mode.id && (
            <motion.div
              layoutId="active-mode-pill"
              className="absolute inset-0 bg-purple-600/50 rounded-full"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
          )}
          <mode.icon className="w-4 h-4 z-10" />
          <span className="z-10">{mode.label}</span>
=======
            'relative flex items-center justify-center gap-2 w-36 px-4 py-3 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded-t-md',
            currentMode === mode.id
              ? 'text-white'
              : 'text-gray-400 hover:text-white'
          )}
        >
          <mode.icon className="w-5 h-5" />
          <span>{mode.label}</span>
          
          {currentMode === mode.id && (
            <motion.div
              layoutId="active-mode-underline"
              className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-purple-500"
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            />
          )}
>>>>>>> 0c32aca (ai assistant)
        </button>
      ))}
    </div>
  );
};

export default ModeSwitcher;