import { motion } from 'motion/react';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ColouredContainerProps {
  children: ReactNode;
  color: 'blue' | 'green' | 'purple' | 'red' | 'yellow' | 'grey';
  className?: string;
}

const colorClasses = {
  blue: 'bg-blue-50 border-blue-200 text-blue-800',
  green: 'bg-green-50 border-green-200 text-green-800',
  purple: 'bg-purple-50 border-purple-200 text-purple-800',
  red: 'bg-red-50 border-red-200 text-red-800',
  yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  grey: 'bg-gray-50 border-gray-200 text-gray-800',
};

export default function ColouredContainer({
  children,
  color,
  className,
}: ColouredContainerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={cn('rounded-lg border p-3', colorClasses[color], className)}
    >
      {children}
    </motion.div>
  );
}
