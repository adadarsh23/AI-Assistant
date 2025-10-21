<<<<<<< HEAD

export interface Message {
  sender: 'ai' | 'user';
  text: string;
=======
export interface Message {
  sender: 'ai' | 'user';
  text: string;
  timestamp?: number;
  sources?: { uri: string; title: string }[];
>>>>>>> 0c32aca (ai assistant)
}

export interface Persona {
  id: string;
  name: string;
<<<<<<< HEAD
  systemInstruction: string;
=======
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
>>>>>>> 0c32aca (ai assistant)
}
