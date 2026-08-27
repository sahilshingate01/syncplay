import React, { useState, useRef } from 'react';
import { ListMusic, Play, Plus, Trash2, Film, CheckCircle2, Clock } from 'lucide-react';
import { formatDuration } from '../utils/timeUtils';
import { DEMO_VIDEOS } from '../utils/demoVideos';

export function PlaylistView({ room, isHost, onSelectDemoVideo, onSelectFile, onChangeMovie }) {
  const fileInputRef = useRef(null);
  const [playlist, setPlaylist] = useState(room?.playlist || [
    {
      id: 'pl-1',
      title: 'Interstellar',
      duration: 10144,
      filename: 'Interstellar.2014.1080p.mp4',
      addedBy: 'Hanna',
      active: true,
    },
    {
      id: 'pl-2',
      title: 'Tears of Steel',
      duration: 734,
      filename: 'Tears.Of.Steel.2012.4K.mp4',
      addedBy: 'MacBook Air',
      active: false,
    },
    {
      id: 'pl-3',
      title: 'Sintel',
      duration: 888,
      filename: 'Sintel.2010.1080p.mp4',
      addedBy: 'iMac 24"',
      active: false,
    }
  ]);

  const handlePlayItem = (item) => {
    // Find matching demo or set title
    const demo = DEMO_VIDEOS.find(d => d.title.toLowerCase() === item.title.toLowerCase());
    if (demo) {
      onSelectDemoVideo(demo.id);
    } else {
      onChangeMovie({
        title: item.title,
        filename: item.filename,
        duration: item.duration,
      });
    }

    setPlaylist(prev => prev.map(p => ({
      ...p,
      active: p.id === item.id,
    })));
  };

  const handleAddFile = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const newItem = {
        id: `pl-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, "").replace(/[._-]/g, ' '),
        duration: 0,
        filename: file.name,
        addedBy: isHost ? 'Host' : 'You',
        active: false,
      };
      setPlaylist(prev => [...prev, newItem]);
    }
  };

  const handleAddDemo = (demo) => {
    const newItem = {
      id: `pl-${Date.now()}`,
      title: demo.title,
      duration: demo.duration,
      filename: demo.filename,
      addedBy: isHost ? 'Host' : 'You',
      active: false,
    };
    setPlaylist(prev => [...prev, newItem]);
  };

  const handleDeleteItem = (id) => {
    setPlaylist(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-left animate-in fade-in duration-150">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleAddFile}
      />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-borderSubtle">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center">
            <ListMusic className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Movie Night Playlist</h2>
            <p className="text-xs text-slate-500">Queue up local movies for continuous group watch</p>
          </div>
        </div>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add Local Video</span>
        </button>
      </div>

      {/* Current Queue */}
      <div className="space-y-3">
        {playlist.map((item, idx) => (
          <div
            key={item.id}
            className={`card-base p-4.5 flex items-center justify-between transition-all ${
              item.active
                ? 'border-purple-300 bg-purple-50/40 shadow-xs'
                : 'hover:border-slate-300'
            }`}
          >
            <div className="flex items-center space-x-4">
              <span className="text-xs font-bold text-slate-400 font-mono w-4">
                {idx + 1}
              </span>

              <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 flex-shrink-0">
                <Film className="w-5 h-5" />
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-bold text-slate-900">
                    {item.title}
                  </h4>
                  {item.active && (
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse" />
                      <span>Now Playing</span>
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 flex items-center space-x-2 mt-0.5">
                  <span className="font-mono">{formatDuration(item.duration)}</span>
                  <span>•</span>
                  <span>Added by {item.addedBy}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePlayItem(item)}
                className={`p-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                  item.active
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-100 hover:bg-purple-100 text-slate-700 hover:text-purple-700'
                }`}
                title="Play this movie"
              >
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
              </button>

              <button
                onClick={() => handleDeleteItem(item.id)}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Remove from playlist"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Suggested Demo Library */}
      <div className="card-base p-5 space-y-3 bg-slate-50/60">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Add Open Source Demo Clips
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {DEMO_VIDEOS.map((demo) => (
            <button
              key={demo.id}
              onClick={() => handleAddDemo(demo)}
              className="p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-purple-300 hover:bg-purple-50/30 text-left transition-all flex items-center justify-between shadow-2xs"
            >
              <div>
                <span className="block text-xs font-bold text-slate-900">{demo.title}</span>
                <span className="block text-[11px] text-slate-500 font-mono">{demo.metadata}</span>
              </div>
              <Plus className="w-4 h-4 text-purple-600" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
