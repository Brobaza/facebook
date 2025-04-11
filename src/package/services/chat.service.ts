import { IChatConversation } from 'src/types/chat';
import { IListResponse } from '../interface/app.interface';
import http from '../request';
import httpFormData from '../utils/file-request';
import { User } from '@auth0/auth0-react';

const chatService = {
  getConversationDetail: (conversationId: string): Promise<IChatConversation> =>
    http.axios.request({
      method: 'GET',
      url: `/api/v1/chat/conversations/${conversationId}`,
    }),

  deleteMessage: (payload: {
    conversationId: string;
    messageId: string;
  }): Promise<IChatConversation> =>
    http.axios.request({
      method: 'DELETE',
      url: `/api/v1/chat/conversations/${payload.conversationId}/messages/${payload.messageId}`,
    }),

  getStreamToken: (payload: { conversationId: string }): Promise<{ token: string }> =>
    http.axios.request({
      method: 'GET',
      url: `/api/v1/chat/conversations/${payload.conversationId}/stream/token`,
    }),

  getListConversations: (): Promise<IListResponse<IChatConversation>> =>
    http.axios.request({
      method: 'GET',
      url: '/api/v1/chat/conversations',
    }),

  getOnlineUsers: (): Promise<IListResponse<User>> =>
    http.axios.request({
      method: 'GET',
      url: '/api/v1/chat/online-users',
    }),

  uploadImage: (body: any): Promise<{ success: boolean }> =>
    httpFormData.axios.request({
      url: '/api/v1/chat/media/upload',
      method: 'POST',
      data: body,
    }),

  getPermissionInMeeting: (payload: { conversationId: string }): Promise<{ isAllowed: boolean }> =>
    http.axios.request({
      method: 'GET',
      url: `/api/v1/chat/conversations/${payload.conversationId}/permission`,
    }),
};

export default chatService;
