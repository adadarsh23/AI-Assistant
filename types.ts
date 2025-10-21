export interface Message {
  sender: 'ai' | 'user';
  text: string;
  timestamp?: number;
  sources?: { uri: string; title: string }[];
}

export interface Persona {
  id: string;
  name: string;
  systemInstruction?: string;
  grounding?: boolean;
}

export interface ChatSession {
  id: string;
  name: string;
  timestamp: number;
  messages: Message[];
}

export interface SavedSessions {
  [personaId: string]: ChatSession[];
}
