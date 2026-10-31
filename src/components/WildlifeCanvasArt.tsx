import React from 'react';

export type WildlifeSceneType =
  | 'lion_python'
  | 'porcupine_defense'
  | 'wild_dogs'
  | 'canopy_basecamp'
  | 'natural_jungle_hero';

interface WildlifeCanvasArtProps {
  sceneType: WildlifeSceneType;
  thumbnailUrl?: string;
  altText?: string;
  isHovered?: boolean;
  className?: string;
}

/**
 * Renders the distinct, unique video thumbnail image for each channel video or wildlife encounter
 * with subtle zoom on hover and animated rustling leaves around the frame.
 */
export const WildlifeCanvasArt: React.FC<WildlifeCanvasArtProps> = ({
  thumbnailUrl = '/assets/aistudio/image_86a107b9.png',
  altText = 'TetherEarth Wildlife Documentary',
  isHovered = false,
  className = '',
}) => {
  return (
    <div className={`relative w-full h-full overflow-hidden bg-[#12170e] ${className}`}>
      <img
        src={thumbnailUrl}
        alt={altText}
        referrerPolicy="no-referrer"
        className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
          isHovered ? 'scale-108' : 'scale-100'
        }`}
      />

      {/* Subtle Glassmorphic Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(11, 15, 8, 0.08) 0%, rgba(18, 23, 14, 0.25) 60%, rgba(11, 15, 8, 0.82) 100%)',
        }}
      />

      {/* Animated Rustling Jungle Foliage Corners on Hover */}
      <svg
        viewBox="0 0 120 120"
        className={`pointer-events-none absolute -left-4 -bottom-4 w-24 h-24 text-[#1d2516]/85 transition-transform duration-500 ${
          isHovered ? 'rustle-active-left' : ''
        }`}
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M0,120 Q30,55 105,15 Q65,70 45,100 Q20,115 0,120 Z" />
        <path d="M15,120 Q55,75 115,45 Q80,95 55,115 Z" opacity="0.7" />
      </svg>

      <svg
        viewBox="0 0 120 120"
        className={`pointer-events-none absolute -right-4 -bottom-4 w-24 h-24 text-[#1d2516]/85 transition-transform duration-500 ${
          isHovered ? 'rustle-active-right' : ''
        }`}
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M120,120 Q90,55 15,15 Q55,70 75,100 Q100,115 120,120 Z" />
        <path d="M105,120 Q65,75 5,45 Q40,95 65,115 Z" opacity="0.7" />
      </svg>
    </div>
  );
};
