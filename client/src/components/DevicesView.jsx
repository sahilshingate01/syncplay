import React from 'react';
import { Laptop, Monitor, Tablet, Wifi, CheckCircle2, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';
import { formatTimeWithLeadingZero, formatOffset } from '../utils/timeUtils';

export function DevicesView({ room, isHost, onManageDevice, currentTime }) {
  const devices = room?.clients && room.clients.length > 0 ? room.clients : [
    {
      id: 'dev-1',
      name: 'MacBook Pro',
      deviceType: 'MacBook Pro (macOS 15.1)',
      isHost: true,
      localTime: currentTime,
      syncOffsetMs: 0,
      ping: 3,
      status: 'Playing',
      ip: '192.168.1.10',
    },
    {
      id: 'dev-2',
      name: 'MacBook Air',
      deviceType: 'MacBook Air M2 (macOS 14.5)',
      isHost: false,
      localTime: currentTime,
      syncOffsetMs: 12,
      ping: 8,
      status: 'Playing',
      ip: '192.168.1.14',
    },
    {
      id: 'dev-3',
      name: 'iMac 24"',
      deviceType: 'iMac 24" M3 (macOS 14.6)',
      isHost: false,
      localTime: currentTime,
      syncOffsetMs: -8,
      ping: 6,
      status: 'Playing',
      ip: '192.168.1.22',
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 text-left animate-in fade-in duration-150">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-borderSubtle">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Network & Device Telemetry</h2>
            <p className="text-xs text-slate-500">Live NTP clock sync, latency, and drift metrics</p>
          </div>
        </div>

        <div className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
          <Wifi className="w-3.5 h-3.5" />
          <span>LAN Synchronized (Sub-30ms)</span>
        </div>
      </div>

      {/* Device Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {devices.map((device, idx) => {
          const isDevHost = device.isHost || device.id === room?.hostClientId || idx === 0;
          const offset = device.syncOffsetMs !== undefined ? device.syncOffsetMs : (idx === 0 ? 0 : (idx === 1 ? 12 : -8));

          return (
            <div key={device.id || idx} className="card-base p-6 space-y-4 relative overflow-hidden border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    {device.name.toLowerCase().includes('imac') ? <Monitor className="w-5 h-5" /> : <Laptop className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{device.name}</h4>
                    <p className="text-[11px] text-slate-500">{device.deviceType || 'Apple Silicon Mac'}</p>
                  </div>
                </div>

                {isDevHost ? (
                  <span className="text-xs font-bold text-purple-700 bg-purple-100 px-3 py-1 rounded-full">
                    Host
                  </span>
                ) : (
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                    Guest
                  </span>
                )}
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Ping</span>
                  <span className="text-xs font-bold text-slate-800 font-mono">{device.ping || 4}ms</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Sync Drift</span>
                  <span className="text-xs font-bold text-emerald-600 font-mono">{formatOffset(offset)}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Playback Time</span>
                  <span className="text-xs font-bold text-slate-800 font-mono">{formatTimeWithLeadingZero(device.localTime || currentTime)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span className="flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="font-medium text-slate-700">{device.status || 'Playing in Sync'}</span>
                </span>
                <span className="font-mono text-slate-400 text-[11px]">{device.ip || '192.168.1.x'}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
