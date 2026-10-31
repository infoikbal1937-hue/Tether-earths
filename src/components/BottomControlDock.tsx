import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, Eye, CloudFog, Compass, ChevronDown, ChevronUp } from 'lucide-react';

interface BottomControlDockProps {
  lang: 'en' | 'es';
  cameraOverride: 'scroll' | 'canopy' | 'porcupine' | 'dogs' | 'lion' | 'basecamp';
  onSelectCamera: (cam: 'scroll' | 'canopy' | 'porcupine' | 'dogs' | 'lion' | 'basecamp') => void;
  mistDensity: 'dense' | 'clear';
  onToggleMist: () => void;
  isAudioPlaying: boolean;
  onToggleAudio: () => void;
}

export const BottomControlDock: React.FC<BottomControlDockProps> = ({
  lang,
  cameraOverride,
  onSelectCamera,
  mistDensity,
  onToggleMist,
  isAudioPlaying,
  onToggleAudio,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.key.toLowerCase() === 'h' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        setIsCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const presets: Array<{
    id: 'scroll' | 'canopy' | 'porcupine' | 'dogs' | 'lion' | 'basecamp';
    label: string;
  }> =
    lang === 'en'
      ? [
          { id: 'scroll', label: 'Free Dive' },
          { id: 'canopy', label: '3D Canopy' },
          { id: 'porcupine', label: 'Porcupine' },
          { id: 'dogs', label: 'Wild Dogs' },
          { id: 'lion', label: 'Lion Encounter' },
          { id: 'basecamp', label: 'Basecamp' },
        ]
      : [
          { id: 'scroll', label: 'Recorrido Libre' },
          { id: 'canopy', label: 'Bóveda 3D' },
          { id: 'porcupine', label: 'Puercoespín' },
          { id: 'dogs', label: 'Perros Salvajes' },
          { id: 'lion', label: 'León Salvaje' },
          { id: 'basecamp', label: 'Campamento' },
        ];

  return (
    <div
      className="fixed bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 z-40 w-auto max-w-[min(940px,96vw)] flex flex-col items-center pointer-events-auto transition-transform duration-300"
      style={{
        transform: isCollapsed
          ? 'translate(-50%, calc(100% - 32px))'
          : 'translate(-50%, 0)',
      }}
    >
      {/* Collapse / Expand Toggle Tab */}
      <button
        type="button"
        onClick={() => setIsCollapsed((prev) => !prev)}
        className="flex items-center gap-1.5 px-3 py-1 rounded-t-lg bg-[#1c2415]/95 border border-b-0 border-white/15 text-[11px] sm:text-xs font-medium text-[#d0d9ca] hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        title="Keyboard shortcut: H"
      >
        {isCollapsed ? (
          <>
            <ChevronUp className="w-3.5 h-3.5 text-[#a3c285]" />
            <span>{lang === 'en' ? 'Show 3D Controls (H)' : 'Mostrar Controles 3D (H)'}</span>
          </>
        ) : (
          <>
            <ChevronDown className="w-3.5 h-3.5 text-[#a3c285]" />
            <span>{lang === 'en' ? 'Cinema Mode / Hide (H)' : 'Modo Cine / Ocultar (H)'}</span>
          </>
        )}
      </button>

      {/* Main Unified Control Bar */}
      <div className="flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-[#161c10]/95 border border-white/15 shadow-2xl max-w-[96vw] overflow-x-auto">
        <div className="flex items-center gap-1 pr-1.5 sm:pr-2 border-r border-white/10">
          <span className="hidden lg:inline-flex items-center gap-1 text-xs text-[#a2b097] mr-1.5 whitespace-nowrap shrink-0">
            <Compass className="w-3.5 h-3.5 text-[#a3c285]" />
            {lang === 'en' ? '3D View:' : 'Vista 3D:'}
          </span>
          {presets.map((preset) => {
            const active = cameraOverride === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectCamera(preset.id)}
                className={`px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[#f2f5f0] text-[#182011] font-semibold'
                    : 'text-[#c8d4c0] hover:bg-white/10 hover:text-white'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Mist Density Toggle */}
        <button
          type="button"
          onClick={onToggleMist}
          className="flex items-center gap-1 px-2.5 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-medium bg-white/8 hover:bg-white/15 text-[#e2e8dd] border border-white/10 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          {mistDensity === 'dense' ? (
            <>
              <CloudFog className="w-3.5 h-3.5 text-[#a3c285]" />
              <span className="hidden sm:inline">
                {lang === 'en' ? 'Mist: Dense' : 'Niebla: Densa'}
              </span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5 text-[#a3c285]" />
              <span className="hidden sm:inline">
                {lang === 'en' ? 'Mist: Clear' : 'Niebla: Clara'}
              </span>
            </>
          )}
        </button>

        {/* Bio-Acoustic Audio Toggle */}
        <button
          type="button"
          onClick={onToggleAudio}
          className={`flex items-center gap-1 px-2.5 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-medium border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            isAudioPlaying
              ? 'bg-[#2a381f] border-[#8fa876] text-white'
              : 'bg-white/8 border-white/10 text-[#bcc7b4] hover:text-white'
          }`}
        >
          {isAudioPlaying ? (
            <>
              <Volume2 className="w-3.5 h-3.5 text-[#a3c285]" />
              <span>{lang === 'en' ? 'Jungle Audio: On' : 'Audio Selva: Activo'}</span>
            </>
          ) : (
            <>
              <VolumeX className="w-3.5 h-3.5 text-[#98a68e]" />
              <span>{lang === 'en' ? 'Sound' : 'Sonido'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
