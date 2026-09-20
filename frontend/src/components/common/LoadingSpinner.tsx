import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  message?: string;
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
  message = 'Loading PRAGATI intelligence...',
  className = ''
}) => {
  const displayText = text || message;
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-14 h-14'
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <div className={`relative ${sizeClasses[size]}`}>
        <div className={`${sizeClasses[size]} rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin`} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
        </div>
      </div>
      {displayText && (
        <p className="text-xs font-medium text-slate-400 mt-3 tracking-wide">{displayText}</p>
      )}
    </div>
  );
};

export default LoadingSpinner;
