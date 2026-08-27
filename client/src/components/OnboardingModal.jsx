import React, { useState } from 'react';
import { Play, Users, ShieldCheck, Wifi, Sparkles, ArrowRight, Laptop, Film } from 'lucide-react';

export function OnboardingModal({ isOpen, onCreateRoom, onJoinRoom, networkInfo }) {
  if (!isOpen) return null;

  const [mode, setMode] = useState('welcome'); // 'welcome' | 'join' | 'create'
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [userName, setUserName] = useState('Hanna');
  const [roomName, setRoomName] = useState('Movie Night Room');
  const [deviceType, setDeviceType] = useState('MacBook Pro');

  const lanUrl = networkInfo?.lanUrl || `http://${window.location.hostname}:5173`;

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (!roomCodeInput.trim()) return;
    onJoinRoom({
      roomId: roomCodeInput.trim().toUpperCase(),
      userName: userName.trim() || 'MacBook Air',
      deviceType,
    });
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    onCreateRoom({
      roomName: roomName.trim() || 'Movie Night Room',
      userName: userName.trim() || 'Hanna',
      deviceType,
      includeDemoPeers: true,
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-4xl max-w-xl w-full p-7 sm:p-9 shadow-2xl border border-white/80 space-y-7 relative overflow-hidden text-center">
        {/* Background ambient lighting */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-purple-200/50 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-peach/50 blur-3xl pointer-events-none" />

        {/* Top Logo */}
        <div className="flex flex-col items-center space-y-3 relative z-10">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-purple-400 flex items-center justify-center shadow-lg shadow-brand-500/25 text-white">
            <Play className="w-7 h-7 fill-white ml-0.5" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              SyncPlay
            </h2>
            <p className="text-sm font-medium text-slate-500 mt-1">
              Synchronized local movie playback across all your Macs & devices
            </p>
          </div>
        </div>

        {/* Welcome Mode Selection */}
        {mode === 'welcome' && (
          <div className="space-y-4 relative z-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Create Room Card */}
              <button
                onClick={() => setMode('create')}
                className="card-base p-6 text-left hover:border-purple-300 hover:bg-purple-50/40 transition-all duration-200 group flex flex-col justify-between h-44 shadow-sm hover:shadow-md"
              >
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 fill-purple-700 ml-0.5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                    Create a Room
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Start as Host, pick a movie & invite other Macs.
                  </p>
                </div>
              </button>

              {/* Join Room Card */}
              <button
                onClick={() => setMode('join')}
                className="card-base p-6 text-left hover:border-emerald-300 hover:bg-emerald-50/40 transition-all duration-200 group flex flex-col justify-between h-44 shadow-sm hover:shadow-md"
              >
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    Join a Room
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Enter room code to watch in perfect sync.
                  </p>
                </div>
              </button>
            </div>

            {/* Local Network Info Pill */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs text-slate-600 text-left">
              <div className="flex items-center space-x-2">
                <Wifi className="w-4 h-4 text-emerald-600" />
                <span>LAN Host: <strong className="font-mono text-slate-800">{lanUrl}</strong></span>
              </div>
              <span className="text-[11px] text-slate-400">Wi-Fi Connected</span>
            </div>

            {/* Privacy Guarantee */}
            <div className="flex items-center justify-center space-x-2 text-xs font-medium text-slate-400 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Your movie files never leave your device. Zero upload.</span>
            </div>
          </div>
        )}

        {/* Create Mode Form */}
        {mode === 'create' && (
          <form onSubmit={handleCreateSubmit} className="space-y-4 text-left relative z-10">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Room Name
              </label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="e.g. Movie Night Room"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none text-sm font-semibold text-slate-900"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Your Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. Hanna"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none text-sm font-semibold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Device
                </label>
                <select
                  value={deviceType}
                  onChange={(e) => setDeviceType(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none text-sm font-semibold text-slate-900 bg-white"
                >
                  <option value="MacBook Pro">MacBook Pro</option>
                  <option value="MacBook Air">MacBook Air</option>
                  <option value="iMac 24&quot;">iMac 24&quot;</option>
                  <option value="Mac Mini">Mac Mini</option>
                  <option value="iPad Pro">iPad Pro</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-3">
              <button
                type="button"
                onClick={() => setMode('welcome')}
                className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-purple-600 to-brand-600 hover:from-purple-700 hover:to-brand-700 text-white text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
              >
                <span>Launch Movie Night Room</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Join Mode Form */}
        {mode === 'join' && (
          <form onSubmit={handleJoinSubmit} className="space-y-4 text-left relative z-10">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Room Code
              </label>
              <input
                type="text"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                placeholder="e.g. MN-7X9P"
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none text-base font-bold font-mono tracking-wider text-slate-900 uppercase"
                autoFocus
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Your Name
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. Sahil"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none text-sm font-semibold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Device
                </label>
                <select
                  value={deviceType}
                  onChange={(e) => setDeviceType(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 outline-none text-sm font-semibold text-slate-900 bg-white"
                >
                  <option value="MacBook Air">MacBook Air</option>
                  <option value="MacBook Pro">MacBook Pro</option>
                  <option value="iMac 24&quot;">iMac 24&quot;</option>
                  <option value="iPad Pro">iPad Pro</option>
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-3 pt-3">
              <button
                type="button"
                onClick={() => setMode('welcome')}
                className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
              >
                <span>Join & Sync Playback</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
