/**
 * Discord API class for handling API calls related to discord.
 *
 * @class DiscordService
 * @extends BaseApiService
 * @type {DiscordService}
 * @see BaseApiService
 * @see Discord
 */

import { APIResponse } from '../types';
import BaseApiService from './BaseApiService';

// ------ Types ------ //
export interface FormDiscordSettingsInput {
  botName: string;
  webhookURL: string;
  identifier: string;
  isLivePostWebhook: boolean;
  isAnnouncementWebhook: boolean;
  isMemberOnlyWebhook: boolean;
  _id?: string;
}

export interface DiscordSettingsInt {
  _id: string;
  webhookURL: string;
  botName: string;
  identifier: string;
  isLivePostWebhook: boolean;
  isAnnouncementWebhook: boolean;
  isMemberOnlyWebhook: boolean;
}

// ------ Actual API calls ------ //
class DiscordService extends BaseApiService {
  // This is the base url for this endpoint. It is relative to the API_URL
  url = '/discord';

  /**
   * Gets all discord settings.
   * @returns {Promise<DiscordSettingsInt>}
   * @memberof DiscordService
   * @see DiscordSettingsInt
   */
  async getAll(): Promise<APIResponse<DiscordSettingsInt[]>> {
    return await this.get(`${this.url}/`);
  }

  /**
   * Get discord settings by id.
   * @param {string} id
   * @returns {Promise<DiscordSettingsInt>}
   * @memberof DiscordService
   * @see DiscordSettingsInt
   */
  async getById(id: string): Promise<APIResponse<DiscordSettingsInt>> {
    return await this.get(`${this.url}/${id}`);
  }

  /**
   * Create a new discord settings.
   * @param {DiscordSettingsInt} discordSettings
   * @returns {Promise<DiscordSettingsInt>}
   * @memberof DiscordService
   * @see DiscordSettingsInt
   */
  async create(
    discordSettings: FormDiscordSettingsInput
  ): Promise<APIResponse<DiscordSettingsInt>> {
    return await this.post(`${this.url}/`, discordSettings);
  }

  /**
   * Update a discord settings.
   * @param {DiscordSettingsInt} discordSettings
   * @returns {Promise<DiscordSettingsInt>}
   * @memberof DiscordService
   * @see DiscordSettingsInt
   */
  async update(
    discordSettings: FormDiscordSettingsInput
  ): Promise<APIResponse<DiscordSettingsInt>> {
    return await this.put(
      `${this.url}/${discordSettings._id}`,
      discordSettings
    );
  }

  /**
   * Delete a discord settings.
   * @param {string} id
   * @returns {Promise<DiscordSettingsInt>}
   * @memberof DiscordService
   * @see DiscordSettingsInt
   */
  async remove(id: string): Promise<APIResponse<DiscordSettingsInt>> {
    return await this.delete(`${this.url}/${id}`);
  }

  /**
   * Send a test message to the discord webhook.
   * @param {DiscordSettingsInt} discordSettings
   * @returns {Promise<DiscordSettingsInt>}
   * @memberof DiscordService
   * @see DiscordSettingsInt
   * @see discord
   */
  async sendTestMessage(
    discordSettings: FormDiscordSettingsInput,
    params: { [key: string]: any }
  ): Promise<APIResponse<DiscordSettingsInt>> {
    return await this.post(discordSettings.webhookURL, {
      ...params,
      username: discordSettings.botName,
    });
  }
}

export default new DiscordService();
