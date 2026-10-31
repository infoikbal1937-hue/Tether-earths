import React, { useState } from 'react';
import {
  Lock,
  Plus,
  Trash2,
  RefreshCw,
  ArrowLeft,
  CheckCircle2,
  Youtube,
  ExternalLink,
  ShieldCheck,
  Copy,
  Mail,
  Film,
  Sparkles,
} from 'lucide-react';
import { DocumentaryItem } from './DocumentaryModal';

interface AdminDashboardProps {
  customDocs: DocumentaryItem[];
  autoSyncedDocs: DocumentaryItem[];
  baseDocs: DocumentaryItem[];
  channelId: string;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  onAddCustomVideo: (doc: DocumentaryItem) => void;
  onDeleteCustomVideo: (id: string) => void;
  onClearCustomVideos: () => void;
  onTriggerSync: () => Promise<void>;
  onUpdateChannelId: (newChannelId: string) => void;
  onExitAdmin: () => void;
}

const DEFAULT_PASSCODE = 'tetherearth2026';
const PASSCODE_STORAGE_KEY = 'tetherearth_admin_passcode_v1';
const AUTH_SESSION_KEY = 'tetherearth_admin_authed_v1';

function extractYouTubeId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const regExp =
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?|shorts|live)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = trimmed.match(regExp);
  return match ? match[1] : null;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  customDocs,
  autoSyncedDocs,
  baseDocs,
  channelId,
  isSyncing,
  lastSyncedAt,
  onAddCustomVideo,
  onDeleteCustomVideo,
  onClearCustomVideos,
  onTriggerSync,
  onUpdateChannelId,
  onExitAdmin,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem(AUTH_SESSION_KEY) === 'true';
  });
  const [passcodeInput, setPasscodeInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Add Video Form State
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoLocation, setVideoLocation] = useState('Tether Earth Expedition');
  const [videoSynopsis, setVideoSynopsis] = useState('');
  const [formFeedback, setFormFeedback] = useState('');
  const [formError, setFormError] = useState('');

  // Channel ID & Passcode Settings
  const [channelIdInput, setChannelIdInput] = useState(channelId);
  const [newPasscode, setNewPasscode] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const savedPasscode =
    localStorage.getItem(PASSCODE_STORAGE_KEY) || DEFAULT_PASSCODE;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcodeInput.trim() === savedPasscode) {
      sessionStorage.setItem(AUTH_SESSION_KEY, 'true');
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Invalid admin passcode. Please try again.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    setIsAuthenticated(false);
    setPasscodeInput('');
  };

  const handleAddVideoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const extractedId = extractYouTubeId(videoUrl);
    if (!extractedId) {
      setFormError(
        'Please enter a valid YouTube Video URL (e.g., https://www.youtube.com/watch?v=...) or 11-character Video ID.'
      );
      setFormFeedback('');
      return;
    }

    const cleanTitle =
      videoTitle.trim() || `TetherEarth Wildlife Release (${extractedId})`;

    const newDoc: DocumentaryItem = {
      id: `custom-${extractedId}-${Date.now()}`,
      youtubeId: extractedId,
      title: cleanTitle,
      originalTitle: cleanTitle,
      subtitle: 'Official YouTube Channel Release',
      duration: '4K ULTRA HD',
      location: videoLocation.trim() || 'Tether Earth Expedition',
      coordinates: `YouTube ID: ${extractedId}`,
      resolution: '4K ULTRA HD · 60 FPS',
      sceneType: 'lion_python',
      soundCue: 'lion',
      thumbnailUrl: `https://i.ytimg.com/vi/${extractedId}/hqdefault.jpg`,
      synopsis:
        videoSynopsis.trim() ||
        'Official 4K Ultra HD wildlife documentary release from the Tether Earth YouTube channel (@TetherEarth).',
      fieldNotes: 'Added via TetherEarth Private Admin Studio.',
    };

    onAddCustomVideo(newDoc);
    setVideoUrl('');
    setVideoTitle('');
    setVideoSynopsis('');
    setFormError('');
    setFormFeedback('Video added and published as Latest Video!');
    setTimeout(() => setFormFeedback(''), 4000);
  };

  const handleSavePasscode = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPasscode.trim().length < 4) return;
    localStorage.setItem(PASSCODE_STORAGE_KEY, newPasscode.trim());
    setNewPasscode('');
    setFormFeedback('Admin passcode updated successfully!');
    setTimeout(() => setFormFeedback(''), 3500);
  };

  const adminDirectUrl = `${window.location.origin}/admin`;

  const copyAdminLink = () => {
    navigator.clipboard.writeText(adminDirectUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen w-full premium-two-color-bg text-[#f3f6f1] flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md rounded-3xl glass-panel p-7 sm:p-10 border border-[#b5d69c]/30 shadow-2xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#b5d69c]/15 border border-[#b5d69c]/40 flex items-center justify-center text-[#b5d69c]">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold text-white">
                  TetherEarth Admin
                </h1>
                <p className="text-xs text-[#9fb09c]">
                  Owner-Only Video Backend Portal
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onExitAdmin}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Site</span>
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#d2ddd0] mb-1.5">
                Enter Admin Passcode
              </label>
              <input
                type="password"
                value={passcodeInput}
                onChange={(e) => setPasscodeInput(e.target.value)}
                placeholder="Enter passcode..."
                className="w-full px-4 py-3 rounded-xl bg-[#070b08] border border-white/15 text-sm text-white placeholder-[#6e7f6b] focus:outline-none focus:border-[#b5d69c]"
                autoFocus
                required
              />
            </div>

            {loginError && (
              <p className="text-xs text-[#fbbf24] font-medium">{loginError}</p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 rounded-full bg-[#b5d69c] text-[#070b08] font-semibold text-sm hover:bg-white transition-colors cursor-pointer shadow-lg"
            >
              Unlock Video Manager
            </button>
          </form>

          <div className="pt-4 border-t border-white/10 text-[11px] text-[#9fb09c] leading-relaxed">
            This portal is hidden from regular visitors. Only the channel owner with the
            secret link and passcode can add or manage featured videos.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full premium-two-color-bg text-[#f3f6f1] py-10 px-4 sm:px-6 md:px-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Bar */}
        <div className="rounded-3xl glass-panel p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-5 border border-[#b5d69c]/30">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#b5d69c]">
              <ShieldCheck className="w-4 h-4" />
              <span>PRIVATE OWNER BACKEND · @TetherEarth</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-white">
              TetherEarth Video & Channel Manager
            </h1>
            <p className="text-xs sm:text-sm text-[#cbd6c8]">
              Add new YouTube videos, manage pinned releases, or auto-sync directly with
              your YouTube channel.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={copyAdminLink}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5 text-[#b5d69c]" />
              <span>{copiedLink ? 'Secret Link Copied!' : 'Copy Admin Link'}</span>
            </button>

            <button
              type="button"
              onClick={onExitAdmin}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#b5d69c] text-[#070b08] hover:bg-white text-xs font-semibold transition-colors cursor-pointer shadow-md"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>View Live Website</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-full bg-white/5 hover:bg-white/15 text-xs text-[#cbd6c8] cursor-pointer"
            >
              Lock
            </button>
          </div>
        </div>

        {formFeedback && (
          <div className="p-4 rounded-2xl bg-[#b5d69c]/15 border border-[#b5d69c]/50 flex items-center gap-3 text-sm text-[#b5d69c]">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{formFeedback}</span>
          </div>
        )}

        {/* Main Grid: Left = Add New Video + Auto-Sync Settings, Right = Current Channel Videos */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left 5 Cols: Add Video Form & Auto-Sync Controls */}
          <div className="lg:col-span-5 space-y-6">
            {/* Manual Video Publisher */}
            <div className="rounded-3xl glass-panel p-6 sm:p-7 space-y-5">
              <div className="flex items-center gap-2.5">
                <Plus className="w-5 h-5 text-[#b5d69c]" />
                <h2 className="font-display text-xl font-bold text-white">
                  Publish / Pin Latest Video
                </h2>
              </div>

              <form onSubmit={handleAddVideoSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#d2ddd0] mb-1.5">
                    YouTube Video URL or 11-Character Video ID *
                  </label>
                  <input
                    type="text"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[#070b08] border border-white/15 text-sm text-white placeholder-[#6e7f6b] focus:outline-none focus:border-[#b5d69c]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#d2ddd0] mb-1.5">
                    Video Title (English or Spanish)
                  </label>
                  <input
                    type="text"
                    value={videoTitle}
                    onChange={(e) => setVideoTitle(e.target.value)}
                    placeholder="WILD SERENGETI | The Untold Encounter..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[#070b08] border border-white/15 text-sm text-white placeholder-[#6e7f6b] focus:outline-none focus:border-[#b5d69c]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#d2ddd0] mb-1.5">
                    Expedition Location
                  </label>
                  <input
                    type="text"
                    value={videoLocation}
                    onChange={(e) => setVideoLocation(e.target.value)}
                    placeholder="Okavango Delta, Botswana"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#070b08] border border-white/15 text-sm text-white placeholder-[#6e7f6b] focus:outline-none focus:border-[#b5d69c]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#d2ddd0] mb-1.5">
                    Short Episode Synopsis
                  </label>
                  <textarea
                    rows={3}
                    value={videoSynopsis}
                    onChange={(e) => setVideoSynopsis(e.target.value)}
                    placeholder="Describe the wildlife encounter..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[#070b08] border border-white/15 text-sm text-white placeholder-[#6e7f6b] focus:outline-none focus:border-[#b5d69c] resize-none"
                  />
                </div>

                {formError && (
                  <p className="text-xs text-[#fbbf24]">{formError}</p>
                )}

                <button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-[#b5d69c] text-[#070b08] font-semibold text-sm hover:bg-white transition-colors cursor-pointer shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Video to Website</span>
                </button>
              </form>
            </div>

            {/* Automatic YouTube Channel Feed Sync */}
            <div className="rounded-3xl glass-panel p-6 sm:p-7 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#b5d69c]" />
                  <h3 className="font-display text-lg font-bold text-white">
                    Auto-Update from YouTube
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#b5d69c]/15 border border-[#b5d69c]/40 text-[11px] font-mono text-[#b5d69c]">
                  ACTIVE
                </span>
              </div>

              <p className="text-xs text-[#cbd6c8] leading-relaxed">
                Your website automatically checks your YouTube channel feed (
                <code className="text-[#b5d69c]">{channelId}</code>) on every page load so
                new uploads appear automatically on Vercel.
              </p>

              <div className="space-y-2">
                <label className="block text-xs font-medium text-[#d2ddd0]">
                  YouTube Channel ID
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={channelIdInput}
                    onChange={(e) => setChannelIdInput(e.target.value)}
                    className="flex-1 px-3.5 py-2 rounded-xl bg-[#070b08] border border-white/15 text-xs font-mono text-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      onUpdateChannelId(channelIdInput.trim());
                      setFormFeedback('Channel ID saved & syncing...');
                      setTimeout(() => setFormFeedback(''), 3000);
                    }}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onTriggerSync}
                  disabled={isSyncing}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing Feed...' : 'Sync Channel Now'}</span>
                </button>

                {lastSyncedAt && (
                  <span className="text-[11px] font-mono text-[#9fb09c]">
                    Synced: {lastSyncedAt}
                  </span>
                )}
              </div>
            </div>

            {/* Contact Email Routing Info & Passcode Update */}
            <div className="rounded-3xl glass-panel p-6 sm:p-7 space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#b5d69c]">
                <Mail className="w-4 h-4" />
                <span>Contact Form Email Delivery</span>
              </div>
              <p className="text-xs text-[#cbd6c8] leading-relaxed">
                All contact form submissions are routed directly to:{' '}
                <strong className="text-white font-mono">
                  info.meharujjaman@gmail.com
                </strong>
              </p>

              <form onSubmit={handleSavePasscode} className="pt-3 border-t border-white/10 space-y-2">
                <label className="block text-xs font-medium text-[#d2ddd0]">
                  Change Admin Passcode
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={newPasscode}
                    onChange={(e) => setNewPasscode(e.target.value)}
                    placeholder="New passcode (min 4 chars)"
                    className="flex-1 px-3.5 py-2 rounded-xl bg-[#070b08] border border-white/15 text-xs text-white"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white cursor-pointer"
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right 7 Cols: Active Videos List */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-3xl glass-panel p-6 sm:p-7 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Film className="w-5 h-5 text-[#b5d69c]" />
                  <h2 className="font-display text-xl font-bold text-white">
                    Active Channel Videos ({customDocs.length + autoSyncedDocs.length + baseDocs.length})
                  </h2>
                </div>
                {customDocs.length > 0 && (
                  <button
                    type="button"
                    onClick={onClearCustomVideos}
                    className="text-xs text-[#fbbf24] hover:underline cursor-pointer"
                  >
                    Reset Custom Videos
                  </button>
                )}
              </div>

              {/* Custom Pinned Videos */}
              {customDocs.length > 0 && (
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-[#b5d69c]">
                    Manually Added / Pinned Videos ({customDocs.length})
                  </div>
                  {customDocs.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-black/45 border border-[#b5d69c]/40"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <img
                          src={doc.thumbnailUrl}
                          alt={doc.title}
                          className="w-24 aspect-video rounded-xl object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-semibold text-white truncate">
                            {doc.title}
                          </h4>
                          <p className="text-[11px] font-mono text-[#b5d69c]">
                            ID: {doc.youtubeId} · {doc.location}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onDeleteCustomVideo(doc.id)}
                        className="p-2 rounded-xl bg-red-500/15 text-red-300 hover:bg-red-500/30 transition-colors cursor-pointer shrink-0"
                        title="Remove video"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Live Auto-Synced Channel Feed Videos */}
              <div className="space-y-3">
                <div className="text-xs font-semibold text-[#d2ddd0]">
                  Channel Catalog & Auto-Synced Videos
                </div>
                <div className="space-y-3 max-h-[540px] overflow-y-auto pr-1">
                  {[...autoSyncedDocs, ...baseDocs]
                    .filter(
                      (v, i, arr) =>
                        arr.findIndex((x) => x.youtubeId === v.youtubeId) === i
                    )
                    .map((doc, idx) => (
                      <div
                        key={doc.youtubeId}
                        className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-black/35 border border-white/10"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <img
                            src={doc.thumbnailUrl}
                            alt={doc.title}
                            className="w-24 aspect-video rounded-xl object-cover shrink-0"
                          />
                          <div className="min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                              {idx === 0 && customDocs.length === 0 && (
                                <span className="px-2 py-0.5 rounded-full bg-[#b5d69c] text-[#070b08] text-[10px] font-bold">
                                  LATEST
                                </span>
                              )}
                              <span className="text-[11px] font-mono text-[#9fb09c]">
                                {doc.youtubeId}
                              </span>
                            </div>
                            <h4 className="text-xs sm:text-sm font-semibold text-white line-clamp-1">
                              {doc.title}
                            </h4>
                          </div>
                        </div>

                        <a
                          href={`https://www.youtube.com/watch?v=${doc.youtubeId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white shrink-0"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
