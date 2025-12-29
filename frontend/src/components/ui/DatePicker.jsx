import React from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar } from 'lucide-react';

/**
 * DatePicker Component
 * A styled date picker component with calendar icon
 * 
 * @param {Date} selected - Currently selected date
 * @param {Function} onChange - Callback when date changes
 * @param {string} placeholder - Placeholder text
 * @param {Date} minDate - Minimum selectable date
 * @param {Date} maxDate - Maximum selectable date
 * @param {boolean} showYearDropdown - Show year dropdown selector
 * @param {boolean} showMonthDropdown - Show month dropdown selector
 * @param {string} dateFormat - Date format string (default: "MM/dd/yyyy")
 * @param {string} className - Additional CSS classes
 * @param {boolean} required - Whether the field is required
 * @param {boolean} disabled - Whether the field is disabled
 */
const DatePicker = ({
    selected,
    onChange,
    placeholder = 'Select date',
    minDate,
    maxDate,
    showYearDropdown = true,
    showMonthDropdown = true,
    dateFormat = 'MM/dd/yyyy',
    className = '',
    required = false,
    disabled = false,
    ...props
}) => {
    return (
        <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none z-10">
                <Calendar className="w-5 h-5 text-gray-400" />
            </div>
            <ReactDatePicker
                selected={selected}
                onChange={onChange}
                placeholderText={placeholder}
                minDate={minDate}
                maxDate={maxDate}
                showYearDropdown={showYearDropdown}
                showMonthDropdown={showMonthDropdown}
                dropdownMode="select"
                dateFormat={dateFormat}
                required={required}
                disabled={disabled}
                className={`input-modern pl-10 ${className}`}
                wrapperClassName="w-full"
                {...props}
            />
        </div>
    );
};

export default DatePicker;
