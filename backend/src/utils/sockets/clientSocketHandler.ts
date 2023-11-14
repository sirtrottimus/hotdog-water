import { Server as ServerIO, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import {
  getStreamElementsTwitchSocket,
  getStreamElementsYTSocket,
} from './seSocketHandler';
import { logIfDebugging } from '../helpers';
import Activity from '../../database/schema/Activity';

type SocketConnection = {
  socketId: string;
  userId: string;
  username: string;
};

type DecodedToken = string | jwt.JwtPayload | undefined;

const EVENTS = {
  CONNECTION: 'connection',
  AUTHENTICATE: 'authenticate',
  DISCONNECT: 'disconnect',
  STREAM_ACTIVITY: 'stream-activity',
  TEST: 'event:test',
  READ: 'event:read',
  TEST_ROOM: 'event:test_room',
  EVENT: 'event',
};

let activeSockets: SocketConnection[] = [];

const handleClientConnections = (io: ServerIO) => {
  io.on(EVENTS.CONNECTION, (socket: Socket) => {
    logIfDebugging(
      `[WEBSOCKET/BACKEND]: Client connected with ID ${socket.id}`
    );
    socket.on(
      EVENTS.AUTHENTICATE,
      (data: { method: string; token: string }) => {
        if (data.method === 'jwt') {
          handleJWTAuthentication(socket, data.token);
        }
      }
    );

    socket.on(EVENTS.TEST, (data) => {
      logIfDebugging(`[WEBSOCKET/BACKEND]: Received test event: ${data}`);
      socket.emit('event:test', 'Test event received');
    });

    socket.on(EVENTS.TEST_ROOM, (data) => {
      logIfDebugging(`[WEBSOCKET/BACKEND]: Received test event: ${data}`);
      socket.to(EVENTS.STREAM_ACTIVITY).emit('event:test_room', data);
      socket.emit('event:test_room', data);
    });

    socket.on(EVENTS.READ, async (data) => {
      // Find the event in the database and mark it as read
      logIfDebugging('[WEBSOCKET/BACKEND]: Received read event:');
      logIfDebugging(data);
      const { _id } = data;
      const readEvent = await Activity.findByIdAndUpdate(
        { SE_ID: _id },
        { read: true },
        { new: true }
      );

      if (!readEvent) {
        logIfDebugging(
          `[WEBSOCKET/BACKEND]: Error in handleClientConnections: Event with ID ${_id} not found.`
        );
      }

      logIfDebugging(`[WEBSOCKET/BACKEND]: Received read event: ${data}`);

      socket.to(EVENTS.STREAM_ACTIVITY).emit('event:read', { _id });
      socket.emit('event:read', { _id });
    });
  });
};

const handleJWTAuthentication = (socket: Socket, token: string) => {
  jwt.verify(
    token,
    process.env.SESSION_SECRET!,
    (err, decoded: DecodedToken) => {
      if (err) {
        handleAuthenticationError(socket, err);
      } else {
        handleAuthenticationSuccess(socket, decoded);
      }
    }
  );
};

const handleAuthenticationError = (socket: Socket, err: Error) => {
  logIfDebugging(
    `[WEBSOCKET/BACKEND]: Error in handleJWTAuthentication: ${err}`
  );
  socket.emit('unauthorized', { message: 'Invalid token' });
  socket.disconnect();
};

const handleAuthenticationSuccess = async (
  socket: Socket,
  decoded: DecodedToken
) => {
  // Check if token is invalid or expired
  if (!decoded || typeof decoded === 'string') {
    socket.emit('unauthorized', { message: 'Invalid token' });
    socket.disconnect();
    return;
  }

  // Check if user is already connected
  if (
    activeSockets.find(
      (s) => s.userId === decoded.id && s.socketId !== socket.id
    )
  ) {
    socket.emit('unauthorized', { message: 'Already connected' });
    console.log('Already connected');
    socket.disconnect();
    return;
  }

  // Let the client know that they are authenticated
  socket.emit('authenticated', { message: 'Authenticated' });

  await socket.join(EVENTS.STREAM_ACTIVITY);
  activeSockets.push({
    socketId: socket.id,
    userId: decoded.id,
    username: decoded.username,
  });

  const SEYTSocket = await getStreamElementsYTSocket(socket);
  const SETwitchSocket = await getStreamElementsTwitchSocket(socket);

  // Let the other clients know that a new client has connected
  socket.to(EVENTS.STREAM_ACTIVITY).emit('active-sockets', activeSockets);

  // Let the new client know about the other clients
  socket.emit('active-sockets', activeSockets);

  // Send Initial Data from DB
  const initialData = await Activity.find({ read: false }).sort({
    createdAt: 1,
  });

  socket.emit('event:initial', initialData);

  // Handle client disconnect
  socket.on(EVENTS.DISCONNECT, () => {
    handleClientDisconnect(socket, SEYTSocket, SETwitchSocket);
  });
};

const handleClientDisconnect = (
  socket: Socket,
  SEYTSocket: any,
  SETwitchSocket: any
) => {
  activeSockets = activeSockets.filter((s) => s.socketId !== socket.id);
  socket.to(EVENTS.STREAM_ACTIVITY).emit('active-sockets', activeSockets);

  if (activeSockets.length === 0) {
    SEYTSocket?.disconnect();
    SETwitchSocket?.disconnect();
  }

  logIfDebugging(
    `[WEBSOCKET/BACKEND]: Client disconnected with ID ${socket.id}`
  );
};

export default handleClientConnections;
