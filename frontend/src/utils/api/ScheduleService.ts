/**
 * Schedule API class for handling schedule related requests.
 *
 * @class ScheduleService
 * @extends BaseApiService
 * @type {ScheduleService}
 * @see BaseApiService
 */

import { APIResponse } from '../types';
import BaseApiService from './BaseApiService';

// ------ Types ------ //
export interface FormScheduleInput {
  title: string;
  date?: Date | null;
  description: string;
  type: 'stream' | 'event' | 'video' | 'announcement' | 'bored' | 'podcast';
  endTime?: string;
  link?: string;
  isRecurring: boolean;
  recurringDays?: string[];
  overridesRecurring?: boolean;
  membersOnly?: boolean;
  _id?: string;
}

export interface ScheduleInt {
  _id: string;
  title: string;
  date?: Date | null;
  description: string;
  type: 'stream' | 'event' | 'video' | 'announcement' | 'bored' | 'podcast';
  startTime: string;
  endTime?: string;
  link?: string;
  isRecurring: boolean;
  recurringDays?: string[];
  overridesRecurring?: boolean;
  membersOnly?: boolean;
}

// ------ Actual API calls ------ //
class ScheduleService extends BaseApiService {
  // This is the base url for this endpoint. It is relative to the API_URL
  url = '/schedule';

  /**
   * Gets all schedule events.
   * @returns {Promise<ScheduleInt[]>}
   * @memberof ScheduleService
   * @see Schedule
   */
  async getAll(): Promise<APIResponse<ScheduleInt[]>> {
    return await this.get(`${this.url}/`);
  }
  async getById(id: string): Promise<APIResponse<ScheduleInt>> {
    return await this.get(`${this.url}/${id}`);
  }
  async create(schedule: FormScheduleInput): Promise<APIResponse<ScheduleInt>> {
    return await this.post(`${this.url}/`, schedule);
  }
  async update(schedule: FormScheduleInput): Promise<APIResponse<ScheduleInt>> {
    return await this.put(`${this.url}/${schedule._id}`, schedule);
  }
  async remove(id: string): Promise<APIResponse<ScheduleInt>> {
    return await this.delete(`${this.url}/${id}`);
  }
}

export default new ScheduleService();
