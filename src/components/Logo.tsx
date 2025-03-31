
import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className = "", size = "md" }: LogoProps) {
  const sizeClasses = {
    sm: "h-8",
    md: "h-10",
    lg: "h-12"
  };

  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src="/scamguard-logo.png" 
        alt="ScamGuard Logo" 
        className={`${sizeClasses[size]} w-auto object-contain`}
      />
    </div>
  );
}

export default Logo;
