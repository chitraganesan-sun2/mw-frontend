import React from "react";

const ErrorMsg = () => {
    return (
        <div className="flex-center min-h-[50vh] w-full h-full max-h-[90vh] flex-col gap-6 px-4">
            {/* Lightweight SVG illustration - replaces 0.86 MB GIF */}
            <svg
                className="w-full h-full max-w-[400px] max-h-[400px]"
                viewBox="0 0 400 400"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-label="Something went wrong illustration"
            >
                {/* Background circle */}
                <circle cx="200" cy="200" r="180" fill="#FEF2F2" />
                
                {/* Sad cloud shape */}
                <g className="animate-bounce" style={{ animationDuration: '3s' }}>
                    <ellipse cx="200" cy="160" rx="80" ry="60" fill="#EF4444" opacity="0.2" />
                    <ellipse cx="160" cy="170" rx="50" ry="40" fill="#EF4444" opacity="0.2" />
                    <ellipse cx="240" cy="170" rx="50" ry="40" fill="#EF4444" opacity="0.2" />
                </g>
                
                {/* Sad face */}
                <g>
                    {/* Left eye */}
                    <circle cx="170" cy="180" r="8" fill="#DC2626" />
                    <path d="M 170 188 L 165 195" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" />
                    
                    {/* Right eye */}
                    <circle cx="230" cy="180" r="8" fill="#DC2626" />
                    <path d="M 230 188 L 235 195" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" />
                    
                    {/* Sad mouth */}
                    <path 
                        d="M 170 220 Q 200 210 230 220" 
                        stroke="#DC2626" 
                        strokeWidth="4" 
                        strokeLinecap="round"
                        fill="none"
                    />
                </g>
                
                {/* Error symbols */}
                <g opacity="0.6">
                    {/* X mark top left */}
                    <g className="animate-pulse" style={{ animationDuration: '2s' }}>
                        <line x1="80" y1="80" x2="100" y2="100" stroke="#F87171" strokeWidth="3" strokeLinecap="round" />
                        <line x1="100" y1="80" x2="80" y2="100" stroke="#F87171" strokeWidth="3" strokeLinecap="round" />
                    </g>
                    
                    {/* X mark top right */}
                    <g className="animate-pulse" style={{ animationDuration: '2.5s' }}>
                        <line x1="300" y1="80" x2="320" y2="100" stroke="#F87171" strokeWidth="3" strokeLinecap="round" />
                        <line x1="320" y1="80" x2="300" y2="100" stroke="#F87171" strokeWidth="3" strokeLinecap="round" />
                    </g>
                    
                    {/* Exclamation mark bottom */}
                    <g className="animate-pulse" style={{ animationDuration: '2.2s' }}>
                        <line x1="200" y1="280" x2="200" y2="310" stroke="#F87171" strokeWidth="4" strokeLinecap="round" />
                        <circle cx="200" cy="325" r="4" fill="#F87171" />
                    </g>
                </g>
            </svg>
            
            <div className="text-center space-y-2 max-w-md">
                <h2 className="text-2xl font-semibold text-gray-900">
                    Oops! Something went wrong
                </h2>
                <p className="text-gray-600 text-sm">
                    We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.
                </p>
            </div>
        </div>
    );
};

export default ErrorMsg;
