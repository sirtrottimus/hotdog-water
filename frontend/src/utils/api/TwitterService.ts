/**
 * Twitter API class for handling API calls related to twitter.
 *
 * @class TwitterService
 * @extends BaseApiService
 * @type {TwitterService}
 * @see BaseApiService
 * @see Twitter
 */

import { APIResponse } from '../types';
import BaseApiService from './BaseApiService';

// ------ Types ------ //
export interface FormTwitterSettingsInput {
  consumerKey: string;
  consumerSecret: string;
  accessToken: string;
  accessTokenSecret: string;
  _id?: string;
}

export interface TwitterSettingsInt {
  consumerKey: string;
  consumerSecret: string;
  accessToken: string;
  accessTokenSecret: string;
}

// ------ Actual API calls ------ //
class TwitterService extends BaseApiService {
  // This is the base url for this endpoint. It is relative to the API_URL
  url = '/twitter';

  /**
   * Gets all twitter settings.
   * @returns {Promise<TwitterSettingsInt>}
   * @memberof TwitterService
   * @see Twitter
   */
  async getAll(): Promise<APIResponse<TwitterSettingsInt[]>> {
    return await this.get(`${this.url}/`);
  }

  /**
   * Get twitter settings by id.
   * @param {string} id
   * @returns {Promise<TwitterSettingsInt>}
   * @memberof TwitterService
   * @see Twitter
   */
  async getById(id: string): Promise<APIResponse<TwitterSettingsInt>> {
    return await this.get(`${this.url}/${id}`);
  }

  /**
   * Get One twitter setting.
   * @returns {Promise<TwitterSettingsInt>}
   * @memberof TwitterService
   * @see Twitter
   */
  async getOne(): Promise<APIResponse<TwitterSettingsInt>> {
    return await this.get(`${this.url}/one`);
  }

  /**
   * Create twitter settings.
   * @param {FormTwitterSettingsInput} twitterSettings
   * @returns {Promise<TwitterSettingsInt>}
   * @memberof TwitterService
   * @see Twitter
   */
  async create(
    twitterSettings: FormTwitterSettingsInput
  ): Promise<APIResponse<TwitterSettingsInt>> {
    return await this.post(`${this.url}/`, twitterSettings);
  }

  /**
   * Update twitter settings.
   * @param {FormTwitterSettingsInput} twitterSettings
   * @returns {Promise<TwitterSettingsInt>}
   * @memberof TwitterService
   * @see Twitter
   */
  async update(
    twitterSettings: FormTwitterSettingsInput
  ): Promise<APIResponse<TwitterSettingsInt>> {
    return await this.put(
      `${this.url}/${twitterSettings._id}`,
      twitterSettings
    );
  }

  /**
   * Delete twitter settings.
   * @param {string} id
   * @returns {Promise<TwitterSettingsInt>}
   * @memberof TwitterService
   * @see Twitter
   */
  async remove(id: string): Promise<APIResponse<TwitterSettingsInt>> {
    return await this.delete(`${this.url}/${id}`);
  }

  /**
   * Test twitter settings with a get request.
   * @returns {Promise<any>}
   * @memberof TwitterService
   * @see Twitter
   */
  async testGet(): Promise<APIResponse<any>> {
    return await this.get(`${this.url}/test/get`);
  }

  /**
   * Test twitter settings with a post request.
   * @returns {Promise<any>}
   * @memberof TwitterService
   * @see Twitter
   */
  async testPost(): Promise<APIResponse<any>> {
    return await this.get(`${this.url}/test/post`);
  }
}

export default new TwitterService();
