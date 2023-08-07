/**
 * Announcement API class for handling API calls related to announcements.
 *
 * @class AnnouncementService
 * @extends BaseApiService
 * @type {AnnouncementService}
 * @see BaseApiService
 * @see Announcement
 */

import { APIPaginationResponse, APIResponse } from '../types';
import BaseApiService from './BaseApiService';
import { UserInt } from './UserService';

// ------ Types ------ //
export interface AnnouncementFormInput {
  announcementType: AnnouncementType;
  text: string;
  postTo: string[];
}

export interface AnnouncementInt {
  _id: string;
  announcementType: AnnouncementType;
  text: string;
  postTo: string[];
  postedBy: UserInt;
  createdAt: Date;
  updatedAt: Date;
}

export type AnnouncementType = 'public' | 'membersOnly';

// ------ Actual API calls ------ //
class AnnouncementService extends BaseApiService {
  // This is the base url for this endpoint. It is relative to the API_URL
  url = '/announcement';

  /**
   * Gets all announcements.
   *
   * @returns {Promise<Announcement[]>}
   * @memberof AnnouncementService
   * @see Announcement
   *
   */
  async getAll(): Promise<APIResponse<AnnouncementInt[]>> {
    return await this.get(`${this.url}/all`);
  }

  /**
   * Get announcement by id.
   * @param {string} id
   * @returns {Promise<Announcement>}
   * @memberof AnnouncementService
   * @see Announcement
   *
   */
  async getById(id: string): Promise<APIResponse<AnnouncementInt>> {
    return await this.get(`${this.url}/${id}`);
  }

  /**
   * Get announcements in a paginated way.
   * @param {number} offset
   * @param {number} limit
   * @returns {Promise<Announcement[]>}
   * @memberof AnnouncementService
   * @see Announcement
   *
   */
  async getPaginated(
    offset: number,
    limit: number
  ): Promise<APIPaginationResponse<AnnouncementInt[]>> {
    return await this.get(`${this.url}/?offset=${offset}&limit=${limit}`, {
      includePagination: true,
    });
  }

  /**
   * Create new announcement.
   * @param {Announcement} announcement
   * @returns {Promise<Announcement>}
   * @memberof AnnouncementService
   * @see Announcement
   */
  async create(
    announcement: AnnouncementFormInput
  ): Promise<APIResponse<AnnouncementInt>> {
    return await this.post(`${this.url}`, announcement);
  }

  // Update Not Implemented

  // Delete Not Implemented
}

export default new AnnouncementService();
