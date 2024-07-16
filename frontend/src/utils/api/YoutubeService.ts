/**
 * Youtube API class for handling API calls related to youtube.
 *
 * @class YoutubeService
 * @extends BaseApiService
 * @type {YoutubeService}
 * @see BaseApiService
 * @see Youtube
 */

import { APIResponse } from '../types';
import BaseApiService from './BaseApiService';

// ------ Types ------ //
export type FormYoutubeSettingsInput = {
  youtubeClientID: string;
  youtubeClientSecret: string;
  _id?: string;
};

export type YoutubeSettingsInt = {
  youtubeClientID: string;
  youtubeClientSecret: string;
};

export type YoutubeChannelInt = {
  title: string;
};

// ------ Actual API calls ------ //
class YoutubeService extends BaseApiService {
  // This is the base url for this endpoint. It is relative to the API_URL
  url = '/youtube';

  /**
   * Gets all youtube settings.
   * @returns {Promise<YoutubeSettingsInt>}
   * @memberof YoutubeService
   * @see Youtube
   */
  async getAll(): Promise<APIResponse<YoutubeSettingsInt[]>> {
    return await this.get(`${this.url}/`);
  }

  /**
   * Get youtube settings by id.
   * @param {string} id
   * @returns {Promise<YoutubeSettingsInt>}
   * @memberof YoutubeService
   * @see Youtube
   */
  async getById(id: string): Promise<APIResponse<YoutubeSettingsInt>> {
    return await this.get(`${this.url}/${id}`);
  }

  /**
   * Get One youtube setting.
   * @returns {Promise<YoutubeSettingsInt>}
   * @memberof YoutubeService
   * @see Youtube
   */
  async getOne(): Promise<APIResponse<YoutubeSettingsInt>> {
    return await this.get(`${this.url}/one`);
  }

  /**
   * Create youtube settings.
   * @param {FormYoutubeSettingsInput} youtubeSettings
   * @returns {Promise<YoutubeSettingsInt>}
   * @memberof YoutubeService
   * @see Youtube
   */
  async create(
    youtubeSettings: FormYoutubeSettingsInput
  ): Promise<APIResponse<YoutubeSettingsInt>> {
    return await this.post(`${this.url}/`, youtubeSettings);
  }

  /**
   * Update youtube settings.
   * @param {string} id
   * @param {FormYoutubeSettingsInput} youtubeSettings
   * @returns {Promise<YoutubeSettingsInt>}
   * @memberof YoutubeService
   * @see Youtube
   */
  async update(
    youtubeSettings: FormYoutubeSettingsInput
  ): Promise<APIResponse<YoutubeSettingsInt>> {
    return await this.put(`${this.url}/`, youtubeSettings);
  }

  /**
   * Delete youtube settings.
   * @param {string} id
   * @returns {Promise<YoutubeSettingsInt>}
   * @memberof YoutubeService
   * @see Youtube
   */
  async remove(id: string): Promise<APIResponse<YoutubeSettingsInt>> {
    return await this.delete(`${this.url}/${id}`);
  }

  /**
   * Test youtube settings with a get request.
   * @returns {Promise<any>}
   * @memberof YoutubeService
   * @see Youtube
   */
  async testGet(): Promise<APIResponse<any>> {
    return await this.get(`${this.url}/test/get`);
  }

  /**
   * Test youtube settings with a post request.
   * @returns {Promise<any>}
   * @memberof YoutubeService
   * @see Youtube
   */
  async testPost(): Promise<APIResponse<any>> {
    return await this.get(`${this.url}/test/post`);
  }

  async getChannelDetails(): Promise<APIResponse<any>> {
    return await this.get(`${this.url}/channel`);
  }

  async checkLiveStatus(): Promise<APIResponse<any>> {
    return await this.get(`${this.url}/live`);
  }

  async modifyLiveStream(data: YoutubeChannelInt): Promise<APIResponse<any>> {
    return await this.put(`${this.url}/live`, data);
  }
}

export default new YoutubeService();
