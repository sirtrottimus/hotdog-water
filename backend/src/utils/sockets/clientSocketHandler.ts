import { Server as ServerIO, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import {
    getStreamElementsTwitchSocket,
    getStreamElementsYTSocket,
} from './seSocketHandler';
import { logIfDebugging } from '../helpers';
import Activity from '../../database/schema/Activity';
import { StreamElementsSettingsService } from '../../services/streamElements';
import { StreamElementsSettings } from '../../database/schema';
import { fetchActivity } from '../tasks/fetchStreamActivity';

const streamActivityLog = '[SCHEDULE/SE/D_REFRESH]:';

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
    PING: 'PING',
    REFRESH_DATE: 'refresh-date',
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

        socket.on(EVENTS.EVENT, async (data) => {
            logIfDebugging('[WEBSOCKET/BACKEND]: Received event:');
            logIfDebugging(data);

            const { provider, type, _id } = data;

            if (!provider || !type) {
                return;
            }

            const streamElementsSettings =
                await StreamElementsSettingsService.get();

            if (!streamElementsSettings.success) {
                throw new Error('Error Fetching StreamElements Settings');
            }

            const filters =
                provider === 'youtube'
                    ? streamElementsSettings.data?.streamElementsYTFilters
                    : streamElementsSettings.data?.streamElementsTwitchFilters;

            if (!filters) {
                return;
            }

            if (filters.includes(type) || filters.length === 0) {
                const newEvent = await Activity.create(data);

                if (!newEvent) {
                    logIfDebugging(
                        `[WEBSOCKET/BACKEND]: Error in handleClientConnections: Error creating event: ${data}`
                    );
                }

                socket.to(EVENTS.STREAM_ACTIVITY).emit('event', newEvent);
                socket.emit('event', newEvent);
            }
        });

        socket.on(EVENTS.REFRESH_DATE, async (data) => {
            logIfDebugging('[WEBSOCKET/BACKEND]: Received refresh date event:');
            logIfDebugging(data);

            const streamElementsSettings = await StreamElementsSettings.findOne(
                {}
            );

            if (!streamElementsSettings) {
                // Log an error message if settings are not found
                logIfDebugging('Stream Elements settings not found.');
                return;
            }

            const {
                streamElementsYTChannelID: YTchannelID,
                streamElementsYTToken: YTToken,
                streamElementsTwitchChannelID: TwitchChannelID,
                streamElementsTwitchToken: TwitchToken,
            } = streamElementsSettings;

            const date = new Date(data);

            if (!YTchannelID || !YTToken || !TwitchChannelID || !TwitchToken) {
                // Log an error message if channel ID or JWT is missing
                logIfDebugging(
                    ` ${new Date().toTimeString()} - Stream Elements settings not found. Please set them up for this feature to work.`
                );
                return;
            }

            // Retrieve the fetched activity data
            const YTActivity = await fetchActivity(
                YTchannelID,
                YTToken,
                date,
                'youtube'
            );
            const TwitchActivity = await fetchActivity(
                TwitchChannelID,
                TwitchToken,
                date,
                'twitch'
            );

            if (YTActivity) {
                YTActivity.provider = 'youtube';
            }
            if (TwitchActivity) {
                TwitchActivity.provider = 'twitch';
            }

            if (!YTActivity && !TwitchActivity) {
                // Log an error message if fetching fails
                logIfDebugging(
                    `${streamActivityLog} ${new Date().toTimeString()} - Failed to fetch stream activity from Stream Elements API.`
                );
                return;
            }

            // Combine the fetched activity data
            const activityData = [...YTActivity, ...TwitchActivity];

            for (const activity of activityData) {
                // Check if the activity already exists in the database
                const existingActivity = await Activity.findOne({
                    SE_ID: activity._id,
                });

                if (!existingActivity) {
                    // If the activity doesn't exist, save it to the database
                    const newActivity = await Activity.create({
                        SE_ID: activity._id,
                        type: activity.type,
                        createdAt: activity.createdAt,
                        data: activity.data,
                        provider: activity.provider,
                        flagged: activity.flagged ?? false,
                        feedSource: 'schedule',
                    });

                    if (!newActivity) {
                        // Log an error message if saving fails
                        logIfDebugging(
                            `${streamActivityLog} ${new Date().toTimeString()} - Failed to save activity to database.`
                        );
                        return;
                    }

                    const filters =
                        activity.provider === 'youtube'
                            ? streamElementsSettings.streamElementsYTFilters
                            : streamElementsSettings.streamElementsTwitchFilters;

                    if (!filters) {
                        return;
                    }

                    if (
                        filters.includes(activity.type) ||
                        filters.length === 0
                    ) {
                        const newEvent = await Activity.create(data);

                        if (!newEvent) {
                            logIfDebugging(
                                `[WEBSOCKET/BACKEND]: Error in handleClientConnections: Error creating event: ${data}`
                            );
                        }

                        socket
                            .to(EVENTS.STREAM_ACTIVITY)
                            .emit('event', newEvent);
                    }
                    return newActivity;
                }
            }
        });

        socket.on(EVENTS.READ, async (data) => {
            // Find the event in the database and mark it as read
            logIfDebugging('[WEBSOCKET/BACKEND]: Received read event:');
            logIfDebugging(data);
            const { _id } = data;
            const readEvent = await Activity.find({ SE_ID: _id });

            for (const element of readEvent) {
                element.read = true;
                await element.save();
            }

            if (!readEvent) {
                logIfDebugging(
                    `[WEBSOCKET/BACKEND]: Error in handleClientConnections: Event with ID ${_id} not found.`
                );
            }

            logIfDebugging(`[WEBSOCKET/BACKEND]: Received read event: ${data}`);

            socket.to(EVENTS.STREAM_ACTIVITY).emit('event:read', { _id });
            socket.emit('event:read', { _id });
        });

        socket.on(EVENTS.PING, () => {
            socket.to(EVENTS.STREAM_ACTIVITY).emit('PONG');
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
    // if (
    //   activeSockets.find(
    //     (s) => s.userId === decoded.id && s.socketId !== socket.id
    //   )
    // ) {
    //   socket.emit('unauthorized', { message: 'Already connected' });
    //   console.log('Already connected');
    //   socket.disconnect();
    //   return;
    // }

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

    //Filter out duplicate events
    const uniqueEvents = initialData.filter(
        (event, index, self) =>
            index === self.findIndex((e) => e.SE_ID === event.SE_ID)
    );

    // Get StreamElements Settings
    const streamElementsSettings = await StreamElementsSettingsService.get();

    if (!streamElementsSettings.success) {
        throw new Error('Error Fetching StreamElements Settings');
    }

    const filteredEvents = uniqueEvents.filter((event) => {
        const { type, provider } = event;

        if (!provider || !type) {
            return false;
        }

        const filters =
            provider === 'youtube'
                ? streamElementsSettings.data?.streamElementsYTFilters
                : streamElementsSettings.data?.streamElementsTwitchFilters;

        if (!filters) {
            return true;
        }

        if (filters.includes(type) || filters.length === 0) {
            return true;
        }
        return false;
    });

    socket.emit('event:initial', filteredEvents);

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
    socket.leave(EVENTS.STREAM_ACTIVITY);
    activeSockets = activeSockets.filter((s) => s.socketId !== socket.id);
    socket.emit('active-sockets', activeSockets);
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
