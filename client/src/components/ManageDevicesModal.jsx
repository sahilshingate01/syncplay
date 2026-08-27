import React from 'react';
import { X, Crown, UserX, Laptop, Monitor, Shield, Check } from 'lucide-react';
import { formatOffset } from '../utils/timeUtils';

export function ManageDevicesModal({ isOpen, onClose, room, isHost, onManageDevice, onUpdateSettings }) {
  if (!isOpen) return null;

  const devices = room?.clients || [];
  const controlMode = room?.settings?.controlMode || 'host_only';

  const handleToggleControlMode = (mode) => {
    if (onUpdateSettings) {
      onUpdateSettings({ ...room?.settings, controlMode });
    }
  };

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
        <div className="space-y-1 pr-8">
          <h2 className="text-xl font-bold text-slate-900">
            Manage Room Devices
          </h2>
          <p className="text-xs text-slate-500">
            Control roles, permissions, and connected clients in this session.
          </p>
        </div>

        {/* Playback Control Permissions Mode */}
        {isHost && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-2.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Playback Control Permission
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleToggleControlMode('host_only')}
                className={`py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 border transition-all ${
                  controlMode === 'host_only'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Host Only</span>
              </button>

              <button
                type="button"
                onClick={() => handleToggleControlMode('everyone')}
                className={`py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 border transition-all ${
                  controlMode === 'everyone'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Everyone</span>
              </button>
            </div>
          </div>
        )}

        {/* Devices List */}
        <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
          <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Connected Devices ({devices.length})
          </label>

          {devices.map((device) => {
            const isDevHost = device.isHost || device.id === room?.hostClientId;

            return (
              <div
                key={device.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/60"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-100/70 text-purple-700 flex items-center justify-center flex-shrink-0">
                    <Laptop className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-800">
                        {device.name}
                      </span>
                      {isDevHost && (
                        <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                          Host
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center space-x-2 mt-0.5">
                      <span>{device.deviceType || 'Mac'}</span>
                      <span>•</span>
                      <span className="text-emerald-600 font-mono">
                        {formatOffset(device.syncOffsetMs || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Host Actions */}
                {isHost && !isDevHost && (
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => onManageDevice('make_host', device.id)}
                      className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-purple-50 text-purple-700 text-[11px] font-semibold border border-purple-200 transition-colors shadow-2xs"
                      title="Promote to Host"
                    >
                      Make Host
                    </button>
                    <button
                      onClick={() => onManageDevice('kick', device.id)}
                      className="p-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 transition-colors shadow-2xs"
                      title="Kick Device"
                    >
                      <UserX className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-2 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
