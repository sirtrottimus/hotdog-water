import { io, Socket } from 'socket.io-client';
import { Socket as ServerSocket } from 'socket.io';
import { StreamElementsSettingsService } from '../../services/streamElements';
import Activity from '../../database/schema/Activity';
import { logIfDebugging } from '../helpers';

const STREAM_ELEMENTS_URL = 'https://realtime.streamelements.com';

let singletonInstanceYT: Socket | null = null;
let singletonInstanceTwitch: Socket | null = null;

const createSocket = async (
  backendSocket: ServerSocket,
  URL: string,
  type: 'yt' | 'twitch'
): Promise<Socket> => {
  const jwtToken = await fetchStreamElementsToken(type);

  const socket = io(URL, {
    transports: ['websocket'],
    autoConnect: false,
  });

  logIfDebugging(`[WEBSOCKET/SE]: Connecting to StreamElements - ${type}`);

  socket.connect();

  socket.on('connect', () => {
    logIfDebugging(`[WEBSOCKET/SE]: Connected to StreamElements - ${type}`);
    logIfDebugging(
      `[WEBSOCKET/SE]: Authenticating with StreamElements - ${type}`
    );
    socket.emit('authenticate', {
      method: 'jwt',
      token: jwtToken,
    });
  });

  socket.on('disconnect', () => {
    logIfDebugging(
      `[WEBSOCKET/SE]: Disconnected from StreamElements - ${type}`
    );
    handleDisconnect(socket);
  });

  socket.on('authenticated', () => {
    logIfDebugging(
      `[WEBSOCKET/SE]: Authenticated with StreamElements - ${type}`
    );
  });

  socket.on('event', async (data) => {
    data.provider = type === 'yt' ? 'youtube' : 'twitch';
    await handleEventData(data, backendSocket);
  });

  return socket;
};

const fetchStreamElementsToken = async (
  type: 'yt' | 'twitch'
): Promise<string> => {
  const StreamElementsSettings = await StreamElementsSettingsService.get();

  if (!StreamElementsSettings.success) {
    throw new Error('Error Fetching StreamElements Settings');
  }

  return type === 'yt'
    ? StreamElementsSettings.data?.streamElementsYTToken ?? ''
    : StreamElementsSettings.data?.streamElementsTwitchToken ?? '';
};

const handleDisconnect = (socket: Socket) => {
  socket.disconnect();
  logIfDebugging('[WEBSOCKET/SE]: Disconnected from StreamElements ');
  singletonInstanceYT = null;
  singletonInstanceTwitch = null;
};

const handleEventData = async (data: any, backendSocket: ServerSocket) => {
  const existingActivity = await Activity.findOne({
    SE_ID: data._id,
  });

  logIfDebugging(
    `[WEBSOCKET/SE]: Received event: ${data.type} with ID ${data._id}`
  );

  logIfDebugging(data);

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

export const getStreamElementsYTSocket = async (
  backendSocket: ServerSocket
): Promise<Socket> => {
  if (!singletonInstanceYT) {
    singletonInstanceYT = await createSocket(
      backendSocket,
      STREAM_ELEMENTS_URL,
      'yt'
    );
  }

  return singletonInstanceYT;
};

export const getStreamElementsTwitchSocket = async (
  backendSocket: ServerSocket
): Promise<Socket> => {
  if (!singletonInstanceTwitch) {
    singletonInstanceTwitch = await createSocket(
      backendSocket,
      STREAM_ELEMENTS_URL,
      'twitch'
    );
  }

  return singletonInstanceTwitch;
};
