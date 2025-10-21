<<<<<<< HEAD
import React, { useState } from 'react';
import AIChatCard from './AIChatCard';
import { PERSONAS } from '../constants';
import type { Persona } from '../types';
import PersonaSelector from './PersonaSelector';

const ChatView: React.FC = () => {
  const [selectedPersona, setSelectedPersona] = useState<Persona>(PERSONAS[0]);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
        <PersonaSelector
            personas={PERSONAS}
            selectedPersona={selectedPersona}
            onPersonaChange={setSelectedPersona}
        />
        <AIChatCard persona={selectedPersona} key={selectedPersona.id} />
    </div>
  );
}

=======
import React, { useState, useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import { streamChat } from '../services/geminiService';
import type { Message, Persona, ChatSession } from '../types';
import AIChatCard from './AIChatCard';
import SessionManagerModal from './SessionManagerModal';
import { v4 as uuidv4 } from 'uuid';

export interface ChatViewHandles {
  clearChat: () => void;
  exportChat: () => void;
}

interface ChatViewProps {
  selectedPersona: Persona;
}

const getInitialMessages = (persona: Persona): Message[] => [
  {
    sender: 'ai',
    text: persona.systemInstruction 
      ? `Hello! I'm ${persona.name}. How can I help you today?` 
      : 'This persona is for image generation. Please select a different persona to chat.',
    timestamp: Date.now(),
  },
];

const SESSION_STORAGE_KEY = 'gemini-chat-sessions';
const AUTOSAVE_INTERVAL = 2 * 60 * 1000; // 2 minutes

const ChatView = forwardRef<ChatViewHandles, ChatViewProps>(({ selectedPersona }, ref) => {
  const [messages, setMessages] = useState<Message[]>(() => getInitialMessages(selectedPersona));
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const [isSessionManagerOpen, setIsSessionManagerOpen] = useState(false);
  const [savedSessions, setSavedSessions] = useState<Record<string, ChatSession[]>>({});
  const [isChatDirty, setIsChatDirty] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedSessions = localStorage.getItem(SESSION_STORAGE_KEY);
      if (storedSessions) {
        setSavedSessions(JSON.parse(storedSessions));
      }
    } catch (e) {
      console.error("Failed to load sessions from local storage", e);
    }
  }, []);
  
  const personaSessions = savedSessions[selectedPersona.id] || [];

  const saveSessions = (newSessions: Record<string, ChatSession[]>) => {
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newSessions));
      setSavedSessions(newSessions);
    } catch (e) {
      console.error("Failed to save sessions to local storage", e);
    }
  };

  // Auto-save logic
  useEffect(() => {
    const autosave = () => {
      // A chat is worthy of autosaving if it's dirty and has more than the initial system message.
      if (isChatDirty && messages.length > 1) {
        console.log('Autosaving chat...');
        const autosaveId = `autosave-${selectedPersona.id}`;
        const existingSessions = savedSessions[selectedPersona.id] || [];
        
        const existingAutosaveIndex = existingSessions.findIndex(s => s.id === autosaveId);
        
        let newPersonaSessions;
        const autosaveSession: ChatSession = {
            id: autosaveId,
            name: `[Autosave]`,
            timestamp: Date.now(),
            messages: messages,
        };

        if (existingAutosaveIndex !== -1) {
            newPersonaSessions = [...existingSessions];
            newPersonaSessions[existingAutosaveIndex] = autosaveSession;
        } else {
            newPersonaSessions = [...existingSessions, autosaveSession];
        }

        const updatedSessions = {
            ...savedSessions,
            [selectedPersona.id]: newPersonaSessions,
        };
        saveSessions(updatedSessions);
        setIsChatDirty(false); // Reset dirty state after autosave
      }
    };

    const intervalId = setInterval(autosave, AUTOSAVE_INTERVAL);
    return () => clearInterval(intervalId);
  }, [isChatDirty, messages, selectedPersona, savedSessions]);


  // Reset chat when persona changes
  useEffect(() => {
    setMessages(getInitialMessages(selectedPersona));
    setError(null);
    setIsLoading(false);
    setIsChatDirty(false);
    setActiveSessionId(null);
    if (abortControllerRef.current) {
        abortControllerRef.current.abort();
    }
  }, [selectedPersona]);

  const clearChat = () => {
    setMessages(getInitialMessages(selectedPersona));
    setError(null);
    setIsChatDirty(false);
    setActiveSessionId(null);
  };
  
  const exportChat = () => {
    const chatContent = messages.map(msg => `[${new Date(msg.timestamp!).toISOString()}] ${msg.sender.toUpperCase()}:\n${msg.text}\n\n`).join('');
    const blob = new Blob([chatContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gemini-chat-${selectedPersona.id}-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useImperativeHandle(ref, () => ({
    clearChat,
    exportChat,
  }));

  const handleSendMessage = async (input: string) => {
    if (isLoading) return;

    setError(null);
    setIsLoading(true);
    setIsChatDirty(true);
    setActiveSessionId(null); // New message invalidates "active" session status

    const userMessage: Message = { sender: 'user', text: input, timestamp: Date.now() };
    const aiMessage: Message = { sender: 'ai', text: '', timestamp: Date.now(), sources: [] };
    const currentMessages = [...messages, userMessage];

    setMessages([...currentMessages, aiMessage]);

    abortControllerRef.current = new AbortController();

    try {
        if (!selectedPersona.systemInstruction) {
            throw new Error("This persona does not support chat.");
        }
        
        const stream = await streamChat(currentMessages, selectedPersona.systemInstruction, selectedPersona.grounding);
        
        let fullResponse = '';
        let sources: { uri: string, title: string }[] = [];

        for await (const chunk of stream) {
            if (abortControllerRef.current.signal.aborted) {
                console.log("Stream aborted");
                break;
            }
            
            const chunkText = chunk.text;
            if (chunkText) {
              fullResponse += chunkText;
              setMessages(prev => prev.map((msg, index) => 
                  index === prev.length - 1 ? { ...msg, text: fullResponse } : msg
              ));
            }
            
            const groundingMetadata = chunk.candidates?.[0]?.groundingMetadata;
            if (groundingMetadata?.groundingChunks) {
                sources = groundingMetadata.groundingChunks
                    .map((c: any) => ({ uri: c.web?.uri, title: c.web?.title }))
                    .filter((s: any) => s.uri && s.title);
            }
        }
        
        setMessages(prev => prev.map((msg, index) => 
            index === prev.length - 1 ? { ...msg, text: fullResponse, sources: sources.length > 0 ? sources : undefined } : msg
        ));

    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`Failed to get response: ${errorMessage}`);
      // Remove the empty AI message on error
      setMessages(currentMessages);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleRetry = () => {
    const lastUserMessage = messages.filter(m => m.sender === 'user').pop();
    if (lastUserMessage) {
      const messagesWithoutLast = messages.slice(0, messages.lastIndexOf(lastUserMessage));
      setMessages(messagesWithoutLast);
      handleSendMessage(lastUserMessage.text);
    }
  };

  const handleSaveSession = (name: string) => {
    const newSession: ChatSession = {
      id: uuidv4(),
      name: name,
      timestamp: Date.now(),
      messages: messages,
    };
    
    // A manual save supersedes any existing autosave, so we remove it.
    const updatedPersonaSessions = personaSessions.filter(s => s.id !== `autosave-${selectedPersona.id}`);
    updatedPersonaSessions.push(newSession);

    const updatedSessions = {
      ...savedSessions,
      [selectedPersona.id]: updatedPersonaSessions,
    };
    saveSessions(updatedSessions);
    setIsChatDirty(false);
    setActiveSessionId(newSession.id); // The newly saved session is now the active one
  };

  const handleLoadSession = (sessionId: string) => {
    const sessionToLoad = personaSessions.find(s => s.id === sessionId);
    if (sessionToLoad) {
      setMessages(sessionToLoad.messages);
      setIsSessionManagerOpen(false);
      setIsChatDirty(false);
      setActiveSessionId(sessionId);
    }
  };

  const handleDeleteSession = (sessionId: string) => {
    const updatedPersonaSessions = personaSessions.filter(s => s.id !== sessionId);
    const updatedSessions = {
      ...savedSessions,
      [selectedPersona.id]: updatedPersonaSessions,
    };
    saveSessions(updatedSessions);
  };
  
  return (
    <>
      <AIChatCard
        persona={selectedPersona}
        messages={messages}
        isTyping={isLoading}
        error={error}
        onSendMessage={handleSendMessage}
        onClearChat={clearChat}
        onExportChat={exportChat}
        onDismissError={() => setError(null)}
        onOpenSessionManager={() => setIsSessionManagerOpen(true)}
        onRetry={handleRetry}
      />
      <SessionManagerModal
        isOpen={isSessionManagerOpen}
        onClose={() => setIsSessionManagerOpen(false)}
        sessions={personaSessions}
        onSaveSession={handleSaveSession}
        onLoadSession={handleLoadSession}
        onDeleteSession={handleDeleteSession}
        currentMessages={messages}
        onNewChat={clearChat}
        activeSessionId={activeSessionId}
      />
    </>
  );
});

>>>>>>> 0c32aca (ai assistant)
export default ChatView;