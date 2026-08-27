import React, { useState } from 'react';
import { Settings, Shield, Crown, Wifi, RefreshCw, CheckCircle2, Lock } from 'lucide-react';

export function SettingsView({ room, isHost, onUpdateSettings, networkInfo }) {
  const [controlMode, setControlMode] = useState(room?.settings?.controlMode || 'host_only');
  const [autoResync, setAutoResync] = useState(room?.settings?.autoResync !== false);
  const [syncIntervalSec, setSyncIntervalSec] = useState(room?.settings?.syncIntervalSec || 3);
  const [roomPrivacy, setRoomPrivacy] = useState(room?.settings?.roomPrivacy || 'local_network');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    if (onUpdateSettings) {
      onUpdateSettings({
        controlMode,
        autoResync,
        syncIntervalSec: parseInt(syncIntervalSec, 10),
        roomPrivacy,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  const primaryIP = networkInfo?.primaryIP || window.location.hostname;

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-left animate-in fade-in duration-150">
      {/* Page Title */}
      <div className="flex items-center justify-between pb-4 border-b border-borderSubtle">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Room Settings</h2>
            <p className="text-xs text-slate-500">Configure playback permissions, sync interval & local network discovery</p>
          </div>
        </div>

        {savedSuccess && (
          <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
            <CheckCircle2 className="w-4 h-4" />
            <span>Settings Saved</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Playback Control Mode */}
        <div className="card-base p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Crown className="w-4 h-4 text-purple-600" />
            <span>Playback Control Permission</span>
          </h3>
          <p className="text-xs text-slate-500">
            Determine who can Play, Pause, Seek, and change movies in this room.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <label
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start space-x-3 ${
                controlMode === 'host_only'
                  ? 'border-purple-500 bg-purple-50/50 shadow-xs'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="controlMode"
                value="host_only"
                checked={controlMode === 'host_only'}
                onChange={() => setControlMode('host_only')}
                disabled={!isHost}
                className="mt-1 text-purple-600 focus:ring-purple-500"
              />
              <div>
                <span className="block text-xs font-bold text-slate-900">Host Only (Recommended)</span>
                <span className="block text-[11px] text-slate-500 mt-0.5">
                  Only the room creator controls the movie timeline.
                </span>
              </div>
            </label>

            <label
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start space-x-3 ${
                controlMode === 'everyone'
                  ? 'border-purple-500 bg-purple-50/50 shadow-xs'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <input
                type="radio"
                name="controlMode"
                value="everyone"
                checked={controlMode === 'everyone'}
                onChange={() => setControlMode('everyone')}
                disabled={!isHost}
                className="mt-1 text-purple-600 focus:ring-purple-500"
              />
              <div>
                <span className="block text-xs font-bold text-slate-900">Everyone</span>
                <span className="block text-[11px] text-slate-500 mt-0.5">
                  Any connected device can play, pause, or seek.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* Sync Engine Parameters */}
        <div className="card-base p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <RefreshCw className="w-4 h-4 text-emerald-600" />
            <span>Automatic Resync & Drift Correction</span>
          </h3>

          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <div>
              <span className="block text-xs font-bold text-slate-900">Automatic Drift Correction</span>
              <span className="block text-[11px] text-slate-500">
                Smoothly micro-adjusts playback rate (0.99x - 1.01x) to keep audio/video in perfect lockstep.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setAutoResync(!autoResync)}
              disabled={!isHost}
              className={`w-12 h-7 rounded-full transition-colors relative flex-shrink-0 ${
                autoResync ? 'bg-emerald-500' : 'bg-slate-300'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full bg-white shadow-md absolute top-1 transition-transform ${
                  autoResync ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <span className="block text-xs font-bold text-slate-900">Sync Check Interval</span>
              <span className="block text-[11px] text-slate-500">
                How frequently devices exchange NTP timestamps to correct drift.
              </span>
            </div>
            <select
              value={syncIntervalSec}
              onChange={(e) => setSyncIntervalSec(e.target.value)}
              disabled={!isHost}
              className="px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white"
            >
              <option value="2">2 seconds (High Precision)</option>
              <option value="3">3 seconds (Standard)</option>
              <option value="5">5 seconds (Low Latency LAN)</option>
              <option value="10">10 seconds</option>
            </select>
          </div>
        </div>

        {/* Local Network Info Card */}
        <div className="card-base p-6 space-y-3 bg-slate-50/60">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Wifi className="w-4 h-4 text-purple-600" />
            <span>Local Network Details</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[11px]">Primary LAN Address</span>
              <span className="font-bold font-mono text-slate-800 text-sm">{primaryIP}:3001</span>
            </div>
            <div className="p-3 bg-white rounded-xl border border-slate-200">
              <span className="text-slate-400 block text-[11px]">Room Privacy</span>
              <span className="font-bold text-slate-800 text-sm">Local Network Only (Zero Upload)</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        {isHost && (
          <div className="text-right pt-2">
            <button
              type="submit"
              className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors shadow-sm"
            >
              Save Settings
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
