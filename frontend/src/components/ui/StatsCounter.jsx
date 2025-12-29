import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

const StatsCounter = ({ icon: Icon, count, label, suffix = '', duration = 2000 }) => {
    const [displayCount, setDisplayCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const counterRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isVisible) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        if (counterRef.current) {
            observer.observe(counterRef.current);
        }

        return () => {
            if (counterRef.current) {
                observer.unobserve(counterRef.current);
            }
        };
    }, [isVisible]);

    useEffect(() => {
        if (!isVisible) return;

        const targetCount = typeof count === 'string' ? parseInt(count.replace(/[^0-9]/g, '')) : count;
        const increment = targetCount / (duration / 16); // 60fps
        let currentCount = 0;

        const timer = setInterval(() => {
            currentCount += increment;
            if (currentCount >= targetCount) {
                setDisplayCount(targetCount);
                clearInterval(timer);
            } else {
                setDisplayCount(Math.floor(currentCount));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [isVisible, count, duration]);

    const formatCount = () => {
        if (typeof count === 'string') {
            // Handle strings like "10K+", "98%"
            return count.replace(/[0-9]/g, '') + displayCount + suffix;
        }
        return displayCount.toLocaleString() + suffix;
    };

    return (
        <div
            ref={counterRef}
            className="text-center p-8 bg-white rounded-2xl shadow-soft border border-slate-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
        >
            {/* Icon */}
            {Icon && (
                <div className="flex justify-center mb-4">
                    <div className="bg-gradient-medical p-4 rounded-xl">
                        <Icon size={32} className="text-white" strokeWidth={2} />
                    </div>
                </div>
            )}

            {/* Counter */}
            <p className="text-5xl font-bold text-gradient mb-2">
                {typeof count === 'string' ? count : formatCount()}
            </p>

            {/* Label */}
            <p className="text-slate-600 font-medium text-sm uppercase tracking-wide">
                {label}
            </p>
        </div>
    );
};

StatsCounter.propTypes = {
    icon: PropTypes.elementType,
    count: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    label: PropTypes.string.isRequired,
    suffix: PropTypes.string,
    duration: PropTypes.number,
};

export default StatsCounter;
