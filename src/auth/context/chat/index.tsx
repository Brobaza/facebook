import { User } from '@auth0/auth0-react';
import { UseMutateFunction, useMutation, useQuery } from '@tanstack/react-query';
import { concat, filter, find, get, includes, isEmpty, isNil, map } from 'lodash';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Socket } from 'socket.io-client';
import { toast } from 'sonner';
import { ConversationsData } from 'src/actions/chat';
import { useAuthContext } from 'src/auth/hooks';
import chatService from 'src/package/services/chat.service';
import { useRouter, useSearchParams } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';
import { IChatConversation, IChatMessage } from 'src/types/chat';
import { SocketNamespace } from 'src/utils/constants';
import { createSocketClient } from 'src/utils/helper';

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  VIDEO = 'video',
  FILE = 'file',
}

export const messageMentionFormat = `@[__user_display__](__user_id__)`;

const generateDisplayMessage = (rawMessage: string) => {
  return rawMessage.replace(/@\[(.*?)\]\((.*?)\)/g, '$1');
};

const extractMentions = (rawMessage: string) => {
  const displayMessage = generateDisplayMessage(rawMessage);
  const mentionRegex = /@\[(.*?)\]\((.*?)\)/g;
  const mentions = [];

  let offset = 0;

  for (const match of Array.from(rawMessage.matchAll(mentionRegex))) {
    const [_, displayName, userId] = match;

    const startIndex = displayMessage.indexOf(displayName, offset);
    const endIndex = startIndex + displayName.length - 1;

    mentions.push({ userId, displayName, startIndex, endIndex });
    offset = endIndex;
  }

  return { formattedMessage: displayMessage, mentions };
};

interface IChatContext {
  checkMeetingPermission: UseMutateFunction<
    boolean,
    Error,
    {
      payload: {
        conversationId: string;
      };
    },
    unknown
  >;
  deleteMessage: UseMutateFunction<
    object | null,
    Error,
    {
      payload: {
        messageId: string;
      };
      onSuccess?: VoidFunction;
    },
    unknown
  >;
  sendMessage: UseMutateFunction<
    object | null,
    Error,
    {
      payload: {
        content: string;
        conversationId: string;
        replyInfo: {
          id: string;
          body: string;
          senderName: string;
          isImage: boolean;
        };
      };
      onSuccess?: VoidFunction;
    },
    unknown
  >;
  sendEmoji: UseMutateFunction<
    object | null,
    Error,
    {
      payload: {
        messageId: string;
        emoji: string;
      };
      onSuccess?: VoidFunction;
    },
    unknown
  >;
  sendImage: UseMutateFunction<
    object | null,
    Error,
    {
      payload: {
        conversationId: string;
        file: File;
      };
      onSuccess?: VoidFunction;
    },
    unknown
  >;
  isPendingSendImage: boolean;
  loadingFetchMessages: boolean;
  isLoadingSendMessage: boolean;
  chatSocket: Socket | null;
  conversations: {
    items: ConversationsData['conversations'];
    total: number;
  };
  conversationsLoading: boolean;
  conversation: IChatConversation | null;
  loadingConversation: boolean;
  error: any;
  contacts: {
    items: User[];
    total: number;
  };
  contactsLoading: boolean;
  streamToken: string;
}

const chatContext = createContext<IChatContext>({
  checkMeetingPermission: {} as UseMutateFunction<
    boolean,
    Error,
    {
      payload: {
        conversationId: string;
      };
    },
    unknown
  >,

  // * conversations
  contacts: {
    items: [],
    total: 0,
  },
  contactsLoading: false,
  conversations: {
    items: [],
    total: 0,
  },
  conversation: null,
  conversationsLoading: false,
  error: null,
  loadingConversation: false,

  // * chat
  sendEmoji: {} as UseMutateFunction<
    object | null,
    Error,
    {
      payload: {
        messageId: string;
        emoji: string;
      };
      onSuccess?: VoidFunction;
    },
    unknown
  >,
  deleteMessage: {} as UseMutateFunction<
    object | null,
    Error,
    {
      payload: {
        messageId: string;
      };
      onSuccess?: VoidFunction;
    },
    unknown
  >,
  sendMessage: {} as UseMutateFunction<
    object | null,
    Error,
    {
      payload: {
        content: string;
        conversationId: string;
        replyInfo: {
          id: string;
          body: string;
          senderName: string;
          isImage: boolean;
        };
      };
      onSuccess?: VoidFunction;
    },
    unknown
  >,
  sendImage: {} as UseMutateFunction<
    object | null,
    Error,
    {
      payload: {
        conversationId: string;
        file: File;
      };
      onSuccess?: VoidFunction;
    },
    unknown
  >,
  isPendingSendImage: false,
  loadingFetchMessages: false,
  isLoadingSendMessage: false,
  chatSocket: null,
  streamToken: '',
});

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const { authenticated: isAuth, loading: loadingAuth } = useAuthContext();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [error, setError] = useState<any>(null);
  const [conversations, setConversations] = useState<{
    items: ConversationsData['conversations'];
    total: number;
  }>({ items: [], total: 0 });
  const [contacts, setContacts] = useState<{
    items: User[];
    total: number;
  }>({ items: [], total: 0 });
  const [streamToken, setStreamToken] = useState<string | null>(null);
  const [currentConversation, setCurrentConversation] = useState<IChatConversation | null>(null);
  const conversationsRef = useRef(conversations);
  const router = useRouter();

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  const searchParams = useSearchParams();

  const selectedConversationId = searchParams.get('id') || '';

  const { refetch: refetchConservations, isLoading: isLoadingConservations } = useQuery({
    queryKey: ['conservations'],
    enabled: !loadingAuth && isAuth,
    queryFn: async () => {
      try {
        const res = await chatService.getListConversations();
        const { items, total } = res;

        setConversations({
          items,
          total,
        });

        return {
          items,
          total,
        };
      } catch (error) {
        return null;
      }
    },
  });

  const { refetch: refetchStreamToken } = useQuery({
    queryKey: ['stream-token'],
    enabled: !loadingAuth && isAuth,
    queryFn: async () => {
      try {
        const res = await chatService.getStreamToken({ conversationId: 'ok' });
        const { token } = res;

        setStreamToken(token);

        return token;
      } catch (error) {
        return null;
      }
    },
  });

  const { refetch: refetchContacts, isLoading: isLoadingContacts } = useQuery({
    queryKey: ['contacts'],
    enabled: !loadingAuth && isAuth,
    queryFn: async () => {
      try {
        const res = await chatService.getOnlineUsers();
        const { items, total } = res;

        setContacts({
          items,
          total,
        });

        return {
          items,
          total,
        };
      } catch (error) {
        return null;
      }
    },
  });

  const { refetch: refetchCurrentConservation, isLoading: isLoadingCurrentConservation } = useQuery(
    {
      queryKey: ['currentConversation'],
      enabled:
        !loadingAuth &&
        isAuth &&
        !isNil(selectedConversationId) &&
        !isEmpty(selectedConversationId),
      queryFn: async () => {
        try {
          const data = await chatService.getConversationDetail(selectedConversationId);

          setCurrentConversation(data);

          if (includes(map(conversations.items, 'id'), selectedConversationId)) {
            const newConversations = map(conversations.items, (item) => {
              if (item.id === selectedConversationId) {
                return data;
              }
              return item;
            });

            setConversations({
              items: newConversations,
              total: conversations.total,
            });
          } else {
            setConversations({
              items: [...conversations.items, data],
              total: conversations.total + 1,
            });
          }

          return data;
        } catch (error) {
          console.error('Error during get conversation:', error);
          setError(error);
        }
      },
    }
  );

  const { refetch } = useQuery({
    queryKey: ['socket', conversations.items, currentConversation],
    enabled: !loadingAuth && isAuth && (isNil(socket) || !socket?.connected),
    queryFn: async () => {
      try {
        if (isNil(socket)) {
          const client = createSocketClient(SocketNamespace.CHAT);

          client?.connect();

          client.on('receive-craw-url', async (data: any) => {
            const { messageId, previewUrl, conversationId } = data;

            console.log('>>> data :', data);

            setConversations((prev) => {
              const currentConversationList = prev.items;

              const updatedConversations = (() => {
                const updatedConversation = find(currentConversationList, { id: conversationId });

                if (!updatedConversation) return currentConversationList;

                const newConversation = {
                  ...updatedConversation,
                  messages: map(updatedConversation.messages, (message) => {
                    if (message.id === messageId) {
                      return {
                        ...message,
                        previewUrl: previewUrl,
                      };
                    }
                    return message;
                  }),
                };

                return concat(
                  [newConversation],
                  filter(currentConversationList, (conv) => conv.id !== conversationId)
                );
              })();

              return { items: updatedConversations, total: prev.total };
            });

            setCurrentConversation((prev) => {
              if (prev?.id === conversationId && !isNil(prev)) {
                return {
                  ...prev,
                  messages: map(prev.messages, (message) => {
                    if (message.id === messageId) {
                      return {
                        ...message,
                        previewUrl: previewUrl,
                      };
                    }
                    return message;
                  }),
                } as any;
              }
              return prev;
            });
          });

          client.on('receive-emoji', async (data: any) => {
            const { content, sender, messageId, conversationId } = data;

            setConversations((prev) => {
              const currentConversationList = prev.items;

              const updatedConversations = (() => {
                const updatedConversation = find(currentConversationList, { id: conversationId });

                if (!updatedConversation) return currentConversationList;

                const newConversation = {
                  ...updatedConversation,
                  messages: map(updatedConversation.messages, (message) => {
                    if (message.id === messageId) {
                      const isRemove = isEmpty(content);

                      if (isRemove) {
                        return {
                          ...message,
                          emojis: filter(
                            get(message, 'emojis', []),
                            (emoji) => (emoji as any)?.user?.id !== sender
                          ),
                        };
                      }

                      return {
                        ...message,
                        emojis: [
                          ...(get(message, 'emojis', []) as any),
                          {
                            emoji: content,
                            user: {
                              id: sender,
                            },
                          },
                        ],
                      };
                    }
                    return message;
                  }),
                };

                return concat(
                  [newConversation],
                  filter(currentConversationList, (conv) => conv.id !== conversationId)
                );
              })();

              return { items: updatedConversations, total: prev.total };
            });

            setCurrentConversation((prev) => {
              if (prev?.id === conversationId && !isNil(prev)) {
                return {
                  ...prev,
                  messages: map(prev.messages, (message) => {
                    if (message.id === messageId) {
                      const isRemove = isEmpty(content);

                      if (isRemove) {
                        console.log('afterRemove', {
                          ...message,
                          emojis: filter(
                            get(message, 'emojis', []),
                            (emoji) => (emoji as any)?.user?.id !== sender
                          ),
                        });

                        return {
                          ...message,
                          emojis: filter(
                            get(message, 'emojis', []),
                            (emoji) => (emoji as any)?.user?.id !== sender
                          ),
                        };
                      }

                      return {
                        ...message,
                        emojis: [
                          ...(get(message, 'emojis', []) as any),
                          {
                            emoji: content,
                            user: {
                              id: sender,
                            },
                          },
                        ],
                      };
                    }
                    return message;
                  }),
                } as any;
              }
              return prev;
            });
          });

          client.on('delete-message', async (data: any) => {
            const { messageId, conversationId } = data;

            setConversations((prev) => {
              const currentConversationList = prev.items;

              const updatedConversations = (() => {
                const updatedConversation = find(currentConversationList, { id: conversationId });

                if (!updatedConversation) return currentConversationList;

                const newConversation = {
                  ...updatedConversation,
                  messages: filter(
                    updatedConversation.messages,
                    (message) => message.id !== messageId
                  ),
                };

                return concat(
                  [newConversation],
                  filter(currentConversationList, (conv) => conv.id !== conversationId)
                );
              })();

              return { items: updatedConversations, total: prev.total };
            });

            setCurrentConversation((prev) => {
              if (prev?.id === conversationId && !isNil(prev)) {
                return {
                  ...prev,
                  messages: filter(prev.messages, (message) => message.id !== messageId),
                } as any;
              }
              return prev;
            });
          });

          client.on('messages', async (data: any) => {
            const { content, sender, conversationId, type, mentions, messageId } = data;
            const replyInfo = get(data, 'replyInfo', null);

            setConversations((prev) => {
              const currentConversationList = prev.items;
              const existingConversation = currentConversationList.find(
                (item) => item.id === conversationId
              );

              if (!existingConversation) {
                chatService
                  .getConversationDetail(conversationId)
                  .then((res) => {
                    if (!isNil(res)) {
                      setConversations((prevState) => ({
                        items: [res, ...prevState.items],
                        total: prevState.total,
                      }));
                    } else {
                      console.error('Error fetching conversation detail');
                    }
                  })
                  .catch((err) => console.error('Fetch error:', err));

                return prev;
              }

              const updatedConversations = (() => {
                const updatedConversation = find(currentConversationList, { id: conversationId });

                if (!updatedConversation) return currentConversationList;

                const newConversation = {
                  ...updatedConversation,
                  messages: [
                    ...updatedConversation.messages,
                    {
                      id: messageId,
                      body: content,
                      senderId: sender,
                      contentType: type as MessageType,
                      createdAt: new Date().toISOString(),
                      attachments: [],
                      mentions,
                      replyInfo,
                    } as IChatMessage,
                  ],
                };

                return concat(
                  [newConversation],
                  filter(currentConversationList, (conv) => conv.id !== conversationId)
                );
              })();

              return { items: updatedConversations, total: prev.total };
            });

            setCurrentConversation((prev) => {
              if (prev?.id === conversationId && !isNil(prev)) {
                const exists = prev.messages.some((msg) => msg.id === messageId);
                if (exists) return prev;
                return {
                  ...prev,
                  messages: [
                    ...prev.messages,
                    {
                      id: messageId,
                      body: content,
                      senderId: sender,
                      contentType: type as MessageType,
                      createdAt: new Date().toISOString(),
                      attachments: [],
                      mentions,
                      replyInfo,
                    } as IChatMessage,
                  ],
                };
              }
              return prev;
            });
          });

          client.on('redirect', (data: { conversationId: string }) => {
            const { conversationId } = data;

            if (!isNil(conversationId) && !isEmpty(conversationId)) {
              router.push(`${paths.dashboard.chat}?id=${conversationId}`);
            }
          });

          client.on('errors', (error) => {
            if (!isNil(error) && !isEmpty(get(error, 'message', '')))
              toast.error(get(error, 'message'));
          });

          setSocket(client);
        } else {
          socket?.connect();
        }

        return socket;
      } catch (error) {
        console.log('Error during connect to socket:', error);

        setSocket(null);

        return null;
      }
    },
  });

  const { mutate: deleteMessage } = useMutation({
    mutationFn: async ({
      payload,
      onSuccess,
    }: {
      payload: {
        messageId: string;
      };
      onSuccess?: VoidFunction;
    }) => {
      if (isNil(socket)) {
        toast.error('Bạn phải đăng nhập mới xóa nhắn tin');
        return {};
      }

      if (isEmpty(payload?.messageId)) {
        toast.error('Vui lòng chọn nội dung tin nhắn muốn xóa');
        return {};
      }

      try {
        await chatService.deleteMessage({
          conversationId: selectedConversationId,
          messageId: payload.messageId,
        });
      } catch (error) {
        toast.error('Xóa tin nhắn thất bại');
      } finally {
        onSuccess?.();
      }

      return null;
    },
  });

  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: async ({
      payload,
      onSuccess,
    }: {
      payload: {
        content: string;
        conversationId: string;
        replyInfo: {
          id: string;
          body: string;
          senderName: string;
          isImage: boolean;
        };
      };
      onSuccess?: VoidFunction;
    }) => {
      if (isNil(socket)) {
        toast.error('Bạn phải đăng nhập mới được nhắn tin');
        return {};
      }

      if (isEmpty(payload?.content)) {
        toast.error('Vui lòng nhập nội dung tin nhắn');
        return {};
      }

      const { formattedMessage, mentions } = extractMentions(payload.content);

      socket?.emit('send-message', {
        conversationId: payload.conversationId,
        content: formattedMessage,
        mentions,
        ...(payload.replyInfo.id && {
          replyInfo: {
            ...payload.replyInfo,
            messageId: payload.replyInfo.id,
          },
        }),
      });
      onSuccess?.();

      return null;
    },
  });

  const { mutate: sendImage, isPending: isPendingSendImage } = useMutation({
    mutationFn: async ({
      payload,
      onSuccess,
    }: {
      payload: {
        conversationId: string;
        file: File;
      };
      onSuccess?: VoidFunction;
    }) => {
      const { file } = payload;

      if (isNil(file)) {
        toast.error('Vui lòng chọn file để gửi');
        return {};
      }

      try {
        const { success } = await chatService.uploadImage({
          conversationId: payload.conversationId,
          file,
          fileName: file.name,
        });

        if (success) {
          toast.success('Upload file thành công');

          onSuccess?.();
        } else {
          toast.error('Upload file thất bại');
        }
      } catch (error) {
        toast.error('Upload file thất bại');
      }

      return null;
    },
  });

  const { mutate: checkMeetingAllowance } = useMutation({
    mutationFn: async ({
      payload,
    }: {
      payload: {
        conversationId: string;
      };
    }) => {
      const { conversationId } = payload;

      try {
        const { isAllowed } = await chatService.getPermissionInMeeting({
          conversationId,
        });

        return isAllowed;
      } catch (err) {
        console.log('Error during check meeting allowance:', err);

        return false;
      }
    },
  });

  const { mutate: sendEmoji } = useMutation({
    mutationFn: async ({
      payload,
      onSuccess,
    }: {
      payload: {
        messageId: string;
        emoji: string;
      };
      onSuccess?: VoidFunction;
    }) => {
      const { messageId, emoji } = payload;
      const conversationId = get(currentConversation, 'id', '');

      if (isNil(messageId)) {
        toast.error('Không tìm thấy tin nhắn để gửi emoji');
        return {};
      }

      if (isNil(conversationId)) {
        toast.error('Không tìm thấy cuộc trò chuyện để gửi emoji');
        return {};
      }

      if (isNil(socket)) {
        toast.error('Bạn phải đăng nhập mới được nhắn tin');
        return {};
      }

      socket?.emit('send-emoji', { conversationId, messageId, emoji });
      onSuccess?.();

      return null;
    },
  });

  useLayoutEffect(() => {
    if (isAuth) {
      refetch();
      refetchConservations();
      refetchContacts();
      refetchStreamToken();
    }
  }, [isAuth, refetch, socket, loadingAuth]);

  useEffect(() => {
    if (selectedConversationId) {
      refetchCurrentConservation();
    }
  }, [selectedConversationId, refetchCurrentConservation]);

  return (
    <chatContext.Provider
      value={{
        // * chat
        sendEmoji,
        sendMessage,
        deleteMessage,
        isLoadingSendMessage: isPending,
        loadingFetchMessages: false,
        chatSocket: socket,
        sendImage,
        isPendingSendImage,

        // * conversations
        conversations,
        conversationsLoading: isLoadingConservations,
        conversation: currentConversation,
        loadingConversation: isLoadingCurrentConservation,
        checkMeetingPermission: checkMeetingAllowance,
        error,

        // * contacts
        contacts,
        contactsLoading: isLoadingContacts,

        // * stream
        streamToken: streamToken || '',
      }}
    >
      {children}
    </chatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(chatContext);

  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
