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
    const baseClasses = 'inline-flex items-center justify-center font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[#0052CC]/20';

    const variantClasses = {
        primary: 'btn-gradient',
        medical: 'btn-medical',
        demo: 'btn-demo',
        'primary-blue': 'btn-primary-blue',
        secondary: 'bg-white border border-[#DFE1E6] text-[#42526E] hover:bg-[#F4F5F7] hover:border-[#C1C7D0] shadow-sm',
        success: 'btn-success',
        danger: 'btn-danger',
        outline: 'btn-outline',
        ghost: 'btn-ghost',
    };

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-xs rounded-md gap-1.5',
        md: 'px-5 py-2.5 text-sm rounded-lg gap-2',
        lg: 'px-8 py-3.5 text-base rounded-lg gap-2.5',
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
