import React, { useState, useRef, useEffect } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Film,
  CheckCircle2,
} from 'lucide-react';

interface ServiceVideoPlayerProps {
  videoUrl: string;
  posterUrl?: string;
  title: string;
  technicianName?: string;
  technicianRole?: string;
  autoPlay?: boolean;
  className?: string;
  compact?: boolean;
}

export const ServiceVideoPlayer: React.FC<ServiceVideoPlayerProps> = ({
  videoUrl,
  posterUrl,
  title,
  technicianName = 'Certified Technician',
  technicianRole = 'Specialist at Work',
  autoPlay = false,
  className = '',
  compact = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [hasStarted, setHasStarted] = useState(autoPlay);
  const [progress, setProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Check if URL is YouTube
  const isYouTube =
    videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');

  const getYouTubeEmbedUrl = (url: string) => {
    let videoId = '';
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
    } else if (url.includes('watch?v=')) {
      videoId = url.split('watch?v=')[1]?.split('&')[0] || '';
    } else if (url.includes('embed/')) {
      videoId = url.split('embed/')[1]?.split('?')[0] || '';
    }
    return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=0&rel=0&modestbranding=1`;
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
      setHasStarted(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    const total = videoRef.current.duration || 1;
    setProgress((current / total) * 100);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    videoRef.current.currentTime = pos * (videoRef.current.duration || 1);
  };

  const toggleFullscreen = () => {
    if (!videoRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      videoRef.current.requestFullscreen();
    }
  };

  if (isYouTube) {
    return (
      <div className={`relative aspect-[16/9] w-full rounded-2xl overflow-hidden bg-slate-900 shadow-md ${className}`}>
        <iframe
          src={getYouTubeEmbedUrl(videoUrl)}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
        {/* Verification badge overlay */}
        <div className="absolute top-3 left-3 pointer-events-none glass-card px-2.5 py-1 rounded-md text-[10px] font-bold text-slate-800 flex items-center gap-1.5 shadow-xs">
          <ShieldCheck size={13} className="text-[#176B52]" />
          <span>Real Service Demo</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative group w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden bg-slate-950 border border-slate-200/80 shadow-md ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        poster={posterUrl}
        loop
        playsInline
        muted={isMuted}
        onTimeUpdate={handleTimeUpdate}
        onClick={togglePlay}
        className="w-full h-full object-cover cursor-pointer"
      />

      {/* Top Overlay: Verified Technician & Service Tag */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none z-10">
        <div className="glass-card px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-xs backdrop-blur-md bg-white/90">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
          </span>
          <div className="text-left">
            <div className="text-[11px] font-extrabold text-slate-900 leading-tight">
              Real Doorstep Service Demo
            </div>
            <div className="text-[9px] text-slate-500 font-medium">
              {technicianName} • {technicianRole}
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50/90 px-2.5 py-1 rounded-lg border border-emerald-200/80 backdrop-blur-xs">
          <CheckCircle2 size={12} className="text-[#176B52]" />
          <span>100% Genuine Footage</span>
        </div>
      </div>

      {/* Center Big Play Button (when paused or before start) */}
      {!isPlaying && (
        <button
          type="button"
          onClick={togglePlay}
          className="absolute inset-0 m-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/95 hover:bg-white text-slate-900 flex items-center justify-center shadow-2xl transition-all duration-300 transform hover:scale-110 z-20 group/btn border border-white/60"
          aria-label="Play Real Service Demonstration"
        >
          <Play size={28} className="fill-slate-900 text-slate-900 ml-1 group-hover/btn:text-[#176B52] group-hover/btn:fill-[#176B52] transition-colors" />
        </button>
      )}

      {/* Bottom Controls Bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 z-10 ${
          isHovered || !isPlaying ? 'opacity-100' : 'opacity-0 sm:opacity-0'
        }`}
      >
        {/* Progress Bar */}
        <div
          onClick={handleSeek}
          className="w-full h-1.5 bg-white/25 hover:h-2.5 rounded-full cursor-pointer overflow-hidden transition-all mb-3 relative"
        >
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlay}
              className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>

            <button
              type="button"
              onClick={toggleMute}
              className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>

            <span className="text-[11px] font-semibold text-white/90 truncate max-w-[200px] sm:max-w-xs">
              {title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime = 0;
                  videoRef.current.play();
                  setIsPlaying(true);
                }
              }}
              className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors hidden sm:block"
              title="Replay from start"
            >
              <RotateCcw size={14} />
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg hover:bg-white/20 text-white transition-colors"
              title="Fullscreen"
            >
              <Maximize2 size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
