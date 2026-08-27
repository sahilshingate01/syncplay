const http = require('http');
const express = require('express');
const cors = require('cors');
const path = require('path');
const { WebSocketServer } = require('ws');
const { getLocalNetworkAddresses, getPrimaryLocalIP } = require('./networkUtils');
const roomManager = require('./rooms');
const SyncEngine = require('./syncEngine');

const app = express();
let PORT = parseInt(process.env.PORT || '3001', 10);

app.use(cors());
app.use(express.json());

// Initialize HTTP server
const server = http.createServer(app);

// Initialize WebSocket server
const wss = new WebSocketServer({ server });
const syncEngine = new SyncEngine(wss);

// WebSocket connection handler
wss.on('connection', (ws, req) => {
  const clientId = `client-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  syncEngine.registerClient(clientId, ws);

  ws.on('message', (messageData) => {
    try {
      const parsed = JSON.parse(messageData.toString());
      syncEngine.handleMessage(clientId, parsed, ws);
    } catch (err) {
      console.error('Error parsing WS message:', err);
    }
  });

  ws.on('close', () => {
    syncEngine.handleDisconnect(clientId);
  });

  ws.on('error', (err) => {
    console.error(`WS Error for ${clientId}:`, err);
    syncEngine.handleDisconnect(clientId);
  });

  // Send initial welcome message with clientId & server timestamp
  ws.send(JSON.stringify({
    type: 'CONNECTED',
    data: {
      clientId,
      serverTime: Date.now(),
    }
  }));
});

// REST API Endpoints
app.get('/api/info', (req, res) => {
  const networkAddresses = getLocalNetworkAddresses();
  const primaryIP = getPrimaryLocalIP();
  res.json({
    name: 'SyncPlay Server',
    version: '1.0.0',
    serverTime: Date.now(),
    primaryIP,
    networkAddresses,
    lanUrl: `http://${primaryIP}:${PORT}`,
    activeRooms: roomManager.rooms.size,
  });
});

app.get('/api/rooms/:id', (req, res) => {
  const roomState = roomManager.getSerializableRoomState(req.params.id);
  if (!roomState) {
    return res.status(404).json({ error: 'Room not found' });
  }
  res.json(roomState);
});

// If production build exists, serve static client files
const clientDistPath = path.join(__dirname, '../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('SyncPlay Server running. Start client via npm run client');
    }
  });
});

// Resilient start on available port
function startServer(portToTry) {
  server.listen(portToTry, '0.0.0.0', () => {
    const primaryIP = getPrimaryLocalIP();
    const addresses = getLocalNetworkAddresses();
    PORT = portToTry;

    console.log('\n======================================================');
    console.log('🎬  SyncPlay Server is running!');
    console.log('======================================================');
    console.log(`📡 Local Host:       http://localhost:${PORT}`);
    console.log(`🌐 Local Network:    http://${primaryIP}:${PORT}`);
    if (addresses.length > 1) {
      console.log('   Other Interfaces:');
      addresses.forEach(a => {
        console.log(`     - ${a.interface}: http://${a.address}:${PORT}`);
      });
    }
    console.log('------------------------------------------------------');
    console.log('🔒 Zero-Upload Policy: Movie files never leave your device.');
    console.log('⚡ High-Precision NTP Clock Sync & WebSockets active.');
    console.log('======================================================\n');
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️ Port ${portToTry} is in use. Trying port ${portToTry + 1}...`);
      server.close();
      startServer(portToTry + 1);
    } else {
      console.error('Server error:', err);
    }
  });
}

startServer(PORT);
