import React, { useState } from 'react';
import { Pencil, Copy, Check, UserPlus, Wifi } from 'lucide-react';

export function RoomHeader({ room, connected, onOpenInvite, onRenameRoom }) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(room?.name || 'Movie Night Room');

  const roomCode = room?.id || 'MN-7X9P';
  const devicesCount = room?.clients?.length || 3;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveName = () => {
    setIsEditing(false);
    if (onRenameRoom && editedName.trim()) {
      onRenameRoom(editedName.trim());
    }
  };

  return (
    <div className="room-header-gradient rounded-3xl p-6 sm:p-7 relative overflow-hidden transition-all duration-300">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-1/4 w-72 h-72 rounded-full bg-white/40 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
        {/* Left Info Column */}
        <div className="space-y-4">
          {/* Room Title */}
          <div className="flex items-center space-x-2.5">
            {isEditing ? (
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                autoFocus
                className="text-2xl sm:text-[28px] font-bold text-slate-900 bg-white/80 backdrop-blur-sm border border-purple-300 rounded-xl px-3 py-1 outline-none shadow-xs"
              />
            ) : (
              <h1 className="text-2xl sm:text-[28px] font-bold text-slate-900 tracking-tight">
                {room?.name || 'Movie Night Room'}
              </h1>
            )}

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-1.5 rounded-full hover:bg-white/60 text-slate-500 hover:text-slate-800 transition-colors"
              title="Edit room name"
            >
              <Pencil className="w-4 h-4" />
            </button>
          </div>

          {/* Badges Row */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Room Code Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/60 shadow-xs text-xs">
              <span className="text-slate-500 font-medium">Room Code</span>
              <span className="font-bold text-slate-900 font-mono tracking-wider">{roomCode}</span>
              <button
                onClick={handleCopyCode}
                className="p-1 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors ml-0.5"
                title="Copy Room Code"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Network Status Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/60 shadow-xs text-xs">
              <span className="text-slate-500 font-medium">Local Network</span>
              <span className="flex items-center space-x-1.5">
                <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span className="font-semibold text-slate-800">
                  {connected ? 'Connected' : 'Connecting...'}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Right Action Column */}
        <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-start md:items-end lg:items-center gap-3">
          {/* Invite Friends Button */}
          <button
            onClick={onOpenInvite}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-white text-slate-800 text-xs sm:text-[13px] font-semibold hover:bg-slate-50 transition-all duration-150 shadow-sm hover:shadow border border-white/80"
          >
            <UserPlus className="w-4 h-4 text-brand-600" />
            <span>Invite Friends</span>
          </button>

          {/* Connected Count Pill */}
          <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-2xl bg-white/70 backdrop-blur-md text-xs font-medium text-slate-700 border border-white/60 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{devicesCount} devices connected</span>
          </div>
        </div>
      </div>
    </div>
  );
}
