import React from 'react';
import { Volume2, Play, Sparkles } from 'lucide-react';

export function AutoplayBanner({ visible, onUnlock }) {
  if (!visible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900/90 text-white backdrop-blur-md px-6 py-3.5 rounded-full shadow-2xl border border-white/20 flex items-center space-x-4">
        <div className="w-8 h-8 rounded-full bg-purple-500/30 text-purple-300 flex items-center justify-center flex-shrink-0">
          <Volume2 className="w-4 h-4" />
        </div>
        <div className="text-left">
          <span className="block text-xs font-bold text-white">Ready to Sync Playback</span>
          <span className="block text-[11px] text-slate-300">Browser audio policy requires 1 click to unlock.</span>
        </div>
        <button
          onClick={onUnlock}
          className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white text-xs font-bold transition-all shadow-md hover:scale-105 flex items-center space-x-1.5 flex-shrink-0"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>Enable Playback</span>
        </button>
      </div>
    </div>
  );
}
