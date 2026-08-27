import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Clock, 
  RotateCcw, 
  Sliders, 
  Zap,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

export function PlaybackControls({
  isPlaying,
  currentTime,
  onPlay,
  onPause,
  onSeek,
  onSyncNow,
  isHost,
}) {
  const [showSeekModal, setShowSeekModal] = useState(false);
  const [jumpMinutes, setJumpMinutes] = useState('');
  const [jumpSeconds, setJumpSeconds] = useState('');
  const [syncingPulse, setSyncingPulse] = useState(false);

  const handleSyncClick = () => {
    setSyncingPulse(true);
    onSyncNow();
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#10B981', '#8B5CF6', '#F59E0B']
    });
    setTimeout(() => setSyncingPulse(false), 1500);
  };

  const handleSeekSubmit = (e) => {
    e.preventDefault();
    const mins = parseInt(jumpMinutes || '0', 10);
    const secs = parseInt(jumpSeconds || '0', 10);
    const totalSecs = mins * 60 + secs;
    onSeek(totalSecs);
    setShowSeekModal(false);
    setJumpMinutes('');
    setJumpSeconds('');
  };

  return (
    <div className="space-y-3.5">
      {/* Section Header */}
      <div className="flex items-center space-x-2.5 px-1">
        <div className="w-6 h-6 rounded-lg bg-purple-100/70 text-purple-600 flex items-center justify-center">
          <Sliders className="w-3.5 h-3.5" />
        </div>
        <h3 className="text-base font-bold text-slate-800 tracking-tight">
          Playback Controls
        </h3>
      </div>

      {/* 4 Pastel Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
        {/* 1. Play Card */}
        <button
          onClick={() => onPlay(currentTime)}
          className="card-base p-4 sm:p-5 flex items-center space-x-3.5 text-left card-hover group cursor-pointer border-slate-100 hover:border-emerald-200"
        >
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 group-hover:bg-emerald-100 transition-all">
            <Play className="w-5 h-5 fill-emerald-600 ml-0.5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
              Play
            </h4>
            <p className="text-[11.5px] text-slate-500 mt-0.5 leading-tight">
              Play on all devices
            </p>
          </div>
        </button>

        {/* 2. Pause Card */}
        <button
          onClick={() => onPause(currentTime)}
          className="card-base p-4 sm:p-5 flex items-center space-x-3.5 text-left card-hover group cursor-pointer border-slate-100 hover:border-orange-200"
        >
          <div className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center flex-shrink-0 group-hover:scale-105 group-hover:bg-orange-100 transition-all">
            <Pause className="w-5 h-5 fill-orange-500" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
              Pause
            </h4>
            <p className="text-[11.5px] text-slate-500 mt-0.5 leading-tight">
              Pause on all devices
            </p>
          </div>
        </button>

        {/* 3. Seek Card */}
        <button
          onClick={() => setShowSeekModal(true)}
          className="card-base p-4 sm:p-5 flex items-center space-x-3.5 text-left card-hover group cursor-pointer border-slate-100 hover:border-purple-200"
        >
          <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 group-hover:bg-purple-100 transition-all">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
              Seek
            </h4>
            <p className="text-[11.5px] text-slate-500 mt-0.5 leading-tight">
              Jump to time
            </p>
          </div>
        </button>

        {/* 4. Sync Now Card */}
        <button
          onClick={handleSyncClick}
          className={`card-base p-4 sm:p-5 flex items-center space-x-3.5 text-left card-hover group cursor-pointer border-slate-100 hover:border-teal-200 ${
            syncingPulse ? 'ring-2 ring-emerald-400 bg-emerald-50/50' : ''
          }`}
        >
          <div className={`w-11 h-11 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 group-hover:bg-teal-100 transition-all ${
            syncingPulse ? 'animate-spin' : ''
          }`}>
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
              Sync Now
            </h4>
            <p className="text-[11.5px] text-slate-500 mt-0.5 leading-tight">
              Resync all devices
            </p>
          </div>
        </button>
      </div>

      {/* Seek Modal Dialog */}
      {showSeekModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Jump to Time</h3>
                <p className="text-xs text-slate-500">Synchronized seek for all viewers</p>
              </div>
            </div>

            <form onSubmit={handleSeekSubmit} className="space-y-4 pt-2">
              <div className="flex items-center space-x-2">
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Minutes
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 84"
                    value={jumpMinutes}
                    onChange={(e) => setJumpMinutes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none text-sm font-mono"
                    autoFocus
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Seconds
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="59"
                    placeholder="e.g. 17"
                    value={jumpSeconds}
                    onChange={(e) => setJumpSeconds(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none text-sm font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSeekModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition-colors shadow-sm"
                >
                  Jump Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
