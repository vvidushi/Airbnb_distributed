import React, { useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const ImageCarousel = ({ images, alt, className = "w-full h-full object-cover", showDots = true, showArrows = true, isCard = false }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Handle empty images array
    if (!images || images.length === 0) {
        return (
            <div className="relative">
                <img
                    src="https://via.placeholder.com/800x400?text=No+Image"
                    alt={alt}
                    className={className}
                />
            </div>
        );
    }

    // If only one image, don't show carousel controls
    if (images.length === 1) {
        const imageUrl = images[0].startsWith('http://') || images[0].startsWith('https://') 
            ? images[0] 
            : `/uploads/${images[0]}`;
        
        return (
            <div className="relative">
                <img
                    src={imageUrl}
                    alt={alt}
                    className={className}
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/800x400?text=No+Image' }}
                />
            </div>
        );
    }

    const goToPrevious = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex === 0 ? images.length - 1 : prevIndex - 1
        );
    };

    const goToNext = () => {
        setCurrentIndex((prevIndex) => 
            prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
    };

    const goToSlide = (index) => {
        setCurrentIndex(index);
    };

    const getImageUrl = (image) => {
        if (image.startsWith('http://') || image.startsWith('https://')) {
            return image;
        }
        return `/uploads/${image}`;
    };

    return (
        <div className="relative group">
            {/* Main Image */}
            <div className="relative overflow-hidden">
                <img
                    src={getImageUrl(images[currentIndex])}
                    alt={`${alt} - Image ${currentIndex + 1}`}
                    className={className}
                    onError={(e) => { e.target.src = 'https://via.placeholder.com/800x400?text=No+Image' }}
                />
                
                {/* Navigation Arrows */}
                {showArrows && images.length > 1 && (
                    <>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                goToPrevious();
                            }}
                            className={`absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full transition-opacity duration-200 hover:bg-opacity-70 ${
                                isCard ? 'p-1 opacity-0 group-hover:opacity-100' : 'p-2 opacity-0 group-hover:opacity-100'
                            }`}
                            aria-label="Previous image"
                        >
                            <FaChevronLeft className={isCard ? 'text-sm' : ''} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                goToNext();
                            }}
                            className={`absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full transition-opacity duration-200 hover:bg-opacity-70 ${
                                isCard ? 'p-1 opacity-0 group-hover:opacity-100' : 'p-2 opacity-0 group-hover:opacity-100'
                            }`}
                            aria-label="Next image"
                        >
                            <FaChevronRight className={isCard ? 'text-sm' : ''} />
                        </button>
                    </>
                )}
            </div>

            {/* Dots Indicator */}
            {showDots && images.length > 1 && (
                <div className={`absolute left-1/2 transform -translate-x-1/2 flex space-x-2 ${
                    isCard ? 'bottom-2' : 'bottom-4'
                }`}>
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={(e) => {
                                e.stopPropagation();
                                goToSlide(index);
                            }}
                            className={`rounded-full transition-colors duration-200 ${
                                isCard ? 'w-1.5 h-1.5' : 'w-2 h-2'
                            } ${
                                index === currentIndex 
                                    ? 'bg-white' 
                                    : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                            }`}
                            aria-label={`Go to image ${index + 1}`}
                        />
                    ))}
                </div>
            )}

            {/* Image Counter */}
            {images.length > 1 && !isCard && (
                <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                    {currentIndex + 1} / {images.length}
                </div>
            )}
        </div>
    );
};

export default ImageCarousel;
