import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

export interface CommandAction {
  id: string;
  name: string;
  section: string;
  shortcut?: string;
  icon: React.ReactNode;
  onExecute: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  actions: CommandAction[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, setIsOpen, actions }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    // Reset search when palette is opened/closed
    setQuery('');
    setSelectedIndex(0);
  }, [isOpen]);

  const filteredActions = useMemo(() => {
    if (!query) return actions;
    return actions.filter(action =>
      action.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [query, actions]);
  
  const groupedActions = useMemo(() => {
    // FIX: Use a forEach loop for grouping to ensure correct type inference, resolving issues with `reduce`.
    const acc: Record<string, CommandAction[]> = {};
    filteredActions.forEach((action) => {
        (acc[action.section] = acc[action.section] || []).push(action);
    });
    return acc;
  }, [filteredActions]);

  const flatActions = Object.values(groupedActions).flat();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % flatActions.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + flatActions.length) % flatActions.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const action = flatActions[selectedIndex];
        if (action) {
          action.onExecute();
        }
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, flatActions, selectedIndex, setIsOpen]);

  useEffect(() => {
    // Scroll selected item into view
    const selectedElement = document.getElementById(`palette-item-${selectedIndex}`);
    selectedElement?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center pt-24 p-4"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="w-full max-w-lg rounded-xl border border-white/20 bg-gray-900/80 shadow-2xl shadow-purple-900/50 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <input
              type="text"
              placeholder="Type a command or search..."
              value={query}
              onChange={e => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              className="w-full p-4 bg-transparent text-white placeholder-gray-500 focus:outline-none border-b border-white/20"
              autoFocus
            />
            <div className="max-h-[400px] overflow-y-auto palette-scrollbar">
              {Object.entries(groupedActions).map(([section, actionsInSection]) => (
                <div key={section} className="p-2">
                  <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">{section}</h3>
                  <ul className="mt-1">
                    {actionsInSection.map(action => {
                       const currentIndex = flatActions.findIndex(a => a.id === action.id);
                       return (
                        <li
                            key={action.id}
                            id={`palette-item-${currentIndex}`}
                            onClick={action.onExecute}
                            className={cn(
                            'flex items-center gap-3 p-2 rounded-md cursor-pointer text-gray-300 transition-colors',
                            selectedIndex === currentIndex ? 'bg-purple-600/50 text-white' : 'hover:bg-white/10'
                            )}
                        >
                            <span className="w-6 h-6 flex items-center justify-center">{action.icon}</span>
                            <span>{action.name}</span>
                        </li>
                       )
                    })}
                  </ul>
                </div>
              ))}
              {filteredActions.length === 0 && (
                <p className="p-4 text-center text-gray-500">No results found.</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};