import React from 'react';
import { Controller } from 'react-hook-form';
import DatePicker from '../ui/DatePicker';

const FormField = ({
    label,
    name,
    type = 'text',
    register,
    control, // Added for DatePicker
    error,
    required = false,
    placeholder = '',
    options = [],
    ...props
}) => {
    const renderInput = () => {
        // DatePicker field
        if (type === 'datepicker') {
            return (
                <Controller
                    name={name}
                    control={control}
                    rules={{ required: required && `${label} is required` }}
                    render={({ field }) => (
                        <DatePicker
                            selected={field.value}
                            onChange={field.onChange}
                            placeholder={placeholder || `Select ${label.toLowerCase()}`}
                            required={required}
                            {...props}
                        />
                    )}
                />
            );
        }

        if (type === 'select') {
            return (
                <select
                    {...register(name, { required: required && `${label} is required` })}
                    className="input-modern"
                    {...props}
                >
                    <option value="">Select {label}</option>
                    {options.map((option, index) => (
                        <option key={index} value={option.value || option}>
                            {option.label || option}
                        </option>
                    ))}
                </select>
            );
        }

        if (type === 'textarea') {
            return (
                <textarea
                    {...register(name, { required: required && `${label} is required` })}
                    className="input-modern resize-none"
                    rows={4}
                    placeholder={placeholder}
                    {...props}
                />
            );
        }

        return (
            <input
                type={type}
                {...register(name, { required: required && `${label} is required` })}
                className="input-modern"
                placeholder={placeholder}
                {...props}
            />
        );
    };

    return (
        <div className="mb-4">
            <label className="label-modern">
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {renderInput()}
            {error && (
                <p className="mt-1 text-sm text-red-500 animate-fade-in">
                    {error.message}
                </p>
            )}
        </div>
    );
};

export default FormField;
