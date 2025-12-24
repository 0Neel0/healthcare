import React from 'react';

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    onClick,
    type = 'button',
    disabled = false,
    className = '',
    ...props
}) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500/50';

    const variantClasses = {
        primary: 'btn-gradient',
        secondary: 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm',
        success: 'btn-success',
        danger: 'btn-danger',
        outline: 'btn-outline',
        ghost: 'btn-ghost',
    };

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
        md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
        lg: 'px-8 py-3.5 text-base rounded-2xl gap-2.5',
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;
