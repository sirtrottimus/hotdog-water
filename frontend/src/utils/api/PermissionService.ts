/**
 * Permission API class for handling API calls related to permissions.
 *
 * @class PermissionService
 * @extends BaseApiService
 * @type {PermissionService}
 * @see BaseApiService
 * @see Permission
 */

import { APIResponse } from '../types';
import BaseApiService from './BaseApiService';
import { RoleInt } from './RoleService';

// ------ Types ------ //
export interface PermissionInt {
  _id: string;
  name: string;
  description: string;
  roles: RoleInt[];
}

export interface FormPermissionInput {
  name: string;
  description?: string;
}

// ------ Actual API calls ------ //
class PermissionService extends BaseApiService {
  // This is the base url for this endpoint. It is relative to the API_URL
  url = '/permissions';

  /**
   * Gets all permissions.
   * @returns {Promise<PermissionInt[]>}
   * @memberof PermissionService
   * @see Permission
   */
  async getAll(): Promise<APIResponse<PermissionInt[]>> {
    return await this.get(`${this.url}/`);
  }

  /**
   * Get permission by id.
   * @param {string} id
   * @returns {Promise<PermissionInt>}
   * @memberof PermissionService
   * @see Permission
   */
  async getById(id: string): Promise<APIResponse<PermissionInt>> {
    return await this.get(`${this.url}/${id}`);
  }

  /**
   * Create a new permission.
   * @param {PermissionInt} permission
   * @returns {Promise<PermissionInt>}
   * @memberof PermissionService
   * @see Permission
   */
  async create(permission: PermissionInt): Promise<APIResponse<PermissionInt>> {
    return await this.post(`${this.url}/`, permission);
  }

  /**
   * Update a permission.
   * @param {PermissionInt} permission
   * @returns {Promise<PermissionInt>}
   * @memberof PermissionService
   * @see Permission
   */
  async update(permission: PermissionInt): Promise<APIResponse<PermissionInt>> {
    return await this.put(`${this.url}/${permission._id}`, permission);
  }

  /**
   * Delete a permission.
   * @param {string} id
   * @returns {Promise<PermissionInt>}
   * @memberof PermissionService
   * @see Permission
   */
  async remove(id: string): Promise<APIResponse<PermissionInt>> {
    return await this.delete(`${this.url}/${id}`);
  }
}

export default new PermissionService();
