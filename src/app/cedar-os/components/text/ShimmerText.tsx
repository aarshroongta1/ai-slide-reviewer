import { motion } from 'motion/react';
import { useState, useEffect } from 'react';

interface ShimmerTextProps {
  text: string;
  state: 'in_progress' | 'complete';
}

export function ShimmerText({ text, state }: ShimmerTextProps) {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    if (state === 'in_progress') {
      // Simulate typing effect
      let index = 0;
      const interval = setInterval(() => {
        if (index < text.length) {
          setDisplayText(text.slice(0, index + 1));
          index++;
        } else {
          clearInterval(interval);
        }
      }, 50);

      return () => clearInterval(interval);
    } else {
      setDisplayText(text);
    }
  }, [text, state]);

  return (
    <div className="flex items-center space-x-2">
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="text-sm font-medium"
      >
        {displayText}
      </motion.span>
      {state === 'in_progress' && (
        <motion.div
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="w-2 h-2 bg-current rounded-full"
        />
      )}
    </div>
  );
}
