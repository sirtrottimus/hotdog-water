/**
 * Base API class for all API services. Do not use this class directly, instead extend it.
 *
 * @param baseURL - The base URL for the API
 * @returns BaseApiService
 * @example
 * const api = new BaseApiService('https://api.example.com');
 * api.post('/login', { username: 'user', password: 'pass' });
 * api.get('/user/123');
 * api.post('/user/123', { name: 'John Doe' });
 */

import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { getAPIUrl } from '../helpers';
import { APIPaginationResponse, APIResponse } from '../types';

interface Options {
  includePagination?: boolean;
  axiosOptions?: AxiosRequestConfig<any>;
}

class BaseApiService {
  // The base URL for the API
  baseURL = `${getAPIUrl()}/api`;

  /**
   * Performs a POST request to the API.
   * @param {string} url - The URL to send the request to
   * @param {any} data - The data to send in the request body
   * @param {Options} options - Options for the request
   * @returns {Promise<APIResponse<any>>}
   * @memberof BaseApiService
   */
  async post(
    url: string,
    data: any,
    options: Options = {}
  ): Promise<APIResponse<any>> {
    try {
      const response = await axios.post(`${this.baseURL}${url}`, data, {
        ...options.axiosOptions,
        withCredentials: true,
      });
      // Check if the response status is in the 2xx range
      if (response.status >= 200 && response.status < 300) {
        // Successful response

        return {
          data: response.data ?? [],
          success: true,
          error: null,
        };
      } else {
        // Unsuccessful response, reject with error message
        return Promise.reject({
          success: false,
          data: null,
          error: response.data.message ?? 'Request failed',
        });
      }
    } catch (error) {
      const err = error as AxiosError;
      if (err.response) {
        // Rejected Promise for API errors with response
        return Promise.reject({
          success: false,
          data: null,
          error: (err.response.data as any).message ?? err.message,
        });
      } else {
        // Rejected Promise for general errors (network, etc.)
        return Promise.reject({
          success: false,
          data: null,
          error: err.message,
        });
      }
    }
  }

  /**
   * Performs a GET request to the API.
   * @param {string} url - The URL to send the request to.
   * @param {Options} options - Options for the request.
   * @returns {Promise<APIResponse<any> | APIPaginationResponse<any>>}
   * @memberof BaseApiService
   */
  async get(
    url: string,
    options: Options = {}
  ): Promise<APIResponse<any> | APIPaginationResponse<any>> {
    try {
      const response = await axios.get(`${this.baseURL}${url}`, {
        ...options.axiosOptions,
        withCredentials: true,
      });
      // Check if the response status is in the 2xx range
      if (response.status >= 200 && response.status < 300) {
        // Successful response

        if (options.includePagination) {
          return {
            data: response.data.data ?? [],
            success: true,
            error: null,
            total: response.data.total,
            hasMore: response.data.hasMore,
          };
        }

        return {
          data: response.data ?? [],
          success: true,
          error: null,
        };
      }
      // Unsuccessful response, reject with error message
      return Promise.reject({
        success: false,
        data: null,
        error: response.data.message ?? 'Request failed',
      });
    } catch (error) {
      const err = error as AxiosError;
      if (err.response) {
        // Rejected Promise for API errors with response
        return Promise.reject({
          success: false,
          data: null,
          error: (err.response.data as any).message ?? err.message,
        });
      } else {
        // Rejected Promise for general errors (network, etc.)
        return Promise.reject({
          success: false,
          data: null,
          error: err.message,
        });
      }
    }
  }

  /**
   * Performs a PUT request to the API.
   * @param {string} url - The URL to send the request to
   * @param {any} data - The data to send in the request body
   * @param {Options} options - Options for the request
   * @returns {Promise<APIResponse<any>>}
   * @memberof BaseApiService
   */
  async put(url: string, data: any, options: Options = {}) {
    try {
      const response = await axios.put(`${this.baseURL}${url}`, data, {
        ...options.axiosOptions,
        withCredentials: true,
      });
      // Check if the response status is in the 2xx range
      if (response.status >= 200 && response.status < 300) {
        // Successful response
        return {
          data: response.data ?? [],
          success: true,
          error: null,
        };
      }
      // Unsuccessful response, reject with error message
      return Promise.reject({
        success: false,
        data: null,
        error: response.data.message ?? 'Request failed',
      });
    } catch (error) {
      const err = error as AxiosError;
      if (err.response) {
        // Rejected Promise for API errors with response
        return Promise.reject({
          success: false,
          data: null,
          error: (err.response.data as any).message ?? err.message,
        });
      } else {
        // Rejected Promise for general errors (network, etc.)
        return Promise.reject({
          success: false,
          data: null,
          error: err.message,
        });
      }
    }
  }

  /**
   * Performs a DELETE request to the API.
   * @param {string} url - The URL to send the request to.
   * @param {Options} options - Options for the request.
   * @returns {Promise<APIResponse<any>>}
   * @memberof BaseApiService
   */
  async delete(url: string, options: Options = {}): Promise<APIResponse<any>> {
    try {
      const response = await axios.delete(`${this.baseURL}${url}`, {
        ...options.axiosOptions,
        withCredentials: true,
      });
      // Check if the response status is in the 2xx range
      if (response.status >= 200 && response.status < 300) {
        // Successful response
        return {
          data: response.data ?? [],
          success: true,
          error: null,
        };
      }
      // Unsuccessful response, reject with error message
      return Promise.reject({
        success: false,
        data: null,
        error: response.data.message ?? 'Request failed',
      });
    } catch (error) {
      const err = error as AxiosError;
      if (err.response) {
        // Rejected Promise for API errors with response
        return Promise.reject({
          success: false,
          data: null,
          error: (err.response.data as any).message ?? err.message,
        });
      } else {
        // Rejected Promise for general errors (network, etc.)
        return Promise.reject({
          success: false,
          data: null,
          error: err.message,
        });
      }
    }
  }

  /**
   * Performs a PATCH request to the API.
   * @param {string} url - The URL to send the request to
   * @param {any} data - The data to send in the request body
   * @param {Options} options - Options for the request
   * @returns {Promise<APIResponse<any>>}
   * @memberof BaseApiService
   */
  async patch(
    url: string,
    data: any,
    options: Options = {}
  ): Promise<APIResponse<any>> {
    try {
      const response = await axios.patch(`${this.baseURL}${url}`, data, {
        ...options.axiosOptions,
        withCredentials: true,
      });
      // Check if the response status is in the 2xx range
      if (response.status >= 200 && response.status < 300) {
        // Successful response
        return {
          data: response.data ?? [],
          success: true,
          error: null,
        };
      }
      // Unsuccessful response, reject with error message
      return Promise.reject({
        success: false,
        data: null,
        error: response.data.message ?? 'Request failed',
      });
    } catch (error) {
      const err = error as AxiosError;
      if (err.response) {
        // Rejected Promise for API errors with response
        return Promise.reject({
          success: false,
          data: null,
          error: (err.response.data as any).message ?? err.message,
        });
      } else {
        // Rejected Promise for general errors (network, etc.)
        return Promise.reject({
          success: false,
          data: null,
          error: err.message,
        });
      }
    }
  }

  /**
   * Performs a HEAD request to the API.
   * @param {string} url - The URL to send the request to.
   * @param {Options} options - Options for the request.
   * @returns {Promise<APIResponse<any>>}
   * @memberof BaseApiService
   */
  async head(url: string, options: Options = {}): Promise<APIResponse<any>> {
    try {
      const response = await axios.head(`${this.baseURL}${url}`, {
        ...options.axiosOptions,
        withCredentials: true,
      });
      // Check if the response status is in the 2xx range
      if (response.status >= 200 && response.status < 300) {
        // Successful response
        return {
          data: response.data ?? [],
          success: true,
          error: null,
        };
      }
      // Unsuccessful response, reject with error message
      return Promise.reject({
        success: false,
        data: null,
        error: response.data.message ?? 'Request failed',
      });
    } catch (error) {
      const err = error as AxiosError;
      if (err.response) {
        // Rejected Promise for API errors with response
        return Promise.reject({
          success: false,
          data: null,
          error: (err.response.data as any).message ?? err.message,
        });
      } else {
        // Rejected Promise for general errors (network, etc.)
        return Promise.reject({
          success: false,
          data: null,
          error: err.message,
        });
      }
    }
  }

  /**
   * Performs a OPTIONS request to the API.
   * @param {string} url - The URL to send the request to.
   * @param {Options} options - Options for the request.
   * @returns {Promise<APIResponse<any>>}
   * @memberof BaseApiService
   */
  async options(url: string, options: Options = {}): Promise<APIResponse<any>> {
    try {
      const response = await axios.options(`${this.baseURL}${url}`, {
        ...options.axiosOptions,
        withCredentials: true,
      });
      // Check if the response status is in the 2xx range
      if (response.status >= 200 && response.status < 300) {
        // Successful response
        return {
          data: response.data ?? [],
          success: true,
          error: null,
        };
      }
      // Unsuccessful response, reject with error message
      return Promise.reject({
        success: false,
        data: null,
        error: response.data.message ?? 'Request failed',
      });
    } catch (error) {
      const err = error as AxiosError;
      if (err.response) {
        // Rejected Promise for API errors with response
        return Promise.reject({
          success: false,
          data: null,
          error: (err.response.data as any).message ?? err.message,
        });
      } else {
        // Rejected Promise for general errors (network, etc.)
        return Promise.reject({
          success: false,
          data: null,
          error: err.message,
        });
      }
    }
  }
}

export default BaseApiService;
