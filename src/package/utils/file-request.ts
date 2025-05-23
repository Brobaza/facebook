/* eslint-disable class-methods-use-this */
import axios, { AxiosInstance } from 'axios';
import { forEach, isArray, isEmpty, keys, reduce, replace } from 'lodash';
import { STORAGE_KEY } from 'src/auth/context/jwt';
import { trimObjectValues } from '../helpers';

type IRequestCredentials = 'include' | 'omit' | 'same-origin';

type IAnyObject = { [key: string]: string | number | boolean | undefined | any };

interface IRequestUrlInfo {
  baseURL?: string;
  params?: IAnyObject;
  url: string;
  queries?: IAnyObject;
}

interface IRequestConfig {
  headers?: any;
  revalidate?: number;
  baseURL?: string;
  timeout?: number;
  cacheTags?: string[];
  credentials?: IRequestCredentials;
}

interface IGetRequest extends IRequestUrlInfo, IRequestConfig {}
interface IPostRequest extends IRequestUrlInfo, IRequestConfig {
  data: IAnyObject;
}

class Http {
  private headers: any;

  private revalidate: number;

  private timeout: number;

  private credentials: IRequestCredentials;

  private cacheTags: string[];

  private baseURL: string;

  axios: AxiosInstance;

  constructor({ headers, revalidate, cacheTags, baseURL, credentials, timeout }: IRequestConfig) {
    this.baseURL = baseURL || '/';

    this.headers = headers || {};

    this.timeout = (timeout || 10) * 1000;

    this.revalidate = revalidate || 1;

    this.credentials = credentials || 'include';

    this.cacheTags = cacheTags || ['all'];

    this.axios = axios.create({
      baseURL: this.baseURL,
      headers: this.headers as any,
      timeout: this.timeout,
      withCredentials: false,
    });

    this.axios.interceptors.request.use((config) => {
      const token = sessionStorage.getItem(STORAGE_KEY);
      if (token) config.headers.Authorization = `Bearer ${token}`;

      return config;
    });

    this.axios.interceptors.response.use(this.handleResponse, this.handleError);
  }

  private getRequestUrl({
    baseURL,
    params,
    url,
    queries,
    isAxios = false,
  }: IRequestUrlInfo & { isAxios?: boolean }) {
    let requestUrl = `${isAxios ? '' : (baseURL || this.baseURL).replace(/\/$/, '')}/${url.replace(
      /^\//,
      ''
    )}`;

    if (!isEmpty(queries)) {
      const trimmedQueries = trimObjectValues(queries, { omitEmpty: true });
      if (!isEmpty(trimmedQueries)) {
        requestUrl = reduce(
          keys(trimmedQueries),
          (prev, curr) => replace(prev, `:${curr}`, trimmedQueries[curr]),
          requestUrl
        );
      }
    }

    if (isEmpty(params)) return requestUrl;

    const originalParams = trimObjectValues(params, { omitEmpty: true });
    if (!isEmpty(originalParams)) {
      const searchParams = new URLSearchParams();
      forEach(keys(originalParams), (key) => {
        searchParams.append(key, originalParams[key]);
      });

      requestUrl = `${requestUrl}?${searchParams.toString()}`;
    }

    return requestUrl;
  }

  private getBodyData(data: { [key: string]: any }, isFetch = true) {
    const trimmedBody = trimObjectValues(data, { omitEmpty: true });
    return isFetch ? JSON.stringify(trimmedBody) : trimmedBody;
  }

  private handleResponse(res: any) {
    if (!isEmpty(res?.data?.data) && isArray(res?.data?.data)) return res?.data || res;

    return res?.data?.data || res?.data || res;
  }

  private handleError(error: any) {
    return Promise.reject(error);
  }

  get<T>({ baseURL, url, queries, params }: IGetRequest): Promise<T> {
    return this.axios.request({
      method: 'GET',
      url: this.getRequestUrl({ url, queries, params, baseURL, isAxios: true }),
      ...(baseURL && this.baseURL !== baseURL && { baseURL }),
    });
  }

  getWithAxios<T>({ baseURL, url, queries, params }: IGetRequest): Promise<T> {
    return this.axios.request({
      method: 'GET',
      url: this.getRequestUrl({ url, queries, params, baseURL, isAxios: true }),
      ...(baseURL && this.baseURL !== baseURL && { baseURL }),
    });
  }

  post<T>({ baseURL, data, url, queries, params }: IPostRequest): Promise<T> {
    return this.axios.request({
      method: 'POST',
      url: this.getRequestUrl({ url, queries, params, baseURL, isAxios: true }),
      data: trimObjectValues(data, { omitEmpty: true }),
      ...(baseURL && this.baseURL !== baseURL && { baseURL }),
    });
  }

  patch<T>({ baseURL, data, url, queries, params }: IPostRequest): Promise<T> {
    return this.axios.request({
      method: 'PATCH',
      url: this.getRequestUrl({ url, queries, params, baseURL, isAxios: true }),
      data: trimObjectValues(data, { omitEmpty: true }),
      ...(baseURL && this.baseURL !== baseURL && { baseURL }),
    });
  }

  delete<T>({ baseURL, url, queries, params }: IGetRequest): Promise<T> {
    return this.axios.request({
      method: 'DELETE',
      url: this.getRequestUrl({ url, queries, params, baseURL, isAxios: true }),
      ...(baseURL && this.baseURL !== baseURL && { baseURL }),
    });
  }
}

const httpFormData = new Http({
  baseURL: import.meta.env.VITE_SERVER_URL ?? '',
  credentials: 'omit',
  headers: { 'Content-Type': 'multipart/form-data' },
  timeout: 10,
});

export default httpFormData;
