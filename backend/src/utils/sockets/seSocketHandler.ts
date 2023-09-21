import { Server as WebSocketServer } from 'ws';

const wss = new WebSocketServer({ noServer: true });

wss.on('connection', (ws) => {
  console.log('A client connected');

  // Handle WebSocket communication here

  ws.on('message', (message) => {
    console.log(`Received: ${message}`);
    // Handle incoming messages from clients
  });

  ws.on('close', () => {
    console.log('A client disconnected');
  });
});

export default wss;
