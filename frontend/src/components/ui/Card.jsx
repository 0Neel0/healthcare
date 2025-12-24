import React from 'react';

const Card = ({
    children,
    className = '',
    hover = false,
    gradient = false,
    ...props
}) => {
    const baseClasses = 'rounded-2xl p-6 glass-effect';
    const hoverClasses = hover ? 'card-hover cursor-pointer' : '';
    const gradientClasses = gradient ? 'bg-gradient-subtle border-brand-100' : 'bg-white';

    return (
        <div
            className={`${baseClasses} ${hoverClasses} ${gradientClasses} ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export default Card;
