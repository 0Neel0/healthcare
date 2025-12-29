import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

const TestimonialSlider = ({ testimonials = [] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlay, setIsAutoPlay] = useState(true);

    // Auto-play functionality
    useEffect(() => {
        if (!isAutoPlay || testimonials.length === 0) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        }, 5000); // Change slide every 5 seconds

        return () => clearInterval(interval);
    }, [isAutoPlay, testimonials.length]);

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
        setIsAutoPlay(false);
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
        setIsAutoPlay(false);
    };

    const goToSlide = (index) => {
        setCurrentIndex(index);
        setIsAutoPlay(false);
    };

    if (testimonials.length === 0) {
        return null;
    }

    const currentTestimonial = testimonials[currentIndex];

    return (
        <div className="relative max-w-4xl mx-auto">
            {/* Main Testimonial Card */}
            <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-slate-100">
                {/* Quote Icon */}
                <div className="flex justify-center mb-6">
                    <div className="bg-gradient-medical p-4 rounded-2xl">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z" />
                        </svg>
                    </div>
                </div>

                {/* Stars Rating */}
                <div className="flex justify-center gap-1 mb-6">
                    {[...Array(currentTestimonial.rating || 5)].map((_, i) => (
                        <Star
                            key={i}
                            size={20}
                            className="text-demo-orange-500 fill-demo-orange-500"
                        />
                    ))}
                </div>

                {/* Review Text */}
                <p className="text-slate-700 text-lg leading-relaxed text-center mb-8 italic">
                    "{currentTestimonial.text}"
                </p>

                {/* Author Info */}
                <div className="text-center">
                    <p className="text-xl font-bold text-slate-900 mb-1">
                        {currentTestimonial.name}
                    </p>
                    <p className="text-medical-blue-600 font-medium">
                        {currentTestimonial.designation}
                    </p>
                    {currentTestimonial.hospital && (
                        <p className="text-slate-500 text-sm mt-1">
                            {currentTestimonial.hospital}
                        </p>
                    )}
                </div>
            </div>

            {/* Navigation Arrows */}
            {testimonials.length > 1 && (
                <>
                    <button
                        onClick={goToPrevious}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-16 bg-white hover:bg-medical-blue-50 text-medical-blue-600 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                        aria-label="Previous testimonial"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={goToNext}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-16 bg-white hover:bg-medical-blue-50 text-medical-blue-600 p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
                        aria-label="Next testimonial"
                    >
                        <ChevronRight size={24} />
                    </button>
                </>
            )}

            {/* Dots Indicator */}
            {testimonials.length > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                    {testimonials.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex
                                    ? 'w-8 bg-gradient-medical'
                                    : 'w-2 bg-slate-300 hover:bg-slate-400'
                                }`}
                            aria-label={`Go to testimonial ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

TestimonialSlider.propTypes = {
    testimonials: PropTypes.arrayOf(
        PropTypes.shape({
            text: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            designation: PropTypes.string.isRequired,
            hospital: PropTypes.string,
            rating: PropTypes.number,
        })
    ),
};

export default TestimonialSlider;
