import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

export interface TourStep {
    selector?: string;
    title: string;
    content: string;
}

interface OnboardingTourProps {
    steps: TourStep[];
    onComplete: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ steps, onComplete }) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
    const [style, setStyle] = useState<React.CSSProperties>({});
    const [isMounted, setIsMounted] = useState(false);
    const tooltipRef = useRef<HTMLDivElement>(null);

    const currentStep = steps[currentStepIndex];
    const isLastStep = currentStepIndex === steps.length - 1;

    // Effect to find the target element and highlight it
    useLayoutEffect(() => {
        const selector = currentStep.selector;
        if (selector) {
            const element = document.querySelector(selector) as HTMLElement;
            if (element) {
                element.classList.add('tour-highlight');
                element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                
                // We need to wait for the scroll to finish to get the correct rect
                const timer = setTimeout(() => {
                    setTargetRect(element.getBoundingClientRect());
                }, 300); // 300ms is a safe bet for smooth scroll

                return () => {
                    clearTimeout(timer);
                    element.classList.remove('tour-highlight');
                };
            }
        }
        setTargetRect(null); // For steps without a selector
    }, [currentStep.selector, currentStepIndex]);

    // Effect to calculate the tooltip's position
    useLayoutEffect(() => {
        if (!tooltipRef.current) return;

        const tooltip = tooltipRef.current;
        const PADDING = 12;
        let newStyle: React.CSSProperties = {};

        if (!targetRect) {
            // Modal style - center it
            newStyle = {
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
            };
        } else {
            // Tooltip style - position relative to target
            const tooltipHeight = tooltip.offsetHeight;
            const tooltipWidth = tooltip.offsetWidth;

            // Default: position below
            let top = targetRect.bottom + PADDING;
            let left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
            
            // Check for vertical overflow (bottom) and flip to top if needed
            if (top + tooltipHeight > window.innerHeight) {
                top = targetRect.top - tooltipHeight - PADDING;
            }
            
            // Check for horizontal overflow and adjust
            if (left < PADDING) {
                left = PADDING;
            } else if (left + tooltipWidth > window.innerWidth) {
                left = window.innerWidth - tooltipWidth - PADDING;
            }
            
            newStyle = {
                top: `${top}px`,
                left: `${left}px`,
                transform: 'none', // Reset transform as we are now using absolute top/left
            };
        }
        
        setStyle(newStyle);

    }, [targetRect, currentStepIndex]);
    
    useEffect(() => {
      // Prevent body scrolling during tour
      document.body.style.overflow = 'hidden';
      setIsMounted(true);
      return () => {
        document.body.style.overflow = 'auto';
      };
    }, []);

    const handleNext = () => {
        if (isLastStep) {
            onComplete();
        } else {
            setCurrentStepIndex(currentStepIndex + 1);
        }
    };
    
    const handlePrev = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(currentStepIndex - 1);
        }
    };

    if (!isMounted) return null;

    const tourUI = (
      <div className="fixed inset-0 z-[10000]">
        {/* Backdrop for modal steps, handled by tour-highlight class for element steps */}
        {!targetRect && <div className="fixed inset-0 bg-black/70" onClick={onComplete}></div>}

        <AnimatePresence>
            <motion.div
                key={currentStepIndex}
                ref={tooltipRef}
                className="absolute w-[calc(100%-2rem)] max-w-sm rounded-lg border border-white/20 bg-gray-800 text-white shadow-2xl shadow-purple-900/50 p-4"
                style={style}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3 }}
            >
                <h3 className="text-lg font-bold mb-2">{currentStep.title}</h3>
                <p className="text-sm text-gray-300 mb-4">{currentStep.content}</p>
                <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">{`${currentStepIndex + 1} / ${steps.length}`}</span>
                    <div className="flex gap-2">
                         {currentStepIndex > 0 && <button onClick={handlePrev} className="px-3 py-1 text-sm bg-white/10 hover:bg-white/20 rounded-md transition-colors">Prev</button>}
                         <button onClick={handleNext} className="px-3 py-1 text-sm bg-purple-600 hover:bg-purple-700 rounded-md transition-colors">{isLastStep ? 'Finish' : 'Next'}</button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
      </div>
    );
    
    return ReactDOM.createPortal(tourUI, document.body);
};