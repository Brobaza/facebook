import { siLK } from '@mui/material/locale';
import type { AxiosRequestConfig } from 'axios';

import axios from 'axios';
import { signOut } from 'firebase/auth';

import { CONFIG } from 'src/config-global';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({ baseURL: CONFIG.site.serverUrl });

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject((error.response && error.response.data) || 'Something went wrong!')
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher: any = async (args: string | [string, AxiosRequestConfig]) => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args];

    const res = await axiosInstance.get(url, { ...config });

    return res.data;
  } catch (error) {
    console.error('Failed to fetch:', error);
    throw error;
  }
};

// ----------------------------------------------------------------------

export const endpoints = {
  // chat: '/api/chat',
  chat: {
    base: 'api/v1/chat',
    contact: 'api/v1/chat/online-users',
    conversations: 'api/v1/chat/conversations',
  },
  conservation: 'api/v1/chat/conversations',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  auth: {
    // me: '/api/auth/me',
    // signIn: '/api/auth/sign-in',
    // signUp: '/api/auth/sign-up',
    me: '/api/v1/users/me',
    signIn: '/api/v1/auth/sign-in',
    signUp: '/api/v1/auth/sign-up',
    signOut: '/api/v1/auth/sign-out',
  },
  mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels',
  },
  post: {
    list: '/api/post/list',
    details: '/api/post/details',
    latest: '/api/post/latest',
    search: '/api/post/search',
  },
  product: {
    list: '/api/product/list',
    details: '/api/product/details',
    search: '/api/product/search',
  },
};
