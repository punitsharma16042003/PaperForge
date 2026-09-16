import React from 'react';
import katex from 'katex';

/**
 * Parses and renders text that may contain inline LaTeX ($...$ or \(...\))
 * or display LaTeX ($$...$$ or \[...\]), while preserving standard text.
 */
export const RenderMathText = ({ text = '', className = '' }) => {
  if (!text) return null;

  // Split by LaTeX delimiter patterns
  const parts = text.split(/(\$\$[\s\S]*?\$\$|\$[^\$\n]+\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\))/g);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (!part) return null;

        let math = null;
        let isDisplay = false;

        if (part.startsWith('$$') && part.endsWith('$$')) {
          math = part.slice(2, -2);
          isDisplay = true;
        } else if (part.startsWith('\\[') && part.endsWith('\\]')) {
          math = part.slice(2, -2);
          isDisplay = true;
        } else if (part.startsWith('$') && part.endsWith('$')) {
          math = part.slice(1, -1);
          isDisplay = false;
        } else if (part.startsWith('\\(') && part.endsWith('\\)')) {
          math = part.slice(2, -2);
          isDisplay = false;
        }

        if (math !== null) {
          try {
            const html = katex.renderToString(math, {
              displayMode: isDisplay,
              throwOnError: false
            });
            return (
              <span
                key={index}
                dangerouslySetInnerHTML={{ __html: html }}
                className={isDisplay ? "block my-2 text-center" : "inline-block px-0.5"}
              />
            );
          } catch (e) {
            return <code key={index} className="text-amber-400 bg-slate-800 px-1 rounded">{part}</code>;
          }
        }

        // Standard text, handle newlines
        return part.split('\n').map((line, lIdx, arr) => (
          <React.Fragment key={`${index}-${lIdx}`}>
            {line}
            {lIdx < arr.length - 1 && <br />}
          </React.Fragment>
        ));
      })}
    </span>
  );
};
