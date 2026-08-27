import React from 'react';
import { 
  Home, 
  PlaySquare, 
  ListMusic, 
  Settings, 
  Laptop, 
  Info, 
  Play, 
  Sparkles, 
  ChevronRight,
  ChevronDown
} from 'lucide-react';

export function Sidebar({ activeTab, setActiveTab, room, isHost, onOpenAbout, onOpenPromo }) {
  const navItems = [
    { id: 'room', label: 'Room', icon: Home },
    { id: 'now-playing', label: 'Now Playing', icon: PlaySquare },
    { id: 'playlist', label: 'Playlist', icon: ListMusic },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'devices', label: 'Devices', icon: Laptop },
    { id: 'about', label: 'About', icon: Info },
  ];

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-borderSubtle flex flex-col justify-between p-5 min-h-screen select-none">
      {/* Top Section */}
      <div className="space-y-7">
        {/* App Logo */}
        <div className="flex items-center space-x-3 px-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-500 to-purple-400 flex items-center justify-center shadow-md shadow-brand-500/20 text-white">
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-primaryText flex items-center">
              SyncPlay
            </span>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'about') {
                    onOpenAbout();
                  } else {
                    setActiveTab(item.id);
                  }
                }}
                className={`w-full flex items-center space-x-3.5 px-4 py-3 rounded-2xl text-[14px] font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-brand-50 text-brand-600 font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className="space-y-4 pt-6">
        {/* Promotional Card matching reference image */}
        <div className="promo-card-gradient rounded-3xl p-5 relative overflow-hidden shadow-xs border border-white/60">
          {/* Subtle glowing floating orb */}
          <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-gradient-to-br from-purple-300/40 via-peach/30 to-amber-200/30 blur-md pointer-events-none" />
          
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400/40 to-pink-400/40 flex items-center justify-center mb-3 shadow-xs">
            <Sparkles className="w-4 h-4 text-purple-700" />
          </div>

          <h4 className="text-[13.5px] font-bold text-slate-800 leading-snug">
            Perfect sync.<br />Every time.
          </h4>
          <p className="text-[12px] text-slate-600 mt-1 leading-relaxed">
            Movies together,<br />wherever you are.
          </p>

          <button 
            onClick={onOpenPromo}
            className="mt-3.5 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-900 text-white text-[11.5px] font-medium hover:bg-slate-800 transition-colors shadow-sm"
          >
            <span>Learn more</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* User Profile Pill at bottom */}
        <div className="flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-brand-200 to-purple-300 text-brand-700 font-semibold flex items-center justify-center text-sm shadow-xs border-2 border-white">
              {isHost ? 'H' : 'U'}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[13px] font-semibold text-slate-800 leading-tight">
                {isHost ? 'Hanna' : 'Sahil'}
              </span>
              <span className="text-[11.5px] text-slate-500">
                {isHost ? 'Host' : 'Guest'}
              </span>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </div>
      </div>
    </aside>
  );
}
