import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChatSession, Message } from '../types';
import { TrashIcon, CloseIcon } from './icons';
import { cn } from '../lib/utils';

interface SessionManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: ChatSession[];
  onSaveSession: (name: string) => void;
  onLoadSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  currentMessages: Message[];
  onNewChat: () => void;
  activeSessionId: string | null;
}

const SessionManagerModal: React.FC<SessionManagerModalProps> = ({
  isOpen,
  onClose,
  sessions,
  onSaveSession,
  onLoadSession,
  onDeleteSession,
  currentMessages,
  onNewChat,
  activeSessionId,
}) => {
  const [sessionName, setSessionName] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  const latestSessionId = sessions.length > 0 ? sessions.sort((a,b) => b.timestamp - a.timestamp)[0].id : null;

  const handleSave = () => {
    if (sessionName.trim()) {
      onSaveSession(sessionName.trim());
      setSessionName('');
    }
  };

  const handleNewChat = () => {
      onNewChat();
      onClose();
  }
  
  const handleDeleteClick = (sessionId: string) => {
    if (deleteConfirmId === sessionId) {
      onDeleteSession(sessionId);
      setDeleteConfirmId(null);
    } else {
      setDeleteConfirmId(sessionId);
    }
  };

  // A session is considered "savable" if there's more than the initial AI message.
  const isSavable = currentMessages.length > 1;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => {
            onClose();
            setDeleteConfirmId(null);
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="w-full max-w-lg rounded-xl border border-white/20 bg-gray-900/80 shadow-2xl shadow-purple-900/50 flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">Chat Sessions</h2>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white">
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            
            {/* Save Current Session */}
            <div className="p-4 border-b border-white/10">
              <h3 className="text-sm font-semibold text-gray-300 mb-2">Save Current Chat</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={sessionName}
                  onChange={e => setSessionName(e.target.value)}
                  placeholder="Enter a name for this session..."
                  className="flex-grow bg-white/5 p-2 rounded-md border border-white/20 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={!isSavable}
                />
                <button
                  onClick={handleSave}
                  disabled={!sessionName.trim() || !isSavable}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold px-4 py-2 rounded-md text-sm transition-colors"
                >
                  Save
                </button>
              </div>
              {!isSavable && <p className="text-xs text-gray-500 mt-2">Start a conversation to save the session.</p>}
            </div>

            {/* Saved Sessions List */}
            <div className="p-4 flex-1 overflow-y-auto max-h-[50vh] custom-scrollbar">
              <div className="flex justify-between items-center mb-2">
                 <h3 className="text-sm font-semibold text-gray-300">Load a Session</h3>
                 <button 
                    onClick={handleNewChat}
                    className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
                 >
                    Start New Chat
                 </button>
              </div>

              {sessions.length > 0 ? (
                <ul className="space-y-2">
                  {sessions.sort((a, b) => b.timestamp - a.timestamp).map(session => {
                    const isAutosaved = session.id.startsWith('autosave-');
                    const isActive = session.id === activeSessionId;
                    const isLatest = session.id === latestSessionId;

                    return (
                      <li key={session.id} className={cn(
                        "group flex items-center justify-between bg-white/5 p-2 rounded-md transition-all duration-300",
                         isActive ? "border border-purple-500 shadow-lg shadow-purple-900/50" : "border border-transparent hover:bg-white/10"
                      )}>
                        <button onClick={() => onLoadSession(session.id)} className="flex-1 text-left overflow-hidden pr-2">
                          <p className="font-medium text-white truncate">{session.name}</p>
                          <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                            <span>{new Date(session.timestamp).toLocaleString()}</span>
                            {isAutosaved && <span className="text-xs bg-yellow-800/50 text-yellow-300 px-1.5 py-0.5 rounded-full">[Autosave]</span>}
                            {isActive && <span className="text-xs bg-purple-600/50 text-purple-300 px-1.5 py-0.5 rounded-full font-semibold">Active</span>}
                            {isLatest && !isAutosaved && !isActive && <span className="text-xs bg-blue-600/50 text-blue-300 px-1.5 py-0.5 rounded-full">Latest</span>}
                          </div>
                        </button>
                        
                        <div className="flex-shrink-0 flex items-center gap-1">
                            {deleteConfirmId === session.id && (
                                <>
                                 <button onClick={() => setDeleteConfirmId(null)} className="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-500 rounded-md">Cancel</button>
                                 <button onClick={() => handleDeleteClick(session.id)} className="px-2 py-1 text-xs bg-red-600 hover:bg-red-500 rounded-md">Confirm</button>
                                </>
                            )}
                            {deleteConfirmId !== session.id && (
                                <button 
                                  onClick={() => handleDeleteClick(session.id)}
                                  className="p-2 text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                                  title="Delete session"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                      </li>
                    )
                  })}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">No saved sessions for this persona.</p>
                </div>
              )}
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SessionManagerModal;