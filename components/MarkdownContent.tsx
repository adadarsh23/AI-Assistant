import React, { useEffect, useState, useRef } from 'react';
import { marked } from 'marked';
import hljs from 'highlight.js';

// The `highlight` option is deprecated in `marked.setOptions`.
// The modern approach is to override the `code` renderer using `marked.use()`.
marked.setOptions({
  gfm: true,
  breaks: true,
});

marked.use({
  renderer: {
    // The renderer function for `code` in `marked` extensions receives a single
    // token object, not separate arguments for code, language, and escaped status.
    // The `Code` token contains `text` (the code) and `lang` (the language).
    code(token) {
      const language = hljs.getLanguage(token.lang || '') ? token.lang || '' : 'plaintext';
      const highlightedCode = hljs.highlight(token.text, {
        language,
        ignoreIllegals: true,
      }).value;

      // The renderer function is responsible for the entire block.
      // We add the `language-` class for CSS and for the copy button logic.
      return `<pre><code class="language-${language}">${highlightedCode}</code></pre>`;
    },
  },
});

interface MarkdownContentProps {
  content: string;
}

export const MarkdownContent: React.FC<MarkdownContentProps> = ({ content }) => {
  const [htmlContent, setHtmlContent] = useState('');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const parsedHtml = marked.parse(content) as string;
    setHtmlContent(parsedHtml);
  }, [content]);

  useEffect(() => {
    if (contentRef.current) {
      const preElements = contentRef.current.querySelectorAll('pre');
      preElements.forEach(pre => {
        // Prevent adding multiple headers on re-renders
        if (pre.querySelector('.code-block-header')) {
          return;
        }

        const code = pre.querySelector('code');
        if (!code) return;

        // 1. Create header element
        const header = document.createElement('div');
        header.className = 'code-block-header';

        // 2. Extract language name from code block's class
        const langClass = [...code.classList].find(c => c.startsWith('language-'));
        const langName = langClass ? langClass.replace('language-', '') : 'text';
        
        const langSpan = document.createElement('span');
        langSpan.className = 'language-name';
        langSpan.innerText = langName;

        // 3. Create copy button with new icons
        const copyButton = document.createElement('button');
        copyButton.className = 'copy-code-btn';
        copyButton.title = 'Copy code';
        const iconSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>`;
        const checkSVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        copyButton.innerHTML = iconSVG;
        
        let timeoutId: number;
        copyButton.addEventListener('click', (e) => {
          e.stopPropagation();
          navigator.clipboard.writeText(code.innerText);
          
          copyButton.innerHTML = checkSVG;
          copyButton.classList.add('copied');
          
          clearTimeout(timeoutId);
          timeoutId = window.setTimeout(() => {
            copyButton.innerHTML = iconSVG;
            copyButton.classList.remove('copied');
          }, 2000);
        });
        
        // 4. Assemble the header with copy button on left, language on right
        header.appendChild(copyButton);
        header.appendChild(langSpan);

        // 5. Wrap the original code content to handle padding and scrolling
        const codeWrapper = document.createElement('div');
        codeWrapper.className = 'code-wrapper custom-scrollbar';
        
        // Move the original <code> element into the new wrapper
        codeWrapper.appendChild(code);

        // 6. Add the new header and wrapper to the <pre> element
        pre.insertBefore(header, pre.firstChild);
        pre.appendChild(codeWrapper);
      });
    }
  }, [htmlContent]);

  return (
    <div
      ref={contentRef}
      className="markdown-content"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
};