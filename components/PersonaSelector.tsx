import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import type { Persona } from '../types';
import { ChevronDownIcon, CheckIcon } from './icons';

interface PersonaSelectorProps {
  personas: Persona[];
  selectedPersona: Persona;
  onPersonaChange: (persona: Persona) => void;
}

const PersonaSelector: React.FC<PersonaSelectorProps> = ({ personas, selectedPersona, onPersonaChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (persona: Persona) => {
    onPersonaChange(persona);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} id="persona-selector" className="relative w-full max-w-md">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-full flex items-center justify-between bg-white/10 text-white py-2 px-4 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-left"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="truncate">{selectedPersona.name}</span>
        <ChevronDownIcon
          className={cn('w-5 h-5 text-gray-400 transform transition-transform', isOpen && 'rotate-180')}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-10 mt-1 w-full bg-gray-800/90 backdrop-blur-md rounded-lg shadow-lg border border-white/20 max-h-60 overflow-auto focus:outline-none custom-scrollbar"
            role="listbox"
          >
            {personas.map((persona) => (
              <li
                key={persona.id}
                onClick={() => handleSelect(persona)}
                className="relative cursor-pointer select-none py-2 pl-10 pr-4 text-white hover:bg-purple-600/50"
                role="option"
                aria-selected={persona.id === selectedPersona.id}
              >
                <span className={cn('block truncate', persona.id === selectedPersona.id ? 'font-semibold' : 'font-normal')}>
                  {persona.name}
                </span>
                {persona.id === selectedPersona.id && (
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-purple-400">
                    <CheckIcon className="w-5 h-5" />
                  </span>
                )}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PersonaSelector;