// Services for handling roles

import { Schedule as ScheduleSchema } from '../../database/schema';

import { Options } from '../helpers';

export class ScheduleService {
  async getAll(options: Options) {
    const schedules = await ScheduleSchema.find({});

    return { success: true, data: schedules, error: null, msg: null };
  }

  async getById(options: Options) {
    const schedule = await ScheduleSchema.findById(options.id);

    if (!schedule) {
      return {
        success: false,
        data: null,
        error: null,
        msg: 'No event found',
      };
    }

    return { success: true, data: schedule, error: null, msg: null };
  }

  async create(options: Options) {
    const { body: event } = options;
    if (!event) {
      throw new Error('No event parameter');
    }

    const newSchedule = await ScheduleSchema.create(event);

    if (!newSchedule) {
      return {
        success: false,
        data: null,
        error: null,
        msg: 'Error creating event',
      };
    }

    return { success: true, data: newSchedule, error: null, msg: null };
  }

  async update(options: Options) {
    const { body: event } = options;

    if (!event) {
      throw new Error('No event parameter');
    }

    const updatedSchedule = await ScheduleSchema.findByIdAndUpdate(
      event._id,
      { ...event },
      { new: true }
    );

    if (!updatedSchedule) {
      return {
        success: false,
        data: null,
        error: null,
        msg: 'No event found',
      };
    }

    return { success: true, data: updatedSchedule, error: null, msg: null };
  }

  async delete(options: Options) {
    const { id: eventId } = options;

    if (!eventId) {
      throw new Error('No event parameter');
    }

    const deletedSchedule = await ScheduleSchema.findByIdAndDelete(eventId);

    if (!deletedSchedule) {
      return {
        success: false,
        data: null,
        error: null,
        msg: 'No event found',
      };
    }

    return { success: true, data: deletedSchedule, error: null, msg: null };
  }

  toString() {
    return 'Role Service';
  }

  [key: string]: (...args: any[]) => string | Promise<any>;
}
