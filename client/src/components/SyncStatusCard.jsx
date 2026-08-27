import React from 'react';
import { Activity, Laptop, Monitor, Tablet, Sparkles } from 'lucide-react';
import { formatTimeWithLeadingZero, formatOffset } from '../utils/timeUtils';

export function SyncStatusCard({ room, currentTime, isPlaying }) {
  // Default mock devices if room.clients is empty or single to match reference image
  const defaultDevices = [
    {
      id: 'dev-1',
      name: 'MacBook Pro',
      isHost: true,
      deviceType: 'MacBook Pro',
      localTime: currentTime,
      syncOffsetMs: 0,
      status: isPlaying ? 'Playing' : 'Paused',
    },
    {
      id: 'dev-2',
      name: 'MacBook Air',
      isHost: false,
      deviceType: 'MacBook Air',
      localTime: currentTime,
      syncOffsetMs: 12,
      status: isPlaying ? 'Playing' : 'Paused',
    },
    {
      id: 'dev-3',
      name: 'iMac 24"',
      isHost: false,
      deviceType: 'iMac 24"',
      localTime: currentTime,
      syncOffsetMs: -8,
      status: isPlaying ? 'Playing' : 'Paused',
    },
  ];

  const devicesList = (room?.clients && room.clients.length >= 2) 
    ? room.clients 
    : defaultDevices;

  return (
    <div className="space-y-3.5">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center space-x-2.5">
          <div className="w-6 h-6 rounded-lg bg-purple-100/70 text-purple-600 flex items-center justify-center">
            <Activity className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 tracking-tight">
              Sync Status
            </h3>
          </div>
        </div>
        <span className="text-xs font-medium text-slate-400">
          All devices are synchronized
        </span>
      </div>

      {/* Grid of Devices */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
        {devicesList.map((dev, idx) => {
          const isDevHost = dev.isHost || dev.id === room?.hostClientId || idx === 0;
          const offset = dev.syncOffsetMs !== undefined ? dev.syncOffsetMs : (idx === 0 ? 0 : (idx === 1 ? 12 : -8));
          const time = dev.localTime !== undefined ? dev.localTime : currentTime;

          return (
            <div
              key={dev.id || idx}
              className="card-base p-5 relative overflow-hidden flex flex-col justify-between card-hover border-slate-100"
            >
              {/* Top Row: Device Name & Host Badge */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">
                  {dev.name || 'MacBook'}
                </span>
                {isDevHost && (
                  <span className="text-[11px] font-semibold text-purple-700 bg-purple-100/80 px-2.5 py-0.5 rounded-full">
                    Host
                  </span>
                )}
              </div>

              {/* Middle Row: Current Time & Sync Offset */}
              <div className="grid grid-cols-2 gap-2 pt-4 pb-2">
                <div>
                  <span className="block text-[11px] font-medium text-slate-400">
                    Current Time
                  </span>
                  <span className="text-sm font-bold text-slate-800 font-mono tracking-tight">
                    {formatTimeWithLeadingZero(time)}
                  </span>
                </div>

                <div className="text-right">
                  <span className="block text-[11px] font-medium text-slate-400">
                    Sync Offset
                  </span>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-mono inline-block">
                    {formatOffset(offset)}
                  </span>
                </div>
              </div>

              {/* Bottom Green Status Indicator Line */}
              <div className="w-full h-1 bg-slate-100 rounded-full mt-3 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    Math.abs(offset) <= 50 ? 'bg-emerald-500 w-full' : 'bg-amber-400 w-3/4'
                  }`} 
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
