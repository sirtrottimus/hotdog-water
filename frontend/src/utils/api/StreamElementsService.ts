/**
 * Twitter API class for handling API calls related to StreamElements.
 *
 * @class StreamElementsService
 * @extends BaseApiService
 * @type {StreamElementsService}
 * @see BaseApiService
 * @see StreamElements
 */
import { APIResponse } from '../types';
import BaseApiService from './BaseApiService';

// ------ Types ------ //
type FormStreamElementsSettingsInput = {
  streamElementsToken: string;
};

export type StreamElementsSettingsInt = {
  streamElementsToken: string;
  _id?: string;
};

// ------ Actual API calls ------ //
class StreamElementsService extends BaseApiService {
  // This is the base url for this endpoint. It is relative to the API_URL
  url = '/streamElements';

  /**
   * Gets all streamElements settings.
   * @returns {Promise<StreamElementsSettingsInt>}
   * @memberof StreamElementsService
   * @see StreamElements
   */
  async getAll(): Promise<APIResponse<StreamElementsSettingsInt[]>> {
    return await this.get(`${this.url}/`);
  }

  /**
   * Get streamElements settings by id.
   * @param {string} id
   * @returns {Promise<StreamElementsSettingsInt>}
   * @memberof StreamElementsService
   * @see StreamElements
   */
  async getById(id: string): Promise<APIResponse<StreamElementsSettingsInt>> {
    return await this.get(`${this.url}/${id}`);
  }

  /**
   * Get One streamElements setting.
   * @returns {Promise<StreamElementsSettingsInt>}
   * @memberof StreamElementsService
   * @see StreamElements
   */
  async getOne(): Promise<APIResponse<StreamElementsSettingsInt>> {
    return await this.get(`${this.url}/one`);
  }

  /**
   * Create a new streamElements setting.
   * @param {StreamElementsSettingsInt} streamElements
   * @returns {Promise<StreamElementsSettingsInt>}
   * @memberof StreamElementsService
   * @see StreamElements
   */
  async create(
    streamElements: FormStreamElementsSettingsInput
  ): Promise<APIResponse<StreamElementsSettingsInt>> {
    return await this.post(`${this.url}/`, streamElements);
  }

  /**
   * Update a streamElements setting.
   * @param {StreamElementsSettingsInt} streamElements
   * @returns {Promise<StreamElementsSettingsInt>}
   * @memberof StreamElementsService
   * @see StreamElements
   */
  async update(
    streamElements: StreamElementsSettingsInt
  ): Promise<APIResponse<StreamElementsSettingsInt>> {
    return await this.put(`${this.url}/`, streamElements);
  }

  /**
   * Delete a streamElements setting.
   * @param {string} id
   * @returns {Promise<StreamElementsSettingsInt>}
   * @memberof StreamElementsService
   * @see StreamElements
   */
  async remove(id: string): Promise<APIResponse<StreamElementsSettingsInt>> {
    return await this.delete(`${this.url}/${id}`);
  }
}

export default new StreamElementsService();
