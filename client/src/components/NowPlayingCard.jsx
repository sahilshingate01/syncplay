import React, { useRef, useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  SkipBack, 
  SkipForward, 
  FolderOpen, 
  MoreHorizontal, 
  CheckCircle2, 
  Film, 
  Maximize2, 
  Volume2, 
  VolumeX,
  Clapperboard,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { formatTime, formatDuration } from '../utils/timeUtils';
import { DEMO_VIDEOS } from '../utils/demoVideos';

export function NowPlayingCard({
  room,
  localMovie,
  videoRef,
  currentTime,
  duration,
  isPlaying,
  playbackRate,
  movieMatchStatus,
  onPlay,
  onPause,
  onSeek,
  onSelectFile,
  onSelectDemoVideo,
  onToggleTheater,
  onOpenPlaylist,
}) {
  const fileInputRef = useRef(null);
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(currentTime);
  const [isMuted, setIsMuted] = useState(false);
  const [viewMode, setViewMode] = useState('video'); // 'video' | 'poster'

  const displayTime = isSeeking ? seekValue : currentTime;
  const progressPercent = duration > 0 ? (displayTime / duration) * 100 : 0;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onSelectFile(file);
    }
  };

  const handleSliderChange = (e) => {
    const val = parseFloat(e.target.value);
    setSeekValue(val);
  };

  const handleSliderMouseDown = () => {
    setIsSeeking(true);
    setSeekValue(currentTime);
  };

  const handleSliderMouseUp = (e) => {
    setIsSeeking(false);
    const target = parseFloat(e.target.value);
    onSeek(target);
  };

  const handleSkip = (deltaSeconds) => {
    const newPos = Math.max(0, Math.min(duration, currentTime + deltaSeconds));
    onSeek(newPos);
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      onPause(currentTime);
    } else {
      onPlay(currentTime);
    }
  };

  const toggleMute = () => {
    if (videoRef?.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="card-base p-6 sm:p-7 relative transition-all duration-200">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-matroska,.mkv,.mp4,.mov,.webm"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Top Card Header */}
      <div className="flex items-center justify-between pb-5 border-b border-borderSubtle/60">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-100/80 text-purple-700 flex items-center justify-center">
            <Clapperboard className="w-4 h-4" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Now Playing
          </h2>
        </div>

        <div className="flex items-center space-x-2 relative">
          {/* Open File Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-2xl bg-purple-50/80 hover:bg-purple-100/80 text-purple-700 text-xs font-semibold transition-colors border border-purple-200/50 shadow-xs"
          >
            <FolderOpen className="w-4 h-4" />
            <span>Open File</span>
          </button>

          {/* More Options / Demo Picker Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDemoMenu(!showDemoMenu)}
              className="p-2 rounded-2xl hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors border border-transparent hover:border-slate-200"
              title="More options & demo movies"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showDemoMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Demo Movie
                </div>
                {DEMO_VIDEOS.map((demo) => (
                  <button
                    key={demo.id}
                    onClick={() => {
                      onSelectDemoVideo(demo.id);
                      setShowDemoMenu(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      localMovie.title === demo.title ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    <span className="truncate">{demo.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{demo.year}</span>
                  </button>
                ))}
                
                <div className="border-t border-slate-100 my-1 pt-1">
                  <button
                    onClick={() => {
                      fileInputRef.current?.click();
                      setShowDemoMenu(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs text-purple-600 font-medium hover:bg-purple-50 transition-colors flex items-center space-x-2"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    <span>Choose Local MP4/MKV...</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content: Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 pt-6 items-center">
        {/* Left: Movie Poster / Video Viewport */}
        <div className="lg:col-span-5 relative group">
          <div className="aspect-[4/3] sm:aspect-[16/10] lg:aspect-[4/3.2] w-full rounded-3xl overflow-hidden bg-slate-900 relative shadow-md border border-slate-800/20">
            {/* HTML5 Video element */}
            <video
              ref={videoRef}
              src={localMovie.videoUrl}
              poster={localMovie.posterUrl}
              playsInline
              className="w-full h-full object-cover"
              onClick={togglePlayPause}
            />

            {/* Subtle Overlay Controls on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-3.5 pointer-events-none">
              <div className="flex justify-between items-center pointer-events-auto">
                <span className="text-[11px] font-medium text-white/90 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded-full border border-white/10">
                  {localMovie.isLocalFile ? 'Local File' : 'Stream/Demo'}
                </span>
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={toggleMute}
                    className="p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={onToggleTheater}
                    className="p-1.5 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
                    title="Theater Mode"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Status pill in overlay */}
              <div className="self-center pointer-events-auto">
                <button
                  onClick={togglePlayPause}
                  className="w-12 h-12 rounded-full bg-white/30 backdrop-blur-md hover:bg-white/40 text-white flex items-center justify-center transition-transform hover:scale-105"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-white" />
                  ) : (
                    <Play className="w-5 h-5 fill-white ml-0.5" />
                  )}
                </button>
              </div>

              <div className="text-[11px] text-white/80 font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            {/* Poster title watermark if video is paused and has poster */}
            {localMovie.title === 'Interstellar' && !localMovie.isLocalFile && (
              <div className="absolute bottom-3 left-0 right-0 text-center pointer-events-none">
                <span className="text-[11px] font-mono tracking-[0.3em] text-white/80 uppercase font-light drop-shadow-md">
                  INTERSTELLAR
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Metadata, Scrubber, Transport Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Title & Metadata */}
          <div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {localMovie.title || 'Selected Movie'}
            </h3>
            <p className="text-sm font-medium text-slate-500 mt-1">
              {localMovie.metadata || `${localMovie.year || '2024'} · 1080p`}
            </p>
          </div>

          {/* Timeline Scrubber */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 font-mono">
              <span>{formatTime(displayTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>

            {/* Custom Track & Slider */}
            <div className="relative py-1 flex items-center">
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.1}
                value={displayTime}
                onChange={handleSliderChange}
                onMouseDown={handleSliderMouseDown}
                onMouseUp={handleSliderMouseUp}
                onTouchStart={handleSliderMouseDown}
                onTouchEnd={handleSliderMouseUp}
                className="timeline-slider w-full z-10"
                style={{
                  background: `linear-gradient(to right, #7C3AED 0%, #7C3AED ${progressPercent}%, #E2E8F0 ${progressPercent}%, #E2E8F0 100%)`
                }}
              />
            </div>

            {/* Synced Status Badge matching reference */}
            <div className="flex items-center justify-between pt-1">
              <div className="inline-flex items-center space-x-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-emerald-700">✓ Synced</span>
                <span className="text-xs text-emerald-600/90 font-medium hidden sm:inline">
                  All devices are in sync
                </span>
              </div>

              {playbackRate !== 1.0 && (
                <span className="text-[11px] font-mono text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">
                  Drift correction: {playbackRate.toFixed(3)}x
                </span>
              )}
            </div>
          </div>

          {/* Transport Controls Row */}
          <div className="flex items-center justify-center sm:justify-start space-x-4 sm:space-x-5 pt-2">
            {/* -10s Rewind */}
            <button
              onClick={() => handleSkip(-10)}
              className="w-11 h-11 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 flex flex-col items-center justify-center transition-all duration-150 border border-slate-200/60 shadow-xs hover:scale-105 active:scale-95"
              title="Rewind 10 seconds"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="text-[9px] font-bold mt-[-2px]">10</span>
            </button>

            {/* Previous */}
            <button
              onClick={() => onSeek(0)}
              className="w-11 h-11 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-all duration-150 border border-slate-200/60 shadow-xs hover:scale-105 active:scale-95"
              title="Restart / Previous"
            >
              <SkipBack className="w-4 h-4 fill-slate-700" />
            </button>

            {/* Big Main Play/Pause Button */}
            <button
              onClick={togglePlayPause}
              className="w-16 h-16 rounded-full bg-gradient-to-tr from-purple-500 via-brand-600 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white flex items-center justify-center transition-all duration-200 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 active:scale-95"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-7 h-7 fill-white" />
              ) : (
                <Play className="w-7 h-7 fill-white ml-1" />
              )}
            </button>

            {/* Next */}
            <button
              onClick={onOpenPlaylist}
              className="w-11 h-11 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-all duration-150 border border-slate-200/60 shadow-xs hover:scale-105 active:scale-95"
              title="Next movie in playlist"
            >
              <SkipForward className="w-4 h-4 fill-slate-700" />
            </button>

            {/* +10s Forward */}
            <button
              onClick={() => handleSkip(10)}
              className="w-11 h-11 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-700 flex flex-col items-center justify-center transition-all duration-150 border border-slate-200/60 shadow-xs hover:scale-105 active:scale-95"
              title="Forward 10 seconds"
            >
              <RotateCw className="w-4 h-4" />
              <span className="text-[9px] font-bold mt-[-2px]">10</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
