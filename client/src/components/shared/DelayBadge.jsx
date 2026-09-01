import React from 'react';
import { formatDelay } from '../../utils/formatTime';
import { getDelayBg, getDelayColor } from '../../utils/delayColors';

export default function DelayBadge({ delayMinutes, size = 'md' }) {
  const bg = getDelayBg(delayMinutes);
  const color = getDelayColor(delayMinutes);
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base font-medium'
  };
  
  const text = delayMinutes <= 5 ? 'On Time' : formatDelay(delayMinutes);

  return (
    <span className={`inline-flex items-center rounded-full border ${bg} ${color} ${sizeClasses[size]}`}>
      {text}
    </span>
  );
}
