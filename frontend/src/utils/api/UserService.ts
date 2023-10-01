/**
 * User API class for handling API calls related to users.
 *
 * @class UserService
 * @extends BaseApiService
 * @type {UserService}
 * @see BaseApiService
 * @see User
 */

import { APIResponse } from '../types';
import BaseApiService from './BaseApiService';
import { RoleInt } from './RoleService';

// ------ Types ------ //
export interface UserInt {
  _id: string;
  discordId: string;
  accessToken?: string;
  username: string;
  roles: RoleInt[];
  avatar?: string;
}

export interface FormUserInput {
  discordId: string;
}

// ------ Actual API calls ------ //
class UserService extends BaseApiService {
  // This is the base url for this endpoint. It is relative to the API_URL
  url = '/user';

  /**
   * Gets all users.
   * @returns {Promise<UserInt[]>}
   * @memberof UserService
   * @see User
   */
  async getAll(): Promise<APIResponse<UserInt[]>> {
    return await this.get(`${this.url}/`);
  }

  /**
   * Get the current user.
   * @returns {Promise<UserInt>}
   * @memberof UserService
   * @see User
   */
  async getCurrent(): Promise<APIResponse<UserInt>> {
    return await this.get(`${this.url}/current`);
  }

  /**
   * Get user by id.
   * @param {string} id
   * @returns {Promise<UserInt>}
   * @memberof UserService
   * @see User
   */
  async getById(id: string): Promise<APIResponse<UserInt>> {
    return await this.get(`${this.url}/${id}`);
  }

  /**
   * Get all by roles.
   * @param {string[]} roles
   * @returns {Promise<UserInt[]>}
   * @memberof UserService
   * @see User
   * @see Role
   */
  async getAllByRoles(roles: string[]): Promise<APIResponse<UserInt[]>> {
    return await this.get(`${this.url}/roles/`, {
      axiosOptions: { params: { roles } },
    });
  }

  /**
   * Create a new user.
   * @param {UserInt} user
   * @returns {Promise<UserInt>}
   * @memberof UserService
   * @see User
   */
  async create(user: FormUserInput): Promise<APIResponse<UserInt>> {
    return await this.post(`${this.url}/`, user);
  }

  /**
   * Update a user.
   * @param {UserInt} user
   * @returns {Promise<UserInt>}
   * @memberof UserService
   * @see User
   */
  async update(user: UserInt): Promise<APIResponse<UserInt>> {
    return await this.put(`${this.url}/${user._id}`, user);
  }

  /**
   * Delete a user.
   * @param {string} id
   * @returns {Promise<UserInt>}
   * @memberof UserService
   * @see User
   */
  async remove(id: string): Promise<APIResponse<UserInt>> {
    return await this.delete(`${this.url}/${id}`);
  }

  /**
   * Log out the current user.
   * @returns {Promise<UserInt>}
   * @memberof UserService
   * @see User
   */
  async logout(): Promise<APIResponse<UserInt>> {
    return await this.post(`${this.url}/logout`, {});
  }

  /**
   * Update a user's roles.
   * @param {string} id
   * @param {string[]} roles
   * @param {string} [action='add' | 'remove']
   * @returns {Promise<UserInt>}
   * @memberof UserService
   * @see User
   */
  async updateRoles(
    id: string,
    roles: string[],
    action: 'add' | 'remove' = 'add'
  ): Promise<APIResponse<UserInt>> {
    return await this.put(`${this.url}/${id}/roles`, { roles, action });
  }
}

export default new UserService();
