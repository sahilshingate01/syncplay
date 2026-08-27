/**
 * Room and Client State Management for SyncPlay
 */

// Generate memorable 6-character room codes like 'MN-7X9P'
function generateRoomCode() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let part1 = '';
  let part2 = '';
  for (let i = 0; i < 2; i++) part1 += chars.charAt(Math.floor(Math.random() * chars.length));
  for (let i = 0; i < 4; i++) part2 += chars.charAt(Math.floor(Math.random() * chars.length));
  return `${part1}-${part2}`;
}

class RoomManager {
  constructor() {
    this.rooms = new Map(); // roomId -> Room object
  }

  createRoom({ roomCode, roomName = 'Movie Night Room', hostClientId, hostName = 'Host', hostDevice = 'MacBook Pro', ip = '127.0.0.1' }) {
    const code = (roomCode || generateRoomCode()).toUpperCase();
    
    const room = {
      id: code,
      name: roomName,
      createdAt: Date.now(),
      hostClientId: hostClientId,
      movie: {
        title: 'Interstellar',
        filename: 'Interstellar.2014.1080p.mp4',
        size: 2450000000,
        duration: 10144, // ~2h 49m
        metadata: '2014 · 2h 49m · 1080p',
        posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop',
        isDemo: true,
      },
      playback: {
        isPlaying: false,
        position: 5057, // 1:24:17 for rich initial UI display
        playbackRate: 1.0,
        lastSyncServerTime: Date.now(),
        scheduledStartTime: 0,
        lastCommand: 'PAUSE',
      },
      settings: {
        controlMode: 'host_only', // 'host_only' | 'everyone'
        autoResync: true,
        syncIntervalSec: 3,
        driftToleranceMs: 50,
        roomPrivacy: 'local_network',
      },
      clients: new Map(), // clientId -> clientObj
      chatMessages: [
        {
          id: 'msg-init-1',
          senderId: 'system',
          senderName: 'Hanna',
          isHost: true,
          deviceType: 'MacBook Pro',
          text: "Let's start in 5!",
          timestamp: Date.now() - 120000,
          formattedTime: '7:45 PM',
          bubbleColor: 'peach',
        },
        {
          id: 'msg-init-2',
          senderId: 'system2',
          senderName: 'MacBook Air',
          isHost: false,
          deviceType: 'MacBook Air',
          text: 'Ready! 🍿',
          timestamp: Date.now() - 60000,
          formattedTime: '7:45 PM',
          bubbleColor: 'lavender',
        },
        {
          id: 'msg-init-3',
          senderId: 'system3',
          senderName: 'iMac 24"',
          isHost: false,
          deviceType: 'iMac 24"',
          text: "Let's go! 🎬",
          timestamp: Date.now() - 10000,
          formattedTime: '7:46 PM',
          bubbleColor: 'mint',
        }
      ],
      playlist: [
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
          title: 'Inception',
          duration: 8880,
          filename: 'Inception.2010.1080p.mp4',
          addedBy: 'MacBook Air',
          active: false,
        },
        {
          id: 'pl-3',
          title: 'Oppenheimer',
          duration: 10800,
          filename: 'Oppenheimer.2023.1080p.mp4',
          addedBy: 'iMac 24"',
          active: false,
        }
      ]
    };

    this.rooms.set(code, room);
    return room;
  }

  getRoom(roomId) {
    if (!roomId) return null;
    return this.rooms.get(roomId.toUpperCase()) || null;
  }

  addClientToRoom(roomId, clientData) {
    const room = this.getRoom(roomId);
    if (!room) return null;

    const isFirstClient = room.clients.size === 0;
    const isHost = room.hostClientId === clientData.id || isFirstClient;
    if (isFirstClient) {
      room.hostClientId = clientData.id;
    }

    const client = {
      id: clientData.id,
      name: clientData.name || (isHost ? 'Host' : `Device ${room.clients.size + 1}`),
      deviceType: clientData.deviceType || 'MacBook Pro',
      isHost: isHost,
      ip: clientData.ip || '127.0.0.1',
      ping: 4, // ms
      clockOffset: 0, // ms
      localTime: room.playback.position,
      syncOffsetMs: 0,
      status: 'Ready', // 'Playing' | 'Paused' | 'Buffering' | 'Ready' | 'Out of Sync'
      isReady: true,
      lastSeen: Date.now(),
      signalQuality: 4, // 1 - 4
      movieMatches: true,
    };

    room.clients.set(client.id, client);
    return { room, client };
  }

  removeClient(clientId) {
    for (const [roomId, room] of this.rooms.entries()) {
      if (room.clients.has(clientId)) {
        const removedClient = room.clients.get(clientId);
        room.clients.delete(clientId);

        // If host left, migrate host to next available client
        if (room.hostClientId === clientId && room.clients.size > 0) {
          const nextHost = Array.from(room.clients.values())[0];
          nextHost.isHost = true;
          room.hostClientId = nextHost.id;
        }

        // Clean up empty rooms after 30 minutes
        if (room.clients.size === 0) {
          setTimeout(() => {
            if (this.rooms.get(roomId)?.clients.size === 0) {
              this.rooms.delete(roomId);
            }
          }, 1800000);
        }

        return { room, removedClient };
      }
    }
    return null;
  }

  getClientRoom(clientId) {
    for (const room of this.rooms.values()) {
      if (room.clients.has(clientId)) {
        return room;
      }
    }
    return null;
  }

  updateClient(clientId, updates) {
    const room = this.getClientRoom(clientId);
    if (!room) return null;
    const client = room.clients.get(clientId);
    if (!client) return null;

    Object.assign(client, updates);
    client.lastSeen = Date.now();
    return { room, client };
  }

  addChatMessage(roomId, message) {
    const room = this.getRoom(roomId);
    if (!room) return null;

    const formattedMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      senderId: message.senderId,
      senderName: message.senderName || 'Anonymous',
      isHost: message.isHost || false,
      deviceType: message.deviceType || 'MacBook',
      text: message.text,
      timestamp: Date.now(),
      formattedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      bubbleColor: message.isHost ? 'peach' : (message.bubbleColor || 'lavender'),
    };

    room.chatMessages.push(formattedMessage);
    // Keep last 100 messages
    if (room.chatMessages.length > 100) {
      room.chatMessages.shift();
    }

    return formattedMessage;
  }

  getSerializableRoomState(roomId) {
    const room = this.getRoom(roomId);
    if (!room) return null;

    return {
      id: room.id,
      name: room.name,
      createdAt: room.createdAt,
      hostClientId: room.hostClientId,
      movie: room.movie,
      playback: room.playback,
      settings: room.settings,
      clients: Array.from(room.clients.values()),
      chatMessages: room.chatMessages,
      playlist: room.playlist,
      serverTime: Date.now(),
    };
  }
}

module.exports = new RoomManager();
