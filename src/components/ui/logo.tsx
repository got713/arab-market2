import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'icon' | 'footer';
  light?: boolean;
}

export default function Logo({ className = '', variant = 'full', light = false }: LogoProps) {
  const greenColor = light ? '#FFFFFF' : '#182B3A';
  const goldColor = '#C69C5D';
  const textColor = light ? '#FFFFFF' : '#182B3A';
  const subTextColor = goldColor;

  if (variant === 'icon') {
    return (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        {/* Shopping Cart Handle */}
        <path
          d="M25 22C25 20.3431 26.3431 19 28 19H35C36.3197 19 37.4593 19.858 37.8441 21.1188L46.1559 48.3375C46.5407 49.5982 47.6803 50.4562 49 50.4562H75C76.2878 50.4562 77.4045 49.6385 77.8184 48.4206L86.8184 21.9206C87.3876 20.2464 86.14 18.4562 84.3734 18.4562H47"
          stroke={greenColor}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Basket Gold Ribbon */}
        <path
          d="M48 25.5H82.5C83.5 25.5 84 26.5 83.5 27.5C80 34.5 73.5 45.5 73.5 45.5C73.5 45.5 71.5 48.5 67 48.5H49.5"
          stroke={goldColor}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Three Leaves in the Cart */}
        <path
          d="M58 38C58 38 61 31 65 31C69 31 72 38 72 38"
          stroke={greenColor}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M65 31V38"
          stroke={greenColor}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M50 38C50 38 53.5 33 57 33C60.5 33 63.5 38 63.5 38"
          stroke={greenColor}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M57 33V38"
          stroke={greenColor}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M66.5 38C66.5 38 69.5 34 72.5 34C75.5 34 78 38 78 38"
          stroke={greenColor}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M72.5 34V38"
          stroke={greenColor}
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Wheels */}
        <circle cx="51.5" cy="59.5" r="7.5" fill={greenColor} />
        <circle cx="51.5" cy="59.5" r="3.5" fill={goldColor} />
        <circle cx="72.5" cy="59.5" r="7.5" fill={greenColor} />
        <circle cx="72.5" cy="59.5" r="3.5" fill={goldColor} />
      </svg>
    );
  }

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Icon portion */}
      <svg
        viewBox="0 0 100 70"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-12 h-12 flex-shrink-0"
      >
        {/* Speed lines on left */}
        <line x1="10" y1="24" x2="22" y2="24" stroke={goldColor} strokeWidth="4" strokeLinecap="round" />
        <line x1="5" y1="31" x2="20" y2="31" stroke={goldColor} strokeWidth="4" strokeLinecap="round" />
        <line x1="12" y1="38" x2="18" y2="38" stroke={goldColor} strokeWidth="4" strokeLinecap="round" />
        
        {/* Shopping Cart Handle */}
        <path
          d="M24 18C24 16.5 25 15 26.5 15H33C34 15 35 15.5 35.3 16.5L42.5 41.5C42.8 42.5 43.8 43.5 45 43.5H72C73 43.5 74 42.5 74.3 41.5L81.5 21C82 19.5 81 18 79.5 18H45"
          stroke={greenColor}
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Basket Gold Ribbon */}
        <path
          d="M44 23.5H78C78.5 23.5 79 24 78.8 24.5C76 31 71.5 40.5 71.5 40.5C71.5 40.5 70.2 42.5 66 42.5H46"
          stroke={goldColor}
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Three Leaves in the Cart */}
        <path
          d="M56 31.5C56 31.5 58.5 25 62 25C65.5 25 68 31.5 68 31.5"
          stroke={greenColor}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M62 25V31.5"
          stroke={greenColor}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M49 32C49 32 52 27 55 27C58 27 60.5 32 60.5 32"
          stroke={greenColor}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M55 27V32"
          stroke={greenColor}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M63.5 32C63.5 32 66 28 68.5 28C71 28 73 32 73 32"
          stroke={greenColor}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M68.5 28V32"
          stroke={greenColor}
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Wheels */}
        <circle cx="48.5" cy="52.5" r="6.5" fill={greenColor} />
        <circle cx="48.5" cy="52.5" r="3" fill={goldColor} />
        <circle cx="67.5" cy="52.5" r="6.5" fill={greenColor} />
        <circle cx="67.5" cy="52.5" r="3" fill={goldColor} />
      </svg>
      
      {/* Wordmark portion */}
      <div className="flex flex-col leading-none">
        <span
          className="font-bold text-2xl tracking-wide uppercase"
          style={{ color: textColor }}
        >
          Arab
        </span>
        <span
          className="font-semibold text-lg tracking-wider"
          style={{ color: subTextColor }}
        >
          — Market —
        </span>
      </div>
    </div>
  );
}
