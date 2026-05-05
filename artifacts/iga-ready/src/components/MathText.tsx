import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface MathTextProps {
  text: string;
}

export const MathText: React.FC<MathTextProps> = ({ text }) => {
  if (!text) return null;

  // Split text by $ delimiters
  const parts = text.split(/(\$[^$]+\$)/g);

  return (
    <span>
      {parts.map((part, index) => {
        if (part.startsWith('$') && part.endsWith('$')) {
          const content = part.slice(1, -1);
          return <InlineMath key={index}>{content}</InlineMath>;
        }
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
};
