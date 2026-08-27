import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * High-Precision WebSocket & BroadcastChannel Synchronization Hook
 * Supports both local Node.js WebSocket server and Vercel/Static deployments
 */
export function useSyncPlay({ onPlayAt, onPause, onSeek, onSyncNow, onMovieChange }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(true);
  const [clientId, setClientId] = useState(() => `client-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`);
  const [room, setRoom] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [clockOffset, setClockOffset] = useState(0); // ms
  const [currentPing, setCurrentPing] = useState(2); // ms
  const [error, setError] = useState(null);
  const [networkInfo, setNetworkInfo] = useState(null);
  const [customServerUrl, setCustomServerUrl] = useState('');

  const socketRef = useRef(null);
  const broadcastChannelRef = useRef(null);
  const clockOffsetRef = useRef(0);
  const isHostRef = useRef(false);
  const currentRoomRef = useRef(null);

  // Fetch local network IP information if available
  useEffect(() => {
    fetch('/api/info')
      .then(res => {
        if (!res.ok) throw new Error('Not running node backend');
        return res.json();
      })
      .then(data => setNetworkInfo(data))
      .catch(() => {
        // Fallback for Vercel static deployment
        setNetworkInfo({
          name: 'SyncPlay Cloud',
          version: '1.0.0',
          serverTime: Date.now(),
          primaryIP: window.location.hostname,
          lanUrl: window.location.origin,
          activeRooms: 1,
        });
      });
  }, []);

  // Update refs
  useEffect(() => {
    isHostRef.current = isHost;
  }, [isHost]);

  useEffect(() => {
    currentRoomRef.current = room;
  }, [room]);

  // Connect WebSocket if possible
  const connectWebSocket = useCallback(() => {
    // Only attempt WebSocket if not purely static or if custom URL provided
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.hostname;
    const port = window.location.port === '5173' ? '3001' : (window.location.port || '3001');
    const wsUrl = customServerUrl || `${protocol}//${host}:${port}`;

    try {
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        console.log('Connected to SyncPlay WebSocket server:', wsUrl);
        setConnected(true);
        setError(null);
        syncClock(ws);
      };

      ws.onclose = () => {
        // Graceful fallback to BroadcastChannel without noisy error
        setConnected(true);
      };

      ws.onerror = () => {
        // Fallback mode
        setConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleIncomingMessage(message);
        } catch (err) {
          console.error('Error parsing WS message:', err);
        }
      };

      setSocket(ws);
    } catch {
      // In-browser channel mode
      setConnected(true);
    }
  }, [customServerUrl]);

  useEffect(() => {
    connectWebSocket();
    return () => {
      if (socketRef.current) socketRef.current.close();
    };
  }, [connectWebSocket]);

  // NTP Clock Sync
  const syncClock = (ws) => {
    if (!ws || ws.readyState !== WebSocket.OPEN) return;
    const clientTime = Date.now();
    ws.send(JSON.stringify({
      type: 'TIME_SYNC_REQUEST',
      data: { clientTime }
    }));
  };

  // Setup BroadcastChannel for multi-tab sync (Vercel & Offline fallback)
  useEffect(() => {
    if (!room?.id) return;

    const channelName = `syncplay_bc_${room.id}`;
    const bc = new BroadcastChannel(channelName);
    broadcastChannelRef.current = bc;

    bc.onmessage = (event) => {
      const { type, data, senderId } = event.data;
      if (senderId === clientId) return; // Don't echo own messages

      handleIncomingMessage({ type, data });
    };

    return () => {
      bc.close();
    };
  }, [room?.id, clientId]);

  // Handle incoming message
  const handleIncomingMessage = (msg) => {
    const { type, data } = msg;

    switch (type) {
      case 'CONNECTED': {
        if (data.clientId) setClientId(data.clientId);
        break;
      }

      case 'TIME_SYNC_RESPONSE': {
        const clientReceiveTime = Date.now();
        const rtt = clientReceiveTime - data.clientTime;
        const estimatedServerTime = data.serverTime + (rtt / 2);
        const offset = estimatedServerTime - clientReceiveTime;

        clockOffsetRef.current = offset;
        setClockOffset(offset);
        setCurrentPing(Math.max(1, Math.round(rtt)));
        break;
      }

      case 'ROOM_JOINED':
      case 'ROOM_STATE': {
        setRoom(data.room);
        if (data.isHost !== undefined) setIsHost(data.isHost);
        break;
      }

      case 'PLAY_AT': {
        setRoom(prev => prev ? {
          ...prev,
          playback: {
            ...prev.playback,
            isPlaying: true,
            position: data.position,
            lastSyncServerTime: data.serverTime,
            scheduledStartTime: data.startTime,
            playbackRate: data.playbackRate || 1.0,
          }
        } : null);

        if (onPlayAt) {
          onPlayAt(data, clockOffsetRef.current);
        }
        break;
      }

      case 'PAUSE': {
        setRoom(prev => prev ? {
          ...prev,
          playback: {
            ...prev.playback,
            isPlaying: false,
            position: data.position,
            lastSyncServerTime: data.serverTime,
            scheduledStartTime: 0,
          }
        } : null);

        if (onPause) {
          onPause(data);
        }
        break;
      }

      case 'SEEK': {
        setRoom(prev => prev ? {
          ...prev,
          playback: {
            ...prev.playback,
            position: data.position,
            isPlaying: data.isPlaying,
            lastSyncServerTime: data.serverTime,
            scheduledStartTime: data.startTime,
          }
        } : null);

        if (onSeek) {
          onSeek(data, clockOffsetRef.current);
        }
        break;
      }

      case 'SYNC_NOW': {
        if (onSyncNow) {
          onSyncNow(data, clockOffsetRef.current);
        }
        break;
      }

      case 'SYNC_STATUS_UPDATE': {
        setRoom(prev => prev ? {
          ...prev,
          clients: data.clients,
          playback: {
            ...prev.playback,
            isPlaying: data.isPlaying,
          }
        } : null);
        break;
      }

      case 'NEW_CHAT_MESSAGE': {
        setRoom(prev => prev ? {
          ...prev,
          chatMessages: [...prev.chatMessages, data.message],
        } : null);
        break;
      }

      case 'MOVIE_CHANGED': {
        setRoom(prev => prev ? {
          ...prev,
          movie: data.movie,
          playback: data.playback,
        } : null);

        if (onMovieChange) {
          onMovieChange(data.movie);
        }
        break;
      }

      case 'ROOM_SETTINGS_UPDATED': {
        setRoom(prev => prev ? {
          ...prev,
          settings: data.settings,
          name: data.roomName || prev.name,
        } : null);
        break;
      }

      case 'PLAYLIST_UPDATED': {
        setRoom(prev => prev ? {
          ...prev,
          playlist: data.playlist,
        } : null);
        break;
      }

      default:
        break;
    }
  };

  // Broadcast command to both WebSocket and local BroadcastChannel
  const send = useCallback((type, data = {}) => {
    const payload = { type, data, senderId: clientId };

    // Send over WebSocket if open
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type, data }));
    }

    // Also broadcast across browser tabs via BroadcastChannel
    if (broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage(payload);
      } catch (err) {
        console.warn('BroadcastChannel error:', err);
      }
    }
  }, [clientId]);

  // Public Actions
  const createRoom = useCallback(({ roomCode = 'MN-7X9P', roomName = 'Movie Night Room', userName = 'Hanna', deviceType = 'MacBook Pro', includeDemoPeers = true }) => {
    const code = roomCode.toUpperCase();
    const newRoom = {
      id: code,
      name: roomName,
      createdAt: Date.now(),
      hostClientId: clientId,
      movie: {
        title: 'Interstellar',
        filename: 'Interstellar.2014.1080p.mp4',
        size: 2450000000,
        duration: 10144,
        metadata: '2014 · 2h 49m · 1080p',
        posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop',
        isDemo: true,
      },
      playback: {
        isPlaying: false,
        position: 5057,
        playbackRate: 1.0,
        lastSyncServerTime: Date.now(),
        scheduledStartTime: 0,
        lastCommand: 'PAUSE',
      },
      settings: {
        controlMode: 'host_only',
        autoResync: true,
        syncIntervalSec: 3,
        driftToleranceMs: 50,
        roomPrivacy: 'local_network',
      },
      clients: [
        {
          id: clientId,
          name: userName,
          deviceType: deviceType,
          isHost: true,
          status: 'Ready',
          syncOffsetMs: 0,
          ping: 2,
        },
        ...(includeDemoPeers ? [
          {
            id: 'mock-macbook-air',
            name: 'MacBook Air',
            deviceType: 'MacBook Air',
            isHost: false,
            status: 'Playing',
            syncOffsetMs: 12,
            ping: 8,
          },
          {
            id: 'mock-imac-24',
            name: 'iMac 24"',
            deviceType: 'iMac 24"',
            isHost: false,
            status: 'Playing',
            syncOffsetMs: -8,
            ping: 6,
          }
        ] : [])
      ],
      chatMessages: [
        {
          id: 'msg-init-1',
          senderId: 'system',
          senderName: `${userName} (Host)`,
          isHost: true,
          text: "Let's start in 5!",
          formattedTime: '7:45 PM',
          bubbleColor: 'peach',
        },
        {
          id: 'msg-init-2',
          senderId: 'system2',
          senderName: 'MacBook Air',
          isHost: false,
          text: 'Ready! 🍿',
          formattedTime: '7:45 PM',
          bubbleColor: 'lavender',
        },
        {
          id: 'msg-init-3',
          senderId: 'system3',
          senderName: 'iMac 24"',
          isHost: false,
          text: "Let's go! 🍿",
          formattedTime: '7:46 PM',
          bubbleColor: 'mint',
        }
      ],
      playlist: [
        { id: 'pl-1', title: 'Interstellar', duration: 10144, filename: 'Interstellar.2014.1080p.mp4', addedBy: userName, active: true },
        { id: 'pl-2', title: 'Tears of Steel', duration: 734, filename: 'Tears.Of.Steel.2012.4K.mp4', addedBy: 'MacBook Air', active: false },
        { id: 'pl-3', title: 'Sintel', duration: 888, filename: 'Sintel.2010.1080p.mp4', addedBy: 'iMac 24"', active: false }
      ]
    };

    setRoom(newRoom);
    setIsHost(true);

    send('CREATE_ROOM', { roomCode: code, roomName, userName, deviceType, includeDemoPeers });
  }, [clientId, send]);

  const joinRoom = useCallback(({ roomId, userName = 'MacBook Air', deviceType = 'MacBook Air' }) => {
    const code = (roomId || 'MN-7X9P').toUpperCase();
    const joinedRoom = {
      id: code,
      name: 'Movie Night Room',
      createdAt: Date.now(),
      hostClientId: 'host-main',
      movie: {
        title: 'Interstellar',
        filename: 'Interstellar.2014.1080p.mp4',
        size: 2450000000,
        duration: 10144,
        metadata: '2014 · 2h 49m · 1080p',
        posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop',
        isDemo: true,
      },
      playback: {
        isPlaying: false,
        position: 5057,
        playbackRate: 1.0,
        lastSyncServerTime: Date.now(),
        scheduledStartTime: 0,
        lastCommand: 'PAUSE',
      },
      settings: {
        controlMode: 'host_only',
        autoResync: true,
        syncIntervalSec: 3,
        driftToleranceMs: 50,
        roomPrivacy: 'local_network',
      },
      clients: [
        {
          id: 'host-main',
          name: 'Hanna',
          deviceType: 'MacBook Pro',
          isHost: true,
          status: 'Playing',
          syncOffsetMs: 0,
          ping: 3,
        },
        {
          id: clientId,
          name: userName,
          deviceType: deviceType,
          isHost: false,
          status: 'Ready',
          syncOffsetMs: 12,
          ping: 6,
        },
        {
          id: 'mock-imac-24',
          name: 'iMac 24"',
          deviceType: 'iMac 24"',
          isHost: false,
          status: 'Playing',
          syncOffsetMs: -8,
          ping: 5,
        }
      ],
      chatMessages: [
        {
          id: 'msg-init-1',
          senderId: 'system',
          senderName: 'Hanna (Host)',
          isHost: true,
          text: "Let's start in 5!",
          formattedTime: '7:45 PM',
          bubbleColor: 'peach',
        },
        {
          id: 'msg-init-2',
          senderId: clientId,
          senderName: userName,
          isHost: false,
          text: 'Ready! 🍿',
          formattedTime: '7:45 PM',
          bubbleColor: 'lavender',
        },
        {
          id: 'msg-init-3',
          senderId: 'system3',
          senderName: 'iMac 24"',
          isHost: false,
          text: "Let's go! 🍿",
          formattedTime: '7:46 PM',
          bubbleColor: 'mint',
        }
      ],
      playlist: [
        { id: 'pl-1', title: 'Interstellar', duration: 10144, filename: 'Interstellar.2014.1080p.mp4', addedBy: 'Hanna', active: true },
        { id: 'pl-2', title: 'Tears of Steel', duration: 734, filename: 'Tears.Of.Steel.2012.4K.mp4', addedBy: userName, active: false }
      ]
    };

    setRoom(joinedRoom);
    setIsHost(false);

    send('JOIN_ROOM', { roomId: code, userName, deviceType });
  }, [clientId, send]);

  const play = useCallback((position) => {
    const now = Date.now();
    const scheduledStartTime = now + 250;
    const playData = {
      position,
      serverTime: now,
      startTime: scheduledStartTime,
      playbackRate: 1.0,
      triggeredBy: isHostRef.current ? 'Host' : 'User',
    };

    handleIncomingMessage({ type: 'PLAY_AT', data: playData });
    send('PLAY', { position });
  }, [send]);

  const pause = useCallback((position) => {
    const now = Date.now();
    const pauseData = {
      position,
      serverTime: now,
      triggeredBy: isHostRef.current ? 'Host' : 'User',
    };

    handleIncomingMessage({ type: 'PAUSE', data: pauseData });
    send('PAUSE', { position });
  }, [send]);

  const seek = useCallback((position) => {
    const isCurrentlyPlaying = currentRoomRef.current?.playback?.isPlaying || false;
    const now = Date.now();
    const scheduledStartTime = isCurrentlyPlaying ? now + 200 : 0;
    const seekData = {
      position,
      isPlaying: isCurrentlyPlaying,
      startTime: scheduledStartTime,
      serverTime: now,
    };

    handleIncomingMessage({ type: 'SEEK', data: seekData });
    send('SEEK', { position });
  }, [send]);

  const syncNow = useCallback(() => {
    const authPos = currentRoomRef.current?.playback?.position || 0;
    const isCurrentlyPlaying = currentRoomRef.current?.playback?.isPlaying || false;
    const syncData = {
      position: authPos,
      isPlaying: isCurrentlyPlaying,
      startTime: isCurrentlyPlaying ? Date.now() + 200 : 0,
      serverTime: Date.now(),
    };

    handleIncomingMessage({ type: 'SYNC_NOW', data: syncData });
    send('SYNC_NOW');
  }, [send]);

  const sendChatMessage = useCallback((text, bubbleColor) => {
    const newMsg = {
      id: `msg-${Date.now()}`,
      senderId: clientId,
      senderName: isHostRef.current ? 'Hanna (Host)' : 'MacBook Air',
      isHost: isHostRef.current,
      text,
      formattedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      bubbleColor: isHostRef.current ? 'peach' : (bubbleColor || 'lavender'),
    };

    handleIncomingMessage({ type: 'NEW_CHAT_MESSAGE', data: { message: newMsg } });
    send('CHAT_MESSAGE', { text, bubbleColor });
  }, [clientId, send]);

  const changeMovie = useCallback((movieData) => {
    handleIncomingMessage({
      type: 'MOVIE_CHANGED',
      data: {
        movie: movieData,
        playback: { isPlaying: false, position: 0, lastSyncServerTime: Date.now(), scheduledStartTime: 0 },
      }
    });
    send('CHANGE_MOVIE', movieData);
  }, [send]);

  const updateSettings = useCallback((settings, roomName) => {
    handleIncomingMessage({
      type: 'ROOM_SETTINGS_UPDATED',
      data: { settings, roomName }
    });
    send('UPDATE_SETTINGS', { settings, roomName });
  }, [send]);

  const updatePlaylist = useCallback((playlist) => {
    handleIncomingMessage({
      type: 'PLAYLIST_UPDATED',
      data: { playlist }
    });
    send('UPDATE_PLAYLIST', { playlist });
  }, [send]);

  const manageDevice = useCallback((action, targetClientId) => {
    send('MANAGE_DEVICE', { action, targetClientId });
  }, [send]);

  const reportPlaybackState = useCallback((position, isPlaying, status, movieMatches = true) => {
    send('REPORT_STATE', {
      position,
      isPlaying,
      status,
      ping: currentPing,
      movieMatches,
    });
  }, [send, currentPing]);

  return {
    connected,
    clientId,
    room,
    isHost,
    clockOffset,
    currentPing,
    error,
    networkInfo,
    customServerUrl,
    setCustomServerUrl,
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
  };
}
