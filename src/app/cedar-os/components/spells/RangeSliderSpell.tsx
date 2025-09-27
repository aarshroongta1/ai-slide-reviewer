import React, { useState } from 'react';
import { useSpell } from 'cedar-os';
import { motion } from 'motion/react';

export interface RangeOption {
  value: number;
  text: string;
  icon: string;
  color: string;
}

interface RangeSliderSpellProps {
  spellId: string;
  activationConditions: unknown;
  rangeSliderConfig: {
    options: RangeOption[];
    unit: string;
    proportionalSpacing: boolean;
  };
  onComplete: (value: number, optionIndex: number) => void;
  onChange: (value: number, optionIndex: number) => void;
}

export default function RangeSliderSpell({
  spellId,
  activationConditions,
  rangeSliderConfig,
  onComplete,
  onChange,
}: RangeSliderSpellProps) {
  const { isActive, activate, deactivate } = useSpell({
    id: spellId,
    activationConditions,
    onActivate: () => console.log('Range slider activated'),
    onDeactivate: () => console.log('Range slider deactivated'),
  });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleOptionSelect = (index: number) => {
    setSelectedIndex(index);
    const option = rangeSliderConfig.options[index];
    onChange(option.value, index);
  };

  const handleComplete = () => {
    const option = rangeSliderConfig.options[selectedIndex];
    onComplete(option.value, selectedIndex);
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
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Select Analysis Range
        </h3>

        <div className="space-y-3">
          {rangeSliderConfig.options.map((option, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleOptionSelect(index)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg border-2 transition-all ${
                selectedIndex === index
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              <span className="text-2xl">{option.icon}</span>
              <div className="flex-1 text-left">
                <div className="font-medium text-gray-900 dark:text-white">
                  {option.text.replace('${value}', option.value.toString())}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {option.value} {rangeSliderConfig.unit}
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={deactivate}
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleComplete}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Analyze
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
