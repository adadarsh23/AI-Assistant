import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Message, Persona } from '../types';
import { MarkdownContent } from './MarkdownContent';
import { useTypingEffect } from '../hooks/useTypingEffect';
import { 
  SendIcon, 
  TrashIcon, 
  DownloadIcon, 
  CloseIcon, 
  RefreshIcon, 
  BookmarkIcon,
  SparklesIcon,
  PlayIcon
} from './icons';

interface AIChatCardProps {
  persona: Persona;
  messages: Message[];
  isTyping: boolean;
  error: string | null;
  onSendMessage: (message: string) => void;
  onClearChat: () => void;
  onExportChat: () => void;
  onDismissError: () => void;
  onOpenSessionManager: () => void;
  onRetry: () => void;
}

const CodePreview: React.FC<{ code: string; onClose: () => void }> = ({ code, onClose }) => (
    <motion.div 
        className="code-preview-container"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
        <div className="code-preview-header">
            <div className="window-controls">
                <div className="window-dot bg-red-500"></div>
                <div className="window-dot bg-yellow-500"></div>
                <div className="window-dot bg-green-500"></div>
            </div>
            <div className="code-preview-title">
                <span className="live-indicator"></span>
                <span>Live Preview</span>
            </div>
            <button onClick={onClose} className="code-preview-close-btn">
                <CloseIcon className="w-4 h-4" />
            </button>
        </div>
        <iframe
            srcDoc={code}
            title="Code Preview"
            sandbox="allow-scripts allow-modals allow-forms"
            className="w-full h-96 bg-white rounded-b-lg"
            loading="lazy"
        />
    </motion.div>
);

const AIMessageBubble: React.FC<{ message: Message; isTyping: boolean; personaName: string }> = ({ message, isTyping, personaName }) => {
    const [showPreview, setShowPreview] = useState(false);
    const typedText = useTypingEffect(message.text, 30, isTyping);

    const previewCode = useMemo(() => {
        const match = message.text.match(/```html-preview\n([\s\S]*?)```/);
        return match ? match[1] : null;
    }, [message.text]);

    return (
        <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-500/50 flex items-center justify-center text-purple-300 font-bold flex-shrink-0 text-sm">
              {personaName.charAt(0)}
            </div>
            <div className="bg-white/5 p-3 rounded-lg rounded-tl-none max-w-full overflow-x-auto w-full">
                <MarkdownContent content={typedText} />
                
                {previewCode && !isTyping && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                        <button 
                            onClick={() => setShowPreview(!showPreview)} 
                            className="flex items-center gap-2 text-sm font-semibold bg-purple-600/50 hover:bg-purple-600/80 px-3 py-1.5 rounded-md transition-colors"
                        >
                            <PlayIcon className="w-4 h-4" />
                            {showPreview ? 'Close Preview' : 'Run Preview'}
                        </button>
                    </div>
                )}
                
                {message.sources && message.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                        <h4 className="text-xs font-semibold text-gray-400 mb-1">Sources:</h4>
                        <ul className="text-xs space-y-1">
                            {message.sources.map((source, i) => (
                                <li key={i} className="truncate">
                                    <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">
                                        {i + 1}. {source.title || source.uri}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                
                <AnimatePresence>
                    {showPreview && previewCode && (
                        <CodePreview code={previewCode} onClose={() => setShowPreview(false)} />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};


const UserMessageBubble: React.FC<{ message: Message }> = ({ message }) => (
    <div className="flex justify-end">
        <div className="bg-blue-600/50 p-3 rounded-lg rounded-br-none max-w-lg">
            <p className="text-white whitespace-pre-wrap">{message.text}</p>
        </div>
    </div>
);

const SystemInstructionCard: React.FC<{ instruction: string }> = ({ instruction }) => (
    <motion.div
        className="bg-black/30 border border-purple-500/30 rounded-lg p-4 text-sm text-gray-300"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
    >
        <div className="flex items-start gap-3">
            <SparklesIcon className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
            <div>
                <h3 className="font-semibold text-white mb-1">Persona Active</h3>
                <blockquote className="border-l-2 border-purple-500/50 pl-3 italic text-gray-400">
                    {instruction}
                </blockquote>
            </div>
        </div>
    </motion.div>
);


const AIChatCard: React.FC<AIChatCardProps> = ({
  persona,
  messages,
  isTyping,
  error,
  onSendMessage,
  onClearChat,
  onExportChat,
  onDismissError,
  onOpenSessionManager,
  onRetry,
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };
  
  const isNewChat = messages.length === 1 && messages[0].sender === 'ai';

  return (
    <div className="w-full h-full flex flex-col bg-black/50 border border-white/10 rounded-lg shadow-lg">
      {/* Card Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/10 flex-shrink-0">
        <h2 className="font-semibold text-white">{persona.name}</h2>
        <div className="flex items-center gap-2">
            <button onClick={onOpenSessionManager} title="Save/Load Sessions" className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"><BookmarkIcon className="w-5 h-5"/></button>
            <button onClick={onExportChat} title="Export Chat" className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"><DownloadIcon className="w-5 h-5"/></button>
            <button onClick={onClearChat} title="Clear Chat" className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"><TrashIcon className="w-5 h-5"/></button>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar">
          {isNewChat && persona.systemInstruction && (
            <SystemInstructionCard instruction={persona.systemInstruction} />
          )}
          {messages.map((msg, index) => {
              const isLast = index === messages.length - 1;
              if (msg.sender === 'ai') {
                  return <AIMessageBubble key={index} message={msg} isTyping={isTyping && isLast} personaName={persona.name} />;
              }
              return <UserMessageBubble key={index} message={msg} />;
          })}
          <div ref={messagesEndRef} />
      </div>
      
      {/* Error Display */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="p-3 border-t border-red-500/30 bg-red-900/30 text-red-300 text-sm flex items-center justify-between gap-4"
          >
            <div className="flex-1">
              <p className="font-semibold">An error occurred</p>
              <p className="text-xs mt-1">{error}</p>
            </div>
            <div className="flex items-center gap-2">
                <button onClick={onRetry} className="p-1.5 rounded-md hover:bg-white/10" title="Retry last message"><RefreshIcon className="w-5 h-5"/></button>
                <button onClick={onDismissError} className="p-1.5 rounded-md hover:bg-white/10" title="Dismiss error"><CloseIcon className="w-5 h-5"/></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Input */}
      <div className="p-3 border-t border-white/10 flex-shrink-0">
        <form onSubmit={handleSend} className="relative">
          <textarea
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${persona.name}...`}
            className="w-full bg-white/5 p-3 pr-12 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none custom-scrollbar"
            rows={1}
            style={{ maxHeight: '120px' }}
            onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = `${target.scrollHeight}px`;
            }}
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
          >
            <SendIcon className="w-5 h-5 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIChatCard;