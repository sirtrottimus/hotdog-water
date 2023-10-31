import { io, Socket } from 'socket.io-client';
import { Socket as ServerSocket } from 'socket.io';
import { StreamElementsSettingsService } from '../../services/streamElements';
import Activity from '../../database/schema/Activity';
import { logIfDebugging } from '../helpers';

const STREAM_ELEMENTS_URL = 'https://realtime.streamelements.com';

let singletonInstance: Socket | null = null;

const createSocket = async (backendSocket: ServerSocket): Promise<Socket> => {
  const jwtToken = await fetchStreamElementsToken();

  const socket = io(STREAM_ELEMENTS_URL, {
    transports: ['websocket'],
    autoConnect: false,
  });

  logIfDebugging('[WEBSOCKET/SE]: Connecting to StreamElements');

  socket.connect();

  socket.on('connect', () => {
    logIfDebugging('[WEBSOCKET/SE]: Connected to StreamElements');
    logIfDebugging('[WEBSOCKET/SE]: Authenticating with StreamElements');
    socket.emit('authenticate', {
      method: 'jwt',
      token: jwtToken,
    });
  });

  socket.on('disconnect', () => {
    logIfDebugging('[WEBSOCKET/SE]: Disconnected from StreamElements');
    handleDisconnect(socket);
  });

  socket.on('authenticated', () => {
    logIfDebugging('[WEBSOCKET/SE]: Authenticated');
  });

  socket.on('event', async (data) => {
    await handleEventData(data, backendSocket);
  });

  return socket;
};

const fetchStreamElementsToken = async (): Promise<string> => {
  const StreamElementsSettings = await StreamElementsSettingsService.get();

  if (!StreamElementsSettings.success) {
    throw new Error('Error Fetching StreamElements Settings');
  }

  return StreamElementsSettings.data?.streamElementsToken ?? '';
};

const handleDisconnect = (socket: Socket) => {
  socket.disconnect();
  logIfDebugging('[WEBSOCKET/SE]: Disconnected from StreamElements');
  singletonInstance = null;
};

const handleEventData = async (data: any, backendSocket: ServerSocket) => {
  const existingActivity = await Activity.findOne({
    SE_ID: data._id,
  });

  logIfDebugging(
    `[WEBSOCKET/SE]: Received event: ${data.type} with ID ${data._id}`
  );

  console.log(data);

  if (!existingActivity) {
    const newActivity = await Activity.create({
      SE_ID: data._id,
      type: data.type,
      data: data.data,
      createdAt: data.createdAt,
      provider: data.provider,
      flagged: data.flagged ?? false,
      feedSource: 'websocket',
    });

    if (!newActivity) {
      logIfDebugging(
        '[WEBSOCKET/SE]: Failed to save activity to the database.'
      );
      return;
    }

    logIfDebugging(
      `[WEBSOCKET/SE]: Saved activity to the database with ID ${data._id}`
    );

    if (data.type === 'follow') {
      return;
    }

    backendSocket.to('stream-activity').emit('event', data);

    logIfDebugging(
      `[WEBSOCKET/SE]: Sent activity to the frontend with ID ${data._id}`
    );
  }
};

const getStreamElementsSocket = async (
  backendSocket: ServerSocket
): Promise<Socket> => {
  if (!singletonInstance) {
    singletonInstance = await createSocket(backendSocket);
  }

  return singletonInstance;
};

export default getStreamElementsSocket;
