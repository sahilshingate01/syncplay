import React from 'react';
import { 
  Minimize2, 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  VolumeX,
  Clapperboard,
  Sparkles,
  Wifi
} from 'lucide-react';
import { formatTime, formatDuration, formatOffset } from '../utils/timeUtils';

export function TheaterView({
  room,
  localMovie,
  videoRef,
  currentTime,
  duration,
  isPlaying,
  playbackRate,
  onPlay,
  onPause,
  onSeek,
  onCloseTheater,
}) {
  const [isMuted, setIsMuted] = React.useState(false);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

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

  const handleSliderChange = (e) => {
    const val = parseFloat(e.target.value);
    onSeek(val);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-in fade-in duration-200 text-left">
      {/* Video Container */}
      <div className="relative aspect-[16/9] w-full bg-black rounded-4xl overflow-hidden shadow-2xl border border-slate-800">
        <video
          ref={videoRef}
          src={localMovie.videoUrl}
          poster={localMovie.posterUrl}
          playsInline
          className="w-full h-full object-contain"
          onClick={togglePlayPause}
        />

        {/* Top HUD */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
          <div className="bg-black/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center space-x-3 pointer-events-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-white tracking-wide">{localMovie.title}</span>
            <span className="text-[11px] text-slate-400 font-mono">{localMovie.metadata}</span>
          </div>

          <div className="flex items-center space-x-2 pointer-events-auto">
            <div className="bg-black/60 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10 text-xs font-mono text-emerald-400 flex items-center space-x-1.5">
              <Wifi className="w-3.5 h-3.5" />
              <span>Synced (±0ms)</span>
            </div>
            <button
              onClick={onCloseTheater}
              className="p-2 rounded-2xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white border border-white/10 transition-colors"
              title="Return to Dashboard"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom Floating Glass Controls */}
        <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-lg p-4 rounded-3xl border border-white/15 shadow-2xl space-y-3">
          {/* Scrubber */}
          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono font-semibold text-slate-300 w-12 text-left">
              {formatTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleSliderChange}
              className="timeline-slider flex-1"
              style={{
                background: `linear-gradient(to right, #7C3AED 0%, #7C3AED ${progressPercent}%, rgba(255,255,255,0.2) ${progressPercent}%, rgba(255,255,255,0.2) 100%)`
              }}
            />
            <span className="text-xs font-mono font-semibold text-slate-400 w-12 text-right">
              {formatTime(duration)}
            </span>
          </div>

          {/* Transport Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => onSeek(Math.max(0, currentTime - 10))}
                className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={togglePlayPause}
                className="w-10 h-10 rounded-full bg-white hover:bg-slate-100 text-slate-900 flex items-center justify-center transition-transform hover:scale-105"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-slate-900" /> : <Play className="w-5 h-5 fill-slate-900 ml-0.5" />}
              </button>

              <button
                onClick={() => onSeek(Math.min(duration, currentTime + 10))}
                className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={toggleMute}
                className="p-2 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <button
                onClick={onCloseTheater}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
              >
                Exit Cinema View
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
