import React, { useEffect } from 'react';
import { X, Compass, Film, ExternalLink, Youtube } from 'lucide-react';
import { WildlifeSceneType } from './WildlifeCanvasArt';

export interface DocumentaryItem {
  id: string;
  youtubeId: string;
  title: string;
  originalTitle?: string;
  subtitle: string;
  duration: string;
  location: string;
  coordinates: string;
  resolution: string;
  sceneType: WildlifeSceneType;
  soundCue: 'lion' | 'porcupine' | 'dogs';
  synopsis: string;
  fieldNotes: string;
  thumbnailUrl: string;
}

interface DocumentaryModalProps {
  doc: DocumentaryItem | null;
  lang: 'en' | 'es';
  onClose: () => void;
}

export const DocumentaryModal: React.FC<DocumentaryModalProps> = ({ doc, lang, onClose }) => {
  useEffect(() => {
    if (!doc) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [doc, onClose]);

  if (!doc) return null;

  const youtubeWatchUrl = `https://www.youtube.com/watch?v=${doc.youtubeId}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 bg-black/85 backdrop-blur-md pointer-events-auto overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl rounded-2xl logo-glass-card overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/10">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-[#c8d4c0]">
            <Film className="w-4 h-4 text-[#a3c285] shrink-0" />
            <span>
              {lang === 'en' ? 'Tether Earth Official YouTube Video' : 'Video Oficial de YouTube Tether Earth'}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{doc.resolution}</span>
            <span className="hidden sm:inline" aria-hidden="true">·</span>
            <span className="hidden sm:inline">{doc.location}</span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={youtubeWatchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors"
            >
              <Youtube className="w-3.5 h-3.5 text-[#ff4e45]" />
              <span>{lang === 'en' ? 'Open on YouTube' : 'Ver en YouTube'}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-[#c8d4c0] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Embedded Official YouTube Player */}
        <div className="relative aspect-video w-full bg-[#080b06] overflow-hidden">
          <iframe
            className="w-full h-full border-0"
            src={`https://www.youtube.com/embed/${doc.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
            title={doc.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        {/* Documentary Details & Expedition Notes */}
        <div className="p-5 sm:p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
          <div className="md:col-span-2 space-y-2">
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {doc.title}
            </h3>
            {doc.originalTitle && doc.originalTitle !== doc.title && (
              <p className="text-xs font-medium text-[#a3c285]">{doc.originalTitle}</p>
            )}
            <p className="text-xs sm:text-sm text-[#d0d9ca] leading-relaxed">{doc.synopsis}</p>
          </div>
          <div className="p-4 rounded-xl logo-glass-subtle space-y-2.5 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#b8d49e]">
                <Compass className="w-4 h-4" />
                <span>{lang === 'en' ? 'Field Notes' : 'Bitácora de Campo'}</span>
              </div>
              <p className="text-xs text-[#bcc7b4] leading-relaxed">{doc.fieldNotes}</p>
            </div>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-mono tabular-nums text-[#98a68e]">
              <span>{doc.coordinates}</span>
              <a
                href="https://www.youtube.com/@TetherEarthWild?sub_confirmation=1"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:underline"
              >
                @TetherEarth
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
