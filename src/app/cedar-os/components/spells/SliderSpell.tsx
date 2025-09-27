import React, { useState } from 'react';
import { useSpell } from 'cedar-os';
import { motion } from 'motion/react';

export interface RangeMetadata {
  min: number;
  max: number;
  icon: string;
  text: string;
  color: string;
}

interface SliderSpellProps {
  spellId: string;
  activationConditions: unknown;
  sliderConfig: {
    min: number;
    max: number;
    step: number;
    unit: string;
    ranges: RangeMetadata[];
    label: string;
  };
  onComplete: (value: number) => void;
  onChange: (value: number) => void;
}

export default function SliderSpell({
  spellId,
  activationConditions,
  sliderConfig,
  onComplete,
  onChange,
}: SliderSpellProps) {
  const { isActive, activate, deactivate } = useSpell({
    id: spellId,
    activationConditions,
    onActivate: () => console.log('Slider activated'),
    onDeactivate: () => console.log('Slider deactivated'),
  });
  const [value, setValue] = useState(sliderConfig.min);

  const handleSliderChange = (newValue: number) => {
    setValue(newValue);
    onChange(newValue);
  };

  const handleComplete = () => {
    onComplete(value);
    deactivate();
  };

  const getCurrentRange = () => {
    return sliderConfig.ranges.find(
      (range) => value >= range.min && value <= range.max
    );
  };

  const currentRange = getCurrentRange();

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
          {sliderConfig.label}
        </h3>

        <div className="space-y-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {value} {sliderConfig.unit}
            </div>
            {currentRange && (
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {currentRange.text.replace('${value}', value.toString())}
              </div>
            )}
          </div>

          <div className="px-4">
            <input
              type="range"
              min={sliderConfig.min}
              max={sliderConfig.max}
              step={sliderConfig.step}
              value={value}
              onChange={(e) => handleSliderChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${
                  ((value - sliderConfig.min) /
                    (sliderConfig.max - sliderConfig.min)) *
                  100
                }%, #e5e7eb ${
                  ((value - sliderConfig.min) /
                    (sliderConfig.max - sliderConfig.min)) *
                  100
                }%, #e5e7eb 100%)`,
              }}
            />
          </div>

          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{sliderConfig.min}</span>
            <span>{sliderConfig.max}</span>
          </div>
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
