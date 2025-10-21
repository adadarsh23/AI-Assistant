<<<<<<< HEAD

import React from 'react';
import type { Persona } from '../types';
=======
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import type { Persona } from '../types';
import { ChevronDownIcon, CheckIcon } from './icons';
>>>>>>> 0c32aca (ai assistant)

interface PersonaSelectorProps {
  personas: Persona[];
  selectedPersona: Persona;
  onPersonaChange: (persona: Persona) => void;
}

const PersonaSelector: React.FC<PersonaSelectorProps> = ({ personas, selectedPersona, onPersonaChange }) => {
<<<<<<< HEAD
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = event.target.value;
    const persona = personas.find(p => p.id === selectedId);
    if (persona) {
      onPersonaChange(persona);
    }
  };

  return (
    <div className="relative w-full max-w-xs">
      <select
        value={selectedPersona.id}
        onChange={handleChange}
        className="w-full appearance-none bg-white/10 text-white py-2 px-4 pr-8 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
      >
        {personas.map((persona) => (
          <option key={persona.id} value={persona.id} className="bg-gray-800 text-white">
            {persona.name}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
=======
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
>>>>>>> 0c32aca (ai assistant)
    </div>
  );
};

<<<<<<< HEAD
export default PersonaSelector;
=======
export default PersonaSelector;
>>>>>>> 0c32aca (ai assistant)
