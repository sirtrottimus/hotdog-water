/**
 * Role API class for handling all role related requests.
 *
 * @class RoleService
 * @extends BaseApiService
 * @type {RoleService}
 * @see BaseApiService
 */

import { APIResponse } from '../types';
import BaseApiService from './BaseApiService';
import { PermissionInt } from './PermissionService';

// ------ Types ------ //
export interface FormRoleInput {
  name: string;
  description: string;
  assignables: string[];
  permissions: string[];
  color: string;
  _id?: string;
}

export interface RoleInt {
  _id: string;
  name: string;
  description: string;
  permissions: PermissionInt[];
  assignables: RoleInt[];
  color: string;
}

// ------ Actual API calls ------ //

class RoleService extends BaseApiService {
  // This is the base url for this endpoint. It is relative to the API_URL
  url = '/roles';

  /**
   * Gets all roles.
   * @returns {Promise<RoleInt[]>}
   * @memberof RoleService
   * @see Role
   */
  async getAll(): Promise<APIResponse<RoleInt[]>> {
    return await this.get(`${this.url}/`);
  }

  /**
   * Gets a role by its id.
   * @param {string} id - The id of the role to get.
   * @returns {Promise<RoleInt>}
   * @memberof RoleService
   * @see Role
   */
  async getById(id: string): Promise<APIResponse<RoleInt>> {
    return await this.get(`${this.url}/${id}`);
  }

  /**
   * Gets All assignable roles.
   * @returns {Promise<RoleInt[]>}
   * @memberof RoleService
   * @see Role
   */
  async getAssignable(): Promise<APIResponse<RoleInt[]>> {
    return await this.get(`${this.url}/assignable`);
  }

  /**
   * Creates a new role.
   * @param {FormRoleInput} role - The role to create.
   * @returns {Promise<RoleInt>}
   * @memberof RoleService
   * @see Role
   */
  async create(role: FormRoleInput): Promise<APIResponse<RoleInt>> {
    return await this.post(`${this.url}/`, role);
  }

  /**
   * Updates an existing role.
   * @param {string} id - The id of the role to update.
   * @param {FormRoleInput} role - The updated role data.
   * @returns {Promise<RoleInt>}
   * @memberof RoleService
   * @see Role
   */
  async update(role: FormRoleInput): Promise<APIResponse<RoleInt>> {
    return await this.put(`${this.url}/${role._id}`, role);
  }

  /**
   * Deletes a role.
   * @param {string} id - The id of the role to delete.
   * @returns {Promise<APIResponse>}
   * @memberof RoleService
   */
  async remove(id: string): Promise<APIResponse<RoleInt>> {
    return await this.delete(`${this.url}/${id}`);
  }
}

export default new RoleService();
