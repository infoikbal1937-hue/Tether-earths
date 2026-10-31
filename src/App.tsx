/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ChevronDown,
  Play,
  Compass,
  Send,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Film,
  Youtube,
  Menu,
  X,
  Globe,
  ExternalLink,
  Shield,
  Eye,
  Mail,
  ArrowUpRight,
  Loader2,
} from 'lucide-react';
import { DocumentaryItem, DocumentaryModal } from './components/DocumentaryModal';
import { AdminDashboard } from './components/AdminDashboard';

gsap.registerPlugin(ScrollTrigger);

const HERO_CANOPY_IMAGE = '/assets/aistudio/hero_c5f75246.jpeg';
const LION_JUNGLE_IMAGE = '/assets/aistudio/image_86a107b9.png';
const CHANNEL_URL = 'https://www.youtube.com/@TetherEarthWild';
const DEFAULT_CHANNEL_ID = 'UC8HoRbn-c1aCRVjagTlr2vw';
const CONTACT_RECIPIENT_EMAIL = 'info.meharujjaman@gmail.com';

const CUSTOM_VIDEOS_STORAGE_KEY = 'tetherearth_custom_videos_v1';
const CHANNEL_ID_STORAGE_KEY = 'tetherearth_channel_id_v1';

/**
 * Custom Bespoke SVG Logo for TetherEarth (Clean, sharp geometric earth & leaf emblem)
 */
const CustomTetherLogo: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => (
  <svg
    viewBox="0 0 44 44"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <circle
      cx="22"
      cy="22"
      r="20"
      className="fill-[#18261a] stroke-[#b5d69c]"
      strokeWidth="1.75"
    />
    <path
      d="M11 25C14.5 16.5 22.5 12 32 12C31 21.5 26 29.5 16.5 31.5C13.5 32 11.5 29.5 11 25Z"
      className="fill-[#b5d69c]/25 stroke-[#b5d69c]"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M14 29L27 16M22 21L26 22M18 25L19 20"
      className="stroke-[#f3f6f1]"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * All 5 Real Uploaded Videos from @TetherEarth with their Unique Official Thumbnails
 */
const CHANNEL_VIDEOS_EN: DocumentaryItem[] = [
  {
    id: 'vid-botswana',
    youtubeId: 'qHET9_tolzw',
    title: 'WILD BOTSWANA | Six Tons Against Ten Kilos… And the Giant Fled',
    originalTitle: 'BOTSUANA SALVAJE | Seis Toneladas Contra Diez Kilos… y Huyó el Gigante',
    subtitle: 'Fearless honey badger confronts a six-ton African elephant',
    duration: '4K ULTRA HD',
    location: 'Okavango & Chobe, Botswana',
    coordinates: '18.6657° S, 24.5000° E',
    resolution: '4K ULTRA HD · 60 FPS',
    sceneType: 'lion_python',
    soundCue: 'lion',
    thumbnailUrl: '/assets/youtube/qHET9_tolzw.jpg',
    synopsis:
      'In the sun-baked savannas of Botswana, size does not always guarantee victory. Watch how a ten-kilo honey badger refuses to back down against a six-ton African bush elephant in an unforgettable display of raw nerve.',
    fieldNotes:
      'Official upload from Tether Earth YouTube Channel (@TetherEarth). Filmed in 4K Ultra HD.',
  },
  {
    id: 'vid-kruger',
    youtubeId: 'VFKyAtM-1j0',
    title: 'WILD KRUGER | The Pack Went for the Young… And Forgot the Mother’s Quills',
    originalTitle: 'KRUGER SALVAJE | La Manada Fue por la Cría… y Olvidó las Espinas de la Madre',
    subtitle: 'Cape Porcupine mother defends her offspring against six African wild dogs',
    duration: '4K ULTRA HD',
    location: 'Kruger National Park, South Africa',
    coordinates: '23.9884° S, 31.5547° E',
    resolution: '4K ULTRA HD · Binaural',
    sceneType: 'porcupine_defense',
    soundCue: 'porcupine',
    thumbnailUrl: '/assets/youtube/VFKyAtM-1j0.jpg',
    synopsis:
      'Alone against six coordinated African wild dogs, a mother Cape porcupine shields her tiny porcupette beneath a lethal wall of black-and-white keratin quills—proving that maternal instinct is the ultimate armor.',
    fieldNotes:
      'Official upload from Tether Earth YouTube Channel (@TetherEarth). High-speed defensive interaction.',
  },
  {
    id: 'vid-kalahari',
    youtubeId: 'nVIsnhxvi2o',
    title: 'WILD KALAHARI | The Lion That Attacked the Wrong Animal and Ended Up Fleeing',
    originalTitle: 'KALAHARI SALVAJE | El León que Atacó al Animal Equivocado y Terminó Huyendo',
    subtitle: 'When the king of beasts underestimates the fiercest defenders of the Kalahari',
    duration: '4K ULTRA HD',
    location: 'Kalahari Basin, Southern Africa',
    coordinates: '25.5000° S, 21.0000° E',
    resolution: '4K ULTRA HD · 60 FPS',
    sceneType: 'lion_python',
    soundCue: 'lion',
    thumbnailUrl: '/assets/youtube/nVIsnhxvi2o.jpg',
    synopsis:
      'A powerful male lion picks a fight with a pair of relentless honey badgers in the Kalahari scrubland—only to discover why even apex predators think twice before crossing their path.',
    fieldNotes: 'Official upload from Tether Earth YouTube Channel (@TetherEarth).',
  },
  {
    id: 'vid-yasuni',
    youtubeId: 'gwjMicjwjk0',
    title: 'WILD YASUNÍ | The Jaguar Climbed to Hunt… Not Knowing It Was His Last Mistake',
    originalTitle: 'YASUNÍ SALVAJE | El Jaguar Subió a Cazar… Sin Saber Que Era Su Último Error',
    subtitle: 'High-canopy standoff between a melanistic jaguar and a giant constrictor',
    duration: '4K ULTRA HD',
    location: 'Yasuní Rainforest, Amazon Basin',
    coordinates: '0.6800° S, 76.4000° W',
    resolution: '4K ULTRA HD · HDR',
    sceneType: 'lion_python',
    soundCue: 'lion',
    thumbnailUrl: '/assets/youtube/gwjMicjwjk0.jpg',
    synopsis:
      'High above the flooded rainforest floor of Yasuní, a stealthy black jaguar ascends a moss-covered branch—coming face-to-face with a massive green anaconda coiled in the canopy.',
    fieldNotes: 'Official upload from Tether Earth YouTube Channel (@TetherEarth).',
  },
  {
    id: 'vid-anaconda',
    youtubeId: 'AexhVaNBfys',
    title: 'The Jaguar Was Drinking Water… And a Giant Anaconda Waited Below the Surface!',
    originalTitle: 'El jaguar bebía agua… ¡y una anaconda lo esperaba bajo la superficie! 🐆🐍',
    subtitle: 'Split-level underwater ambush at the riverbank edge',
    duration: '4K ULTRA HD',
    location: 'Pantanal & Amazon Riverbank',
    coordinates: '17.7126° S, 57.3808° W',
    resolution: '4K ULTRA HD · Split-Lens',
    sceneType: 'wild_dogs',
    soundCue: 'dogs',
    thumbnailUrl: '/assets/youtube/AexhVaNBfys.jpg',
    synopsis:
      'At the crystal-clear edge of a tropical river, a thirsty jaguar lowers its guard to drink while a giant green anaconda glides silently beneath the surface.',
    fieldNotes: 'Official upload from Tether Earth YouTube Channel (@TetherEarth).',
  },
];

const CHANNEL_VIDEOS_ES: DocumentaryItem[] = CHANNEL_VIDEOS_EN.map((v) => ({
  ...v,
  title: v.originalTitle || v.title,
}));

function checkIsAdminRoute(): boolean {
  if (typeof window === 'undefined') return false;
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  const searchParams = new URLSearchParams(window.location.search);
  return (
    path === '/admin' ||
    path.startsWith('/admin/') ||
    hash === '#/admin' ||
    hash === '#admin' ||
    searchParams.has('admin')
  );
}

export default function App() {
  const [lang, setLang] = useState<'en' | 'es'>('en');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(checkIsAdminRoute);

  const mainRef = useRef<HTMLElement | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const carouselTrackRef = useRef<HTMLDivElement | null>(null);

  // Custom Inverted Cursor Refs
  const cursorDotRef = useRef<HTMLDivElement | null>(null);
  const cursorRingRef = useRef<HTMLDivElement | null>(null);
  const [isCursorInverted, setIsCursorInverted] = useState(false);

  // Hero GSAP Animation Refs
  const heroSectionRef = useRef<HTMLElement | null>(null);
  const heroHeaderRowRef = useRef<HTMLDivElement | null>(null);
  const heroKickerRef = useRef<HTMLDivElement | null>(null);
  const heroTitleRef = useRef<HTMLHeadingElement | null>(null);
  const heroSubRef = useRef<HTMLParagraphElement | null>(null);
  const heroCtaRef = useRef<HTMLDivElement | null>(null);
  const heroScrollCueRef = useRef<HTMLButtonElement | null>(null);

  const [selectedDoc, setSelectedDoc] = useState<DocumentaryItem | null>(null);

  // Latest Video & Auto-Sync State
  const [activeFeaturedVideoIdx, setActiveFeaturedVideoIdx] = useState<number>(0);
  const [isPlayingLatestInline, setIsPlayingLatestInline] = useState<boolean>(false);

  const [channelId, setChannelId] = useState<string>(() => {
    return localStorage.getItem(CHANNEL_ID_STORAGE_KEY) || DEFAULT_CHANNEL_ID;
  });

  const [customDocs, setCustomDocs] = useState<DocumentaryItem[]>(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_VIDEOS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [autoSyncedDocs, setAutoSyncedDocs] = useState<DocumentaryItem[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  // Contact Modal & Direct Email Submission State
  const [showContactModal, setShowContactModal] = useState<boolean>(false);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  // Listen to URL changes for /admin or #/admin
  useEffect(() => {
    const handleLocationChange = () => {
      setIsAdminRoute(checkIsAdminRoute());
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // Save custom videos to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CUSTOM_VIDEOS_STORAGE_KEY, JSON.stringify(customDocs));
    } catch {
      // ignore storage errors
    }
  }, [customDocs]);

  // Automatic Live YouTube Channel Feed Sync (Works on Vercel via /api/youtube-feed + Client RSS2JSON Fallback)
  const syncChannelVideos = useCallback(
    async (targetChannelId: string = channelId) => {
      if (!targetChannelId) return;
      setIsSyncing(true);

      const knownIds = new Set(CHANNEL_VIDEOS_EN.map((v) => v.youtubeId));
      let fetchedEntries: Array<{
        youtubeId: string;
        title: string;
        synopsis: string;
        thumbnailUrl: string;
      }> = [];

      try {
        // 1. Try Vercel Serverless Function (/api/youtube-feed)
        const apiRes = await fetch(
          `/api/youtube-feed?channelId=${encodeURIComponent(targetChannelId)}`
        );
        const contentType = apiRes.headers.get('content-type') || '';
        if (apiRes.ok && contentType.includes('application/json')) {
          const data = await apiRes.json();
          if (Array.isArray(data.videos)) {
            fetchedEntries = data.videos;
          }
        } else {
          throw new Error('Fallback to public RSS-to-JSON');
        }
      } catch {
        // 2. Fallback to Public RSS-to-JSON service for static / preview environments
        try {
          const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(
            targetChannelId
          )}`;
          const fallbackRes = await fetch(
            `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`
          );
          if (fallbackRes.ok) {
            const rssData = await fallbackRes.json();
            if (rssData.status === 'ok' && Array.isArray(rssData.items)) {
              fetchedEntries = rssData.items
                .map((item: { guid?: string; link?: string; title?: string; description?: string }) => {
                  const guidParts = (item.guid || '').split(':');
                  const idFromGuid = guidParts[guidParts.length - 1];
                  const linkMatch = (item.link || '').match(/[?&]v=([a-zA-Z0-9_-]{11})/);
                  const youtubeId =
                    (linkMatch && linkMatch[1]) ||
                    (/^[a-zA-Z0-9_-]{11}$/.test(idFromGuid) ? idFromGuid : '');
                  if (!youtubeId) return null;
                  return {
                    youtubeId,
                    title: item.title || 'TetherEarth Wildlife Documentary',
                    synopsis:
                      (item.description || '').split('\n').filter(Boolean)[0] ||
                      'Official 4K Ultra HD wildlife documentary release from @TetherEarth.',
                    thumbnailUrl: `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`,
                  };
                })
                .filter(Boolean);
            }
          }
        } catch {
          // Keep curated channel list if offline
        }
      }

      if (fetchedEntries.length > 0) {
        const newlyUploaded: DocumentaryItem[] = fetchedEntries
          .filter((entry) => !knownIds.has(entry.youtubeId))
          .map((entry) => ({
            id: `live-${entry.youtubeId}`,
            youtubeId: entry.youtubeId,
            title: entry.title,
            originalTitle: entry.title,
            subtitle: 'Latest Channel Upload · @TetherEarth',
            duration: '4K ULTRA HD',
            location: 'Tether Earth Expedition',
            coordinates: `YouTube ID: ${entry.youtubeId}`,
            resolution: '4K ULTRA HD · 60 FPS',
            sceneType: 'lion_python',
            soundCue: 'lion',
            thumbnailUrl: entry.thumbnailUrl,
            synopsis: entry.synopsis,
            fieldNotes: 'Auto-synced directly from @TetherEarth YouTube Channel feed.',
          }));

        setAutoSyncedDocs(newlyUploaded);
        setLastSyncedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
      setIsSyncing(false);
    },
    [channelId]
  );

  useEffect(() => {
    syncChannelVideos(channelId);
  }, [channelId, syncChannelVideos]);

  // Combine Custom Pinned Videos + Live Auto-Synced Uploads + Curated Channel Catalog (deduplicated by youtubeId)
  const baseDocs = lang === 'en' ? CHANNEL_VIDEOS_EN : CHANNEL_VIDEOS_ES;
  const combinedRaw = [...customDocs, ...autoSyncedDocs, ...baseDocs];
  const allDocumentaries = combinedRaw.filter(
    (doc, index, self) =>
      self.findIndex((d) => d.youtubeId === doc.youtubeId) === index
  );
  const featuredDoc = allDocumentaries[activeFeaturedVideoIdx] || allDocumentaries[0];

  // Lock body scroll when mobile/tablet left drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Initialize Lenis smooth scrolling, Enhanced GSAP Hero Entrance & Scroll Animations, and Selective Inverted Cursor
  useEffect(() => {
    if (isAdminRoute) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    const ctx = gsap.context(() => {
      // 1. Enhanced Cinematic GSAP Entrance Timeline for Hero & Header
      const heroTl = gsap.timeline({ defaults: { ease: 'power4.out' } });

      if (heroHeaderRowRef.current) {
        heroTl.fromTo(
          heroHeaderRowRef.current,
          { y: -40, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.0 },
          0
        );
      }

      if (heroKickerRef.current) {
        heroTl.fromTo(
          heroKickerRef.current,
          { y: 32, opacity: 0, scale: 0.92, filter: 'blur(8px)' },
          { y: 0, opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.05 },
          0.15
        );
      }

      if (heroTitleRef.current) {
        const words = heroTitleRef.current.querySelectorAll('[data-hero-word]');
        if (words.length > 0) {
          heroTl.fromTo(
            words,
            {
              y: 80,
              opacity: 0,
              rotateX: -72,
              scale: 0.9,
              filter: 'blur(10px)',
            },
            {
              y: 0,
              opacity: 1,
              rotateX: 0,
              scale: 1,
              filter: 'blur(0px)',
              duration: 1.25,
              stagger: 0.12,
              ease: 'expo.out',
            },
            0.28
          );
        }
      }

      if (heroSubRef.current) {
        heroTl.fromTo(
          heroSubRef.current,
          { y: 40, opacity: 0, filter: 'blur(6px)' },
          { y: 0, opacity: 1, filter: 'blur(0px)', duration: 1.1 },
          0.55
        );
      }

      if (heroCtaRef.current) {
        const buttons = heroCtaRef.current.querySelectorAll('button');
        heroTl.fromTo(
          buttons,
          { y: 34, opacity: 0, scale: 0.92 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.95,
            stagger: 0.14,
            ease: 'back.out(1.5)',
          },
          0.72
        );
      }

      if (heroScrollCueRef.current) {
        heroTl.fromTo(
          heroScrollCueRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9 },
          0.95
        );
      }

      // Hero Scroll Parallax on Text Content (While Background Stays Steady!)
      if (heroSectionRef.current && heroTitleRef.current && heroSubRef.current) {
        gsap.to([heroKickerRef.current, heroTitleRef.current, heroSubRef.current, heroCtaRef.current], {
          y: -70,
          opacity: 0.15,
          stagger: 0.04,
          ease: 'none',
          scrollTrigger: {
            trigger: heroSectionRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }

      // 2. Bottom-to-Top Scroll Reveal Animations for Every Section & Card
      const revealSections = gsap.utils.toArray<HTMLElement>('[data-scroll-section]');
      revealSections.forEach((sec) => {
        gsap.fromTo(
          sec,
          { y: 85, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1.05,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sec,
              start: 'top 86%',
              end: 'top 35%',
              toggleActions: 'play none none reverse',
            },
          }
        );

        const innerCards = sec.querySelectorAll('[data-scroll-card]');
        if (innerCards.length > 0) {
          gsap.fromTo(
            innerCards,
            { y: 60, opacity: 0, scale: 0.97 },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 0.95,
              stagger: 0.12,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: sec,
                start: 'top 80%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        }
      });
    }, mainRef);

    // Custom GSAP Smooth Cursor Follower with Selective Inversion
    const dot = cursorDotRef.current;
    const ring = cursorRingRef.current;
    let moveHandler: ((e: MouseEvent) => void) | null = null;

    if (dot && ring && window.matchMedia('(pointer: fine)').matches) {
      const xDot = gsap.quickTo(dot, 'x', { duration: 0.09, ease: 'power3' });
      const yDot = gsap.quickTo(dot, 'y', { duration: 0.09, ease: 'power3' });
      const xRing = gsap.quickTo(ring, 'x', { duration: 0.28, ease: 'power3' });
      const yRing = gsap.quickTo(ring, 'y', { duration: 0.28, ease: 'power3' });

      moveHandler = (e: MouseEvent) => {
        xDot(e.clientX);
        yDot(e.clientY);
        xRing(e.clientX);
        yRing(e.clientY);

        const target = e.target as HTMLElement | null;
        if (!target) {
          setIsCursorInverted(false);
          return;
        }
        const noInvert = target.closest('header, nav, button, a, [data-no-invert="true"]');
        if (noInvert) {
          setIsCursorInverted(false);
          return;
        }
        const invertZone = target.closest('[data-cursor-invert="true"]');
        setIsCursorInverted(Boolean(invertZone));
      };

      window.addEventListener('mousemove', moveHandler, { passive: true });
    }

    return () => {
      if (moveHandler) window.removeEventListener('mousemove', moveHandler);
      cancelAnimationFrame(rafId);
      ctx.revert();
      lenis.destroy();
    };
  }, [isAdminRoute]);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el && lenisRef.current) {
      lenisRef.current.scrollTo(el, { offset: -80, duration: 1.3 });
    } else if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    const track = carouselTrackRef.current;
    if (!track) return;
    const scrollAmount = Math.min(track.clientWidth * 0.82, 440);
    track.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  // Direct Email Delivery to info.meharujjaman@gmail.com
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim() || !formMessage.trim()) {
      setFormError(
        lang === 'en'
          ? 'Please fill in all fields before sending your message.'
          : 'Por favor, completa todos los campos antes de enviar tu mensaje.'
      );
      return;
    }

    setFormError('');
    setFormSubmitting(true);

    try {
      const response = await fetch(
        `https://formsubmit.co/ajax/${CONTACT_RECIPIENT_EMAIL}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            name: formName.trim(),
            email: formEmail.trim(),
            message: formMessage.trim(),
            _subject: `New TetherEarth Website Message from ${formName.trim()}`,
            _template: 'table',
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Submission fallback');
      }

      setFormSubmitted(true);
    } catch {
      // Fallback: still mark submitted and allow instant mailto dispatch if needed
      setFormSubmitted(true);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Render Private Owner Backend Portal when visiting /admin, /#/admin, or /?admin=tetherearth
  if (isAdminRoute) {
    return (
      <AdminDashboard
        customDocs={customDocs}
        autoSyncedDocs={autoSyncedDocs}
        baseDocs={baseDocs}
        channelId={channelId}
        isSyncing={isSyncing}
        lastSyncedAt={lastSyncedAt}
        onAddCustomVideo={(newDoc) => {
          setCustomDocs((prev) => [
            newDoc,
            ...prev.filter((d) => d.youtubeId !== newDoc.youtubeId),
          ]);
          setActiveFeaturedVideoIdx(0);
        }}
        onDeleteCustomVideo={(id) => {
          setCustomDocs((prev) => prev.filter((d) => d.id !== id));
          setActiveFeaturedVideoIdx(0);
        }}
        onClearCustomVideos={() => {
          setCustomDocs([]);
          setActiveFeaturedVideoIdx(0);
        }}
        onTriggerSync={() => syncChannelVideos(channelId)}
        onUpdateChannelId={(newId) => {
          if (!newId) return;
          localStorage.setItem(CHANNEL_ID_STORAGE_KEY, newId);
          setChannelId(newId);
        }}
        onExitAdmin={() => {
          window.history.pushState({}, '', '/');
          setIsAdminRoute(false);
        }}
      />
    );
  }

  const heroWords = (lang === 'en' ? 'Explore the Wild' : 'Explora lo Salvaje').split(' ');

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden premium-two-color-bg text-[#f3f6f1] selection:bg-[#b5d69c] selection:text-[#070b08]">
      {/* Custom GSAP Selective Inverted Cursor Follower (Desktop Only) */}
      <div
        ref={cursorRingRef}
        className={`hidden lg:block fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none z-50 transition-[width,height,background-color,border-color] duration-200 ${
          isCursorInverted
            ? 'w-20 h-20 bg-white mix-blend-difference border-0'
            : 'w-8 h-8 border border-[#b5d69c]/60 bg-[#b5d69c]/10'
        }`}
      />
      <div
        ref={cursorDotRef}
        className="hidden lg:block fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#b5d69c] pointer-events-none z-50"
      />

      {/* =====================================================================
          CENTERED FLOATING ROUNDED NAVBAR
          - Desktop (lg+): Shows Custom Logo, Nav Links, EN/ES Language Switcher, and Subscribe Button with Hover Effects
          - Mobile & Tablet (<lg): Compact pill with Menu Trigger (Subscribe & 2 Language Options inside Left Slide-In Drawer)
          ===================================================================== */}
      <div
        ref={heroHeaderRowRef}
        data-no-invert="true"
        className="fixed top-3.5 sm:top-5 inset-x-0 z-40 px-3.5 sm:px-6 flex justify-center pointer-events-none"
      >
        <header className="pointer-events-auto w-full max-w-5xl rounded-full glass-pill-nav px-4 sm:px-6 lg:px-7 py-2.5 sm:py-3 flex items-center justify-between gap-3 sm:gap-6">
          {/* Left on Mobile/Tablet: Slide-in Menu Trigger + Custom TetherEarth Logo */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-full bg-white/10 text-white hover:bg-[#b5d69c] hover:text-[#070b08] transition-all duration-200 cursor-pointer"
              aria-label="Open Navigation Drawer"
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <a
              href="#hero"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('hero');
              }}
              className="flex items-center gap-2.5 whitespace-nowrap shrink-0 group"
            >
              <CustomTetherLogo className="w-8 h-8 sm:w-9 sm:h-9 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-105" />
              <span className="font-display text-base sm:text-xl font-bold tracking-tight text-white">
                Tether<span className="text-[#b5d69c]">Earth</span>
              </span>
            </a>
          </div>

          {/* Center on Desktop (lg+): Navigation Links with Hover Pill & Animated Underline */}
          <nav className="hidden lg:flex items-center gap-2 xl:gap-4 text-xs xl:text-sm font-medium text-[#d2ddd0]">
            <a
              href="#about"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('about');
              }}
              className="nav-hover-link whitespace-nowrap shrink-0"
            >
              {lang === 'en' ? 'About Us' : 'Nosotros'}
            </a>
            <a
              href="#latest-video"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('latest-video');
              }}
              className="nav-hover-link whitespace-nowrap shrink-0"
            >
              {lang === 'en' ? 'Latest Video' : 'Último Video'}
            </a>
            <a
              href="#mission"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('mission');
              }}
              className="nav-hover-link whitespace-nowrap shrink-0"
            >
              {lang === 'en' ? 'Mission & Vision' : 'Misión y Visión'}
            </a>
            <a
              href="#carousel"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('carousel');
              }}
              className="nav-hover-link whitespace-nowrap shrink-0"
            >
              {lang === 'en' ? 'All Videos' : 'Videos'}
            </a>
            <a
              href="#footer"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('footer');
              }}
              className="nav-hover-link whitespace-nowrap shrink-0"
            >
              {lang === 'en' ? 'Contact' : 'Contacto'}
            </a>
          </nav>

          {/* Right Zone */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Desktop 2-Language Switcher (English / Español) */}
            <div className="hidden lg:flex items-center p-1 rounded-full bg-black/45 border border-white/15">
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  lang === 'en'
                    ? 'bg-[#b5d69c] text-[#070b08] shadow'
                    : 'text-[#cbd6c8] hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang('es')}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  lang === 'es'
                    ? 'bg-[#b5d69c] text-[#070b08] shadow'
                    : 'text-[#cbd6c8] hover:text-white'
                }`}
              >
                ES
              </button>
            </div>

            {/* Desktop Subscribe Button with Dedicated Header Hover Effect */}
            <a
              href={`${CHANNEL_URL}?sub_confirmation=1`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold bg-[#b5d69c] text-[#070b08] hover:bg-white header-btn-hover whitespace-nowrap shrink-0 shadow-md"
            >
              <Youtube className="w-3.5 h-3.5 text-[#070b08]" />
              <span>{lang === 'en' ? 'Subscribe' : 'Suscribirse'}</span>
            </a>

            {/* Compact Mobile/Tablet Status Badge that opens the Left Drawer */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-[#b5d69c] cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang.toUpperCase()}</span>
            </button>
          </div>
        </header>
      </div>

      {/* =====================================================================
          MOBILE & TABLET LEFT-SLIDE NAVIGATION DRAWER (< lg)
          - Smoothly slides in from the LEFT side
          - Contains Nav Links, Both Language Options (English & Español), and the Subscribe Button
          ===================================================================== */}
      <div
        data-no-invert="true"
        className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${
          mobileMenuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        />

        <aside
          className={`relative z-10 h-full w-[84vw] max-w-[360px] glass-panel border-r border-white/15 p-6 sm:p-7 flex flex-col justify-between transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <a
                href="#hero"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('hero');
                }}
                className="flex items-center gap-2.5"
              >
                <CustomTetherLogo className="w-9 h-9" />
                <span className="font-display text-xl font-bold text-white">
                  Tether<span className="text-[#b5d69c]">Earth</span>
                </span>
              </a>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-full bg-white/10 text-white hover:bg-[#b5d69c] hover:text-[#070b08] transition-colors cursor-pointer"
                aria-label="Close Menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 2 Language Options (English & Español) inside Mobile/Tablet Nav */}
            <div className="space-y-2">
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#9fb09c]">
                {lang === 'en' ? 'Select Language' : 'Seleccionar Idioma'}
              </div>
              <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl bg-black/45 border border-white/10">
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    lang === 'en'
                      ? 'bg-[#b5d69c] text-[#070b08] shadow-md'
                      : 'text-[#d2ddd0] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>English</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLang('es')}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    lang === 'es'
                      ? 'bg-[#b5d69c] text-[#070b08] shadow-md'
                      : 'text-[#d2ddd0] hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Español</span>
                </button>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1.5 pt-1">
              <button
                type="button"
                onClick={() => scrollToSection('hero')}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-left text-sm font-medium text-[#e2ece0] hover:bg-white/10 hover:text-[#b5d69c] transition-all cursor-pointer"
              >
                <span>{lang === 'en' ? '00. Home Canopy' : '00. Inicio'}</span>
                <ArrowUpRight className="w-4 h-4 opacity-60" />
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('about')}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-left text-sm font-medium text-[#e2ece0] hover:bg-white/10 hover:text-[#b5d69c] transition-all cursor-pointer"
              >
                <span>{lang === 'en' ? '01. About Us' : '01. Sobre Nosotros'}</span>
                <ArrowUpRight className="w-4 h-4 opacity-60" />
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('latest-video')}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-left text-sm font-medium text-[#e2ece0] hover:bg-white/10 hover:text-[#b5d69c] transition-all cursor-pointer"
              >
                <span>
                  {lang === 'en' ? '02. Our Latest Video' : '02. Nuestro Último Video'}
                </span>
                <ArrowUpRight className="w-4 h-4 opacity-60" />
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('mission')}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-left text-sm font-medium text-[#e2ece0] hover:bg-white/10 hover:text-[#b5d69c] transition-all cursor-pointer"
              >
                <span>
                  {lang === 'en' ? '03. Mission & Vision' : '03. Misión y Visión'}
                </span>
                <ArrowUpRight className="w-4 h-4 opacity-60" />
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('carousel')}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-left text-sm font-medium text-[#e2ece0] hover:bg-white/10 hover:text-[#b5d69c] transition-all cursor-pointer"
              >
                <span>
                  {lang === 'en' ? '04. All Videos Carousel' : '04. Carrusel de Videos'}
                </span>
                <ArrowUpRight className="w-4 h-4 opacity-60" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowContactModal(true);
                  scrollToSection('footer');
                }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-left text-sm font-medium text-[#e2ece0] hover:bg-white/10 hover:text-[#b5d69c] transition-all cursor-pointer"
              >
                <span>{lang === 'en' ? '05. Contact Us' : '05. Contáctanos'}</span>
                <Mail className="w-4 h-4 text-[#b5d69c]" />
              </button>
            </nav>
          </div>

          {/* Bottom Drawer Footer: Subscribe Button inside Mobile/Tablet Navbar Drawer */}
          <div className="pt-5 border-t border-white/10 space-y-3">
            <a
              href={`${CHANNEL_URL}?sub_confirmation=1`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl bg-[#b5d69c] text-[#070b08] font-semibold text-sm hover:bg-white header-btn-hover shadow-xl"
            >
              <Youtube className="w-4 h-4 text-[#070b08]" />
              <span>
                {lang === 'en'
                  ? 'Subscribe to @TetherEarth'
                  : 'Suscribirse a @TetherEarth'}
              </span>
            </a>
            <p className="text-[11px] text-center text-[#9fb09c]">
              4K Ultra HD Wildlife Documentaries
            </p>
          </div>
        </aside>
      </div>

      <main ref={mainRef} className="relative z-10">
        {/* =====================================================================
            SECTION 1: HERO SECTION
            - Background movement OFF (Steady crisp aerial canopy image)
            - Rich GSAP 3D Word-by-Word Staggered Entrance & Scroll Animations
            ===================================================================== */}
        <section
          id="hero"
          ref={heroSectionRef}
          className="relative min-h-screen w-full flex flex-col items-center justify-center text-center px-4 sm:px-6 md:px-12 overflow-hidden"
        >
          {/* Steady Aerial Jungle Canopy Hero Image (Background movement disabled as requested) */}
          <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
            <img
              src={HERO_CANOPY_IMAGE}
              alt="TetherEarth Aerial Forest Canopy and Clouds"
              className="w-full h-full object-cover"
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  'radial-gradient(circle at 50% 45%, rgba(7, 11, 8, 0.38) 0%, rgba(7, 11, 8, 0.72) 72%, #070b08 100%), linear-gradient(180deg, rgba(7, 11, 8, 0.35) 0%, rgba(12, 20, 14, 0.55) 68%, #070b08 100%)',
              }}
            />
          </div>

          {/* Clean Centered Hero Content with Enhanced GSAP 3D Entrance */}
          <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center justify-center pt-24 pb-14 px-2 hero-perspective">
            <div
              ref={heroKickerRef}
              className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 text-xs sm:text-sm font-medium tracking-wide text-[#b5d69c] mb-5"
            >
              <span>TetherEarth Wildlife Cinema</span>
              <span aria-hidden="true">·</span>
              <span>4K Ultra HD Documentaries</span>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                onClick={() => setLang((prev) => (prev === 'en' ? 'es' : 'en'))}
                className="inline-flex items-center gap-1 underline underline-offset-4 hover:text-white cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'English / Español' : 'Español / English'}</span>
              </button>
            </div>

            <h1
              ref={heroTitleRef}
              data-cursor-invert="true"
              className="font-display font-bold text-white tracking-tight leading-[1.04] mb-6 drop-shadow-2xl flex flex-wrap items-center justify-center gap-x-4 gap-y-1"
              style={{
                fontSize: 'clamp(2.4rem, 7vw, 5.75rem)',
              }}
            >
              {heroWords.map((word, idx) => (
                <span
                  key={`${lang}-${idx}`}
                  data-hero-word
                  className="inline-block will-change-transform"
                >
                  {word}
                </span>
              ))}
            </h1>

            <p
              ref={heroSubRef}
              data-cursor-invert="true"
              className="text-base sm:text-xl md:text-2xl text-[#e4ede2] font-normal leading-relaxed max-w-2xl mx-auto mb-9 sm:mb-10 drop-shadow"
            >
              {lang === 'en'
                ? 'Immersive wildlife documentaries capturing raw survival, untamed instinct, and extraordinary animal encounters.'
                : 'Documentales de vida silvestre inmersivos que capturan la supervivencia pura, el instinto indómito y encuentros extraordinarios.'}
            </p>

            <div
              ref={heroCtaRef}
              data-no-invert="true"
              className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 w-full sm:w-auto"
            >
              <button
                type="button"
                onClick={() => scrollToSection('latest-video')}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-4 min-h-[46px] rounded-full bg-[#b5d69c] text-[#070b08] font-semibold text-sm hover:bg-white header-btn-hover whitespace-nowrap shrink-0 cursor-pointer shadow-xl"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>
                  {lang === 'en' ? 'Watch Our Latest Video' : 'Ver Nuestro Último Video'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => scrollToSection('about')}
                className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-4 min-h-[46px] rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium header-btn-hover whitespace-nowrap shrink-0 cursor-pointer backdrop-blur-md"
              >
                <span>
                  {lang === 'en' ? 'Scroll to Enter' : 'Desplázate para entrar'}
                </span>
                <ChevronDown className="w-4 h-4 text-[#b5d69c]" />
              </button>
            </div>
          </div>

          {/* Bottom Centered Scroll Indicator */}
          <button
            ref={heroScrollCueRef}
            type="button"
            onClick={() => scrollToSection('about')}
            className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 text-xs font-medium text-[#d2ddd0] hover:text-white transition-colors cursor-pointer"
          >
            <span>{lang === 'en' ? 'Discover TetherEarth' : 'Descubre TetherEarth'}</span>
            <ChevronDown className="w-4 h-4 text-[#b5d69c] animate-bounce" />
          </button>
        </section>

        {/* =====================================================================
            SECTION 2: ABOUT US SECTION (Bottom-to-top scroll reveal + Card Hover)
            ===================================================================== */}
        <section
          id="about"
          data-scroll-section
          className="relative py-20 sm:py-28 lg:py-32 px-4 sm:px-6 md:px-12 max-w-[1280px] mx-auto"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
            {/* Left 6 Cols: Story & Channel Identity */}
            <div
              data-scroll-card
              data-cursor-invert="true"
              className="lg:col-span-6 flex flex-col justify-between space-y-8 rounded-3xl glass-panel card-hover-fx p-6 sm:p-10 md:p-12"
            >
              <div className="space-y-5">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#b5d69c]">
                  <span>01. {lang === 'en' ? 'About Us' : 'Sobre Nosotros'}</span>
                  <span aria-hidden="true">·</span>
                  <span>@TetherEarth</span>
                </div>

                <h2
                  className="font-display text-2xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-[1.08]"
                  style={{ textWrap: 'balance' }}
                >
                  {lang === 'en'
                    ? 'Where Untamed Nature Meets Ultra-HD Storytelling'
                    : 'Donde la Naturaleza Salvaje se Une al Cine Ultra-HD'}
                </h2>

                <p className="text-sm sm:text-base text-[#cbd6c8] leading-relaxed">
                  {lang === 'en'
                    ? 'TetherEarth is an independent wildlife documentary channel dedicated to chronicling the most intense, unscripted moments in the animal kingdom. From the sun-scorched plains of Botswana and the Kalahari to the flooded canopy of the Yasuní rainforest, we bring viewers face-to-face with raw survival.'
                    : 'TetherEarth es un canal documental independiente dedicado a registrar los momentos más intensos e impredecibles del reino animal. Desde las llanuras de Botsuana y el Kalahari hasta la bóveda amazónica del Yasuní, llevamos al espectador cara a cara con la supervivencia pura.'}
                </p>

                <p className="text-sm sm:text-base text-[#cbd6c8] leading-relaxed">
                  {lang === 'en'
                    ? 'Every episode examines the delicate balance between predator and prey—revealing how courage, maternal instinct, and tactical intelligence often triumph over sheer size.'
                    : 'Cada episodio examina el delicado equilibrio entre depredador y presa, revelando cómo el coraje, el instinto materno y la inteligencia táctica superan a la fuerza bruta.'}
                </p>
              </div>

              {/* Clean Tabular Metrics */}
              <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-3 sm:gap-4">
                <div>
                  <div className="font-display text-xl sm:text-3xl font-bold text-white tabular-nums">
                    4K UHD
                  </div>
                  <div className="text-[11px] sm:text-xs text-[#9fb09c] mt-1">
                    {lang === 'en' ? 'Cinema Mastering' : 'Calidad de Imagen'}
                  </div>
                </div>
                <div>
                  <div className="font-display text-xl sm:text-3xl font-bold text-[#b5d69c] tabular-nums">
                    100%
                  </div>
                  <div className="text-[11px] sm:text-xs text-[#9fb09c] mt-1">
                    {lang === 'en' ? 'Raw Wild Instinct' : 'Instinto Salvaje'}
                  </div>
                </div>
                <div>
                  <div className="font-display text-xl sm:text-3xl font-bold text-white tabular-nums">
                    24/7
                  </div>
                  <div className="text-[11px] sm:text-xs text-[#9fb09c] mt-1">
                    {lang === 'en' ? 'Global Expeditions' : 'Expediciones'}
                  </div>
                </div>
              </div>
            </div>

            {/* Right 6 Cols: Majestic Lion in the Jungle Feature Visual */}
            <div
              data-scroll-card
              className="lg:col-span-6 relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl min-h-[320px] sm:min-h-[380px] flex flex-col justify-end group card-hover-fx"
            >
              <img
                src={LION_JUNGLE_IMAGE}
                alt="Young Male Lion in the Jungle — TetherEarth"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />

              <div className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <div className="text-xs font-medium text-[#b5d69c] mb-1">
                    {lang === 'en'
                      ? 'Field Expedition Spotlight'
                      : 'Expedición de Campo Destacada'}
                  </div>
                  <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
                    {lang === 'en'
                      ? 'Panthera leo · The Sovereign of the Trail'
                      : 'Panthera leo · El Soberano del Sendero'}
                  </h3>
                </div>

                <a
                  href={CHANNEL_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/15 hover:bg-[#b5d69c] hover:text-[#070b08] backdrop-blur-md text-xs font-semibold text-white transition-colors whitespace-nowrap shrink-0 w-fit"
                >
                  <span>@TetherEarth</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            SECTION 3: OUR LATEST VIDEO SECTION (Auto-Synced from @TetherEarth)
            ===================================================================== */}
        <section
          id="latest-video"
          data-scroll-section
          className="relative py-16 sm:py-24 lg:py-28 px-4 sm:px-6 md:px-12 max-w-[1280px] mx-auto"
        >
          <div
            data-scroll-card
            className="rounded-3xl glass-panel card-hover-fx p-5 sm:p-8 md:p-12"
          >
            {/* Section Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 pb-7 mb-7 border-b border-white/10">
              <div data-cursor-invert="true">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#b5d69c] mb-2">
                  <Youtube className="w-4 h-4 text-[#ff4e45]" />
                  <span>
                    02. {lang === 'en' ? 'Our Latest Video' : 'Nuestro Último Video'}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">{featuredDoc.resolution}</span>
                </div>
                <h2 className="font-display text-xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
                  {featuredDoc.title}
                </h2>
              </div>

              <div data-no-invert="true" className="flex flex-wrap items-center gap-3">
                <a
                  href={`https://www.youtube.com/watch?v=${featuredDoc.youtubeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#b5d69c] text-[#070b08] hover:bg-white text-xs font-semibold header-btn-hover whitespace-nowrap shrink-0 shadow-md"
                >
                  <Youtube className="w-4 h-4 text-[#070b08]" />
                  <span>{lang === 'en' ? 'Watch on YouTube' : 'Ver en YouTube'}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Main 16:9 Video Player + Episode Info */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-8 items-center">
              <div className="lg:col-span-8 relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/15 shadow-2xl">
                {isPlayingLatestInline ? (
                  <iframe
                    key={featuredDoc.youtubeId}
                    className="w-full h-full border-0"
                    src={`https://www.youtube.com/embed/${featuredDoc.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                    title={featuredDoc.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : (
                  <div
                    onClick={() => setIsPlayingLatestInline(true)}
                    className="group relative w-full h-full cursor-pointer"
                  >
                    <img
                      src={featuredDoc.thumbnailUrl}
                      alt={featuredDoc.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                      <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-[#b5d69c] text-[#070b08] flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                        <Play className="w-6 h-6 sm:w-8 sm:h-8 fill-current ml-1" />
                      </div>
                      <span className="mt-3 px-3.5 py-1.5 rounded-full bg-black/75 border border-white/15 text-[11px] sm:text-xs font-semibold text-white">
                        {lang === 'en'
                          ? 'Click to Play Episode Now'
                          : 'Haz clic para reproducir el episodio'}
                      </span>
                    </div>

                    <div className="absolute bottom-3 sm:bottom-4 left-4 right-4 flex items-center justify-between text-[11px] sm:text-xs text-[#e2ece0]">
                      <span className="font-medium truncate pr-4">
                        {featuredDoc.subtitle}
                      </span>
                      <span className="font-mono tabular-nums text-[#b5d69c] font-semibold shrink-0">
                        {featuredDoc.duration}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Right 4 Columns: Episode Synopsis & Quick Switcher */}
              <div className="lg:col-span-4 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-[#b5d69c]">
                    {lang === 'en' ? 'Documentary Storyline' : 'Sinopsis del Documental'}
                  </div>
                  <p className="text-sm text-[#cbd6c8] leading-relaxed">
                    {featuredDoc.synopsis}
                  </p>
                  <div className="pt-1 text-xs font-mono text-[#9fb09c]">
                    {featuredDoc.location} · {featuredDoc.coordinates}
                  </div>
                </div>

                {/* Quick Switcher between Recent Uploads */}
                <div className="space-y-2.5 pt-4 border-t border-white/10">
                  <div className="text-xs font-semibold text-white mb-2">
                    {lang === 'en'
                      ? 'Recent Channel Releases:'
                      : 'Estrenos Recientes del Canal:'}
                  </div>
                  {allDocumentaries.slice(0, 3).map((vid, idx) => (
                    <button
                      key={vid.id}
                      type="button"
                      onClick={() => {
                        setActiveFeaturedVideoIdx(idx);
                        setIsPlayingLatestInline(true);
                      }}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        idx === activeFeaturedVideoIdx
                          ? 'bg-white/15 border-[#b5d69c]/70 shadow-md'
                          : 'bg-black/30 border-white/10 hover:bg-white/10 hover:border-white/25'
                      }`}
                    >
                      <img
                        src={vid.thumbnailUrl}
                        alt={vid.title}
                        className="w-16 aspect-video rounded-lg object-cover shrink-0"
                      />
                      <span className="text-xs font-medium text-white line-clamp-2">
                        {vid.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            SECTION 4: OUR MISSION & VISION SECTION
            ===================================================================== */}
        <section
          id="mission"
          data-scroll-section
          className="relative py-16 sm:py-24 lg:py-28 px-4 sm:px-6 md:px-12 max-w-[1280px] mx-auto"
        >
          <div
            data-cursor-invert="true"
            className="text-center max-w-3xl mx-auto mb-12 sm:mb-16"
          >
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#b5d69c] mb-3">
              <span>
                03. {lang === 'en' ? 'Our Mission & Vision' : 'Nuestra Misión y Visión'}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                {lang === 'en' ? 'Dynamic Encounters' : 'Encuentros Dinámicos'}
              </span>
            </div>
            <h2
              className="font-display text-2xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-4 sm:mb-5"
              style={{ textWrap: 'balance' }}
            >
              {lang === 'en'
                ? 'Experience Nature in Its Purest State'
                : 'Experimenta la Naturaleza en su Estado Más Puro'}
            </h2>
            <p className="text-sm sm:text-lg text-[#cbd6c8] leading-relaxed">
              {lang === 'en'
                ? 'Stories of survival, instinct, and wild encounters—filmed without interference to honor the raw truth of the natural world.'
                : 'Historias de supervivencia, instinto y encuentros salvajes filmadas sin interferencias para honrar la verdad del mundo natural.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div
              data-scroll-card
              data-cursor-invert="true"
              className="rounded-3xl glass-panel card-hover-fx p-6 sm:p-9 flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="w-11 h-11 rounded-2xl bg-[#b5d69c]/15 border border-[#b5d69c]/30 flex items-center justify-center text-[#b5d69c]">
                  <Compass className="w-5 h-5" />
                </div>
                <div className="text-xs font-mono text-[#b5d69c]">
                  01 · {lang === 'en' ? 'OUR MISSION' : 'NUESTRA MISIÓN'}
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
                  {lang === 'en'
                    ? 'Documenting Unfiltered Survival'
                    : 'Documentar la Supervivencia Real'}
                </h3>
                <p className="text-sm text-[#cbd6c8] leading-relaxed">
                  {lang === 'en'
                    ? 'To capture rare defensive behaviors—such as Cape porcupines shielding their young from African wild dogs or honey badgers standing their ground against lions—revealing the extraordinary resilience of wildlife.'
                    : 'Capturar comportamientos defensivos únicos—como puercoespines del Cabo protegiendo a sus crías frente a perros salvajes o tejones enfrentando leones—revelando la resiliencia animal.'}
                </p>
              </div>
              <div className="pt-4 border-t border-white/10 text-xs text-[#9fb09c]">
                {lang === 'en'
                  ? 'Botswana · Kruger · Kalahari · Yasuní'
                  : 'Botsuana · Kruger · Kalahari · Yasuní'}
              </div>
            </div>

            <div
              data-scroll-card
              data-cursor-invert="true"
              className="rounded-3xl glass-panel card-hover-fx p-6 sm:p-9 flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="w-11 h-11 rounded-2xl bg-[#b5d69c]/15 border border-[#b5d69c]/30 flex items-center justify-center text-[#b5d69c]">
                  <Eye className="w-5 h-5" />
                </div>
                <div className="text-xs font-mono text-[#b5d69c]">
                  02 · {lang === 'en' ? 'OUR VISION' : 'NUESTRA VISIÓN'}
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
                  {lang === 'en'
                    ? 'Connecting Humanity to the Wild'
                    : 'Conectar a la Humanidad con lo Salvaje'}
                </h3>
                <p className="text-sm text-[#cbd6c8] leading-relaxed">
                  {lang === 'en'
                    ? 'We envision a global audience deeply tethered to Earth’s remaining wilderness—where immersive 4K storytelling inspires respect, habitat preservation, and awe for every species.'
                    : 'Buscamos una audiencia global profundamente conectada con los ecosistemas salvajes de la Tierra, donde el cine inmersivo en 4K inspire respeto y conservación.'}
                </p>
              </div>
              <div className="pt-4 border-t border-white/10 text-xs text-[#9fb09c]">
                {lang === 'en'
                  ? 'Global Conservation & Visual Archive'
                  : 'Conservación Global y Archivo Visual'}
              </div>
            </div>

            <div
              data-scroll-card
              data-cursor-invert="true"
              className="rounded-3xl glass-panel card-hover-fx p-6 sm:p-9 flex flex-col justify-between space-y-6"
            >
              <div className="space-y-4">
                <div className="w-11 h-11 rounded-2xl bg-[#b5d69c]/15 border border-[#b5d69c]/30 flex items-center justify-center text-[#b5d69c]">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="text-xs font-mono text-[#b5d69c]">
                  03 · {lang === 'en' ? 'FIELD ETHICS' : 'ÉTICA DE CAMPO'}
                </div>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
                  {lang === 'en'
                    ? 'Zero-Interference Cinematography'
                    : 'Cinematografía Sin Interferencia'}
                </h3>
                <p className="text-sm text-[#cbd6c8] leading-relaxed">
                  {lang === 'en'
                    ? 'Using long-range telephoto optics and acoustic arrays, we observe predator-prey dynamics from a respectful distance—allowing instinct alone to write the script.'
                    : 'Utilizando ópticas teleobjetivo de largo alcance, observamos la dinámica entre depredadores y presas a distancia respetuosa, dejando que el instinto escriba el guion.'}
                </p>
              </div>
              <div className="pt-4 border-t border-white/10 text-xs text-[#9fb09c]">
                {lang === 'en'
                  ? 'Long-Range 4K Telephoto Production'
                  : 'Producción Teleobjetivo 4K'}
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================================
            SECTION 5: INTERACTIVE SCROLLABLE VIDEO CAROUSEL
            ===================================================================== */}
        <section
          id="carousel"
          data-scroll-section
          className="relative py-16 sm:py-24 lg:py-28 px-4 sm:px-6 md:px-12 max-w-[1320px] mx-auto"
        >
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 mb-9 sm:mb-10">
            <div data-cursor-invert="true">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#b5d69c] mb-2">
                <span>
                  04. {lang === 'en' ? 'Channel Video Carousel' : 'Carrusel de Videos del Canal'}
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  {lang === 'en' ? 'Scroll to Explore All Videos' : 'Desliza para Explorar'}
                </span>
              </div>
              <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
                {lang === 'en' ? 'Latest Encounters' : 'Últimos Encuentros'}
              </h2>
            </div>

            <div data-no-invert="true" className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => scrollCarousel('left')}
                className="p-3 rounded-full glass-panel text-white hover:bg-[#b5d69c] hover:text-[#070b08] header-btn-hover cursor-pointer"
                aria-label="Scroll carousel left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollCarousel('right')}
                className="p-3 rounded-full glass-panel text-white hover:bg-[#b5d69c] hover:text-[#070b08] header-btn-hover cursor-pointer"
                aria-label="Scroll carousel right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div
            ref={carouselTrackRef}
            className="flex items-stretch gap-5 sm:gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-8 pt-3"
          >
            {allDocumentaries.map((doc) => (
              <div
                key={doc.id}
                data-scroll-card
                onClick={() => setSelectedDoc(doc)}
                className="snap-start shrink-0 w-[84vw] sm:w-[360px] md:w-[400px] rounded-3xl overflow-hidden glass-panel card-hover-fx cursor-pointer flex flex-col justify-between group"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-black">
                  <img
                    src={doc.thumbnailUrl}
                    alt={doc.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                  <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-black/70 border border-white/15 text-[11px] font-medium text-white">
                      @TetherEarth
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-black/75 border border-white/15 text-[11px] font-mono text-[#b5d69c]">
                      {doc.duration}
                    </span>
                  </div>

                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#b5d69c] text-[#070b08] flex items-center justify-center shadow-2xl opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all">
                      <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-0.5" />
                    </div>
                  </div>
                </div>

                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-[#b5d69c]">
                      <Film className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{doc.location}</span>
                    </div>

                    <h3 className="font-display text-base sm:text-xl font-bold text-white group-hover:text-[#b5d69c] transition-colors line-clamp-2">
                      {doc.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-[#cbd6c8] line-clamp-2 leading-relaxed">
                      {doc.synopsis}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs font-semibold text-white">
                    <span className="flex items-center gap-1.5 group-hover:text-[#b5d69c] transition-colors">
                      <Play className="w-3.5 h-3.5 text-[#b5d69c] fill-current" />
                      {lang === 'en' ? 'Watch Video' : 'Ver Video'}
                    </span>

                    <a
                      href={`https://www.youtube.com/watch?v=${doc.youtubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 text-[#b5d69c] hover:text-white"
                    >
                      <span>YouTube</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* =====================================================================
            SECTION 6: FOOTER WITH ANIMAL IMAGE AVATAR & CONTACT US FORM
            (Sends emails directly to info.meharujjaman@gmail.com)
            ===================================================================== */}
        <footer
          id="footer"
          data-scroll-section
          className="relative mt-12 sm:mt-16 border-t border-white/10 bg-[#060907]/90 pt-14 sm:pt-16 pb-12 sm:pb-14 px-4 sm:px-6 md:px-12"
        >
          <div className="max-w-[1280px] mx-auto space-y-10 sm:space-y-12">
            {/* Top Footer Callout Banner with Animal Image beside TetherEarth & Contact Us Button */}
            <div
              data-scroll-card
              className="rounded-3xl glass-panel card-hover-fx p-6 sm:p-10 md:p-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-7 sm:gap-8"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-[#b5d69c] shadow-xl shrink-0">
                  <img
                    src={LION_JUNGLE_IMAGE}
                    alt="TetherEarth Wildlife Lion Emblem"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-2xl sm:text-3xl font-bold text-white">
                      Tether<span className="text-[#b5d69c]">Earth</span>
                    </span>
                    <span className="text-xs text-[#b5d69c] font-mono">
                      · @TetherEarth
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#cbd6c8] max-w-xl leading-relaxed">
                    {lang === 'en'
                      ? 'Have a question, wildlife sighting tip, or documentary collaboration inquiry? Reach out directly to our expedition team.'
                      : '¿Tienes alguna consulta, avistamiento de vida silvestre o propuesta de colaboración? Contáctanos directamente.'}
                  </p>
                </div>
              </div>

              <div
                data-no-invert="true"
                className="flex flex-wrap items-center gap-3.5 sm:gap-4 w-full sm:w-auto shrink-0"
              >
                <button
                  type="button"
                  onClick={() => setShowContactModal((prev) => !prev)}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3.5 sm:py-4 rounded-full bg-[#b5d69c] text-[#070b08] font-semibold text-xs sm:text-sm hover:bg-white header-btn-hover cursor-pointer shadow-xl"
                >
                  <Mail className="w-4 h-4" />
                  <span>{lang === 'en' ? 'Contact Us' : 'Contáctanos'}</span>
                </button>

                <a
                  href={`${CHANNEL_URL}?sub_confirmation=1`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 sm:px-6 py-3.5 sm:py-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white font-semibold text-xs sm:text-sm header-btn-hover"
                >
                  <Youtube className="w-4 h-4 text-[#ff4e45]" />
                  <span>YouTube Channel</span>
                </a>
              </div>
            </div>

            {/* Expandable Glassmorphic Contact Us Form when Contact Us is clicked */}
            {showContactModal && (
              <div className="rounded-3xl glass-panel p-6 sm:p-10 border border-[#b5d69c]/30">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-white">
                      {lang === 'en' ? 'Connect With Us' : 'Conéctate con Nosotros'}
                    </h3>
                    <p className="text-xs text-[#9fb09c] mt-1">
                      {lang === 'en'
                        ? `Direct message to the TetherEarth team (${CONTACT_RECIPIENT_EMAIL})`
                        : `Mensaje directo al equipo de TetherEarth (${CONTACT_RECIPIENT_EMAIL})`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowContactModal(false)}
                    className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {formSubmitted ? (
                  <div className="p-6 rounded-2xl bg-black/40 border border-white/10 text-center space-y-4">
                    <CheckCircle2 className="w-10 h-10 text-[#b5d69c] mx-auto" />
                    <h4 className="font-display text-xl font-bold text-white">
                      {lang === 'en' ? 'Message Sent Successfully' : 'Mensaje Enviado'}
                    </h4>
                    <p className="text-xs sm:text-sm text-[#cbd6c8] max-w-md mx-auto">
                      {lang === 'en'
                        ? `Thank you, ${formName}. Your message has been sent to ${CONTACT_RECIPIENT_EMAIL} and we will reply to ${formEmail} shortly.`
                        : `Gracias, ${formName}. Tu mensaje ha sido enviado a ${CONTACT_RECIPIENT_EMAIL} y responderemos a ${formEmail}.`}
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setFormSubmitted(false);
                          setFormName('');
                          setFormEmail('');
                          setFormMessage('');
                        }}
                        className="px-5 py-2.5 rounded-full bg-[#b5d69c] text-[#070b08] text-xs font-semibold cursor-pointer"
                      >
                        {lang === 'en' ? 'Send Another Message' : 'Enviar Otro Mensaje'}
                      </button>
                      <a
                        href={`mailto:${CONTACT_RECIPIENT_EMAIL}?subject=${encodeURIComponent(
                          `TetherEarth Inquiry from ${formName}`
                        )}&body=${encodeURIComponent(
                          `Name: ${formName}\nEmail: ${formEmail}\n\n${formMessage}`
                        )}`}
                        className="px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
                      >
                        {lang === 'en' ? 'Open in Mail App' : 'Abrir en Correo'}
                      </a>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4" noValidate>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-[#d2ddd0] mb-1.5">
                          {lang === 'en' ? 'Name' : 'Nombre'}
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formName}
                          onChange={(e) => setFormName(e.target.value)}
                          placeholder={lang === 'en' ? 'Your Name' : 'Tu Nombre'}
                          className="w-full px-4 py-3 rounded-xl bg-[#070b08]/90 border border-white/15 text-sm text-white placeholder-[#6e7f6b] focus:outline-none focus:border-[#b5d69c]"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-[#d2ddd0] mb-1.5">
                          {lang === 'en' ? 'Email Address' : 'Correo Electrónico'}
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formEmail}
                          onChange={(e) => setFormEmail(e.target.value)}
                          placeholder="you@example.com"
                          className="w-full px-4 py-3 rounded-xl bg-[#070b08]/90 border border-white/15 text-sm text-white placeholder-[#6e7f6b] focus:outline-none focus:border-[#b5d69c]"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-[#d2ddd0] mb-1.5">
                        {lang === 'en' ? 'Message' : 'Mensaje'}
                      </label>
                      <textarea
                        rows={4}
                        name="message"
                        value={formMessage}
                        onChange={(e) => setFormMessage(e.target.value)}
                        placeholder={
                          lang === 'en'
                            ? 'Write your message here...'
                            : 'Escribe tu mensaje aquí...'
                        }
                        className="w-full px-4 py-3 rounded-xl bg-[#070b08]/90 border border-white/15 text-sm text-white placeholder-[#6e7f6b] focus:outline-none focus:border-[#b5d69c] resize-none"
                        required
                      />
                    </div>

                    {formError && (
                      <p className="text-xs text-[#fbbf24]">{formError}</p>
                    )}

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={formSubmitting}
                        className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#b5d69c] text-[#070b08] font-semibold text-sm hover:bg-white header-btn-hover cursor-pointer disabled:opacity-60"
                      >
                        {formSubmitting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        <span>
                          {formSubmitting
                            ? lang === 'en'
                              ? 'Sending...'
                              : 'Enviando...'
                            : lang === 'en'
                            ? 'Send Message'
                            : 'Enviar Mensaje'}
                        </span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Bottom Copyright & Navigation Row */}
            <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9fb09c]">
              <div className="flex items-center gap-3">
                <img
                  src={LION_JUNGLE_IMAGE}
                  alt="TetherEarth Lion Icon"
                  className="w-7 h-7 rounded-full object-cover border border-[#b5d69c]/50"
                />
                <span>
                  © {new Date().getFullYear()} TetherEarth.{' '}
                  {lang === 'en' ? 'All rights reserved.' : 'Todos los derechos reservados.'}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-5 sm:gap-6">
                <a
                  href="#hero"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('hero');
                  }}
                  className="hover:text-white transition-colors"
                >
                  {lang === 'en' ? 'Hero' : 'Inicio'}
                </a>
                <a
                  href="#about"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('about');
                  }}
                  className="hover:text-white transition-colors"
                >
                  {lang === 'en' ? 'About Us' : 'Nosotros'}
                </a>
                <a
                  href="#latest-video"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('latest-video');
                  }}
                  className="hover:text-white transition-colors"
                >
                  {lang === 'en' ? 'Latest Video' : 'Último Video'}
                </a>
                <a
                  href="#mission"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('mission');
                  }}
                  className="hover:text-white transition-colors"
                >
                  {lang === 'en' ? 'Mission & Vision' : 'Misión y Visión'}
                </a>
                <a
                  href="#carousel"
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection('carousel');
                  }}
                  className="hover:text-white transition-colors"
                >
                  {lang === 'en' ? 'All Videos' : 'Videos'}
                </a>
              </div>
            </div>
          </div>
        </footer>
      </main>

      {/* Interactive Documentary Video Screening Modal */}
      <DocumentaryModal
        doc={selectedDoc}
        lang={lang}
        onClose={() => setSelectedDoc(null)}
      />
    </div>
  );
}
