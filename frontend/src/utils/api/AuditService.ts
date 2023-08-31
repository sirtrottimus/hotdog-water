/**
 * Audit API class for handling audit API calls related to audits.
 *
 * @class AuditService
 * @extends BaseApiService
 * @type {AuditService}
 * @see BaseApiService
 * @see Audit
 */

import { APIResponse } from '../types';
import BaseApiService from './BaseApiService';
import { UserInt } from './UserService';

// ------ Types ------ //
export interface IFunctionLog {
  _id: string;
  user: UserInt;
  controller: string;
  functionName: string;
  success: boolean;
  errorMessage?: string;
  createdAt: Date;
  params: { [key: string]: any };
  data: { [key: string]: any };
}

// ------ Actual API calls ------ //
class AuditService extends BaseApiService {
  // This is the base url for this endpoint. It is relative to the API_URL
  url = '/audit';

  /**
   * Gets all audit logs.
   *
   * @returns {Promise<IFunctionLog[]>}
   * @memberof AuditService
   * @see IFunctionLog
   *
   */
  async getAll(): Promise<APIResponse<IFunctionLog[]>> {
    return await this.get(`${this.url}/`);
  }

  /**
   * Get audit log by id.
   * @param {string} id
   * @returns {Promise<IFunctionLog>}
   * @memberof AuditService
   * @see IFunctionLog
   */
  async getById(id: string): Promise<APIResponse<IFunctionLog>> {
    return await this.get(`${this.url}/${id}`);
  }

  // Create not implemented because it is not needed for this class

  // Update not implemented because it is not needed for this class

  // Delete not implemented because it is not needed for this class
}

export default new AuditService();
