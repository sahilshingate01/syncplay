import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { RoomHeader } from './components/RoomHeader';
import { NowPlayingCard } from './components/NowPlayingCard';
import { PlaybackControls } from './components/PlaybackControls';
import { SyncStatusCard } from './components/SyncStatusCard';
import { ConnectedDevices } from './components/ConnectedDevices';
import { RoomChat } from './components/RoomChat';
import { OnboardingModal } from './components/OnboardingModal';
import { InviteFriendsModal } from './components/InviteFriendsModal';
import { ManageDevicesModal } from './components/ManageDevicesModal';
import { AboutModal } from './components/AboutModal';
import { AutoplayBanner } from './components/AutoplayBanner';
import { TheaterView } from './components/TheaterView';
import { SettingsView } from './components/SettingsView';
import { PlaylistView } from './components/PlaylistView';
import { DevicesView } from './components/DevicesView';
import { useSyncPlay } from './hooks/useSyncPlay';
import { useLocalVideo } from './hooks/useLocalVideo';
import { ShieldCheck, Sparkles, Menu, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('room'); // 'room' | 'now-playing' | 'playlist' | 'settings' | 'devices'
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showManageDevicesModal, setShowManageDevicesModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // SyncPlay engine & WebSocket hook
  const {
    connected,
    clientId,
    room,
    isHost,
    clockOffset,
    currentPing,
    error,
    networkInfo,
    createRoom,
    joinRoom,
    play,
    pause,
    seek,
    syncNow,
    sendChatMessage,
    changeMovie,
    updateSettings,
    updatePlaylist,
    manageDevice,
    reportPlaybackState,
  } = useSyncPlay({
    onPlayAt: (data, offset) => localVideo.handlePlayAt(data, offset),
    onPause: (data) => localVideo.handlePause(data),
    onSeek: (data, offset) => localVideo.handleSeek(data, offset),
    onSyncNow: (data, offset) => localVideo.handleSyncNow(data, offset),
    onMovieChange: (movie) => {
      localVideo.setLocalMovie(prev => ({
        ...prev,
        ...movie,
        isLocalFile: false,
      }));
    }
  });

  // Local Video Player & File API hook
  const localVideo = useLocalVideo({
    onReportState: (pos, isPlaying, status, matches) => {
      reportPlaybackState(pos, isPlaying, status, matches);
    },
    roomPlayback: room?.playback,
  });

  // Auto-detect URL parameter for room code (e.g. ?room=MN-7X9P)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam && !room) {
      joinRoom({
        roomId: roomParam.toUpperCase(),
        userName: 'MacBook Air',
        deviceType: 'MacBook Air',
      });
    }
  }, [joinRoom, room]);

  const handleSelectFile = async (file) => {
    const movieData = await localVideo.handleSelectFile(file);
    if (movieData && isHost) {
      changeMovie({
        title: movieData.title,
        filename: movieData.filename,
        size: movieData.size,
        duration: movieData.duration,
        metadata: movieData.metadata,
        posterUrl: '',
        isDemo: false,
      });
    }
  };

  const handleSelectDemoVideo = (demoId) => {
    const movieData = localVideo.handleSelectDemoVideo(demoId);
    if (movieData && isHost) {
      changeMovie({
        title: movieData.title,
        filename: movieData.filename,
        size: movieData.size,
        duration: movieData.duration,
        metadata: movieData.metadata,
        posterUrl: movieData.posterUrl,
        isDemo: true,
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row text-primaryText font-sans relative">
      {/* Mobile Top Navbar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-borderSubtle">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
            SP
          </div>
          <span className="font-bold text-base text-slate-900">SyncPlay</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-slate-100 text-slate-700"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar (Desktop + Mobile Drawer) */}
      <div className={`${mobileMenuOpen ? 'block' : 'hidden'} md:block fixed md:static inset-0 z-40 bg-white md:bg-transparent`}>
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setMobileMenuOpen(false);
          }}
          room={room}
          isHost={isHost}
          onOpenAbout={() => setShowAboutModal(true)}
          onOpenPromo={() => setShowAboutModal(true)}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Dynamic View Switcher */}
        {activeTab === 'room' && (
          <div className="space-y-6">
            {/* Top Glowing Room Header */}
            <RoomHeader
              room={room}
              connected={connected}
              onOpenInvite={() => setShowInviteModal(true)}
              onRenameRoom={(newName) => updateSettings(room?.settings, newName)}
            />

            {/* Middle Grid: Main Player & Controls on Left, Devices & Chat on Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Center Main Column */}
              <div className="lg:col-span-8 space-y-6">
                {/* Now Playing Card */}
                <NowPlayingCard
                  room={room}
                  localMovie={localVideo.localMovie}
                  videoRef={localVideo.videoRef}
                  currentTime={localVideo.currentTime}
                  duration={localVideo.duration}
                  isPlaying={localVideo.isPlaying}
                  playbackRate={localVideo.playbackRate}
                  movieMatchStatus={localVideo.movieMatchStatus}
                  onPlay={(pos) => play(pos)}
                  onPause={(pos) => pause(pos)}
                  onSeek={(pos) => seek(pos)}
                  onSelectFile={handleSelectFile}
                  onSelectDemoVideo={handleSelectDemoVideo}
                  onToggleTheater={() => setActiveTab('now-playing')}
                  onOpenPlaylist={() => setActiveTab('playlist')}
                />

                {/* Playback Controls Grid (Play, Pause, Seek, Sync Now) */}
                <PlaybackControls
                  isPlaying={localVideo.isPlaying}
                  currentTime={localVideo.currentTime}
                  onPlay={(pos) => play(pos)}
                  onPause={(pos) => pause(pos)}
                  onSeek={(pos) => seek(pos)}
                  onSyncNow={() => syncNow()}
                  isHost={isHost}
                />

                {/* Sync Status Section */}
                <SyncStatusCard
                  room={room}
                  currentTime={localVideo.currentTime}
                  isPlaying={localVideo.isPlaying}
                />
              </div>

              {/* Right Column: Connected Devices + Room Chat */}
              <div className="lg:col-span-4 space-y-6">
                <ConnectedDevices
                  room={room}
                  isHost={isHost}
                  onOpenManageDevices={() => setShowManageDevicesModal(true)}
                />

                <RoomChat
                  room={room}
                  isHost={isHost}
                  onSendMessage={(text, color) => sendChatMessage(text, color)}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Now Playing / Theater Cinema Mode */}
        {activeTab === 'now-playing' && (
          <TheaterView
            room={room}
            localMovie={localVideo.localMovie}
            videoRef={localVideo.videoRef}
            currentTime={localVideo.currentTime}
            duration={localVideo.duration}
            isPlaying={localVideo.isPlaying}
            playbackRate={localVideo.playbackRate}
            onPlay={(pos) => play(pos)}
            onPause={(pos) => pause(pos)}
            onSeek={(pos) => seek(pos)}
            onCloseTheater={() => setActiveTab('room')}
          />
        )}

        {/* Tab 3: Playlist View */}
        {activeTab === 'playlist' && (
          <PlaylistView
            room={room}
            isHost={isHost}
            onSelectDemoVideo={handleSelectDemoVideo}
            onSelectFile={handleSelectFile}
            onChangeMovie={changeMovie}
          />
        )}

        {/* Tab 4: Settings View */}
        {activeTab === 'settings' && (
          <SettingsView
            room={room}
            isHost={isHost}
            onUpdateSettings={updateSettings}
            networkInfo={networkInfo}
          />
        )}

        {/* Tab 5: Devices Diagnostic View */}
        {activeTab === 'devices' && (
          <DevicesView
            room={room}
            isHost={isHost}
            currentTime={localVideo.currentTime}
            onManageDevice={manageDevice}
          />
        )}

        {/* Bottom Trust & Security Banner matching reference */}
        <footer className="pt-6 pb-2 text-center text-xs text-slate-400 flex items-center justify-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-slate-400" />
          <span>End-to-end local network sync</span>
          <span>•</span>
          <span>Your files never leave your devices</span>
        </footer>
      </main>

      {/* Onboarding Modal (Shown when no active room joined) */}
      <OnboardingModal
        isOpen={!room}
        onCreateRoom={createRoom}
        onJoinRoom={joinRoom}
        networkInfo={networkInfo}
      />

      {/* Invite Friends Modal with QR & LAN Link */}
      <InviteFriendsModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        room={room}
        networkInfo={networkInfo}
      />

      {/* Manage Devices Modal */}
      <ManageDevicesModal
        isOpen={showManageDevicesModal}
        onClose={() => setShowManageDevicesModal(false)}
        room={room}
        isHost={isHost}
        onManageDevice={manageDevice}
        onUpdateSettings={updateSettings}
      />

      {/* About Modal */}
      <AboutModal
        isOpen={showAboutModal}
        onClose={() => setShowAboutModal(false)}
      />

      {/* Autoplay Unlock Banner */}
      <AutoplayBanner
        visible={localVideo.autoplayBlocked}
        onUnlock={localVideo.unlockAutoplay}
      />
    </div>
  );
}
