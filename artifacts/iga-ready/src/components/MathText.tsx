import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface MathTextProps {
  text: string;
  block?: boolean;
  className?: string;
}

export function MathText({ text, block = false, className }: MathTextProps) {
  // Split text by $...$ to find math parts
  const parts = text.split(/(\$.*?\$)/g);

  return (
    <div className={className}>
      {parts.map((part, i) => {
        if (part.startsWith('$') && part.endsWith('$')) {
          const math = part.slice(1, -1);
          return block ? (
            <BlockMath key={i} math={math} />
          ) : (
            <InlineMath key={i} math={math} />
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </div>
  );
}
