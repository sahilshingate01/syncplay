import React from 'react';
import { Laptop, Monitor, Tablet, SlidersHorizontal, Wifi } from 'lucide-react';

export function ConnectedDevices({ room, onOpenManageDevices, isHost }) {
  // Default mock devices if room.clients is empty or single
  const defaultDevices = [
    {
      id: 'this-dev',
      name: 'This Device (Host)',
      subName: 'MacBook Pro',
      isHost: true,
      role: 'Host',
      status: 'Playing',
      signal: 4,
    },
    {
      id: 'peer-1',
      name: 'MacBook Air',
      subName: 'User',
      isHost: false,
      role: 'User',
      status: 'Playing',
      signal: 3,
    },
    {
      id: 'peer-2',
      name: 'iMac 24"',
      subName: 'User',
      isHost: false,
      role: 'User',
      status: 'Playing',
      signal: 4,
    },
  ];

  const devices = (room?.clients && room.clients.length >= 2)
    ? room.clients.map((c, i) => ({
        id: c.id,
        name: i === 0 ? `This Device (${c.isHost ? 'Host' : 'User'})` : c.name,
        subName: c.deviceType || (c.isHost ? 'Host' : 'User'),
        isHost: c.isHost,
        role: c.isHost ? 'Host' : 'User',
        status: c.status || 'Playing',
        signal: c.signalQuality || 4,
      }))
    : defaultDevices;

  return (
    <div className="card-base p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">
          Connected Devices
        </h3>
        <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold flex items-center justify-center border border-emerald-200/60">
          {devices.length}
        </span>
      </div>

      {/* Device List */}
      <div className="space-y-3">
        {devices.map((device) => (
          <div
            key={device.id}
            className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 border border-purple-100/60">
                {device.name.toLowerCase().includes('imac') ? (
                  <Monitor className="w-4 h-4" />
                ) : (
                  <Laptop className="w-4 h-4" />
                )}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 leading-tight">
                  {device.name}
                </span>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className="text-[11px] text-slate-400">
                    {device.subName}
                  </span>
                  <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full">
                    {device.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Signal Strength Indicator */}
            <div className="flex items-end space-x-0.5 h-3.5 pr-1" title="Signal: Strong LAN connection">
              <div className="w-0.5 h-1.5 bg-emerald-500 rounded-full" />
              <div className="w-0.5 h-2.5 bg-emerald-500 rounded-full" />
              <div className="w-0.5 h-3.5 bg-emerald-500 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Manage Devices Button */}
      <button
        onClick={onOpenManageDevices}
        className="w-full py-2.5 rounded-2xl border border-slate-200/80 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center space-x-2 transition-colors shadow-xs"
      >
        <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
        <span>Manage Devices</span>
      </button>
    </div>
  );
}
