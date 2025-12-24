import React from 'react';

const Logo = ({ className = "w-8 h-8", textClassName = "text-2xl" }) => {
    return (
        <div className="flex items-center gap-2">
            <svg
                viewBox="0 0 200 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={className}
            >
                <defs>
                    <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0ea5e9" /> {/* Sky 500 */}
                        <stop offset="100%" stopColor="#14b8a6" /> {/* Teal 500 */}
                    </linearGradient>
                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>

                {/* Abstract Cross/Plus Shape composed of leaves/petals - symbolizing life/health */}
                <path
                    d="M100 40 C100 40, 100 20, 100 20 C140 20, 160 60, 160 100 C160 140, 140 180, 100 180 C60 180, 40 140, 40 100 C40 60, 60 20, 100 20"
                    fill="url(#logo-gradient)"
                    opacity="0.1"
                />

                {/* Central Medical Cross + Heart fusion */}
                <path
                    d="M100 60 L100 140 M60 100 L140 100"
                    stroke="url(#logo-gradient)"
                    strokeWidth="24"
                    strokeLinecap="round"
                />

                {/* Protective Circle Segment */}
                <path
                    d="M160 100 A 60 60 0 0 1 100 160"
                    stroke="url(#logo-gradient)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    opacity="0.6"
                />
                <path
                    d="M40 100 A 60 60 0 0 1 100 40"
                    stroke="url(#logo-gradient)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    opacity="0.6"
                />
            </svg>
            <div>
                <span className={`font-bold bg-gradient-to-r from-sky-600 to-teal-600 bg-clip-text text-transparent flex flex-col leading-none tracking-tight ${textClassName}`}>
                    <span>HealthCare</span>
                    <span className="text-xs font-medium text-slate-400 tracking-widest uppercase ml-0.5">Plus</span>
                </span>
            </div>
        </div>
    );
};

export default Logo;
