import React from 'react';
import PropTypes from 'prop-types';

const HexagonCard = ({ icon: Icon, title, description, color = 'medical-blue' }) => {
    const colorMap = {
        'medical-blue': {
            bg: 'bg-[#DEEBFF]',
            border: 'border-[#0052CC]/20',
            iconBg: 'bg-white',
            iconColor: 'text-[#0052CC]',
            textColor: 'text-[#0052CC]',
        },
        'health-green': {
            bg: 'bg-[#E3FCEF]',
            border: 'border-[#00875A]/20',
            iconBg: 'bg-white',
            iconColor: 'text-[#00875A]',
            textColor: 'text-[#00875A]',
        },
        'demo-orange': {
            bg: 'bg-[#FFF0B3]',
            border: 'border-[#FF991F]/20',
            iconBg: 'bg-white',
            iconColor: 'text-[#FF991F]',
            textColor: 'text-[#FF991F]',
        },
    };

    const colors = colorMap[color] || colorMap['medical-blue'];

    return (
        <div className="group relative">
            {/* Professional rectangular card */}
            <div className={`relative ${colors.bg} ${colors.border} border-2 rounded-xl p-8 transition-shadow duration-200 hover:shadow-lg`}>
                {/* Icon */}
                <div className="flex justify-center mb-4">
                    <div className={`${colors.iconColor} p-4 ${colors.iconBg} rounded-lg shadow-sm`}>
                        {Icon && <Icon size={32} strokeWidth={2} />}
                    </div>
                </div>

                {/* Title */}
                <h3 className={`text-lg font-bold text-center mb-3 ${colors.textColor}`}>
                    {title}
                </h3>

                {/* Description */}
                <p className="text-[#42526E] text-center text-sm leading-relaxed">
                    {description}
                </p>
            </div>
        </div>
    );
};

HexagonCard.propTypes = {
    icon: PropTypes.elementType,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    color: PropTypes.oneOf(['medical-blue', 'health-green', 'demo-orange']),
};

export default HexagonCard;
