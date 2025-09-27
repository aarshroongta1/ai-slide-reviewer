import React from 'react';
import { useSpell } from 'cedar-os';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

export interface RadialMenuItem {
  title: string;
  icon: LucideIcon;
  onInvoke: () => void;
}

interface RadialMenuSpellProps {
  spellId: string;
  items: RadialMenuItem[];
  activationConditions: unknown;
}

export default function RadialMenuSpell({
  spellId,
  items,
  activationConditions,
}: RadialMenuSpellProps) {
  const { isActive, activate, deactivate } = useSpell({
    id: spellId,
    activationConditions,
    onActivate: () => console.log('Radial menu activated'),
    onDeactivate: () => console.log('Radial menu deactivated'),
  });

  const handleItemClick = (item: RadialMenuItem) => {
    item.onInvoke();
    deactivate();
  };

  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
      onClick={deactivate}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center space-y-4">
          {items.map((item, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleItemClick(item)}
              className="flex items-center space-x-3 px-6 py-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <item.icon className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-900 dark:text-white">
                {item.title}
              </span>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
