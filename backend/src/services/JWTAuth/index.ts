// Services for handling JWT authentication notifications
import { Options } from '../helpers';
import { JWTAuth as JWTAuthSchema } from '../../database/schema';

export class JWTAuthService {
  static async get() {
    const jwtAuth = await JWTAuthSchema.findOne({});

    if (!jwtAuth) {
      return {
        success: false,
        data: null,
        error: null,
        msg: null,
      };
    }

    return { success: true, data: jwtAuth, error: null, msg: null };
  }

  static async getActive() {
    const jwtAuth = await JWTAuthSchema.find({ status: 'active' });

    if (!jwtAuth) {
      return {
        success: false,
        data: null,
        error: null,
        msg: null,
      };
    }

    return { success: true, data: jwtAuth, error: null, msg: null };
  }

  static async create(options: Options) {
    const { body: jwtAuth } = options;

    if (!jwtAuth) {
      throw new Error('No JWT Auth Provided');
    }

    const newJWTAuth = await JWTAuthSchema.create(jwtAuth);

    if (!newJWTAuth) {
      return {
        success: false,
        data: null,
        error: null,
        msg: 'Error Creating JWT Auth',
      };
    }

    return { success: true, data: newJWTAuth, error: null, msg: null };
  }

  static async update(options: Options) {}

  static async dismiss() {
    const jwtAuth = await JWTAuthSchema.find({ status: 'active' });

    if (!jwtAuth) {
      return {
        success: false,
        data: null,
        error: null,
        msg: null,
      };
    }

    // if there are any active notifications, dismiss them
    jwtAuth.forEach(async (notification) => {
      notification.status = 'inactive';
      await notification.save();
    });

    return { success: true, data: jwtAuth, error: null, msg: null };
  }
}
