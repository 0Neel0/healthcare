import React from 'react';
import PropTypes from 'prop-types';
import { Check } from 'lucide-react';
import Button from './Button';

const AlternatingSection = ({
    title,
    description,
    features = [],
    imageSrc,
    imageAlt = 'Feature illustration',
    imagePosition = 'left',
    ctaText = 'Learn More',
    ctaLink,
    onCtaClick
}) => {
    const isImageLeft = imagePosition === 'left';

    const ImageComponent = () => (
        <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-xl">
                <img
                    src={imageSrc}
                    alt={imageAlt}
                    className="w-full h-auto object-cover"
                />
            </div>
            {/* Decorative gradient overlay */}
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-medical opacity-20 rounded-full blur-3xl -z-10"></div>
        </div>
    );

    const ContentComponent = () => (
        <div className="space-y-6">
            <h2 className="text-4xl font-bold text-slate-900">
                {title}
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
                {description}
            </p>

            {/* Features List */}
            {features.length > 0 && (
                <ul className="space-y-3">
                    {features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-3">
                            <div className="mt-1 flex-shrink-0">
                                <div className="bg-health-green-100 rounded-full p-1">
                                    <Check size={16} className="text-health-green-600" strokeWidth={3} />
                                </div>
                            </div>
                            <span className="text-slate-700">{feature}</span>
                        </li>
                    ))}
                </ul>
            )}

            {/* CTA Button */}
            {(ctaText && (ctaLink || onCtaClick)) && (
                <div className="pt-4">
                    {ctaLink ? (
                        <a href={ctaLink}>
                            <Button variant="primary" size="lg">
                                {ctaText}
                            </Button>
                        </a>
                    ) : (
                        <Button variant="primary" size="lg" onClick={onCtaClick}>
                            {ctaText}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );

    return (
        <section className="py-16">
            <div className={`section-alternate-${imagePosition}`}>
                {isImageLeft ? (
                    <>
                        <ImageComponent />
                        <ContentComponent />
                    </>
                ) : (
                    <>
                        <ContentComponent />
                        <ImageComponent />
                    </>
                )}
            </div>
        </section>
    );
};

AlternatingSection.propTypes = {
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    features: PropTypes.arrayOf(PropTypes.string),
    imageSrc: PropTypes.string.isRequired,
    imageAlt: PropTypes.string,
    imagePosition: PropTypes.oneOf(['left', 'right']),
    ctaText: PropTypes.string,
    ctaLink: PropTypes.string,
    onCtaClick: PropTypes.func,
};

export default AlternatingSection;
