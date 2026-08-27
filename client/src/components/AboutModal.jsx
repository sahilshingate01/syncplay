import React from 'react';
import { X, ShieldCheck, Zap, HardDrive, Wifi, Sparkles } from 'lucide-react';

export function AboutModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-4xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 relative text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1.5 pr-8">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mb-2">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            About SyncPlay
          </h2>
          <p className="text-xs text-slate-500">
            Next-generation local network synchronized movie theater.
          </p>
        </div>

        {/* 3 Core Pillars */}
        <div className="space-y-3.5">
          <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 flex items-start space-x-3.5">
            <div className="w-8 h-8 rounded-xl bg-purple-200/80 text-purple-700 flex items-center justify-center flex-shrink-0 mt-0.5">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">100% Zero Video Upload</h4>
              <p className="text-[11.5px] text-slate-600 mt-0.5 leading-relaxed">
                Video files never leave your Mac. Each device loads its own copy locally via the HTML5 File API and memory blobs.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 flex items-start space-x-3.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-200/80 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">High-Precision NTP Timestamp Sync</h4>
              <p className="text-[11.5px] text-slate-600 mt-0.5 leading-relaxed">
                Instead of loose play/pause signals, SyncPlay synchronizes clocks with sub-millisecond precision and schedules future playback timestamps.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-start space-x-3.5">
            <div className="w-8 h-8 rounded-xl bg-blue-200/80 text-blue-700 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Wifi className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Smooth Continuous Drift Correction</h4>
              <p className="text-[11.5px] text-slate-600 mt-0.5 leading-relaxed">
                Subtle micro-rate adjustments (0.999x - 1.001x) ensure audio and video never stutter while staying frame-accurate.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <span className="text-[11px] text-slate-400">SyncPlay v1.0 • Built for macOS & Web</span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
