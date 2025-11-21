import React, { useState } from 'react';
import { BikeDetection } from '../types';
import { Eye, EyeOff } from 'lucide-react';

interface ImageOverlayProps {
    imageUrl: string;
    detections: BikeDetection[];
    showOverlay: boolean;
    focusMain: boolean;
}

const ImageOverlay: React.FC<ImageOverlayProps> = ({ imageUrl, detections, showOverlay, focusMain }) => {
    const [imageLoaded, setImageLoaded] = useState(false);

    // Filter detections based on focus mode
    const visibleDetections = detections.filter(d => {
        if (!showOverlay) return false;
        if (focusMain) return d.type === 'Main';
        return true;
    });

    return (
        <div className="relative w-full h-full group">
            <img
                src={imageUrl}
                alt="Bike"
                className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImageLoaded(true)}
            />

            {/* Overlay Layer */}
            {imageLoaded && showOverlay && (
                <div className="absolute inset-0 pointer-events-none">
                    {visibleDetections.map((d, i) => {
                        if (!d.boundingBox) return null;

                        const { ymin, xmin, ymax, xmax } = d.boundingBox;
                        const top = `${ymin * 100}%`;
                        const left = `${xmin * 100}%`;
                        const width = `${(xmax - xmin) * 100}%`;
                        const height = `${(ymax - ymin) * 100}%`;

                        const isMain = d.type === 'Main';
                        const color = isMain ? '#5E6AD2' : 'rgba(255, 255, 255, 0.5)';
                        const borderStyle = isMain ? '2px solid #5E6AD2' : '1px dashed rgba(255, 255, 255, 0.5)';

                        return (
                            <div
                                key={i}
                                className="absolute transition-all duration-300"
                                style={{ top, left, width, height, border: borderStyle, boxShadow: isMain ? '0 0 10px rgba(94,106,210,0.3)' : 'none' }}
                            >
                                {/* Label Tag */}
                                <div
                                    className="absolute -top-5 left-0 px-1.5 py-0.5 text-[9px] font-medium text-white rounded shadow-sm whitespace-nowrap"
                                    style={{ backgroundColor: isMain ? '#5E6AD2' : 'rgba(0,0,0,0.6)' }}
                                >
                                    {d.frameColor}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ImageOverlay;
