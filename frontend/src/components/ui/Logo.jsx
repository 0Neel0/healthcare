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
                {/* Abstract Cross/Plus Shape - symbolizing life/health */}
                <path
                    d="M100 40 C100 40, 100 20, 100 20 C140 20, 160 60, 160 100 C160 140, 140 180, 100 180 C60 180, 40 140, 40 100 C40 60, 60 20, 100 20"
                    fill="#DEEBFF"
                    opacity="0.4"
                />

                {/* Central Medical Cross */}
                <path
                    d="M100 60 L100 140 M60 100 L140 100"
                    stroke="#0052CC"
                    strokeWidth="24"
                    strokeLinecap="round"
                />

                {/* Protective Circle Segment */}
                <path
                    d="M160 100 A 60 60 0 0 1 100 160"
                    stroke="#0052CC"
                    strokeWidth="12"
                    strokeLinecap="round"
                    opacity="0.5"
                />
                <path
                    d="M40 100 A 60 60 0 0 1 100 40"
                    stroke="#0052CC"
                    strokeWidth="12"
                    strokeLinecap="round"
                    opacity="0.5"
                />
            </svg>
            <div>
                <span className={`font-bold text-[#0052CC] flex flex-col leading-none tracking-tight ${textClassName}`}>
                    <span>HealthCare</span>
                    <span className="text-xs font-medium text-slate-400 tracking-widest uppercase ml-0.5">Plus</span>
                </span>
            </div>
        </div>
    );
};

export default Logo;
