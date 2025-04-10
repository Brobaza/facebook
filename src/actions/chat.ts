import type { IChatConversation, IChatMessage, IChatParticipant } from 'src/types/chat';

import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';

import axios, { endpoints, fetcher } from 'src/utils/axios';
import { keyBy } from 'src/utils/helper';

// ----------------------------------------------------------------------

const enableServer = false;

const CHART_ENDPOINT = endpoints.chat.base;
const CONSERVATION_ENDPOINT = endpoints.conservation;

const swrOptions = {
  revalidateIfStale: enableServer,
  revalidateOnFocus: enableServer,
  revalidateOnReconnect: enableServer,
};

// ----------------------------------------------------------------------

type ContactsData = {
  contacts: IChatParticipant[];
};

export function useGetContacts() {
  const url = [endpoints.chat.contact, { params: { endpoint: 'contacts' } }];

  const { data, isLoading, error, isValidating } = useSWR<{
    items: ContactsData['contacts'];
    total: number;
  }>(url, fetcher, swrOptions);

  const memoizedValue = useMemo(
    () => ({
      contacts: data?.items || [],
      contactsLoading: isLoading,
      contactsError: error,
      contactsValidating: false,
      contactsEmpty: !isLoading && !data?.total,
    }),
    [data?.items, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export type ConversationsData = {
  conversations: IChatConversation[];
};

export function useGetConversations() {
  const url = [CHART_ENDPOINT, { params: { endpoint: 'conversations' } }];

  const { data, isLoading, error, isValidating } = useSWR<{
    items: ConversationsData['conversations'];
    total: number;
  }>(url, fetcher, swrOptions);

  const memoizedValue = useMemo(() => {
    const byId = data?.items?.length ? keyBy(data.items, 'id') : {};
    const allIds = Object.keys(byId);

    return {
      conversations: { byId, allIds },
      listValue: data?.items || [],
      totalValue: data?.total || 0,
      conversationsLoading: isLoading,
      conversationsError: error,
      conversationsValidating: isValidating,
      conversationsEmpty: !isLoading && !allIds?.length,
    };
  }, [data?.items, error, isLoading, isValidating]);

  return memoizedValue;
}

// ----------------------------------------------------------------------

type ConversationData = {
  conversation: IChatConversation;
};

export function useGetConversation(conversationId: string) {
  const url = conversationId ? `${CONSERVATION_ENDPOINT}/${conversationId}` : '';

  const { data, isLoading, error, isValidating } = useSWR<ConversationData['conversation']>(
    url,
    fetcher,
    swrOptions
  );

  const memoizedValue = useMemo(
    () => ({
      conversation: data,
      participants: data?.participants || [],
      conversationLoading: isLoading,
      conversationError: error,
      conversationValidating: isValidating,
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ----------------------------------------------------------------------

export async function sendMessage(conversationId: string, messageData: IChatMessage) {
  const conversationsUrl = [CHART_ENDPOINT, { params: { endpoint: 'conversations' } }];

  const conversationUrl = [
    CHART_ENDPOINT,
    { params: { conversationId, endpoint: 'conversation' } },
  ];

  /**
   * Work on server
   */
  if (enableServer) {
    const data = { conversationId, messageData };
    await axios.put(CHART_ENDPOINT, data);
  }

  /**
   * Work in local
   */
  mutate(
    conversationUrl,
    (currentData: any) => {
      const currentConversation: IChatConversation = currentData.conversation;

      const conversation = {
        ...currentConversation,
        messages: [...currentConversation.messages, messageData],
      };

      return { ...currentData, conversation };
    },
    false
  );

  mutate(
    conversationsUrl,
    (currentData: any) => {
      const currentConversations: IChatConversation[] = currentData.conversations;

      const conversations: IChatConversation[] = currentConversations.map(
        (conversation: IChatConversation) =>
          conversation.id === conversationId
            ? { ...conversation, messages: [...conversation.messages, messageData] }
            : conversation
      );

      return { ...currentData, conversations };
    },
    false
  );
}

// ----------------------------------------------------------------------

export async function createConversation(conversationData: IChatConversation) {
  const url = [CONSERVATION_ENDPOINT, { params: { endpoint: 'conversations' } }];

  /**
   * Work on server
   */
  const data = { ...conversationData };
  const res = await axios.post(CONSERVATION_ENDPOINT, data);

  /**
   * Work in local
   */
  // mutate(
  //   url,
  //   (currentData: any) => {
  //     const currentConversations: IChatConversation[] = currentData?.conversations;

  //     const conversations: IChatConversation[] = [...currentConversations, conversationData];

  //     return { ...currentData, conversations };
  //   },
  //   false
  // );

  return res.data;
}

// ----------------------------------------------------------------------

export async function clickConversation(conversationId: string) {
  /**
   * Work on server
   */
  if (enableServer) {
    await axios.get(CHART_ENDPOINT, { params: { conversationId, endpoint: 'mark-as-seen' } });
  }

  /**
   * Work in local
   */
  // mutate(
  //   [CHART_ENDPOINT, { params: { endpoint: 'conversations' } }],
  //   (currentData) => {
  //     const currentConversations: IChatConversation[] = currentData?.conversations;

  //     const conversations = currentConversations.map((conversation: IChatConversation) =>
  //       conversation.id === conversationId ? { ...conversation, unreadCount: 0 } : conversation
  //     );

  //     return { ...currentData, conversations };
  //   },
  //   false
  // );
}
