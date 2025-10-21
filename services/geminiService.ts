import { GoogleGenAI } from "@google/genai";
import type { Message } from "../types";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to format app's message structure into Gemini's content structure
const buildHistory = (messages: Message[]) => {
  return messages
    // The API requires that the history does not contain empty messages.
    // We filter out the temporary empty AI message used for streaming UI.
    .filter(msg => msg.text.trim() !== '') 
    .map(msg => ({
        // Gemini API uses 'model' for AI and 'user' for the human.
        role: msg.sender === 'ai' ? 'model' : 'user',
        parts: [{ text: msg.text }],
    }));
};

export async function streamChat(history: Message[], systemInstruction: string, useGrounding?: boolean) {
    const contents = buildHistory(history);

    const config: {
        systemInstruction: string,
        tools?: { googleSearch: {} }[],
    } = {
        systemInstruction: systemInstruction,
    };

    if (useGrounding) {
        config.tools = [{googleSearch: {}}];
    }

    const responseStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: config,
    });
    
    return responseStream;
}

export async function generateImage(prompt: string): Promise<string> {
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: '1:1',
        },
    });

    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return `data:image/png;base64,${base64ImageBytes}`;
}