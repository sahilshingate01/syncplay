import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, X, QrCode, Wifi, Laptop, ShieldCheck } from 'lucide-react';

export function InviteFriendsModal({ isOpen, onClose, room, networkInfo }) {
  if (!isOpen) return null;

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const roomCode = room?.id || 'MN-7X9P';
  const primaryIP = networkInfo?.primaryIP || window.location.hostname;
  const port = window.location.port || '5173';
  const joinUrl = `http://${primaryIP}:${port}/?room=${roomCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-4xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-left space-y-1 pr-8">
          <div className="inline-flex items-center space-x-2 text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full mb-1">
            <Wifi className="w-3.5 h-3.5" />
            <span>Local Network Playback</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Invite Friends & Devices
          </h2>
          <p className="text-xs text-slate-500">
            Any Mac, laptop, or tablet on your Wi-Fi can join this session.
          </p>
        </div>

        {/* QR Code and Direct URL Container */}
        <div className="flex flex-col sm:flex-row items-center gap-6 p-5 rounded-3xl bg-slate-50 border border-slate-200/70">
          {/* QR Code */}
          <div className="bg-white p-3 rounded-2xl shadow-xs border border-slate-200/80 flex-shrink-0 flex flex-col items-center">
            <QRCodeSVG
              value={joinUrl}
              size={120}
              level="M"
              includeMargin={false}
              fgColor="#181826"
            />
            <span className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-wider">
              Scan to Join
            </span>
          </div>

          {/* Join Link & Code */}
          <div className="flex-1 space-y-3.5 text-left w-full">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Room Code
              </label>
              <div className="flex items-center justify-between bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs">
                <span className="font-mono font-bold text-slate-900 text-base">{roomCode}</span>
                <button
                  onClick={handleCopyCode}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                  title="Copy Room Code"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Direct LAN Link
              </label>
              <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-2xs">
                <span className="font-mono text-xs text-slate-700 truncate mr-2">{joinUrl}</span>
                <button
                  onClick={handleCopyLink}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors flex-shrink-0"
                  title="Copy LAN Link"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 3 Step Instructions */}
        <div className="space-y-2 text-left pt-1">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            How it works for your guests:
          </h4>
          <ol className="text-xs text-slate-600 space-y-1.5 list-decimal list-inside">
            <li>Connect to the same Wi-Fi network.</li>
            <li>Open the link above in their browser (Chrome / Safari / Edge).</li>
            <li>Select their local copy of the movie and press <strong>"Enable Playback"</strong>.</li>
          </ol>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center space-x-2 text-[11px] font-medium text-slate-400 pt-2 border-t border-slate-100">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Files stay 100% on each device. No streaming bandwidth consumed.</span>
        </div>
      </div>
    </div>
  );
}
