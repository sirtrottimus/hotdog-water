/**
 * JWTAuthService class for handling JWT Auth requests.
 *
 * @class JWTAuthService
 * @extends BaseApiService
 * @type {JWTAuthService}
 * @see BaseApiService
 *
 */

import { APIResponse } from '../types';
import BaseApiService from './BaseApiService';

// ------ Types ------ //
export interface JWTAuthInt {
  _id: string;
  createdAt: Date;
  read: boolean;
  status: string;
  provider: string;
}

// ------ Actual API calls ------ //
class JWTAuthService extends BaseApiService {
  // This is the base url for this endpoint. It is relative to the API_URL
  url = '/jwt-auth';

  /**
   * Gets all JWT Auth notifications.
   * @returns {Promise<JWTAuthInt[]>}
   * @memberof JWTAuthService
   * @see JWTAuth
   */
  async getAll(): Promise<APIResponse<JWTAuthInt[]>> {
    return await this.get(`${this.url}/`);
  }

  /**
   * Gets all active JWT Auth notifications.
   * @returns {Promise<JWTAuthInt[]>}
   * @memberof JWTAuthService
   * @see JWTAuth
   */
  async getActive(): Promise<APIResponse<JWTAuthInt[]>> {
    return await this.get(`${this.url}/active`);
  }

  /**
   * Creates a JWT Auth notification.
   * @param {JWTAuthInt} jwtAuth - The JWT Auth notification to create.
   * @returns {Promise<JWTAuthInt>}
   * @memberof JWTAuthService
   * @see JWTAuth
   */
  async create(jwtAuth: JWTAuthInt): Promise<APIResponse<JWTAuthInt>> {
    return await this.post(`${this.url}/`, jwtAuth);
  }

  /**
   * Updates a JWT Auth notification.
   * @param {JWTAuthInt} jwtAuth - The JWT Auth notification to update.
   * @returns {Promise<JWTAuthInt>}
   * @memberof JWTAuthService
   * @see JWTAuth
   */
  async update(jwtAuth: JWTAuthInt): Promise<APIResponse<JWTAuthInt>> {
    return await this.put(`${this.url}/`, jwtAuth);
  }

  /**
   * Deletes a JWT Auth notification.
   * @param {string} id - The id of the JWT Auth notification to delete.
   * @returns {Promise<JWTAuthInt>}
   * @memberof JWTAuthService
   * @see JWTAuth
   */
  async delete(id: string): Promise<APIResponse<JWTAuthInt>> {
    return await this.delete(`${this.url}/${id}`);
  }
}

export default new JWTAuthService();
