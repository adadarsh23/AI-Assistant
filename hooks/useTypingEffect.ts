import { useState, useEffect, useRef } from 'react';

export const useTypingEffect = (
  fullText: string,
  typingSpeed: number = 50,
  isTyping: boolean = false
) => {
  const [displayedText, setDisplayedText] = useState('');
  const currentIndexRef = useRef(0);
  const timeoutRef = useRef<number | null>(null);
  
  // If not typing, just show the full text immediately.
  const textToDisplay = isTyping ? displayedText : fullText;

  useEffect(() => {
    // Cleanup function to clear any pending timeout
    const cleanup = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
    
    // If we're not supposed to be typing, reset everything.
    if (!isTyping) {
      // Set the full text immediately if typing just finished.
      if (displayedText !== fullText) {
          setDisplayedText(fullText);
      }
      currentIndexRef.current = fullText.length;
      cleanup();
      return;
    }

    // Reset the index if the text changes (e.g., new message)
    if (displayedText.length === 0) {
        currentIndexRef.current = 0;
    }

    const type = () => {
      if (currentIndexRef.current < fullText.length) {
        setDisplayedText((prev) => prev + fullText[currentIndexRef.current]);
        currentIndexRef.current += 1;
        timeoutRef.current = window.setTimeout(type, typingSpeed);
      }
    };

    // Start typing if the displayed text is shorter than the full text
    if (currentIndexRef.current < fullText.length) {
      cleanup(); // Clear any existing timer before starting a new one
      timeoutRef.current = window.setTimeout(type, typingSpeed);
    }

    return cleanup;
  }, [fullText, typingSpeed, isTyping, displayedText]);

  return textToDisplay;
};