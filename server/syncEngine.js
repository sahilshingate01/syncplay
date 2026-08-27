/**
 * SyncEngine - High-Precision Timestamp Synchronization & Playback Controller
 */
const roomManager = require('./rooms');

// Calculate current authoritative position of a room
function calculateAuthoritativePosition(room) {
  if (!room || !room.playback) return 0;
  
  if (!room.playback.isPlaying) {
    return room.playback.position;
  }

  const now = Date.now();
  if (room.playback.scheduledStartTime && now < room.playback.scheduledStartTime) {
    // Has not reached scheduled playback start time yet
    return room.playback.position;
  }

  const baseTime = room.playback.scheduledStartTime || room.playback.lastSyncServerTime;
  const elapsedMs = Math.max(0, now - baseTime);
  const elapsedSec = (elapsedMs / 1000) * (room.playback.playbackRate || 1.0);
  
  return room.playback.position + elapsedSec;
}

class SyncEngine {
  constructor(wss) {
    this.wss = wss;
    this.clientSockets = new Map(); // clientId -> ws connection
  }

  registerClient(clientId, ws) {
    this.clientSockets.set(clientId, ws);
  }

  unregisterClient(clientId) {
    this.clientSockets.delete(clientId);
  }

  sendToClient(clientId, message) {
    const ws = this.clientSockets.get(clientId);
    if (ws && ws.readyState === 1) { // WebSocket.OPEN
      ws.send(JSON.stringify(message));
    }
  }

  broadcastToRoom(roomId, message, excludeClientId = null) {
    const room = roomManager.getRoom(roomId);
    if (!room) return;

    for (const [clientId, client] of room.clients.entries()) {
      if (excludeClientId && clientId === excludeClientId) continue;
      this.sendToClient(clientId, message);
    }
  }

  handleMessage(clientId, message, ws) {
    const { type, data } = message;

    switch (type) {
      // 1. Clock Synchronization (NTP Protocol)
      case 'TIME_SYNC_REQUEST': {
        const serverTime = Date.now();
        this.sendToClient(clientId, {
          type: 'TIME_SYNC_RESPONSE',
          data: {
            clientTime: data.clientTime,
            serverTime: serverTime,
          },
        });
        break;
      }

      // 2. Create Room
      case 'CREATE_ROOM': {
        const room = roomManager.createRoom({
          roomCode: data.roomCode,
          roomName: data.roomName,
          hostClientId: clientId,
          hostName: data.userName,
          hostDevice: data.deviceType,
          ip: data.ip,
        });

        roomManager.addClientToRoom(room.id, {
          id: clientId,
          name: data.userName || 'Hanna',
          deviceType: data.deviceType || 'MacBook Pro',
        });

        // Add 2 mock/demo peer devices if requested for rich realistic multi-device demo testing
        if (data.includeDemoPeers) {
          roomManager.addClientToRoom(room.id, {
            id: 'mock-macbook-air',
            name: 'MacBook Air',
            deviceType: 'MacBook Air',
            isHost: false,
            status: 'Playing',
            syncOffsetMs: 12,
            ping: 8,
          });
          roomManager.addClientToRoom(room.id, {
            id: 'mock-imac-24',
            name: 'iMac 24"',
            deviceType: 'iMac 24"',
            isHost: false,
            status: 'Playing',
            syncOffsetMs: -8,
            ping: 6,
          });
        }

        this.sendToClient(clientId, {
          type: 'ROOM_JOINED',
          data: {
            room: roomManager.getSerializableRoomState(room.id),
            clientId: clientId,
            isHost: true,
          },
        });
        break;
      }

      // 3. Join Room
      case 'JOIN_ROOM': {
        const roomId = (data.roomId || '').toUpperCase();
        let room = roomManager.getRoom(roomId);

        if (!room) {
          // If room doesn't exist, create it on the fly or return error
          room = roomManager.createRoom({
            roomCode: roomId,
            roomName: 'Movie Night Room',
            hostClientId: clientId,
            hostName: data.userName || 'Host',
            hostDevice: data.deviceType || 'MacBook Pro',
          });
        }

        const { client } = roomManager.addClientToRoom(roomId, {
          id: clientId,
          name: data.userName,
          deviceType: data.deviceType,
        });

        // Send full room state to joiner
        this.sendToClient(clientId, {
          type: 'ROOM_JOINED',
          data: {
            room: roomManager.getSerializableRoomState(roomId),
            clientId: clientId,
            isHost: client.isHost,
          },
        });

        // Notify other peers
        this.broadcastToRoom(roomId, {
          type: 'DEVICE_JOINED',
          data: {
            client: client,
            room: roomManager.getSerializableRoomState(roomId),
          },
        }, clientId);
        break;
      }

      // 4. Playback: PLAY command (Scheduled timestamp-based start)
      case 'PLAY': {
        const room = roomManager.getClientRoom(clientId);
        if (!room) return;

        // Check permissions: Host only or everyone
        const client = room.clients.get(clientId);
        if (room.settings.controlMode === 'host_only' && !client?.isHost) {
          this.sendToClient(clientId, {
            type: 'ERROR',
            data: { message: 'Only the Host has playback control permissions.' }
          });
          return;
        }

        const now = Date.now();
        const startDelayMs = 250; // Schedule 250ms into future for network transit
        const scheduledStartTime = now + startDelayMs;
        const currentPos = data.position !== undefined ? data.position : calculateAuthoritativePosition(room);

        room.playback.isPlaying = true;
        room.playback.position = currentPos;
        room.playback.lastSyncServerTime = now;
        room.playback.scheduledStartTime = scheduledStartTime;
        room.playback.lastCommand = 'PLAY';

        // Update all clients state
        for (const c of room.clients.values()) {
          c.status = 'Playing';
        }

        this.broadcastToRoom(room.id, {
          type: 'PLAY_AT',
          data: {
            position: currentPos,
            serverTime: now,
            startTime: scheduledStartTime,
            playbackRate: room.playback.playbackRate || 1.0,
            triggeredBy: client?.name || 'Host',
          },
        });
        break;
      }

      // 5. Playback: PAUSE command
      case 'PAUSE': {
        const room = roomManager.getClientRoom(clientId);
        if (!room) return;

        const client = room.clients.get(clientId);
        if (room.settings.controlMode === 'host_only' && !client?.isHost) {
          this.sendToClient(clientId, {
            type: 'ERROR',
            data: { message: 'Only the Host can pause playback.' }
          });
          return;
        }

        const currentPos = data.position !== undefined ? data.position : calculateAuthoritativePosition(room);
        const now = Date.now();

        room.playback.isPlaying = false;
        room.playback.position = currentPos;
        room.playback.lastSyncServerTime = now;
        room.playback.scheduledStartTime = 0;
        room.playback.lastCommand = 'PAUSE';

        for (const c of room.clients.values()) {
          c.status = 'Paused';
        }

        this.broadcastToRoom(room.id, {
          type: 'PAUSE',
          data: {
            position: currentPos,
            serverTime: now,
            triggeredBy: client?.name || 'Host',
          },
        });
        break;
      }

      // 6. Playback: SEEK command
      case 'SEEK': {
        const room = roomManager.getClientRoom(clientId);
        if (!room) return;

        const client = room.clients.get(clientId);
        if (room.settings.controlMode === 'host_only' && !client?.isHost) {
          this.sendToClient(clientId, {
            type: 'ERROR',
            data: { message: 'Only the Host can seek playback.' }
          });
          return;
        }

        const targetPos = Math.max(0, data.position || 0);
        const now = Date.now();
        const startDelayMs = room.playback.isPlaying ? 200 : 0;
        const scheduledStartTime = room.playback.isPlaying ? now + startDelayMs : 0;

        room.playback.position = targetPos;
        room.playback.lastSyncServerTime = now;
        room.playback.scheduledStartTime = scheduledStartTime;
        room.playback.lastCommand = 'SEEK';

        this.broadcastToRoom(room.id, {
          type: 'SEEK',
          data: {
            position: targetPos,
            isPlaying: room.playback.isPlaying,
            startTime: scheduledStartTime,
            serverTime: now,
            triggeredBy: client?.name || 'Host',
          },
        });
        break;
      }

      // 7. SYNC NOW command
      case 'SYNC_NOW': {
        const room = roomManager.getClientRoom(clientId);
        if (!room) return;

        const authPos = calculateAuthoritativePosition(room);
        const now = Date.now();
        const startDelayMs = room.playback.isPlaying ? 200 : 0;
        const scheduledStartTime = room.playback.isPlaying ? now + startDelayMs : 0;

        this.broadcastToRoom(room.id, {
          type: 'SYNC_NOW',
          data: {
            position: authPos,
            isPlaying: room.playback.isPlaying,
            startTime: scheduledStartTime,
            serverTime: now,
          },
        });
        break;
      }

      // 8. Periodic Client Playback Status Report (Drift calculation)
      case 'REPORT_STATE': {
        const room = roomManager.getClientRoom(clientId);
        if (!room) return;

        const client = room.clients.get(clientId);
        if (!client) return;

        const authPos = calculateAuthoritativePosition(room);
        const clientPos = data.position || 0;
        const offsetSec = clientPos - authPos;
        const offsetMs = Math.round(offsetSec * 1000);

        client.localTime = clientPos;
        client.syncOffsetMs = offsetMs;
        client.status = data.status || (room.playback.isPlaying ? 'Playing' : 'Paused');
        client.ping = data.ping !== undefined ? data.ping : client.ping;
        client.movieMatches = data.movieMatches !== undefined ? data.movieMatches : client.movieMatches;
        client.lastSeen = Date.now();

        // Broadcast updated device statuses every cycle
        this.broadcastToRoom(room.id, {
          type: 'SYNC_STATUS_UPDATE',
          data: {
            clients: Array.from(room.clients.values()),
            authoritativePosition: authPos,
            isPlaying: room.playback.isPlaying,
            serverTime: Date.now(),
          },
        });
        break;
      }

      // 9. Chat Message
      case 'CHAT_MESSAGE': {
        const room = roomManager.getClientRoom(clientId);
        if (!room) return;

        const client = room.clients.get(clientId);
        const chatMsg = roomManager.addChatMessage(room.id, {
          senderId: clientId,
          senderName: client?.name || data.senderName,
          isHost: client?.isHost || false,
          deviceType: client?.deviceType || data.deviceType,
          text: data.text,
          bubbleColor: data.bubbleColor,
        });

        if (chatMsg) {
          this.broadcastToRoom(room.id, {
            type: 'NEW_CHAT_MESSAGE',
            data: { message: chatMsg },
          });
        }
        break;
      }

      // 10. Change Movie
      case 'CHANGE_MOVIE': {
        const room = roomManager.getClientRoom(clientId);
        if (!room) return;

        const client = room.clients.get(clientId);
        if (room.settings.controlMode === 'host_only' && !client?.isHost) return;

        room.movie = {
          title: data.title || 'Selected Movie',
          filename: data.filename || 'movie.mp4',
          size: data.size || 0,
          duration: data.duration || 0,
          metadata: data.metadata || `${Math.floor((data.duration || 0) / 60)} mins`,
          posterUrl: data.posterUrl || '',
          isDemo: Boolean(data.isDemo),
        };

        // Reset playback position
        room.playback.position = 0;
        room.playback.isPlaying = false;
        room.playback.lastSyncServerTime = Date.now();
        room.playback.scheduledStartTime = 0;

        this.broadcastToRoom(room.id, {
          type: 'MOVIE_CHANGED',
          data: {
            movie: room.movie,
            playback: room.playback,
            changedBy: client?.name || 'Host',
          },
        });
        break;
      }

      // 11. Room Settings Update
      case 'UPDATE_SETTINGS': {
        const room = roomManager.getClientRoom(clientId);
        if (!room) return;

        const client = room.clients.get(clientId);
        if (!client?.isHost) return;

        Object.assign(room.settings, data.settings || {});
        if (data.roomName) {
          room.name = data.roomName;
        }

        this.broadcastToRoom(room.id, {
          type: 'ROOM_SETTINGS_UPDATED',
          data: {
            settings: room.settings,
            roomName: room.name,
          },
        });
        break;
      }

      // 12. Playlist Update
      case 'UPDATE_PLAYLIST': {
        const room = roomManager.getClientRoom(clientId);
        if (!room) return;

        if (data.playlist) {
          room.playlist = data.playlist;
        }

        this.broadcastToRoom(room.id, {
          type: 'PLAYLIST_UPDATED',
          data: { playlist: room.playlist },
        });
        break;
      }

      // 13. Kick Device or Transfer Host
      case 'MANAGE_DEVICE': {
        const room = roomManager.getClientRoom(clientId);
        if (!room) return;

        const hostClient = room.clients.get(clientId);
        if (!hostClient?.isHost) return;

        if (data.action === 'kick' && data.targetClientId) {
          const targetWs = this.clientSockets.get(data.targetClientId);
          if (targetWs) {
            targetWs.send(JSON.stringify({
              type: 'KICKED',
              data: { message: 'You have been removed from the room by the host.' }
            }));
          }
          roomManager.removeClient(data.targetClientId);
          this.broadcastToRoom(room.id, {
            type: 'ROOM_STATE',
            data: { room: roomManager.getSerializableRoomState(room.id) }
          });
        } else if (data.action === 'make_host' && data.targetClientId) {
          const targetClient = room.clients.get(data.targetClientId);
          if (targetClient) {
            hostClient.isHost = false;
            targetClient.isHost = true;
            room.hostClientId = data.targetClientId;
            this.broadcastToRoom(room.id, {
              type: 'ROOM_STATE',
              data: { room: roomManager.getSerializableRoomState(room.id) }
            });
          }
        }
        break;
      }

      default:
        console.log(`Unknown message type: ${type}`);
    }
  }

  handleDisconnect(clientId) {
    const result = roomManager.removeClient(clientId);
    this.unregisterClient(clientId);

    if (result && result.room) {
      this.broadcastToRoom(result.room.id, {
        type: 'DEVICE_LEFT',
        data: {
          clientId: clientId,
          removedClient: result.removedClient,
          room: roomManager.getSerializableRoomState(result.room.id),
        },
      });
    }
  }
}

module.exports = SyncEngine;
