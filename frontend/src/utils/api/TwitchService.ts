/**
 * Twitter API class for handling API calls related to Twitch.
 *
 * @class TwitchService
 * @extends BaseApiService
 * @type {TwitchService}
 * @see BaseApiService
 * @see Twitch
 */

import { checkTwitchStatus } from '../helpers';
import { APIResponse } from '../types';
import BaseApiService from './BaseApiService';

// ------ Types ------ //
type FormTwitchSettingsInput = {
  twitchUsername: string;
  twitchClientID: string;
  twitchClientSecret: string;
};

export type TwitchSettingsInt = {
  twitchUsername: string;
  twitchClientID: string;
  twitchClientSecret: string;
};

// ------ Actual API calls ------ //
class TwitchService extends BaseApiService {
  // This is the base url for this endpoint. It is relative to the API_URL
  url = '/twitch';

  /**
   * Gets all twitch settings.
   * @returns {Promise<TwitchSettingsInt>}
   * @memberof TwitchService
   * @see Twitch
   */
  async getAll(): Promise<APIResponse<TwitchSettingsInt[]>> {
    return await this.get(`${this.url}/`);
  }

  /**
   * Get twitch settings by id.
   * @param {string} id
   * @returns {Promise<TwitchSettingsInt>}
   * @memberof TwitchService
   * @see Twitch
   */
  async getById(id: string): Promise<APIResponse<TwitchSettingsInt>> {
    return await this.get(`${this.url}/${id}`);
  }

  /**
   * Get One twitch setting.
   * @returns {Promise<TwitchSettingsInt>}
   * @memberof TwitchService
   * @see Twitch
   */
  async getOne(): Promise<APIResponse<TwitchSettingsInt>> {
    return await this.get(`${this.url}/one`);
  }

  /**
   * Create a new twitch setting.
   * @param {TwitchSettingsInt} twitch
   * @returns {Promise<TwitchSettingsInt>}
   * @memberof TwitchService
   * @see Twitch
   */
  async create(
    twitch: FormTwitchSettingsInput
  ): Promise<APIResponse<TwitchSettingsInt>> {
    return await this.post(`${this.url}/`, twitch);
  }

  /**
   * Update a twitch setting.
   * @param {TwitchSettingsInt} twitch
   * @returns {Promise<TwitchSettingsInt>}
   * @memberof TwitchService
   * @see Twitch
   */
  async update(
    twitch: TwitchSettingsInt
  ): Promise<APIResponse<TwitchSettingsInt>> {
    return await this.put(`${this.url}/`, twitch);
  }

  /**
   * Delete a twitch setting.
   * @param {string} id
   * @returns {Promise<TwitchSettingsInt>}
   * @memberof TwitchService
   * @see Twitch
   */
  async remove(id: string): Promise<APIResponse<TwitchSettingsInt>> {
    return await this.delete(`${this.url}/${id}`);
  }

  /**
   * Test a twitch setting with a get request.
   * @param {twitchSettings:TwitchSettingsInt}
   * @returns {Promise<TwitchSettingsInt>}
   * @memberof TwitchService
   * @see Twitch
   */
  async test(twitchSettings: TwitchSettingsInt): Promise<APIResponse<any>> {
    const res = await checkTwitchStatus(twitchSettings);
    return Promise.resolve({
      success: true,
      data: res,
      error: null,
    });
  }

  /**
   * Run an ad on twitch.
   * @param {twitchSettings:TwitchSettingsInt}
   * @returns {Promise<TwitchSettingsInt>}
   * @memberof TwitchService
   * @see Twitch
   *
   */
  async runAd(): Promise<APIResponse<any>> {
    const res = await this.post(`${this.url}/runAd`, {});
    return Promise.resolve({
      success: true,
      data: res,
      error: null,
    });
  }

  async getTwitchMods(): Promise<APIResponse<any>> {
    const res = await this.get(`${this.url}/mods`);
    return Promise.resolve({
      success: true,
      data: res,
      error: null,
    });
  }

  async addTwitchMod(username: string): Promise<APIResponse<any>> {
    const res = await this.post(`${this.url}/mods`, { username });
    return Promise.resolve({
      success: true,
      data: res,
      error: null,
    });
  }
  async removeTwitchMod(username: string): Promise<APIResponse<any>> {
    const res = await this.delete(`${this.url}/mods/${username}`);
    return Promise.resolve({
      success: true,
      data: res,
      error: null,
    });
  }

  async searchCategories(query: string): Promise<APIResponse<any>> {
    const res = await this.get(`${this.url}/categories/${query}`);
    return Promise.resolve({
      success: true,
      data: res,
      error: null,
    });
  }

  async modifyChannel({
    title,
    category,
  }: {
    title: string;
    category: string;
  }): Promise<APIResponse<any>> {
    const res = await this.put(`${this.url}/channel`, { title, category });
    return Promise.resolve({
      success: true,
      data: res,
      error: null,
    });
  }
}

export default new TwitchService();
