<<<<<<< HEAD
import React, { useState, useEffect, useRef, memo, useReducer } from "react";
import { motion } from "framer-motion";
import { SendIcon, UserIcon, TrashIcon } from "./icons";
import { cn } from "../lib/utils";
import { createChatSession } from '../services/geminiService';
import type { Message, Persona } from '../types';
import type { Chat } from "@google/genai";
import { MarkdownContent } from "./MarkdownContent";

// --- State Management with useReducer ---

type ChatState = {
  messages: Message[];
  isTyping: boolean;
  error: string | null;
};

type ChatAction =
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'UPDATE_LAST_AI_MESSAGE'; payload: string }
  | { type: 'SET_IS_TYPING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET'; payload: Message };

const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return { ...state, messages: [...state.messages, action.payload] };
    case 'UPDATE_LAST_AI_MESSAGE':
      return {
        ...state,
        messages: state.messages.map((msg, index) =>
          index === state.messages.length - 1 && msg.sender === 'ai'
            ? { ...msg, text: msg.text + action.payload }
            : msg
        ),
      };
    case 'SET_IS_TYPING':
      return { ...state, isTyping: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'RESET':
      return { messages: [action.payload], isTyping: false, error: null };
    default:
      return state;
  }
};

// --- Child Components ---

const TypingIndicator = () => (
    <motion.div
      className="flex items-start gap-3 w-full justify-start"
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
    >
      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-1">
        <span className="text-sm">🤖</span>
      </div>
      <div className="flex items-center gap-1.5 px-3 py-3 rounded-xl max-w-[30%] bg-gray-700/50 message-bubble ai-bubble">
          <span className="w-2 h-2 rounded-full bg-white/80 animate-pulse"></span>
          <span style={{ animationDelay: '0.2s' }} className="w-2 h-2 rounded-full bg-white/80 animate-pulse"></span>
          <span style={{ animationDelay: '0.4s' }} className="w-2 h-2 rounded-full bg-white/80 animate-pulse"></span>
      </div>
    </motion.div>
);

const BlinkingCursor = () => <span className="inline-block w-2 h-4 bg-white/90 animate-blink ml-1" />;

const MemoizedMessage = memo(({ msg, persona, isLastAiMessage, isTyping }: { msg: Message; persona: Persona; isLastAiMessage: boolean, isTyping: boolean }) => {
    const isUser = msg.sender === "user";
    const personaEmoji = persona.name.split(' ')[0];

    return (
        <motion.div
            layout // This enables smooth animation when content changes size
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, type: "spring", stiffness: 150, damping: 20 }}
            className={cn("flex items-start gap-3 w-full", isUser ? "justify-end" : "justify-start")}
        >
            {!isUser && (
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm">{personaEmoji}</span>
                </div>
            )}
            <div
                className={cn(
                    "relative px-4 py-2 rounded-xl max-w-[85%] shadow-md break-words message-bubble",
                    isUser
                        ? "bg-purple-600 text-white user-bubble"
                        : "bg-gray-700/50 text-white ai-bubble"
                )}
            >
                <MarkdownContent content={msg.text} />
                {isLastAiMessage && isTyping && <BlinkingCursor />}
            </div>
            {isUser && (
                <div className="w-8 h-8 rounded-full bg-purple-300/20 text-purple-200 flex items-center justify-center flex-shrink-0 mt-1">
                    <UserIcon className="w-5 h-5" />
                </div>
            )}
        </motion.div>
    );
});

// --- Main Component ---

export default function AIChatCard({ persona }: { persona: Persona }) {
  const [input, setInput] = useState("");
  const chatSession = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getInitialMessage = (p: Persona): Message => ({
    sender: "ai",
    text: `👋 Hello! I’m your ${p.name}. How can I help you today?`,
  });

  const [state, dispatch] = useReducer(chatReducer, {
    messages: [getInitialMessage(persona)],
    isTyping: false,
    error: null,
  });

  const { messages, isTyping, error } = state;

  useEffect(() => {
    chatSession.current = createChatSession(persona.systemInstruction);
    dispatch({ type: 'RESET', payload: getInitialMessage(persona) });
  }, [persona]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
=======
// import React, { useState, useRef, useEffect, useMemo } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import type { Message, Persona } from '../types';
// import { MarkdownContent } from './MarkdownContent';
// import { useTypingEffect } from '../hooks/useTypingEffect';
// import { 
//   SendIcon, 
//   TrashIcon, 
//   DownloadIcon, 
//   CloseIcon, 
//   RefreshIcon, 
//   BookmarkIcon,
//   SparklesIcon,
//   PlayIcon
// } from './icons';

// interface AIChatCardProps {
//   persona: Persona;
//   messages: Message[];
//   isTyping: boolean;
//   error: string | null;
//   onSendMessage: (message: string) => void;
//   onClearChat: () => void;
//   onExportChat: () => void;
//   onDismissError: () => void;
//   onOpenSessionManager: () => void;
//   onRetry: () => void;
// }

// const CodePreview: React.FC<{ code: string; onClose: () => void }> = ({ code, onClose }) => (
//     <motion.div 
//         className="code-preview-container"
//         initial={{ opacity: 0, scale: 0.95, y: 10 }}
//         animate={{ opacity: 1, scale: 1, y: 0 }}
//         exit={{ opacity: 0, scale: 0.95, y: 10 }}
//         transition={{ type: 'spring', stiffness: 400, damping: 25 }}
//     >
//         <div className="code-preview-header">
//             <div className="window-controls">
//                 <div className="window-dot bg-red-500"></div>
//                 <div className="window-dot bg-yellow-500"></div>
//                 <div className="window-dot bg-green-500"></div>
//             </div>
//             <div className="code-preview-title">
//                 <span className="live-indicator"></span>
//                 <span>Live Preview</span>
//             </div>
//             <button onClick={onClose} className="code-preview-close-btn">
//                 <CloseIcon className="w-4 h-4" />
//             </button>
//         </div>
//         <iframe
//             srcDoc={code}
//             title="Code Preview"
//             sandbox="allow-scripts allow-modals allow-forms"
//             className="w-full h-96 bg-white rounded-b-lg"
//             loading="lazy"
//         />
//     </motion.div>
// );

// const AIMessageBubble: React.FC<{ message: Message; isTyping: boolean; personaName: string }> = ({ message, isTyping, personaName }) => {
//     const [showPreview, setShowPreview] = useState(false);
//     const typedText = useTypingEffect(message.text, 30, isTyping);

//     const previewCode = useMemo(() => {
//         const match = message.text.match(/```html-preview\n([\s\S]*?)```/);
//         return match ? match[1] : null;
//     }, [message.text]);

//     return (
//         <div className="flex items-start gap-3">
//             <div className="w-8 h-8 rounded-full bg-purple-500/50 flex items-center justify-center text-purple-300 font-bold flex-shrink-0 text-sm">
//               {personaName.charAt(0)}
//             </div>
//             <div className="bg-white/5 p-3 rounded-lg rounded-tl-none max-w-full overflow-x-auto w-full">
//                 <MarkdownContent content={typedText} />
                
//                 {previewCode && !isTyping && (
//                     <div className="mt-3 pt-3 border-t border-white/10">
//                         <button 
//                             onClick={() => setShowPreview(!showPreview)} 
//                             className="flex items-center gap-2 text-sm font-semibold bg-purple-600/50 hover:bg-purple-600/80 px-3 py-1.5 rounded-md transition-colors"
//                         >
//                             <PlayIcon className="w-4 h-4" />
//                             {showPreview ? 'Close Preview' : 'Run Preview'}
//                         </button>
//                     </div>
//                 )}
                
//                 {message.sources && message.sources.length > 0 && (
//                     <div className="mt-3 pt-3 border-t border-white/10">
//                         <h4 className="text-xs font-semibold text-gray-400 mb-1">Sources:</h4>
//                         <ul className="text-xs space-y-1">
//                             {message.sources.map((source, i) => (
//                                 <li key={i} className="truncate">
//                                     <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline">
//                                         {i + 1}. {source.title || source.uri}
//                                     </a>
//                                 </li>
//                             ))}
//                         </ul>
//                     </div>
//                 )}
                
//                 <AnimatePresence>
//                     {showPreview && previewCode && (
//                         <CodePreview code={previewCode} onClose={() => setShowPreview(false)} />
//                     )}
//                 </AnimatePresence>
//             </div>
//         </div>
//     );
// };


// const UserMessageBubble: React.FC<{ message: Message }> = ({ message }) => (
//     <div className="flex justify-end">
//         <div className="bg-blue-600/50 p-3 rounded-lg rounded-br-none max-w-lg">
//             <p className="text-white whitespace-pre-wrap">{message.text}</p>
//         </div>
//     </div>
// );

// const SystemInstructionCard: React.FC<{ instruction: string }> = ({ instruction }) => (
//     <motion.div
//         className="bg-black/30 border border-purple-500/30 rounded-lg p-4 text-sm text-gray-300"
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5, delay: 0.2 }}
//     >
//         <div className="flex items-start gap-3">
//             <SparklesIcon className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
//             <div>
//                 <h3 className="font-semibold text-white mb-1">Persona Active</h3>
//                 <blockquote className="border-l-2 border-purple-500/50 pl-3 italic text-gray-400">
//                     {instruction}
//                 </blockquote>
//             </div>
//         </div>
//     </motion.div>
// );


// const AIChatCard: React.FC<AIChatCardProps> = ({
//   persona,
//   messages,
//   isTyping,
//   error,
//   onSendMessage,
//   onClearChat,
//   onExportChat,
//   onDismissError,
//   onOpenSessionManager,
//   onRetry,
// }) => {
//   const [input, setInput] = useState('');
//   const messagesEndRef = useRef<HTMLDivElement>(null);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   useEffect(scrollToBottom, [messages, isTyping]);

//   const handleSend = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (input.trim()) {
//       onSendMessage(input);
//       setInput('');
//     }
//   };

//   const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       handleSend(e);
//     }
//   };
  
//   const isNewChat = messages.length === 1 && messages[0].sender === 'ai';

//   return (
//     <div className="w-full h-full flex flex-col bg-black/50 border border-white/10 rounded-lg shadow-lg">
//       {/* Card Header */}
//       <div className="flex items-center justify-between p-3 border-b border-white/10 flex-shrink-0">
//         <h2 className="font-semibold text-white">{persona.name}</h2>
//         <div className="flex items-center gap-2">
//             <button onClick={onOpenSessionManager} title="Save/Load Sessions" className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"><BookmarkIcon className="w-5 h-5"/></button>
//             <button onClick={onExportChat} title="Export Chat" className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"><DownloadIcon className="w-5 h-5"/></button>
//             <button onClick={onClearChat} title="Clear Chat" className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-colors"><TrashIcon className="w-5 h-5"/></button>
//         </div>
//       </div>

//       {/* Messages List */}
//       <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar">
//           {isNewChat && persona.systemInstruction && (
//             <SystemInstructionCard instruction={persona.systemInstruction} />
//           )}
//           {messages.map((msg, index) => {
//               const isLast = index === messages.length - 1;
//               if (msg.sender === 'ai') {
//                   return <AIMessageBubble key={index} message={msg} isTyping={isTyping && isLast} personaName={persona.name} />;
//               }
//               return <UserMessageBubble key={index} message={msg} />;
//           })}
//           <div ref={messagesEndRef} />
//       </div>
      
//       {/* Error Display */}
//       <AnimatePresence>
//         {error && (
//           <motion.div
//             initial={{ opacity: 0, y: 10 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: 10 }}
//             className="p-3 border-t border-red-500/30 bg-red-900/30 text-red-300 text-sm flex items-center justify-between gap-4"
//           >
//             <div className="flex-1">
//               <p className="font-semibold">An error occurred</p>
//               <p className="text-xs mt-1">{error}</p>
//             </div>
//             <div className="flex items-center gap-2">
//                 <button onClick={onRetry} className="p-1.5 rounded-md hover:bg-white/10" title="Retry last message"><RefreshIcon className="w-5 h-5"/></button>
//                 <button onClick={onDismissError} className="p-1.5 rounded-md hover:bg-white/10" title="Dismiss error"><CloseIcon className="w-5 h-5"/></button>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Chat Input */}
//       <div className="p-3 border-t border-white/10 flex-shrink-0">
//         <form onSubmit={handleSend} className="relative">
//           <textarea
//             id="chat-input"
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             onKeyDown={handleKeyDown}
//             placeholder={`Message ${persona.name}...`}
//             className="w-full text-white bg-white/5 p-3 pr-12 rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none custom-scrollbar"
//             rows={1}
//             style={{ maxHeight: '120px' }}
//             onInput={(e) => {
//                 const target = e.target as HTMLTextAreaElement;
//                 target.style.height = 'auto';
//                 target.style.height = `${target.scrollHeight}px`;
//             }}
//             disabled={isTyping}
//           />
//           <button
//             type="submit"
//             disabled={!input.trim() || isTyping}
//             className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
//             aria-label="Send message"
//           >
//             <SendIcon className="w-5 h-5 text-white" />
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AIChatCard;

// AIChatCard.tsx
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
        {/* Keep subtle grayscale dots */}
        <div className="window-dot bg-gray-500"></div>
        <div className="window-dot bg-gray-400"></div>
        <div className="window-dot bg-gray-300"></div>
      </div>
      <div className="code-preview-title">
        <span className="live-indicator"></span>
        <span className="text-gray-200">Live Preview</span>
      </div>
      <button onClick={onClose} className="code-preview-close-btn hover:bg-white/10 rounded-md p-1.5">
        <CloseIcon className="w-4 h-4 text-gray-200" />
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
      {/* Avatar: grayscale */}
      <div className="w-8 h-8 rounded-full bg-gray-700/60 flex items-center justify-center text-gray-100 font-bold flex-shrink-0 text-sm">
        {personaName.charAt(0)}
      </div>

      {/* Bubble: grayscale bg, subtle border, readable text */}
      <div className="bg-white/5 p-3 rounded-lg rounded-tl-none max-w-full overflow-x-auto w-full border border-white/10">
        <MarkdownContent content={typedText} />

        {previewCode && !isTyping && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <button 
              onClick={() => setShowPreview(!showPreview)} 
              className="flex items-center gap-2 text-sm font-semibold bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-md transition-colors text-gray-100"
            >
              <PlayIcon className="w-4 h-4 text-gray-200" />
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
                  <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-gray-200 hover:underline">
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
    {/* User bubble: higher-contrast grayscale */}
    <div className="bg-gray-200 text-gray-900 p-3 rounded-lg rounded-br-none max-w-lg">
      <p className="whitespace-pre-wrap">{message.text}</p>
    </div>
  </div>
);

const SystemInstructionCard: React.FC<{ instruction: string }> = ({ instruction }) => (
  <motion.div
    className="bg-black/30 border border-white/20 rounded-lg p-4 text-sm text-gray-300"
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.2 }}
  >
    <div className="flex items-start gap-3">
      <SparklesIcon className="w-5 h-5 text-gray-300 mt-0.5 flex-shrink-0" />
      <div>
        <h3 className="font-semibold text-white mb-1">Persona Active</h3>
        <blockquote className="border-l-2 border-white/30 pl-3 italic text-gray-400">
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
>>>>>>> 0c32aca (ai assistant)
  };

  useEffect(scrollToBottom, [messages, isTyping]);

<<<<<<< HEAD
  const handleClearChat = () => {
    chatSession.current = createChatSession(persona.systemInstruction);
    dispatch({ type: 'RESET', payload: getInitialMessage(persona) });
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    
    const userInput = input;
    setInput("");
    
    dispatch({ type: 'ADD_MESSAGE', payload: { sender: 'user', text: userInput } });
    dispatch({ type: 'SET_IS_TYPING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    // Add an empty AI message placeholder to stream into
    dispatch({ type: 'ADD_MESSAGE', payload: { sender: 'ai', text: '' } });

    try {
        if (!chatSession.current) throw new Error("Chat session not initialized.");
        
        const stream = await chatSession.current.sendMessageStream({ message: userInput });

        for await (const chunk of stream) {
            dispatch({ type: 'UPDATE_LAST_AI_MESSAGE', payload: chunk.text });
        }

    } catch (e) {
        console.error(e);
        const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
        dispatch({ type: 'SET_ERROR', payload: `Error: ${errorMessage}. Please check your API key and network connection.` });
        // Remove the empty AI message placeholder on error
        dispatch({ type: 'ADD_MESSAGE', payload: { sender: 'ai', text: '' } }); // This feels wrong. Let's fix this.
        dispatch({
          type: 'RESET',
          payload: {
            sender: 'ai',
            text: "Sorry, an error occurred. Please try again."
          }
        });

    } finally {
        dispatch({ type: 'SET_IS_TYPING', payload: false });
    }
  };

  return (
    <div className={cn("relative w-full max-w-[420px] h-[600px] rounded-2xl overflow-hidden p-[2px] shadow-2xl shadow-purple-900/40")}>
      <div className="relative flex flex-col w-full h-full rounded-xl border border-white/10 overflow-hidden bg-black/80 backdrop-blur-2xl">
        <div className="px-4 py-3 border-b border-white/10 relative z-10 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{persona.name}</h2>
          <div className="flex items-center gap-2">
            <button onClick={handleClearChat} title="Clear chat" className="p-1 text-gray-400 hover:text-white transition-colors">
              <TrashIcon className="w-4 h-4" />
            </button>
            <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" title="Online"></div>
          </div>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto space-y-5 text-sm flex flex-col relative z-10 custom-scrollbar">
          {messages.map((msg, i) => (
             <MemoizedMessage 
                key={i} 
                msg={msg} 
                persona={persona} 
                isLastAiMessage={i === messages.length - 1 && msg.sender === 'ai'}
                isTyping={isTyping}
             />
          ))}

          {isTyping && messages[messages.length-1].sender === 'user' && <TypingIndicator />}

          {error && (
            <div className="px-3 py-2 rounded-xl bg-red-500/20 text-red-300 text-xs self-start">
              {error}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex items-center gap-2 p-3 border-t border-white/10 relative z-10">
          <input
            className="flex-1 px-3 py-2 text-sm bg-black/50 rounded-lg border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/80 transition-all placeholder:text-gray-500"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={isTyping}
          />
          <button
            onClick={handleSend}
            disabled={isTyping || !input.trim()}
            className="p-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Send message"
            aria-busy={isTyping}
          >
            <SendIcon className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
=======
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
    <div className="w-full h-full flex flex-col bg-black/60 border border-white/10 rounded-lg shadow-lg">
      {/* Header: grayscale buttons */}
      <div className="flex items-center justify-between p-3 border-b border-white/10 flex-shrink-0">
        <h2 className="font-semibold text-white">{persona.name}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSessionManager}
            title="Save/Load Sessions"
            className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-md transition-colors"
          >
            <BookmarkIcon className="w-5 h-5" />
          </button>
          <button
            onClick={onExportChat}
            title="Export Chat"
            className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-md transition-colors"
          >
            <DownloadIcon className="w-5 h-5" />
          </button>
          <button
            onClick={onClearChat}
            title="Clear Chat"
            className="p-1.5 text-gray-300 hover:text-white hover:bg-white/10 rounded-md transition-colors"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-3 sm:p-4 space-y-4 overflow-y-auto custom-scrollbar">
        {isNewChat && persona.systemInstruction && (
          <SystemInstructionCard instruction={persona.systemInstruction} />
        )}
        {messages.map((msg, index) => {
          const isLast = index === messages.length - 1;
          if (msg.sender === 'ai') {
            return (
              <AIMessageBubble
                key={index}
                message={msg}
                isTyping={isTyping && isLast}
                personaName={persona.name}
              />
            );
          }
          return <UserMessageBubble key={index} message={msg} />;
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="p-3 border-t border-white/10 bg-white/5 text-gray-200 text-sm flex items-center justify-between gap-4"
          >
            <div className="flex-1">
              <p className="font-semibold">An error occurred</p>
              <p className="text-xs mt-1">{error}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={onRetry} className="p-1.5 rounded-md hover:bg-white/10" title="Retry last message">
                <RefreshIcon className="w-5 h-5 text-gray-200" />
              </button>
              <button onClick={onDismissError} className="p-1.5 rounded-md hover:bg-white/10" title="Dismiss error">
                <CloseIcon className="w-5 h-5 text-gray-200" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input: monochrome + responsive sizing */}
      <div className="p-3 border-t border-white/10 flex-shrink-0">
        <form onSubmit={handleSend} className="relative">
          <textarea
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${persona.name}...`}
            className="w-full text-gray-100 placeholder-gray-500 bg-white/5 p-3 pr-12 rounded-lg border border-white/15 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all resize-none custom-scrollbar text-sm sm:text-base"
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
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-gray-100 hover:bg-white disabled:bg-gray-600 disabled:text-gray-200 disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
          >
            <SendIcon className="w-5 h-5 text-gray-900" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIChatCard;
>>>>>>> 0c32aca (ai assistant)
